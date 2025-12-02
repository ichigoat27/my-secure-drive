import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { FileText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  user: User | null;
}

export const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FileServer</h1>
              <p className="text-xs text-muted-foreground">Secure file management</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
