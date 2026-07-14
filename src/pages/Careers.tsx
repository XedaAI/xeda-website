import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import ForDevelopersSection from "@/components/ForDevelopersSection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { useLanguage } from "@/contexts/LanguageContext";

const Careers = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="careers" />
      <div className="container mx-auto px-6 pt-12">
        <Link to="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("blogPage.backHome")}
          </Button>
        </Link>
      </div>
      <main>
        <ForDevelopersSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Careers;
