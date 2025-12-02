import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Save } from "lucide-react";

interface FileEditorProps {
  file: {
    id: string;
    name: string;
    storage_path: string;
  };
  onClose: () => void;
  onSaved: () => void;
}

export const FileEditor = ({ file, onClose, onSaved }: FileEditorProps) => {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFile();
  }, [file]);

  const loadFile = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("user-files")
        .download(file.storage_path);

      if (error) throw error;

      const text = await data.text();
      setContent(text);
    } catch (error: any) {
      toast.error(error.message || "Error loading file");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const blob = new Blob([content], { type: "text/plain" });
      
      const { error } = await supabase.storage
        .from("user-files")
        .update(file.storage_path, blob, {
          upsert: true,
        });

      if (error) throw error;

      toast.success("File saved successfully!");
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error saving file");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit File</CardTitle>
              <CardDescription>{file.name}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading file...</p>
            </div>
          ) : (
            <>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 font-mono text-sm resize-none min-h-[400px]"
                placeholder="File content..."
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
