"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ImageSquareIcon,
  ImagesSquareIcon,
  VideoCameraIcon,
  UploadSimpleIcon,
  XIcon,
  EyeIcon,
  InfoIcon,
  SpinnerIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { API_URL, CDN_URL } from "@/lib/config";
import { compressImage } from "@/lib/utils";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { toast } from "sonner";

type MediaType = "photos" | "videos" | "gallery";

interface UploadedFile {
  name: string;
  size: number;
  path: string;
  url?: string;
  type: MediaType;
}

export default function UploadMediaPage() {
  const [activeTab, setActiveTab] = useState<MediaType>("photos");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewMedia, setPreviewMedia] = useState<UploadedFile | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles = Array.from(fileList);
      const filteredFiles = newFiles.filter((file) => {
        if (activeTab === "photos" || activeTab === "gallery")
          return file.type.startsWith("image/");
        if (activeTab === "videos") return file.type.startsWith("video/");
        return false;
      });
      setSelectedFiles((prev) => [...prev, ...filteredFiles]);
    },
    [activeTab],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    setProgress({ current: 0, total: 0 });
    setShowClearDialog(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedFiles.length });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const originalFile = selectedFiles[i];
      let fileToUpload = originalFile;

      try {
        if (activeTab === "photos" || activeTab === "gallery") {
          setStatusMessage(`Compressing ${originalFile.name}...`);
          try {
            const compressed = await compressImage(originalFile);
            fileToUpload = new File([compressed], originalFile.name, {
              type: compressed.type,
            });
          } catch (error) {
            console.error("Failed to compress image:", error);
          }
        }

        setStatusMessage(`Uploading ${fileToUpload.name}...`);
        const formData = new FormData();
        formData.append("file", fileToUpload);

        if (activeTab === "gallery") {
          const res = await fetch("/api/gallery/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          const result = data.results?.[0];

          if (res.ok && result?.success) {
            successCount++;
            setUploadedFiles((prev) => [
              {
                name: originalFile.name,
                size: fileToUpload.size,
                path: result.key,
                url: result.url,
                type: activeTab,
              },
              ...prev,
            ]);
          } else {
            failedCount++;
          }
        } else {
          formData.append("folder", activeTab);
          const res = await fetch(`${API_URL}/media`, {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            successCount++;
            setUploadedFiles((prev) => [
              {
                name: originalFile.name,
                size: fileToUpload.size,
                path: data.key || data.path,
                type: activeTab,
              },
              ...prev,
            ]);
          } else {
            failedCount++;
          }
        }
      } catch (error) {
        console.error("Failed to upload file:", error);
        failedCount++;
      }
      setProgress({ current: i + 1, total: selectedFiles.length });
    }

    setIsProcessing(false);
    setStatusMessage("");
    setSelectedFiles([]);

    if (failedCount === 0) {
      toast.success(`${successCount} file${successCount === 1 ? "" : "s"} uploaded`);
    } else if (successCount === 0) {
      toast.error(`Failed to upload ${failedCount} file${failedCount === 1 ? "" : "s"}`);
    } else {
      toast.warning(`${successCount} uploaded, ${failedCount} failed`);
    }
  }, [selectedFiles, activeTab]);

  const filteredUploadedFiles = useMemo(
    () => uploadedFiles.filter((f) => f.type === activeTab),
    [uploadedFiles, activeTab],
  );

  return (
    <CMSLayout
      title="Upload Media"
      description="Upload photos, videos, and gallery images to R2 storage"
      actions={
        <Link href="/media" className="cursor-pointer">
          <Button
            variant="outline"
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs sm:text-sm cursor-pointer px-3"
          >
            <EyeIcon className="mr-2 h-3.5 w-3.5" />
            Browse Media
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 space-y-4">
        <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base font-medium">
                Upload New Media
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Select files to upload.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-zinc-50 px-3 py-1.5 border border-zinc-100 w-fit">
              <InfoIcon className="h-3.5 w-3.5" />
              <span>
                {activeTab === "photos"
                  ? "Auto-WebP Conversion Active"
                  : activeTab === "gallery"
                    ? "Uploads to Gallery R2 Bucket"
                    : "Original Quality Upload"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as MediaType);
                setSelectedFiles([]);
              }}
            >
              <TabsList className="grid w-full grid-cols-3 rounded-none bg-zinc-100 p-1 mb-4 h-9">
                <TabsTrigger
                  value="photos"
                  className="gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm cursor-pointer h-7"
                >
                  <ImageSquareIcon className="h-4 w-4" />
                  Photos
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm cursor-pointer h-7"
                >
                  <VideoCameraIcon className="h-4 w-4" />
                  Videos
                </TabsTrigger>
                <TabsTrigger
                  value="gallery"
                  className="gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm cursor-pointer h-7"
                >
                  <ImagesSquareIcon className="h-4 w-4" />
                  Gallery
                </TabsTrigger>
              </TabsList>

              <div className="mt-2">
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isProcessing) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center border border-dashed p-6 sm:p-8 transition-colors cursor-pointer bg-zinc-50/50 rounded-none ${
                    isProcessing
                      ? "opacity-50 pointer-events-none"
                      : isDragging
                        ? "bg-zinc-100 border-zinc-400"
                        : "hover:bg-zinc-50 hover:border-zinc-400 border-zinc-300"
                  }`}
                >
                  <UploadSimpleIcon className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Click or drag &amp; drop to bulk import {activeTab}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept={
                      activeTab === "videos" ? "video/*" : "image/*"
                    }
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h3 className="text-sm font-medium">
                      Selected ({selectedFiles.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearDialog(true)}
                      disabled={isProcessing}
                      className="text-destructive hover:text-destructive h-6 px-2 text-xs cursor-pointer"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-zinc-50 border border-zinc-100 p-2"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-8 w-8 bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                            {activeTab === "videos" ? (
                              <VideoCameraIcon className="text-zinc-400 h-4 w-4" />
                            ) : activeTab === "gallery" ? (
                              <ImagesSquareIcon className="text-zinc-400 h-4 w-4" />
                            ) : (
                              <ImageSquareIcon className="text-zinc-400 h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-700 text-xs">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isProcessing && idx < progress.current && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          )}
                          {isProcessing && idx === progress.current && (
                            <SpinnerIcon className="h-4 w-4 animate-spin text-zinc-500" />
                          )}
                          {!isProcessing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(idx)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <XIcon className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    {isProcessing && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{statusMessage}</span>
                          <span>
                            {Math.round(
                              (progress.current / progress.total) * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 h-1.5 rounded-none overflow-hidden">
                          <div
                            className="bg-zinc-900 h-full transition-all duration-300"
                            style={{
                              width: `${(progress.current / progress.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleUpload}
                      disabled={isProcessing}
                      className="w-full rounded-none h-8 sm:h-9 text-xs sm:text-sm cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        `Upload ${selectedFiles.length} Files`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {filteredUploadedFiles.length > 0 && (
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
            <CardHeader className="border-b border-zinc-100 p-4">
              <CardTitle className="text-base font-medium">
                Session Uploads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredUploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="group relative border border-zinc-200 bg-zinc-50"
                  >
                    <div className="aspect-square bg-zinc-100 flex items-center justify-center relative overflow-hidden">
                      {file.type === "photos" || file.type === "gallery" ? (
                        <img
                          src={file.url || `${CDN_URL}/${file.path}`}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <VideoCameraIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-none h-7 px-2.5 text-xs cursor-pointer"
                          onClick={() => setPreviewMedia(file)}
                        >
                          <EyeIcon className="mr-1.5 h-3.5 w-3.5" /> Preview
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 bg-white border-t border-zinc-200">
                      <p className="text-xs truncate font-medium">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <ConfirmDialog
          open={showClearDialog}
          onOpenChange={setShowClearDialog}
          title="Clear all?"
          description="This will remove all selected files from the queue."
          confirmLabel="Clear"
          onConfirm={clearAllFiles}
        />

        <Dialog
          open={previewMedia !== null}
          onOpenChange={() => setPreviewMedia(null)}
        >
          <DialogContent className="w-[95vw] max-w-4xl h-[80vh] p-0 gap-0 rounded-none border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden focus:outline-none [&>button]:hidden">
            {previewMedia && (
              <>
                <DialogTitle className="sr-only">
                  Preview: {previewMedia.name}
                </DialogTitle>
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs sm:text-sm font-medium text-zinc-200 truncate font-mono">
                      {previewMedia.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={previewMedia.url || `${CDN_URL}/${previewMedia.path}`}
                      download={previewMedia.name}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none cursor-pointer"
                      >
                        <DownloadSimpleIcon className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewMedia(null)}
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none cursor-pointer"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 relative flex items-center justify-center bg-black/40 p-4 overflow-hidden">
                  {previewMedia.type === "videos" ? (
                    <video
                      src={`${CDN_URL}/${previewMedia.path}`}
                      controls
                      autoPlay
                      className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                  ) : (
                    <img
                      src={previewMedia.url || `${CDN_URL}/${previewMedia.path}`}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CMSLayout>
  );
}
