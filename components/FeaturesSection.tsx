import { Zap, CheckCircle, BarChart3, Smile, TrendingUp, Heart } from "lucide-react";

const features = [
  {
    icon: <CheckCircle className="w-8 h-8 text-[#22C55E]" />, // Green check
    title: "Never Miss a Lead",
    desc: "Capture every inquiry, 24/7, ensuring no potential client slips through the cracks.",
    color: "bg-[#EAF6FB]", // swapped to cyan
  },
  {
    icon: <Zap className="w-8 h-8 text-[#06B6D4]" />, // Cyan lightning
    title: "Automate Your Admin",
    desc: "Eliminate repetitive tasks, reduce manual errors, and free up valuable staff time for higher-value work.",
    color: "bg-[#EAFBF3]", // swapped to green
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-[#089387]" />, // Custom green-teal trending up
    title: "Scale with Confidence",
    desc: "Seamlessly handle increasing client demand without the operational chaos or need for additional hires.",
    color: "bg-[#FFF7E6]",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-[#818CF8]" />, // Indigo bar chart
    title: "Actionable Insights",
    desc: "Real-time analytics help you optimize performance and grow your business.",
    color: "bg-[#EEF2FF]",
  },
  {
    icon: <Heart className="w-8 h-8 text-[#F43F5E]" />, // Rose heart
    title: "Reclaim Your Sanity",
    desc: "Reduce stress, anxiety, and overwhelm, gaining back control and enjoying a better work-life balance.",
    color: "bg-[#FDF2F8]",
  },
  {
    icon: <Smile className="w-8 h-8 text-[#06A7C7]" />, // Blue smile
    title: "Delight Your Clients",
    desc: "Provide a consistent, professional, and convenient experience that builds loyalty and boosts satisfaction.",
    color: "bg-[#F5F5F4]",
  },
];


const FeaturesSection = () => (
  <section id="features" className="w-full bg-slate-50 py-16">
    <div className="max-w-7xl mx-auto px-8">
      {/* Section Header */}
      <div className="flex flex-col items-center mb-12 text-center">
        <span className="inline-flex items-center gap-2 px-8 py-2 rounded-full font-sans mb-2 tracking-wide" style={{background: '#6FE7DD', color: '#17796d', fontFamily: `'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`, fontSize: '1.1rem', lineHeight: 1.2, letterSpacing: '0.04em', fontWeight: 400, boxShadow: 'none'}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#17796d" strokeWidth="2.2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.4rem' }}><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" fill="none"/></svg>Powerful Features</span>
        <h2 className="font-extrabold text-3xl lg:text-5xl mb-4 text-center">
  <span className="text-black">Unlock a New Era of</span><br />
  <span className="bg-clip-text text-transparent" style={{backgroundImage: 'linear-gradient(90deg, #22303b, #18C5C2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Productivity & Peace of Mind</span>
</h2>
        <p className="max-w-2xl text-lg opacity-80">Imagine a world where your business runs like a well-oiled machine, where every call is answered, every appointment is perfectly scheduled, and your team is free to excel. That world is within reach.</p>
      </div>
      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className={`flex flex-col items-center text-center gap-4 p-7 rounded-[20px] shadow-[0_4px_11px_rgba(0,0,0,0.15)] bg-white transition`}>
            <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full" style={{background: feature.color.replace('bg-', '')}}>
  {feature.icon}
</div>
            <h3 className="font-semibold text-[1.18rem] leading-snug text-[#34322D] font-sans">{feature.title}</h3>
            <p className="text-[1rem] text-gray-700 font-sans">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
