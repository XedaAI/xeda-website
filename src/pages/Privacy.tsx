import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="privacy" />
      <div className="container mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 14, 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to xeda.ai. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you visit 
              our website or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Contact Information:</strong> Name, email address, company name, and phone number when you submit our contact form.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and navigation patterns.</li>
              <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device information, and operating system.</li>
              <li><strong className="text-foreground">Cookie Data:</strong> Information collected through cookies and similar tracking technologies.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To respond to your inquiries and provide customer support</li>
              <li>To send you information about our services that may interest you</li>
              <li>To improve our website and user experience</li>
              <li>To analyze website traffic and usage patterns</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your browsing experience. 
              Cookies are small text files stored on your device that help us:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Essential Cookies:</strong> Required for the website to function properly.</li>
              <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
              <li><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and preferences.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can manage your cookie preferences through your browser settings or by using the cookie 
              consent banner when you first visit our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data
              against unauthorized access, alteration, disclosure, or destruction. All traffic to and from
              this site and its backend services is encrypted in transit (TLS/HTTPS), and stored data is
              encrypted at rest by our infrastructure providers. This is standard transport and storage
              encryption — our own systems and the sub-processors listed in Section 8 can access message
              content as needed to provide the service (e.g. to generate an AI reply or send you an email);
              it is not end-to-end encryption. However, no method of transmission over the Internet is 100%
              secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Right of Access:</strong> Request a copy of your personal data.</li>
              <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate data.</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your personal data.</li>
              <li><strong className="text-foreground">Right to Restriction:</strong> Request limitation of processing.</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Request transfer of your data.</li>
              <li><strong className="text-foreground">Right to Object:</strong> Object to processing of your data.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes for which 
              it was collected, including legal, accounting, or reporting requirements. Contact form 
              submissions are typically retained for 2 years unless you request earlier deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Third-Party Services &amp; Sub-Processors</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the following sub-processors to operate this site and our AI assistant. Each acts as a
              data processor on our behalf under a data processing agreement (DPA); where a provider is
              based outside the EU/EEA, the transfer is covered by Standard Contractual Clauses (SCCs) or an
              equivalent safeguard.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Supabase:</strong> database, authentication, and backend hosting for contact submissions, newsletter subscriptions, and chat history.</li>
              <li><strong className="text-foreground">Google Gemini (via the Lovable AI Gateway):</strong> generates AI assistant replies. Messages you send the chat assistant are transmitted to this provider for processing; please avoid sharing sensitive personal data in the chat.</li>
              <li><strong className="text-foreground">ElevenLabs:</strong> converts AI assistant replies to spoken audio when voice playback is used.</li>
              <li><strong className="text-foreground">Resend:</strong> delivers contact-form notification and confirmation emails.</li>
              <li><strong className="text-foreground">Mailchimp:</strong> manages newsletter subscriptions and delivery.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These services have their own privacy policies, and we encourage you to review them. This
              public website and its AI assistant run on the managed, cloud-hosted services listed above —
              they are not deployed on-premise or in a private cloud.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. Any changes will be posted on this page 
              with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">xeda.ai</strong><br />
              Email: privacy@xeda.ai<br />
              Germany
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default Privacy;
