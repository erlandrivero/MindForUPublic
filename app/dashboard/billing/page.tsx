import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BillingManagement from "@/components/dashboard/BillingManagement";

export const dynamic = "force-dynamic";

// Billing management page - protected by dashboard layout authentication
export default async function BillingPage() {
  return (
    <DashboardLayout activeTab="billing">
      <BillingManagement />
    </DashboardLayout>
  );
}
