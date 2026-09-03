import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, ArrowUpRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

const ContactSection = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const contactSchema = z.object({
    name: z.string().trim().min(1, t("contact.error.nameRequired")).max(100, t("contact.error.nameTooLong")),
    email: z.string().trim().email(t("contact.error.invalidEmail")).max(255, t("contact.error.emailTooLong")),
    company: z.string().trim().max(100, t("contact.error.companyTooLong")).optional(),
    message: z.string().trim().min(1, t("contact.error.messageRequired")).max(2000, t("contact.error.messageTooLong")),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // No client-side short-circuit on the honeypot. It used to return here with a
    // success toast, so a browser that autofilled the field made the submission
    // vanish with no request, no log and no way to know. The edge function
    // decides, and logs when it does.

    setIsSubmitting(true);

    try {
      const validated = contactSchema.parse(formData);

      // Submission is persisted + emailed server-side by the edge function, which
      // enforces validation, honeypot, and rate limiting. The client no longer
      // writes to the contacts table directly (anon INSERT is disabled by RLS).
      const { error: fnError } = await supabase.functions.invoke("send-contact-email", {
        body: { ...validated, _hp: honeypot },
      });

      if (fnError) throw fnError;

      toast({
        title: t("contact.success.title"),
        description: t("contact.success.description"),
      });

      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("contact.error.validation"),
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("contact.error.general"),
          description: t("contact.error.tryAgain"),
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t("contact.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/*
              Honeypot. Deliberately NOT named "website", "url", "company" or
              anything else a browser recognises: it was named "website" with a
              matching <label>, which Safari and Chrome happily autofilled from a
              saved contact card. autoComplete="off" is advisory and gets ignored.
              A filled honeypot silently discarded the enquiry.
            */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input
                type="text"
                id="xd-ref-2"
                name="xd-ref-2"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("contact.name")} *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t("contact.namePlaceholder")}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("contact.email")} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("contact.emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">{t("contact.company")}</Label>
              <Input
                id="company"
                name="company"
                placeholder={t("contact.companyPlaceholder")}
                value={formData.company}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t("contact.message")} *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder={t("contact.messagePlaceholder")}
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Button type="submit" size="lg" className="w-full sm:w-auto px-8" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("contact.sending")}
                  </>
                ) : (
                  <>
                    {t("contact.send")}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("contact.orEmail")}{" "}
                <a href="mailto:contact@xeda.ai" className="text-primary hover:underline">
                  contact@xeda.ai
                </a>
              </span>
            </div>
          </form>

          <p className="text-sm text-muted-foreground mt-8 text-center">
            {t("contact.responseTime")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
