import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";

export const dynamic = "force-dynamic";

// Analytics dashboard page - protected by dashboard layout authentication
export default async function AnalyticsPage() {
  return (
    <DashboardLayout activeTab="analytics">
      <AnalyticsDashboard />
    </DashboardLayout>
  );
}
