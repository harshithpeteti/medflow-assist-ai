import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
  email: string;
}

const ProfileButton = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, specialty, avatar_url, email")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await signOut();
      navigate("/auth");
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || profile.email[0].toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate("/profile")}
      >
        <Settings className="h-5 w-5" />
      </Button>
      <div 
        className="flex items-center gap-3 pl-3 border-l border-border cursor-pointer"
        onClick={() => navigate("/profile")}
      >
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-foreground">
            {profile.full_name || "Doctor"}
          </p>
          <p className="text-xs text-muted-foreground">
            {profile.specialty || "Medical Professional"}
          </p>
        </div>
        <Avatar>
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ProfileButton;
