import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AIAssistantManager from '@/components/dashboard/AIAssistantManagerClean';

export const dynamic = "force-dynamic";

// AI Assistants management page - protected by dashboard layout authentication
export default async function AssistantsPage() {
  return (
    <DashboardLayout activeTab="assistants">
      <div className="space-y-6">
        <AIAssistantManager />
      </div>
    </DashboardLayout>
  );
}
