"use client";

import { useEffect, useState } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrashIcon, LinkIcon, DownloadIcon, CheckIcon, SpinnerIcon, FileIcon } from "@phosphor-icons/react";
import { API_URL, CDN_URL } from "@/lib/config";
import type { MediaFile } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/media`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch-on-mount: setLoading(true) inside fetchMedia runs synchronously,
    // which the compiler's effect analysis can't distinguish from a loop-causing update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedia();
  }, []);

  const handleDelete = async (key: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    
    setIsDeleting(key);
    try {
      const res = await fetch(`${API_URL}/media/${key}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchMedia();
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopyLink = (key: string) => {
    const url = `${CDN_URL}/${key}`;
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;
    
    try {
      const zip = new JSZip();
      const promises = files.map(async (file) => {
        const response = await fetch(`${CDN_URL}/${file.key}`);
        const blob = await response.blob();
        zip.file(file.key, blob);
      });
      
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `technovit_media_${new Date().toISOString().split('T')[0]}.zip`);
    } catch (error) {
      console.error("Failed to download files:", error);
      alert("Failed to download files. Check console for details.");
    }
  };

  return (
    <CMSLayout
      title="Media Library"
      description="Manage all uploaded posters and images"
      actions={
        <Button 
          variant="outline" 
          className="h-9 text-xs sm:text-sm bg-white shadow-sm"
          onClick={handleDownloadAll}
          disabled={files.length === 0}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download All
        </Button>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <SpinnerIcon className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="text-sm font-medium">Loading media library...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <FileIcon className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">No media files found</h3>
            <p className="text-sm text-zinc-500">Upload posters when creating events to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div
                  key={file.key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.3) }}
                >
                  <Card className="overflow-hidden border-zinc-200/60 shadow-sm group bg-white hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="aspect-square relative bg-zinc-100 flex items-center justify-center overflow-hidden">
                      {file.key.startsWith('images/') ? (
                        <img
                          src={`${CDN_URL}/${file.key}`}
                          alt={file.key} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <FileIcon className="h-10 w-10 text-zinc-300" />
                      )}
                      
                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button
                          onClick={() => handleCopyLink(file.key)}
                          className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          title="Copy Link"
                        >
                          {copiedKey === file.key ? (
                            <CheckIcon className="h-4 w-4 text-green-400" />
                          ) : (
                            <LinkIcon className="h-4 w-4" />
                          )}
                        </button>
                        <a
                          href={`${CDN_URL}/${file.key}`}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          title="Download"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.key)}
                          disabled={isDeleting === file.key}
                          className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          {isDeleting === file.key ? (
                            <SpinnerIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold text-zinc-900 truncate" title={file.key}>
                        {file.key}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] font-medium text-zinc-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400">
                          {new Date(file.uploaded).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CMSLayout>
  );
}
