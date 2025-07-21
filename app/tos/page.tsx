import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

//1. Go to https://chat.openai.com/
//2. Copy paste bellow
//3. Replace the data with your own (if needed)
//4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://fenago.com
// - Name: FeNAgO
// - Contact information: support@fenago.com
// - Description: A Next.js agentic SaaS boilerplate to help entrepreneurs build AI-powered applications more efficiently
// - Ownership: when buying a package, users can download code to create apps. 
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://fenago.com/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.6129.25h6.638A.75.75 0 0115 10z"
          clipRule="evenodd"
        />
       </svg>
       Back
      </Link>
      <h1 className="text-3xl font-extrabold pb-6">
       Terms and Conditions for {config.appName}
      </h1>

      <pre
       className="leading-relaxed whitespace-pre-wrap"
       style={{ fontFamily: "sans-serif" }}
      >
       {`Last Updated: July 14, 2025

1. INTRODUCTION

Welcome to MindForU! These Terms and Conditions ("Terms") govern your access to and use of our website, products, and services (collectively, "Services"). By accessing or using any part of our Services, you agree to be bound by these Terms, our Privacy Policy, and all other policies and guidelines incorporated by reference. If you do not agree to all of these Terms, do not access or use our Services.

1.1 Acceptance of Terms
Your continued use of our Services constitutes your explicit acceptance of these Terms. If you are using the Services on behalf of an entity, you represent and warrant that you have the authority to bind that entity to these Terms, and "you" and "your" refer to that entity.

1.2 Changes to Terms
We reserve the right to modify or update these Terms at any time. We will notify you of material changes by posting the updated Terms on our website or through other reasonable means. Your continued use of the Services after such modifications constitutes your acceptance of the revised Terms. It is your responsibility to review these Terms periodically.

1.3 Eligibility
You must be at least 18 years old to use our Services. By agreeing to these Terms, you represent and warrant that you are at least 18 years old and are otherwise legally qualified to enter into and form contracts under applicable law.

---

2. SERVICES DESCRIPTION

MindForU provides an innovative AI-powered platform designed to assist users in various tasks, including but not limited to, content generation, data analysis, and intelligent automation. Our Services may include access to AI models, tools, and features that leverage artificial intelligence and machine learning technologies.

2.1 AI-Powered Features
Our Services utilize AI models that may generate text, images, code, or other content ("AI-Generated Content"). While we strive for accuracy and relevance, AI-Generated Content is produced by algorithms and may not always be accurate, complete, or reflective of real-world facts. You acknowledge that AI technology is constantly evolving and may produce unexpected or undesirable results.

2.2 Beta Features
From time to time, we may offer new features or tools that are in beta testing. These features may not be fully functional or stable and may be subject to change or withdrawal without notice. Your use of such features is at your own risk.

2.3 Service Availability
We will use commercially reasonable efforts to ensure the availability of our Services. However, we do not guarantee uninterrupted or error-free operation. We may suspend or discontinue any part of the Services at any time, including for maintenance, upgrades, or unforeseen circumstances.

---

3. USER ACCOUNTS AND REGISTRATION

3.1 Account Creation
To access certain features of our Services, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.

3.2 Account Security
You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to comply with this section.

3.3 Account Usage
You agree to use your account solely for your personal or internal business purposes and not to share your account credentials with any third party. You are responsible for ensuring that all users who access our Services through your account comply with these Terms.

3.4 Termination of Account
We reserve the right to suspend or terminate your account at our sole discretion, without notice or liability, for any reason, including if you violate these Terms or if your use of the Services poses a security risk or legal liability to us or others.

---

4. USER CONDUCT AND RESPONSIBILITIES

4.1 Prohibited Uses
You agree not to use our Services for any purpose that is unlawful, harmful, or prohibited by these Terms. Prohibited uses include, but are not limited to:

Engaging in any activity that violates applicable laws or regulations;
Infringing upon the intellectual property rights of others;
Transmitting any harmful, defamatory, obscene, or otherwise objectionable content;
Attempting to gain unauthorized access to our systems or other users' accounts;
Interfering with the proper functioning of our Services;
Using the Services to generate or disseminate misinformation, hate speech, or content that promotes violence or discrimination;
Reverse engineering, decompiling, or disassembling any part of our Services;
Using any automated system, including without limitation "robots," "spiders," or "offline readers," to access the Services in a manner that sends more request messages to our servers than a human can reasonably produce in the same period by using a conventional web browser.

4.2 Content Guidelines
When using our Services to generate or submit content, you agree to comply with all applicable content guidelines and policies. You are solely responsible for the content you generate or submit and for ensuring that it does not violate any third-party rights or applicable laws.

4.3 Feedback
If you provide us with any feedback, suggestions, or ideas regarding our Services ("Feedback"), you grant us a perpetual, irrevocable, worldwide, royalty-free, and non-exclusive license to use, reproduce, modify, adapt, publish, translate, distribute, and display such Feedback for any purpose, without compensation to you.

---

5. INTELLECTUAL PROPERTY

5.1 Our Intellectual Property
All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, and software, and the design, selection, and arrangement thereof, are the exclusive property of MindForU or its licensors and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services, except as generally and ordinarily permitted through the Services according to these Terms.

5.2 User Content
You retain all rights in and to the content you submit, generate, or display through our Services ("User Content"). By submitting, generating, or displaying User Content, you grant MindForU a worldwide, non-exclusive, royalty-free, transferable, and sublicensable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the Services and MindForU's (and its successors' and affiliates') business, including without limitation for promoting and redistributing part or all of the Services (and derivative works thereof) in any media formats and through any media channels.

5.3 AI-Generated Content Ownership
To the extent that AI-Generated Content is created using our Services, and subject to your compliance with these Terms, we assign to you all our right, title, and interest in and to the AI-Generated Content. You are responsible for ensuring that your use of AI-Generated Content complies with all applicable laws and does not infringe upon the rights of any third party.

5.4 Trademarks
The MindForU name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of MindForU or its affiliates or licensors. You must not use such marks without the prior written permission of MindForU.

---

6. FEES AND PAYMENT

6.1 Pricing
Access to certain features of our Services may require payment of fees. All fees are clearly stated on our website or within the Service. We reserve the right to change our pricing at any time, but such changes will not affect ongoing subscriptions until their renewal.

6.2 Payment Terms
All payments are due in advance for the subscription period. We accept various payment methods as indicated on our website. You authorize us to charge your chosen payment method for all applicable fees.

6.3 Automatic Renewal
Unless otherwise specified, subscriptions automatically renew at the end of each billing cycle. You can cancel automatic renewal at any time through your account settings or by contacting customer support. Cancellation will take effect at the end of the current billing cycle.

6.4 Refunds
All fees are non-refundable unless otherwise stated in a specific refund policy or required by applicable law. For details on our refund policy, please refer to the relevant section on our website.

6.5 Taxes
You are responsible for all taxes associated with your use of the Services, other than taxes based on our net income.

---

7. DISCLAIMER OF WARRANTIES

OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. MINDFORU DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES OR THE SERVERS THAT MAKE THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE MAKE NO WARRANTIES REGARDING THE ACCURACY, RELIABILITY, COMPLETENESS, OR TIMELINESS OF ANY CONTENT OR INFORMATION OBTAINED THROUGH THE SERVICES, INCLUDING AI-GENERATED CONTENT.

---

8. THIRD-PARTY LINKS AND SERVICES

Our Services may contain links to third-party websites or services that are not owned or controlled by MindForU. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that MindForU shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.

---

9. LIMITATION OF LIABILITY

9.1 General Limitation
TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MINDFORU, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF OUR SERVICES.

9.2 Cap on Liability
OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR OUR SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SERVICES DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.

9.3 AI-Specific Limitations
YOU ACKNOWLEDGE THAT AI TECHNOLOGY IS INHERENTLY PROBABILISTIC AND MAY PRODUCE UNEXPECTED OR INCORRECT RESULTS. WE ARE NOT LIABLE FOR ANY DECISIONS MADE OR ACTIONS TAKEN BASED ON AI-GENERATED CONTENT OR RECOMMENDATIONS.

9.4 Essential Purpose
THE LIMITATIONS OF LIABILITY SET FORTH IN THIS SECTION ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN MINDFOR AND YOU. OUR SERVICES WOULD NOT BE PROVIDED WITHOUT SUCH LIMITATIONS.

---

10. INDEMNIFICATION

10.1 User Indemnification
You agree to indemnify, defend, and hold harmless MindForU, its officers, directors, employees, agents, licensors, and suppliers from and against all losses, expenses, damages, and costs, including reasonable attorneys' fees, resulting from:

Your use of our Services in violation of these Terms; your violation of any rights of another party; your violation of any applicable laws or regulations; any content you submit, post, or transmit through our Services; any claims that your use of our Services infringes upon the rights of any third party; and any negligent or wrongful conduct by you or anyone using your account.

10.2 Defense of Claims
MindForU reserves the right to assume the exclusive defense and control of any matter subject to indemnification by you, and you agree to cooperate with our defense of such claims.

10.3 Notice Requirement
You must promptly notify us of any potential claims or legal proceedings that may be subject to indemnification under this section.

---

11. TERMINATION

11.1 Termination by You
You may terminate your account and discontinue use of our Services at any time by following the account closure procedures specified in our platform or by contacting our customer support team.

11.2 Termination by MindForU
We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason, including but not limited to:

Breach of these Terms; violation of applicable laws or regulations; fraudulent, abusive, or illegal activity; non-payment of fees; extended periods of inactivity; or circumstances that could harm our business, reputation, or other users.  

11.3 Effect of Termination
Upon termination, your right to access and use our Services will immediately cease. We may delete your account and all associated data, though we may retain certain information as required by law or for legitimate business purposes.      

11.4 Survival
Sections relating to intellectual property, limitation of liability, indemnification, governing law, and dispute resolution shall survive termination of these Terms.

11.5 Data Export
Prior to account termination, you may request export of your data in a commonly used format, subject to technical feasibility and applicable law.

---

12. GOVERNING LAW AND DISPUTE RESOLUTION

12.1 Governing Law
These Terms and any disputes arising out of or related to these Terms or our Services shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. 

12.2 Jurisdiction
Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in Delaware, and you hereby consent to personal jurisdiction and venue therein.

12.3 Dispute Resolution Process
Before initiating any legal proceedings, you agree to first attempt to resolve any dispute through good faith negotiations by contacting our legal department at legal@mindfor.com.

12.4 Arbitration Agreement
For disputes that cannot be resolved through negotiation, you agree that any claim or dispute shall be resolved through binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules, rather than in court, except as otherwise provided herein.

12.5 Class Action Waiver
YOU AGREE THAT ANY ARBITRATION OR LEGAL PROCEEDING SHALL BE LIMITED TO THE DISPUTE BETWEEN YOU AND MINDFOR INDIVIDUALLY. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.

12.6 Injunctive Relief
Notwithstanding the arbitration provision, either party may seek injunctive relief in court to protect intellectual property rights or confidential information.

---

13. MODIFICATIONS TO TERMS

13.1 Right to Modify
We reserve the right to modify these Terms at any time to reflect changes in our Services, legal requirements, or business practices. We will provide notice of material changes through email, platform notifications, or by posting updated Terms on our website.

13.2 Effective Date of Changes
Modified Terms will become effective thirty (30) days after notice is provided, unless you object to the changes by terminating your account before the effective date.

13.3 Continued Use
Your continued use of our Services after the effective date of modified Terms constitutes acceptance of the changes.

13.4 Version Control
We will maintain version control of our Terms and make previous versions available upon request for a reasonable period.

---

14. GENERAL PROVISIONS

14.1 Entire Agreement
These Terms, together with our Privacy Policy and any applicable service agreements, constitute the entire agreement between you and MindForU regarding our Services and supersede all prior agreements and understandings.

14.2 Severability
If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will remain in full force and effect, and the unenforceable provision will be modified to the minimum extent necessary to make it enforceable.

14.3 Waiver
Our failure to enforce any provision of these Terms shall not constitute a waiver of that provision or any other provision.

14.4 Assignment
You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.

14.5 Force Majeure
Neither party shall be liable for any failure or delay in performance due to circumstances beyond their reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, or government actions.

14.6 Independent Contractors
The relationship between you and MindForU is that of independent contractors, and these Terms do not create any partnership, joint venture, or employment relationship.

14.7 Export Compliance
You agree to comply with all applicable export and import laws and regulations in your use of our Services.

14.8 Language
These Terms are written in English, and any translations are provided for convenience only. In case of conflict, the English version shall prevail.

---

15. CONTACT INFORMATION

For questions, concerns, or notices regarding these Terms or our Services, please contact us at:

**MindForU Legal Department**
Email: legal@mindforu.com
Address: [Company Address]
Phone: [Company Phone Number]

**Customer Support**
Email: support@mindforu.com
Website: https://mindfor.com/support

**Data Protection Officer**
Email: privacy@mindforu.com

---

**ACKNOWLEDGMENT**

BY USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE OUR SERVICES.

These Terms and Conditions are effective as of the "Last Updated" date specified above and will remain in effect until modified or terminated in accordance with the provisions herein.

---

* 2025 MindForU. All rights reserved.*`}
      </pre>
    </div>
   </main>
  );
};

export default TOS;
