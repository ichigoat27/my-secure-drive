import { useState } from "react";
import { File, Download, Trash2, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface FileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

interface FileListProps {
  files: FileItem[];
  onFileDeleted: () => void;
  onEditFile: (file: FileItem) => void;
}

export const FileList = ({ files, onFileDeleted, onEditFile }: FileListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from("user-files")
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("File downloaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error downloading file");
    }
  };

  const handleDelete = async (file: FileItem) => {
    setDeletingId(file.id);
    try {
      const { error: storageError } = await supabase.storage
        .from("user-files")
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;

      toast.success("File deleted successfully!");
      onFileDeleted();
    } catch (error: any) {
      toast.error(error.message || "Error deleting file");
    } finally {
      setDeletingId(null);
    }
  };

  const isTextFile = (mimeType: string) => {
    return mimeType.startsWith("text/") || 
           mimeType === "application/json" ||
           mimeType === "application/javascript";
  };

  if (files.length === 0) {
    return (
      <Card className="p-8 text-center">
        <File className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No files uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium truncate">{file.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)} • {format(new Date(file.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isTextFile(file.mime_type) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditFile(file)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(file)}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(file)}
                disabled={deletingId === file.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
