"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpinnerIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { API_URL, CDN_URL } from "@/lib/config";
import { compressImage } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const toInputDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.replace(" ", "T").slice(0, 16);
};

const EVENT_FOR_OPTIONS = ["VITian", "Non VITian", "Both"];
const PARTICIPATION_OPTIONS = ["Solo", "Duo", "Team"];

export function EventForm({ initialData }: { initialData?: Event }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    event_name: initialData?.event_name || "",
    club_name: initialData?.club_name || "",
    event_type: initialData?.event_type || "",
    event_for: initialData?.event_for || "",
    start_date_time: initialData?.start_date_time || "",
    end_date_time: initialData?.end_date_time || "",
    price_per_person: initialData?.price_per_person || 0,
    participation_type: initialData?.participation_type || "",
    event_venue: initialData?.event_venue || "",
    short_description: initialData?.short_description || "",
    long_description: initialData?.long_description || "",
    is_special_event: !!initialData?.is_special_event,
    registration_link: initialData?.registration_link || "",
    team_size: initialData?.team_size || "",
    poster_path: initialData?.poster_path || "",
    faculty_coord_emp_id: initialData?.faculty_coord_emp_id || "",
    faculty_coord_name: initialData?.faculty_coord_name || "",
    faculty_coord_mobile: initialData?.faculty_coord_mobile || "",
    faculty_coord_email: initialData?.faculty_coord_email || "",
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        try {
          setIsCompressing(true);
          const objectUrl = URL.createObjectURL(selectedFile);
          setPreview(objectUrl);
          const compressedBlob = await compressImage(selectedFile);
          const compressedFile = new File([compressedBlob], selectedFile.name, {
            type: compressedBlob.type,
          });
          setFile(compressedFile);
          const compressedUrl = URL.createObjectURL(compressedFile);
          setPreview(compressedUrl);
        } catch (error) {
          console.error("Failed to compress image:", error);
          toast.error("Failed to process the image");
          setFile(null);
          setPreview(null);
        } finally {
          setIsCompressing(false);
        }
      }
    },
    []
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCompressing) return;
    setLoading(true);

    try {
      let finalPosterPath = formData.poster_path;

      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const uploadRes = await fetch(`${API_URL}/media/upload`, {
          method: "POST",
          body: formDataUpload,
        });
        if (!uploadRes.ok) {
          toast.error("Failed to upload poster image");
          setLoading(false);
          return;
        }
        const uploadData = await uploadRes.json();
        finalPosterPath = uploadData.key;
      }

      const payload = {
        ...formData,
        poster_path: finalPosterPath,
        start_date_time: formData.start_date_time?.replace("T", " ") + ":00",
        end_date_time: formData.end_date_time?.replace("T", " ") + ":00",
        is_special_event: formData.is_special_event ? 1 : 0,
      };

      const url = initialData
        ? `${API_URL}/events/${initialData.id}`
        : `${API_URL}/events`;

      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(initialData ? "Event updated" : "Event created");
        router.push("/events");
        router.refresh();
      } else {
        toast.error("Failed to save event");
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      toast.error("Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      className="space-y-6 max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Event Name</Label>
          <Input
            required
            value={formData.event_name}
            onChange={(e) =>
              setFormData({ ...formData, event_name: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Club / Host Name</Label>
          <Input
            value={formData.club_name}
            onChange={(e) =>
              setFormData({ ...formData, club_name: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Event Type</Label>
          <Input
            value={formData.event_type}
            onChange={(e) =>
              setFormData({ ...formData, event_type: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
            placeholder="e.g. Workshop, Hackathon"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Event For</Label>
          <Select
            value={formData.event_for}
            onValueChange={(value) =>
              setFormData({ ...formData, event_for: value })
            }
          >
            <SelectTrigger className="w-full h-10 text-sm focus:ring-primary/20">
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_FOR_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-sm">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Start Date & Time</Label>
          <Input
            type="datetime-local"
            required
            value={toInputDate(formData.start_date_time)}
            onChange={(e) =>
              setFormData({ ...formData, start_date_time: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">End Date & Time</Label>
          <Input
            type="datetime-local"
            value={toInputDate(formData.end_date_time)}
            onChange={(e) =>
              setFormData({ ...formData, end_date_time: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Registration Fee (₹, per person, incl. 18% GST)
          </Label>
          <Input
            type="number"
            min="0"
            value={formData.price_per_person}
            onChange={(e) =>
              setFormData({
                ...formData,
                price_per_person: Number(e.target.value),
              })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Participation</Label>
          <Select
            value={formData.participation_type}
            onValueChange={(value) =>
              setFormData({ ...formData, participation_type: value })
            }
          >
            <SelectTrigger className="w-full h-10 text-sm focus:ring-primary/20">
              <SelectValue placeholder="Select participation type" />
            </SelectTrigger>
            <SelectContent>
              {PARTICIPATION_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-sm">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Venue</Label>
          <Input
            value={formData.event_venue}
            onChange={(e) =>
              setFormData({ ...formData, event_venue: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Short Description</Label>
        <Input
          value={formData.short_description}
          onChange={(e) =>
            setFormData({ ...formData, short_description: e.target.value })
          }
          className="h-10 text-sm focus-visible:ring-primary/20"
          placeholder="Brief summary of the event"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Long Description</Label>
        <Textarea
          className="min-h-[120px] text-sm focus-visible:ring-primary/20"
          value={formData.long_description}
          onChange={(e) =>
            setFormData({ ...formData, long_description: e.target.value })
          }
          placeholder="Detailed description, rules, schedule, etc."
        />
      </div>

      <div className="flex items-center space-x-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50">
        <Switch
          id="special-mode"
          checked={Boolean(formData.is_special_event)}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_special_event: checked })
          }
        />
        <Label htmlFor="special-mode" className="text-sm font-medium cursor-pointer">
          Is Special Event? (Highlights it on the main site)
        </Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Registration Link</Label>
          <Input
            value={formData.registration_link}
            onChange={(e) =>
              setFormData({ ...formData, registration_link: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Team Size</Label>
          <Input
            placeholder="e.g. 1-4"
            value={formData.team_size}
            onChange={(e) =>
              setFormData({ ...formData, team_size: e.target.value })
            }
            className="h-10 text-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-200/60">
        <Label className="text-sm font-medium">Faculty Coordinator</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Employee ID</Label>
            <Input
              value={formData.faculty_coord_emp_id}
              onChange={(e) =>
                setFormData({ ...formData, faculty_coord_emp_id: e.target.value })
              }
              className="h-10 text-sm focus-visible:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={formData.faculty_coord_name}
              onChange={(e) =>
                setFormData({ ...formData, faculty_coord_name: e.target.value })
              }
              className="h-10 text-sm focus-visible:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Mobile Number</Label>
            <Input
              type="tel"
              value={formData.faculty_coord_mobile}
              onChange={(e) =>
                setFormData({ ...formData, faculty_coord_mobile: e.target.value })
              }
              className="h-10 text-sm focus-visible:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={formData.faculty_coord_email}
              onChange={(e) =>
                setFormData({ ...formData, faculty_coord_email: e.target.value })
              }
              className="h-10 text-sm focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-zinc-200/60">
        <Label className="text-sm font-medium">Poster Image</Label>
        
        {initialData?.poster_path && !file && (
          <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 mb-3 transition-colors">
            <div className="h-14 w-14 rounded-lg overflow-hidden border border-zinc-200 bg-white shrink-0 relative">
              <img
                src={`${CDN_URL}/${initialData.poster_path}`}
                alt="Current"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Current Poster</p>
              <p className="text-xs text-zinc-500">Attached to this event</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {file || isCompressing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-xl border border-primary/20 p-3 bg-primary/5 flex items-center gap-4"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full hover:bg-black/5 text-zinc-500 hover:text-zinc-900"
                onClick={clearFile}
                disabled={isCompressing}
              >
                <XIcon className="h-4 w-4" />
              </Button>
              <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-200 bg-white shrink-0 flex items-center justify-center">
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className={`h-full w-full object-cover transition-opacity duration-300 ${isCompressing ? "opacity-30 blur-sm" : "opacity-100"}`}
                  />
                )}
                {isCompressing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SpinnerIcon className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="min-w-0 pr-8">
                {isCompressing ? (
                  <p className="font-medium text-primary animate-pulse text-sm">
                    Compressing...
                  </p>
                ) : (
                  <>
                    <p className="font-semibold text-zinc-900 text-sm truncate">
                      {file?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500 font-medium">{(file!.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider">
                        Ready
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.label
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 p-8 hover:border-primary/50 hover:bg-primary/5 bg-zinc-50/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400">
                <UploadSimpleIcon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-primary block">
                  Click to upload poster
                </span>
                <span className="text-xs text-zinc-500 mt-1 block">
                  Images will be automatically compressed to WebP
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </motion.label>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200/60 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-10 text-sm font-medium min-w-[100px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || isCompressing}
          className="h-10 text-sm font-medium min-w-[140px] bg-primary hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center"
              >
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </motion.div>
            ) : isCompressing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Processing...
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {initialData ? "Update Event" : "Create Event"}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </form>
  );
}
