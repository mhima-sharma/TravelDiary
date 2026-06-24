import type { Metadata } from "next";
import { CheckCircle, XCircle, Flag, ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Content Policy",
  description: "TravelDiary's Content Policy — what's allowed, what isn't, and how we keep the community trustworthy.",
};

export default function ContentPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Flag className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Content Policy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          TravelDiary is built on trust. This policy defines what content is welcome on the platform and what will be removed.
        </p>
        <p className="text-sm text-muted-foreground mt-4">Last updated: June 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: CheckCircle, title: "What's Encouraged", desc: "Genuine first-hand experiences, accurate place details, helpful travel tips, and honest reviews." },
          { icon: XCircle, title: "What's Not Allowed", desc: "Spam, fake reviews, inappropriate content, duplicate listings, and misleading or incorrect information." },
          { icon: ImageIcon, title: "Photo Standards", desc: "Photos must be real, relevant, and taken at the place. Stock images, heavily filtered shots, or unrelated images are not allowed." },
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
        <h2>1. Our Standard</h2>
        <p>TravelDiary exists to help people discover real places and plan authentic travel experiences. Every piece of content on the platform should serve that purpose. If it doesn't help a traveller — it doesn't belong here.</p>

        <h2>2. Submitting Places</h2>
        <h3>What makes a good place submission</h3>
        <ul>
          <li>Accurate name, location, and category</li>
          <li>A clear, informative description based on real knowledge</li>
          <li>Correct city, state, and country details</li>
          <li>Helpful travel tips, opening hours, and entry fees where applicable</li>
          <li>At least one relevant, high-quality photo</li>
        </ul>

        <h3>Place submissions that will be rejected</h3>
        <ul>
          <li>Places with inaccurate or fabricated location details</li>
          <li>Duplicate listings of places already on the platform</li>
          <li>Businesses submitted purely for promotional or advertising purposes</li>
          <li>Places that do not exist or cannot be visited</li>
          <li>Submissions with irrelevant or misleading category selections</li>
        </ul>

        <h2>3. Writing Reviews</h2>
        <h3>Good reviews</h3>
        <ul>
          <li>Are based on a genuine personal visit or direct experience</li>
          <li>Give specific, useful details about what to expect</li>
          <li>Are honest — both positive and constructive feedback are welcome</li>
          <li>Are respectful in tone, even when critical</li>
        </ul>

        <h3>Reviews that will be removed</h3>
        <ul>
          <li><strong>Fake reviews</strong> — reviews written without actually visiting the place</li>
          <li><strong>Spam</strong> — repeated, copied, or irrelevant reviews</li>
          <li><strong>Promotional content</strong> — reviews that read like advertisements</li>
          <li><strong>Personal attacks</strong> — targeting staff, owners, or other users personally</li>
          <li><strong>Off-topic content</strong> — reviews unrelated to the travel experience</li>
        </ul>

        <h2>4. Photos & Images</h2>
        <ul>
          <li>Photos must be taken at the actual place being submitted or reviewed</li>
          <li>You must own or have the rights to any photo you upload</li>
          <li>Photos must be clear, relevant, and representative of the location</li>
          <li>Stock images, AI-generated images, and screenshots from other apps are not permitted</li>
          <li>Images containing nudity, violence, or offensive content will be removed immediately</li>
        </ul>

        <h2>5. Prohibited Content</h2>
        <p>The following content is strictly prohibited and will result in immediate removal and possible account suspension:</p>
        <ul>
          <li><strong>Hate speech</strong> — content that attacks individuals or groups based on race, religion, gender, nationality, or other characteristics</li>
          <li><strong>Harassment</strong> — targeting, threatening, or intimidating other users</li>
          <li><strong>Explicit or adult content</strong> — sexually explicit material of any kind</li>
          <li><strong>Violence</strong> — content that glorifies or promotes violence</li>
          <li><strong>Illegal content</strong> — anything that promotes or facilitates illegal activity</li>
          <li><strong>Personal information</strong> — sharing private details of other individuals without consent</li>
          <li><strong>Misinformation</strong> — deliberately false information intended to mislead travellers</li>
        </ul>

        <h2>6. Reporting Content</h2>
        <p>If you come across content that violates this policy, please use the <strong>Report</strong> button available on every place listing. You can report for the following reasons:</p>
        <ul>
          <li><strong>Spam</strong> — repetitive or irrelevant content</li>
          <li><strong>Inappropriate</strong> — offensive, explicit, or harmful content</li>
          <li><strong>Incorrect Info</strong> — factually wrong or misleading details</li>
          <li><strong>Duplicate</strong> — a place that already exists on the platform</li>
          <li><strong>Other</strong> — anything else that seems wrong</li>
        </ul>
        <p>All reports are reviewed by our moderation team and actioned appropriately.</p>

        <h2>7. Moderation & Enforcement</h2>
        <p>All place submissions are reviewed by our admin team before being listed publicly. Content that violates this policy will be:</p>
        <ul>
          <li>Rejected or removed without prior notice</li>
          <li>Reported to the submitting user where appropriate</li>
        </ul>
        <p>Repeated or severe violations may result in:</p>
        <ul>
          <li>Temporary account suspension</li>
          <li>Permanent account ban</li>
          <li>Removal of all content associated with the account</li>
        </ul>

        <h2>8. Appeals</h2>
        <p>If you believe your content was removed in error, you may appeal by contacting us via the <a href="/contact">Contact page</a>. Please include details about the content and why you believe it complies with this policy. We review all appeals fairly.</p>

        <h2>9. Updates to This Policy</h2>
        <p>This Content Policy may be updated as the platform grows. We will notify users of significant changes. The current version is always available on this page.</p>
      </div>
    </div>
  );
}
