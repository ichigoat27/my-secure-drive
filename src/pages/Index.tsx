import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { FileEditor } from "@/components/FileEditor";

interface FileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFiles(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={user} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Files</h2>
            <p className="text-muted-foreground">
              Upload, manage, and edit your files securely
            </p>
          </div>

          <FileUpload userId={user.id} onUploadComplete={loadFiles} />
          
          <div>
            <h3 className="text-xl font-semibold mb-4">All Files</h3>
            <FileList
              files={files}
              onFileDeleted={loadFiles}
              onEditFile={setEditingFile}
            />
          </div>
        </div>
      </main>

      <Footer />

      {editingFile && (
        <FileEditor
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSaved={loadFiles}
        />
      )}
    </div>
  );
};

export default Index;
