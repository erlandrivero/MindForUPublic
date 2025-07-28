import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserProfile from "@/components/dashboard/UserProfile";

export const dynamic = "force-dynamic";

// Settings/Profile page - protected by dashboard layout authentication
export default async function SettingsPage() {
  return (
    <DashboardLayout activeTab="settings">
      <UserProfile />
    </DashboardLayout>
  );
}
