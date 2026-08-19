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
          <p className="text-muted-foreground mb-8">Last updated: August 13, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Xeda UG (haftungsbeschränkt) ("xeda.ai", "we") respects your privacy and is committed to protecting your
              personal data. This privacy policy explains how we collect, use, and safeguard your information when you
              visit our website or use our services. The controller responsible for data processing is Xeda UG
              (haftungsbeschränkt); full contact details are in our{" "}
              <a href="/impressum" className="text-primary hover:underline">Impressum</a>.
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
              against unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the Internet is 100% secure.
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
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Third-Party Processors</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the following processors to operate this website and our services. Each acts under a
              data processing agreement (Art. 28 GDPR). Where a provider is based outside the EU/EEA,
              transfers are safeguarded by the EU Standard Contractual Clauses (Art. 46 GDPR):
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Supabase</strong> (Supabase, Inc., USA) — database and serverless functions that store contact-form submissions, newsletter sign-ups, and chatbot conversations.</li>
              <li><strong className="text-foreground">Resend</strong> (Resend, Inc., USA) — delivery of transactional emails (your contact-form confirmation and our internal notification). Processes your name, email address, and message.</li>
              <li><strong className="text-foreground">Mailchimp</strong> (The Rocket Science Group LLC / Intuit, USA) — sending our newsletter to subscribers who have opted in. Processes your email address.</li>
              <li><strong className="text-foreground">AI chatbot</strong> — messages you send to our on-site assistant are processed via the Lovable AI Gateway (Lovable) and Google's Gemini model to generate a reply, and are stored in Supabase under an anonymous session ID. <em>Please do not enter personal or confidential information into the chatbot.</em></li>
              <li><strong className="text-foreground">Website hosting</strong> (GitHub Pages — GitHub, Inc. / Microsoft, USA) — serves this website; standard server logs (including IP address) are processed to deliver and secure the site.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Legal bases: Art. 6(1)(b) GDPR (handling your contact request), Art. 6(1)(a) GDPR (newsletter — based
              on your consent, withdrawable at any time), and Art. 6(1)(f) GDPR (secure operation of the website).
              We do not sell your personal data.
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
              <strong className="text-foreground">Xeda UG (haftungsbeschränkt)</strong><br />
              Bismarckstr. 54, 67059 Ludwigshafen am Rhein, Deutschland<br />
              E-Mail: saad.bakhtiyar@xeda.ai
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default Privacy;
