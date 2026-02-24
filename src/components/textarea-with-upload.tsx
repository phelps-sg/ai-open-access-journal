"use client";

import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface TextareaWithUploadProps
  extends React.ComponentProps<typeof Textarea> {
  accept?: string;
  onFileContent?: (content: string, fileName: string) => void;
}

export function TextareaWithUpload({
  accept = ".csv,.json,.txt,.tsv,.md",
  onFileContent,
  ...textareaProps
}: TextareaWithUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = accept.split(",").map((e) => e.trim().toLowerCase());

  async function handleFile(file: File) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      toast.error("Unsupported file type", {
        description: `Allowed: ${allowedExtensions.join(", ")}`,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Maximum file size is 5 MB",
      });
      return;
    }

    try {
      const content = await file.text();
      onFileContent?.(content, file.name);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Failed to read file");
    }
  }

  return (
    <div className="space-y-1">
      <Textarea {...textareaProps} />
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload />
        Upload file
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
