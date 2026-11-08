import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// A one-line notice, not a consent request. The site sets no non-essential
// cookies and runs no tracking, so there is nothing to consent to, and a
// banner asking for consent would promise a choice that changes nothing.
// If a non-essential tool is ever added, bring back a real opt-in banner
// (reject as easy as accept, and a way to reopen it to withdraw consent)
// and gate that tool on it.
//
// Dismissing stores a single flag, only once the visitor clicks, so a fresh
// visit still writes nothing to the browser.
const STORAGE_KEY = "privacy-notice-dismissed";

const CookieConsent = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setIsVisible(true);
    } catch {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage blocked: just hide it for this page view.
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label={t("cookie.text")}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-fade-in"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          {t("cookie.text")}{" "}
          <a href="/privacy" className="text-primary underline hover:decoration-2">
            {t("cookie.learnMore")}
          </a>
          {" · "}
          <a href="/impressum" className="text-primary underline hover:decoration-2">
            {t("footer.impressum")}
          </a>
        </p>
        <Button size="sm" onClick={dismiss}>
          {t("cookie.ok")}
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
