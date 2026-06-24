import type { Metadata } from "next";
import { FileText, Scale, UserCheck, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read TravelDiary's Terms of Service to understand your rights and responsibilities.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <FileText className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          By using TravelDiary, you agree to these terms. Please read them carefully before creating an account or submitting content.
        </p>
        <p className="text-sm text-muted-foreground mt-4">Last updated: June 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: UserCheck, title: "Your Account", desc: "You are responsible for keeping your account secure and for all activity that takes place under your account." },
          { icon: Scale, title: "Fair Use", desc: "TravelDiary is for genuine travel discovery. Spam, fake reviews, and misleading content are strictly prohibited." },
          { icon: AlertTriangle, title: "Enforcement", desc: "Violations may result in content removal, account suspension, or a permanent ban without prior notice." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center p-6 rounded-xl border bg-card">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{desc}</p>
          </div>
        ))}
      </div>

      <div className="prose prose-lg dark:prose-invert mx-auto">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using TravelDiary ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, registered users, and contributors.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 13 years old to use TravelDiary. By creating an account, you confirm that you meet this age requirement. If you are under 18, you should have the permission of a parent or guardian.</p>

        <h2>3. Your Account</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your password.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
          <li>You must provide accurate and complete information when creating your account.</li>
          <li>You may not create accounts for the purpose of abusing the platform or impersonating others.</li>
          <li>Notify us immediately at our <a href="/contact">Contact page</a> if you suspect unauthorised access to your account.</li>
        </ul>

        <h2>4. User-Submitted Content</h2>
        <p>When you submit a place, review, or image to TravelDiary:</p>
        <ul>
          <li>You confirm that the content is accurate and based on genuine personal experience or knowledge.</li>
          <li>You grant TravelDiary a non-exclusive, royalty-free, worldwide licence to display, reproduce, and distribute your content on the platform.</li>
          <li>You retain ownership of your original content.</li>
          <li>You agree that your content complies with our <a href="/content-policy">Content Policy</a>.</li>
        </ul>

        <h2>5. Prohibited Activities</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Post false, misleading, or fabricated travel information</li>
          <li>Submit spam, duplicate places, or irrelevant content</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Use the platform to advertise products or services without authorisation</li>
          <li>Attempt to gain unauthorised access to any part of the Service</li>
          <li>Use automated scripts or bots to scrape or interact with the platform</li>
          <li>Violate any applicable local, national, or international laws</li>
        </ul>

        <h2>6. Content Moderation</h2>
        <p>All submitted places go through a review process before being publicly listed. TravelDiary reserves the right to approve, reject, edit, or remove any content at its sole discretion without prior notice. Repeated violations may result in account suspension or termination.</p>

        <h2>7. Intellectual Property</h2>
        <p>The TravelDiary name, logo, design, and underlying software are the intellectual property of TravelDiary. You may not copy, reproduce, or distribute any part of the platform without explicit written permission.</p>

        <h2>8. Third-Party Links</h2>
        <p>TravelDiary may contain links to external websites. We are not responsible for the content or privacy practices of those sites and encourage you to review their policies independently.</p>

        <h2>9. Disclaimers</h2>
        <p>TravelDiary is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any user-submitted content. Travel decisions are made at your own risk — always verify information before visiting a destination.</p>

        <h2>10. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, TravelDiary shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to travel decisions made based on content on the platform.</p>

        <h2>11. Account Termination</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these Terms at any time. You may also delete your account at any time from your dashboard Settings. Upon termination, your content may be removed from the platform.</p>

        <h2>12. Changes to Terms</h2>
        <p>We may revise these Terms of Service at any time. We will notify users of significant changes via email. Continued use of TravelDiary after any changes constitutes your acceptance of the new terms.</p>

        <h2>13. Governing Law</h2>
        <p>These Terms are governed by applicable law. Any disputes arising from the use of TravelDiary will be resolved in accordance with the laws of the jurisdiction where the platform is operated.</p>

        <h2>14. Contact</h2>
        <p>If you have any questions about these Terms, please reach out via our <a href="/contact">Contact page</a>.</p>
      </div>
    </div>
  );
}
