import { Users, Shield, Clock, Headphones } from "lucide-react";

const stats = [
  {
    icon: <Users className="w-8 h-8 text-primaryTeal" />,
    value: "10,000+",
    label: "Happy Customers",
  },
  {
    icon: <Shield className="w-8 h-8 text-primaryTeal" />,
    value: "99.9%",
    label: "Uptime",
  },
  {
    icon: <Clock className="w-8 h-8 text-primaryTeal" />,
    value: "24/7",
    label: "Support",
  },
  {
    icon: <Headphones className="w-8 h-8 text-primaryTeal" />,
    value: "500K+",
    label: "Calls Handled",
  },
];

const StatsSection = () => (
  <section className="w-full bg-white/50 backdrop-blur-sm py-12">
    <div className="max-w-7xl mx-auto px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-3 p-6 rounded-2xl shadow bg-white/80">
            {stat.icon}
            <span className="text-3xl font-extrabold text-secondarySlate">{stat.value}</span>
            <span className="text-base font-medium text-gray-600">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
