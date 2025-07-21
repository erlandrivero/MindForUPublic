const FinalCtaSection = () => (
  <section className="w-full bg-gradient-to-r from-slate-900 to-primaryTeal py-16">
    <div className="max-w-3xl mx-auto px-8 text-center flex flex-col items-center gap-6">
      <h2 className="font-extrabold text-3xl lg:text-5xl text-white mb-2">
        <span className="bg-gradient-to-r from-primaryTeal to-cyan-500 bg-clip-text text-transparent">Reclaim Your Time</span> Today
      </h2>
      <p className="text-lg mb-4 max-w-xl" style={{color: '#7ce2e2'}}>
        Get started with MindForU and experience the effortless efficiency your business deserves. Instant setup. No credit card required.
      </p>
      <a href="#pricing" className="bg-[#18C5C2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1A7F6B] transition duration-300 inline-block">
        Get Started Today
      </a>
      <span className="text-sm mt-2" style={{color: '#7ce2e2'}}>No Credit Card Required. Instant Setup.</span>
    </div>
  </section>
);

export default FinalCtaSection;
