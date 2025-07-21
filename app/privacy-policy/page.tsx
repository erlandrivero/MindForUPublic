import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://fenago.com
// - Name: FeNAgO
// - Description: A Next.js agentic SaaS boilerplate to help entrepreneurs build AI-powered applications more efficiently
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: support@fenago.com

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: July 14, 2025

1. Introduction

This Privacy Policy describes how MindForU ("we," "us," or "our") collects, uses, processes, and shares your personal information when you use our website, products, and services (collectively, "Services"). We are committed to protecting your privacy and handling your data in a transparent and secure manner. By accessing or using our Services, you agree to the terms of this Privacy Policy.

1.1 Scope of Policy
This Privacy Policy applies to all personal information collected through our Services, as well as any related services, sales, marketing, or events. It does not apply to third-party websites or services that may be linked from our Services.

1.2 Changes to Policy
We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website or through other appropriate communication channels. Your continued use of our Services after such changes constitutes your acceptance of the revised Privacy Policy.

1.3 Data Controller
MindForU is the data controller responsible for your personal information collected through our Services.

2. Information We Collect

We collect various types of information to provide and improve our Services, including:

2.1 Personal Information You Provide

**Account Data:** When you create an account, we collect your name, email address, and password. If you use third-party authentication (e.g., Google Sign-In), we receive information from that service as authorized by you.

**Contact Data:** If you contact us for support, inquiries, or feedback, we collect your name, email address, and the content of your communication.

**Payment Data:** When you make purchases, we collect payment information (e.g., credit card details) through secure third-party payment processors. We do not store full payment card numbers on our servers.

**Usage Data:** Information about how you use our Services, including features accessed, time spent, and interactions with AI models.

**Content Data:** Any content you create, upload, or generate using our Services, including text, images, audio, or other media.

2.2 Information Collected Automatically

**Log Data:** Our servers automatically record information when you access or use our Services, including your IP address, browser type, operating system, referring URLs, device information, and timestamps.

**Usage Data:** We collect information about your activity on our Services, such as pages viewed, features used, and the duration of your sessions. This helps us understand user behavior and improve our Services.

**Device Data:** Information about the device you use to access our Services, including hardware model, operating system, unique device identifiers, and mobile network information.

**Location Data:** We may collect approximate location data based on your IP address or more precise location data if you enable location services on your device.

2.3 Information from Third Parties

We may receive information about you from third-party services, such as analytics providers, advertising partners, and social media platforms, in accordance with their privacy policies.

3. How We Use Your Information

We use the information we collect for various purposes, including:

**To Provide and Maintain Services:** To operate, maintain, and improve the functionality of our Services, including processing transactions and delivering requested features.

**To Personalize User Experience:** To tailor our Services to your preferences, provide customized content, and offer relevant recommendations.

**To Communicate with You:** To send you service-related notifications, updates, security alerts, and support messages. We may also send promotional communications if you have opted in.

**For Analytics and Research:** To understand how users interact with our Services, analyze trends, and conduct research to enhance our offerings.

**For Security and Fraud Prevention:** To detect, prevent, and address fraudulent or unauthorized activities, and to ensure the security of our systems and data.

**For Legal Compliance:** To comply with applicable laws, regulations, legal processes, and governmental requests.

**For Marketing and Advertising:** To deliver targeted advertisements and measure the effectiveness of our marketing campaigns.

**For AI Model Training:** To train and improve our AI models, which may involve using anonymized or aggregated data. We do not use personal content for training without explicit consent.

4. How We Share Your Information

We may share your information with third parties in the following circumstances:

**Service Providers:** We engage third-party service providers to perform functions on our behalf, such as payment processing, hosting, analytics, and customer support. These providers have access to personal information only as needed to perform their functions and are bound by confidentiality obligations.

**Business Transfers:** In the event of a merger, acquisition, reorganization, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.

**Legal Requirements:** We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order or government agency request).

**Protection of Rights:** We may disclose your information to protect our rights, property, or safety, or the rights, property, or safety of our users or others.

**With Your Consent:** We may share your information with third parties when we have your explicit consent to do so.

**Aggregated or Anonymized Data:** We may share aggregated or anonymized data that cannot reasonably be used to identify you with third parties for various purposes, including research, analytics, and marketing.

5. Data Retention

We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When your personal information is no longer needed, we will securely delete or anonymize it.

6. Your Privacy Rights

Depending on your jurisdiction, you may have certain rights regarding your personal information, including:

**Right to Access:** You have the right to request access to the personal information we hold about you.

**Right to Rectification:** You have the right to request that we correct any inaccurate or incomplete personal information.

**Right to Erasure (Right to be Forgotten):** You have the right to request the deletion of your personal information under certain circumstances.

**Right to Restriction of Processing:** You have the right to request that we restrict the processing of your personal information under certain conditions.

**Right to Data Portability:** You have the right to receive your personal information in a structured, commonly used, and machine-readable format.

**Right to Object:** You have the right to object to the processing of your personal information under certain circumstances, including for direct marketing purposes.

**Right to Withdraw Consent:** If we rely on your consent to process your personal information, you have the right to withdraw that consent at any time.

To exercise any of these rights, please contact us using the contact information provided in Section 13.

7. Data Security

We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include encryption, access controls, regular security audits, and employee training. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security of your personal information.

8. International Data Transfers

8.1 Global Operations

MindForU operates globally, and your personal information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws than your country.

8.2 Safeguards for International Transfers

When we transfer personal information internationally, we implement appropriate safeguards to protect your data:

