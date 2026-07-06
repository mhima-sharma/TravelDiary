import type { Metadata } from "next";
import { Shield, Eye, Lock, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Tripzify collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Shield className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your privacy matters to us. This policy explains what data we collect, how we use it, and how we keep it safe.
        </p>
        <p className="text-sm text-muted-foreground mt-4">Last updated: June 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Eye, title: "What We Collect", desc: "Only the information needed to provide you with a great travel discovery experience — nothing more." },
          { icon: Lock, title: "How We Protect It", desc: "All data is encrypted in transit. Passwords are hashed and never stored in plain text." },
          { icon: Database, title: "Where It Lives", desc: "Your data is stored securely on TiDB Cloud servers. We never sell your personal information to third parties." },
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
        <h2>1. Information We Collect</h2>
        <h3>Account Information</h3>
        <p>When you create an account, we collect your name, email address, and password (stored as a bcrypt hash). If you sign in with Google, we receive your name, email, and profile picture from Google.</p>

        <h3>Content You Submit</h3>
        <p>When you add a place or write a review, we store the content, images, ratings, and associated metadata (city, state, country, coordinates) that you provide.</p>

        <h3>Usage Data</h3>
        <p>We collect anonymised page view data including the page path, device type, and country to understand how people use Tripzify. We hash IP addresses so individual users cannot be identified from analytics data.</p>

        <h3>Images</h3>
        <p>Photos you upload are stored on Cloudinary, our image hosting partner. We store the image URL and public ID in our database. Please refer to <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">Cloudinary's Privacy Policy</a> for details on how they handle images.</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To operate and improve the Tripzify platform</li>
          <li>To display your submitted places and reviews to other users</li>
          <li>To send account-related emails (verification, password reset)</li>
          <li>To moderate content and enforce our Content Policy</li>
          <li>To analyse usage patterns and improve user experience</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <p>Tripzify uses the following third-party services:</p>
        <ul>
          <li><strong>Google OAuth</strong> — for "Sign in with Google". Google's Privacy Policy applies.</li>
          <li><strong>Cloudinary</strong> — for image storage and delivery.</li>
          <li><strong>TiDB Cloud</strong> — our database provider (PingCAP). Data is stored on their secure cloud infrastructure.</li>
          <li><strong>Gmail SMTP</strong> — for sending transactional emails.</li>
        </ul>
        <p>We do not sell, rent, or share your personal data with any other third parties for marketing purposes.</p>

        <h2>4. Cookies</h2>
        <p>We use session cookies to keep you logged in. These are essential for the app to function. We do not use tracking or advertising cookies.</p>

        <h2>5. Data Retention</h2>
        <p>We retain your account and content data for as long as your account is active. If you delete your account, your personal information and content will be permanently removed from our database within 30 days.</p>

        <h2>6. Your Rights</h2>
        <ul>
          <li><strong>Access:</strong> You can view and edit your profile information from your dashboard settings.</li>
          <li><strong>Deletion:</strong> You can delete your account and all associated data at any time from Settings.</li>
          <li><strong>Portability:</strong> You may request a copy of your data by contacting us.</li>
        </ul>

        <h2>7. Children's Privacy</h2>
        <p>Tripzify is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify registered users by email of any significant changes. Continued use of Tripzify after changes constitutes acceptance of the updated policy.</p>

        <h2>9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or how we handle your data, please reach out via our <a href="/contact">Contact page</a>.</p>
      </div>
    </div>
  );
}
