import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PhoneNumberManager from '@/components/dashboard/PhoneNumberManager.new';

export default function PhoneNumbersPage() {
  return (
    <DashboardLayout activeTab="phone-numbers">
      <PhoneNumberManager />
    </DashboardLayout>
  );
}
