import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  userId: string;
  onUploadComplete: () => void;
}

export const FileUpload = ({ userId, onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("user-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("files").insert({
          user_id: userId,
          name: file.name,
          size: file.size,
          mime_type: file.type,
          storage_path: filePath,
        });

        if (dbError) throw dbError;
      }

      toast.success("Files uploaded successfully!");
      onUploadComplete();
      e.target.value = "";
    } catch (error: any) {
      toast.error(error.message || "Error uploading files");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop files or click to browse
        </p>
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={isUploading}>
            <span className="cursor-pointer">
              {isUploading ? "Uploading..." : "Choose Files"}
            </span>
          </Button>
        </label>
      </div>
    </Card>
  );
};
