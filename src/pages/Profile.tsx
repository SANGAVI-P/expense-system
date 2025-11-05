import Header from "@/components/Header";
import { AppFooter } from "@/components/AppFooter";
import { ProfileForm } from "@/components/ProfileForm";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const { isLoading } = useProfile();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">My Profile</h2>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <ProfileForm />
            <UpdatePasswordForm />
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
};

export default Profile;