**Adequacy Decisions:** We may transfer data to countries that have been deemed to provide adequate protection by relevant authorities.

**Standard Contractual Clauses:** We use European Commission-approved Standard Contractual Clauses or equivalent mechanisms to ensure appropriate protection.

**Binding Corporate Rules:** We may implement binding corporate rules to govern international transfers within our organization.

**Certification Programs:** We may rely on certification programs and codes of conduct that provide appropriate safeguards.

8.3 Data Processing Locations

Your personal information may be processed in the following regions:
- United States (primary data processing location)
- European Union (for EU users and backup purposes)
- Other regions where our service providers operate

9. Cookies and Tracking Technologies

9.1 Types of Cookies We Use

We use various types of cookies and similar technologies:

**Essential Cookies:** Necessary for the operation of our Services, including authentication, security, and basic functionality.

**Performance Cookies:** Help us understand how users interact with our Services by collecting anonymous usage statistics.

**Functional Cookies:** Enable enhanced functionality and personalization, such as remembering your preferences.

**Marketing Cookies:** Used to deliver relevant advertisements and measure the effectiveness of marketing campaigns.

9.2 Third-Party Cookies

We may allow third-party service providers to place cookies on your device for analytics, advertising, and other purposes. These third parties have their own privacy policies governing their use of your information.

9.3 Cookie Management

You can control cookies through your browser settings:
- Most browsers allow you to block or delete cookies
- You can set your browser to notify you when cookies are being used
- Some features of our Services may not function properly if you disable cookies

9.4 Do Not Track

Currently, we do not respond to "Do Not Track" signals from browsers, as there is no universally accepted standard for how to respond to such signals.

10. Children's Privacy

10.1 Age Restrictions

Our Services are not intended for children under the age of 16. We do not knowingly collect personal information from children under 16 without parental consent.

10.2 Parental Rights

If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately. We will take steps to remove such information from our systems.

10.3 Educational Use

If our Services are used in educational settings with children, we ensure compliance with applicable laws such as COPPA (Children's Online Privacy Protection Act) and work with educational institutions to obtain appropriate consents.

11. California Privacy Rights

11.1 CCPA Disclosures

For California residents, we provide the following disclosures about our data practices in the 12 months preceding the effective date of this Privacy Policy:

Categories of Personal Information Collected:
- **Identifiers (name, email, IP address)**
- **Commercial information (purchase history, preferences)**
- **Internet activity (usage data, device information)**
- **Audio/visual information (voice recordings)**
- **Professional information (job title, company)**

Sources of Personal Information:
- **Directly from you**
- **Automatically through your use of our Services**
- **From third-party integrations with your consent**

Business Purposes for Collection:
- **Providing and improving our Services**
- **Customer support and communication**
- **Security and fraud prevention**
- **Legal compliance**

Categories of Third Parties We Share With:
- **Service providers and vendors**
- **Professional advisors**
- **Legal and regulatory authorities (when required)**

11.2 Sale of Personal Information

We do not sell personal information as defined by the CCPA. We do not have actual knowledge of selling personal information of minors under 16 years of age.

11.3 Exercising CCPA Rights

California residents can exercise their rights by:
- Emailing us at privacy@mindforu.com
- Calling our toll-free number: [Phone Number]
- Submitting a request through our website

We do not discriminate against users who exercise their CCPA rights.

12. Updates to This Privacy Policy

12.1 Policy Changes

We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes through:

Email Notification: Sending notice to the email address associated with your account.

Website Notice: Posting a prominent notice on our website and within our Services.

In-App Notification: Providing notification through our platform interface.

12.2 Effective Date

Changes to this Privacy Policy will become effective on the date specified in the updated policy. Your continued use of our Services after the effective date constitutes acceptance of the updated Privacy Policy.

12.3 Material Changes

For material changes that significantly affect your privacy rights, we will provide at least 30 days' advance notice and may require your explicit consent to continue using our Services.

13. Contact Information

13.1 Privacy Officer

For questions, concerns, or requests related to this Privacy Policy or our data practices, please contact our Privacy Officer:

Email: privacy@mindforu.com
Phone: [Privacy Officer Phone Number]
Address: [Privacy Officer Mailing Address]

13.2 Data Protection Officer

For users in the European Union, you can contact our Data Protection Officer:

Email: dpo@mindforu.com
Address: [DPO Mailing Address]

13.3 General Contact Information

Customer Support: support@mindforu.com
Legal Department: legal@mindforu.com
Website: https://mindforu.com
Mailing Address: [Company Mailing Address]

13.4 Supervisory Authorities

If you are located in the European Economic Area and believe we have violated your privacy rights, you have the right to lodge a complaint with your local data protection authority.

14. Additional Information

14.1 Third-Party Links

Our Services may contain links to third-party websites or services. This Privacy Policy does not apply to those third-party sites, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party sites you visit.

14.2 Social Media

We may maintain social media accounts and interact with users through social media platforms. Your interactions with us on social media are governed by the privacy policies of those platforms.

14.3 Data Accuracy

We strive to maintain accurate and up-to-date personal information. Please help us by keeping your account information current and notifying us of any changes.

14.4 Privacy by Design

We incorporate privacy considerations into the design and development of our Services, implementing privacy-protective measures from the outset rather than as an afterthought.

ACKNOWLEDGMENT

By using our Services, you acknowledge that you have read and understood this Privacy Policy and agree to our collection, use, and disclosure of your personal information as described herein.

This Privacy Policy is effective as of the "Last Updated" date specified above and will remain in effect until modified in accordance with the provisions herein.

* 2025 MindForU. All rights reserved.*`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
