import { useState } from "react";
import { Link } from "react-router-dom";
import { Linkedin, Twitter, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: t("footer.newsletter.invalidEmail"),
        description: t("footer.newsletter.enterValid"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Subscription is persisted server-side by the edge function (validation +
      // honeypot + rate limiting); anon INSERT to the table is disabled by RLS.
      const normalizedEmail = email.toLowerCase().trim();
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email: normalizedEmail },
      });

      if (error) throw error;

      if (data?.alreadySubscribed) {
        toast({
          title: t("footer.newsletter.alreadySubscribed"),
          description: t("footer.newsletter.alreadyOnList"),
        });
      } else {
        supabase.functions.invoke("sync-mailchimp", {
          body: { email: normalizedEmail },
        }).catch((err) => console.error("Mailchimp sync error:", err));

        toast({
          title: t("footer.newsletter.subscribed"),
          description: t("footer.newsletter.thankYou"),
        });
      }

      setEmail("");
    } catch (error: any) {
      toast({
        title: t("footer.newsletter.error"),
        description: t("footer.newsletter.tryLater"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Social */}
          <div>
            <span className="font-semibold text-lg text-foreground">xeda.ai</span>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              {t("footer.description")}
            </p>
            <Link
              to="/careers"
              className="inline-block text-sm text-primary hover:underline mb-4"
            >
              {t("footer.careers")}
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com/company/xeda-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/xeda_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("footer.legal")}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.terms")}
              </Link>
              <Link to="/impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.impressum")}
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("footer.newsletter.title")}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t("footer.newsletter.description")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("footer.newsletter.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button type="submit" size="icon" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} xeda.ai GmbH. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
