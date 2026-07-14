import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="terms" />
      <div className="container mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 14, 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the services provided by xeda.ai, you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Services Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              xeda.ai provides AI consulting, development, and implementation services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>GenAI SaaS product development</li>
              <li>AI MVP development and prototyping</li>
              <li>AI automation solutions</li>
              <li>AI transformation consulting</li>
              <li>Custom AI copilot development</li>
              <li>Technical training and support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Engagement Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All project engagements are governed by individual service agreements that specify:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Scope of work and deliverables</li>
              <li>Project timeline and milestones</li>
              <li>Pricing and payment terms</li>
              <li>Intellectual property rights</li>
              <li>Confidentiality obligations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These Terms of Service apply in addition to any project-specific agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Unless otherwise specified in a project agreement:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Client Materials:</strong> You retain all rights to materials you provide to us.</li>
              <li><strong className="text-foreground">Deliverables:</strong> Upon full payment, you receive ownership of custom deliverables created specifically for your project.</li>
              <li><strong className="text-foreground">Pre-existing IP:</strong> We retain rights to our pre-existing tools, frameworks, and methodologies.</li>
              <li><strong className="text-foreground">Open Source:</strong> Any open-source components remain subject to their respective licenses.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Confidentiality</h2>
            <p className="text-muted-foreground leading-relaxed">
              We treat all client information as confidential. We will not disclose your business 
              information, project details, or proprietary data to third parties without your consent, 
              except as required by law. Our team members sign non-disclosure agreements and follow 
              strict data handling protocols.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Payment terms are specified in individual project agreements. General terms include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Invoices are due within 14 days unless otherwise agreed</li>
              <li>Project milestones may require advance payment</li>
              <li>Late payments may incur interest charges</li>
              <li>All prices are in EUR unless otherwise specified</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Warranties and Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We strive to deliver high-quality solutions, however:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>AI systems may produce unexpected results and require ongoing refinement</li>
              <li>We do not guarantee specific business outcomes or ROI</li>
              <li>Third-party AI models and APIs are subject to their providers' terms</li>
              <li>Performance depends on data quality and infrastructure you provide</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, xeda.ai's liability for any claims arising from 
              our services shall be limited to the fees paid for the specific service giving rise to 
              the claim. We are not liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate a project engagement according to the terms specified in the 
              project agreement. Upon termination, you will receive all completed work and we will 
              return or destroy your confidential materials as requested.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the Federal Republic of Germany. Any disputes 
              shall be resolved in the courts of Germany, unless otherwise agreed in writing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. Continued use of our services after 
              changes constitutes acceptance of the new terms. Material changes will be communicated 
              to active clients.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms, please contact us at:
            </p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">xeda.ai</strong><br />
              Email: legal@xeda.ai<br />
              Germany
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default Terms;
