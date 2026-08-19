import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// GDPR/TTDSG-compliant consent banner:
// - explicit opt-in (no "by continuing you agree" implied consent),
// - reject is exactly as easy as accept (same layer, one click),
// - closing (X) counts as reject (safe default: essential cookies only),
// - the site sets no non-essential cookies until the user accepts.
const CookieConsent = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setIsVisible(true);
  }, []);

  const record = (value: "accepted" | "declined") => {
    localStorage.setItem("cookie-consent", value);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("cookie.text")}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-fade-in"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          <p>
            {t("cookie.text")}{" "}
            <a href="/privacy" className="text-primary underline hover:text-primary/80">
              {t("cookie.learnMore")}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Reject is presented as prominently as Accept (GDPR requirement). */}
          <Button variant="outline" size="sm" onClick={() => record("declined")}>
            {t("cookie.decline")}
          </Button>
          <Button size="sm" onClick={() => record("accepted")}>
            {t("cookie.accept")}
          </Button>
          <button
            onClick={() => record("declined")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("cookie.decline")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
