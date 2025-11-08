import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { User, Building, Phone, FileText, Activity, Clock, CheckCircle2 } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  specialty: string | null;
  workplace: string | null;
  license_number: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface DoctorStats {
  total_patients: number;
  consultations_today: number;
  notes_generated: number;
  tasks_completed: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DoctorStats>({
    total_patients: 0,
    consultations_today: 0,
    notes_generated: 0,
    tasks_completed: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);

        // Fetch stats
        const { data: statsData } = await supabase
          .from("doctor_stats")
          .select("*")
          .eq("doctor_id", user.id)
          .single();

        if (statsData) {
          setStats(statsData);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, toast]);

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          specialty: profile.specialty,
          workplace: profile.workplace,
          license_number: profile.license_number,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || profile.email[0].toUpperCase();

  const statCards = [
    { label: "Total Patients", value: stats.total_patients, icon: User, color: "text-primary" },
    { label: "Today's Consultations", value: stats.consultations_today, icon: Activity, color: "text-accent" },
    { label: "Notes Generated", value: stats.notes_generated, icon: Clock, color: "text-orange-500" },
    { label: "Tasks Completed", value: stats.tasks_completed, icon: CheckCircle2, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.full_name || "Doctor"}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              {profile.specialty && (
                <p className="text-sm text-primary mt-1">{profile.specialty}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                placeholder="e.g., General Practice, Cardiology"
                value={profile.specialty || ""}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workplace">Workplace</Label>
              <Input
                id="workplace"
                placeholder="Hospital or Clinic Name"
                value={profile.workplace || ""}
                onChange={(e) => setProfile({ ...profile, workplace: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                placeholder="Medical License"
                value={profile.license_number || ""}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Read Only)</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
