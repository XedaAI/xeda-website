import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Impressum · Datenschutz · AGB for pages that don't carry the site footer
// (the legal pages themselves, 404, sign-in). § 5 DDG wants the Impressum
// reachable from every page, and the privacy policy should be too.
const LegalLinks = ({ className = "" }: { className?: string }) => {
  const { t } = useLanguage();
  const links = [
    { to: "/impressum", label: t("footer.impressum") },
    { to: "/privacy", label: t("footer.privacy") },
    { to: "/terms", label: t("footer.terms") },
  ];
  return (
    <nav aria-label="Legal" className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm ${className}`}>
      {links.map((l) => (
        <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-foreground transition-colors">
          {l.label}
        </Link>
      ))}
    </nav>
  );
};

export default LegalLinks;
