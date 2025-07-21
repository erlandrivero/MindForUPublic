const faqs = [
  {
    question: "Do I need to install any software?",
    answer:
      "No installation required! MindForU is fully cloud-based and works in any modern browser.",
  },
  {
    question: "Can I try MindForU for free?",
    answer:
      "Yes! Every new account gets a 14-day free trial with no credit card required.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption and security best practices to keep your data safe.",
  },
  {
    question: "Does MindForU integrate with my calendar?",
    answer:
      "Yes, we support Google, Outlook, and Apple Calendar integrations for seamless scheduling.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Of course! You can cancel your subscription at any time, no questions asked.",
  },
];

const FaqSection = () => (
  <section id="faq" className="w-full bg-slate-50 py-16">
    <div className="max-w-4xl mx-auto px-8">
      {/* Section Header */}
      <div className="flex flex-col items-center mb-10 text-center">
        <h2 className="font-extrabold text-3xl lg:text-5xl mb-4 text-secondarySlate">Frequently Asked Questions</h2>
        <p className="max-w-2xl text-lg opacity-80">If you have more questions, reach out to our support team anytime!</p>
      </div>
      {/* FAQ Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {faqs.map((faq) => (
          <div key={faq.question} className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition flex flex-col gap-2">
            <h3 className="font-bold text-lg text-primaryTeal">{faq.question}</h3>
            <p className="text-base text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FaqSection;
