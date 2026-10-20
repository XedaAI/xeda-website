import { useEffect } from "react";
import { useLanguage, SiteLanguage } from "@/contexts/LanguageContext";

interface SEOContent {
  title: string;
  description: string;
  keywords: string;
}

const seoContent: Record<SiteLanguage, SEOContent> = {
  en: {
    title: "xeda.ai — AI integration & automation for German-speaking businesses",
    description: "We integrate AI into your workflows and automate the repetitive work — for businesses across Germany and the DACH region. We build it and run it. Start with a free AI audit.",
    keywords: "AI integration, AI automation, workflow automation, custom AI, AI agency DACH, KI-Integration, KI-Automatisierung, KI-Agentur, Mittelstand, GenAI studio, Germany, Austria, Switzerland",
  },
  de: {
    title: "xeda.ai — KI-Integration & Automatisierung für den deutschsprachigen Raum",
    description: "Wir integrieren KI in Ihre Abläufe und automatisieren die wiederkehrende Arbeit — für Unternehmen in Deutschland, Österreich und der Schweiz. Wir bauen es und betreiben es. Kostenloses KI-Audit.",
    keywords: "KI-Integration, KI-Automatisierung, Prozessautomatisierung, individuelle KI, KI-Agentur DACH, KI-Agentur Deutschland, Mittelstand, GenAI Studio, Deutschland, Österreich, Schweiz",
  },
};

const languageCodes: Record<SiteLanguage, string> = {
  en: "en-GB",
  de: "de-DE",
};

// The service structured data is built from the "What we build" section
// visitors see (WhatWeDoSection, keys whatWeDo.<key>.title/desc). The
// hand-written copy it replaces still sold "GenAI SaaS products", "AI
// Transformation" and "AI Consulting" to enterprises -- the slide-deck
// consultancy the site now says we are not. Keep in step with WhatWeDoSection.
const SERVICE_KEYS = ["saas", "mvp", "automation"] as const;

// The FAQ structured data is built from the FAQ visitors actually see
// (FAQSection, keys faq.q1..q6 / faq.a1..a6). It used to be a separate
// hand-written copy that drifted from the page and told search engines things
// the site does not: end-to-end encryption (we do not do that -- privacy policy,
// section 5), on-premise deployment, a team that "has built production systems
// for enterprises", and "many clients" on retainer. Google also requires FAQ
// markup to match the visible questions. Keep in step with FAQSection.
const FAQ_COUNT = 6;

interface SEOHeadProps {
  page?: "home" | "privacy" | "terms" | "impressum" | "careers";
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

const pageContent: Record<string, Record<SiteLanguage, { title: string; description: string; image: string }>> = {
  home: {
    en: { title: "xeda.ai — AI integration & automation for German-speaking businesses", description: "We integrate AI into your workflows and automate the repetitive work — across Germany and the DACH region. We build it and run it. Start with a free AI audit.", image: "/og-image.png" },
    de: { title: "xeda.ai — KI-Integration & Automatisierung für den deutschsprachigen Raum", description: "Wir integrieren KI in Ihre Abläufe und automatisieren die wiederkehrende Arbeit — in Deutschland, Österreich und der Schweiz. Kostenloses KI-Audit.", image: "/og-image.png" },
  },
  privacy: {
    en: { title: "Privacy Policy | xeda.ai", description: "How xeda.ai handles your personal data under the GDPR: what we collect, why, how long we keep it, and your rights.", image: "/og-privacy.png" },
    de: { title: "Datenschutzerklärung | xeda.ai", description: "Wie xeda.ai Ihre personenbezogenen Daten nach DSGVO verarbeitet: was wir erheben, wozu, wie lange und welche Rechte Sie haben.", image: "/og-privacy.png" },
  },
  terms: {
    en: { title: "Terms of Service | xeda.ai", description: "Terms and conditions for using xeda.ai services. Clear guidelines for our AI consulting partnerships.", image: "/og-terms.png" },
    de: { title: "Nutzungsbedingungen | xeda.ai", description: "Geschäftsbedingungen für xeda.ai Dienstleistungen. Klare Richtlinien für KI-Beratung.", image: "/og-terms.png" },
  },
  careers: {
    en: { title: "Careers & Developers | xeda.ai", description: "Work with xeda.ai on challenging GenAI projects. Contract and ongoing collaboration for developers and AI engineers. Python, TypeScript, cloud-native.", image: "/og-image.png" },
    de: { title: "Karriere & Entwickler | xeda.ai", description: "Arbeiten Sie mit xeda.ai an anspruchsvollen GenAI-Projekten. Vertrags- und langfristige Zusammenarbeit für Entwickler und KI-Ingenieure.", image: "/og-image.png" },
  },
  impressum: {
    en: { title: "Legal Notice (Impressum) | xeda.ai", description: "Legal information and company details for Xeda UG (haftungsbeschränkt). German law compliance.", image: "/og-impressum.png" },
    de: { title: "Impressum | xeda.ai", description: "Rechtliche Informationen und Unternehmensangaben der Xeda UG (haftungsbeschränkt).", image: "/og-impressum.png" },
  },
};

const SEOHead = ({ page = "home", customTitle, customDescription, customImage }: SEOHeadProps) => {
  const { language, t } = useLanguage();
  const content = seoContent[language];
  const pageData = pageContent[page]?.[language] || pageContent.home[language];
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://xeda.ai";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const title = customTitle || pageData.title;
  const description = customDescription || pageData.description;
  const ogImage = customImage || pageData.image;

  useEffect(() => {
    const services = SERVICE_KEYS.map((key) => ({
      name: t(`whatWeDo.${key}.title`),
      description: t(`whatWeDo.${key}.desc`),
    }));

    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    setMetaTag("description", description);
    setMetaTag("keywords", content.keywords);
    setMetaTag("language", languageCodes[language]);

    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", "website", true);
    setMetaTag("og:url", `${baseUrl}${currentPath}`, true);
    setMetaTag("og:locale", languageCodes[language].replace("-", "_"), true);
    setMetaTag("og:site_name", "xeda.ai", true);
    setMetaTag("og:image", `${baseUrl}${ogImage}`, true);
    setMetaTag("og:image:width", "1200", true);
    setMetaTag("og:image:height", "630", true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", `${baseUrl}${ogImage}`);

    // Update html lang attribute
    document.documentElement.lang = language;

    // Remove existing hreflang links
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());

    // Add hreflang links for all languages
    const languages: SiteLanguage[] = ["en", "de"];
    languages.forEach((lang) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = `${baseUrl}?lang=${lang}`;
      document.head.appendChild(link);
    });

    // Add x-default hreflang
    const defaultLink = document.createElement("link");
    defaultLink.rel = "alternate";
    defaultLink.hreflang = "x-default";
    defaultLink.href = baseUrl;
    document.head.appendChild(defaultLink);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = baseUrl;

    // Remove existing JSON-LD scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "xeda.ai",
      "legalName": "Xeda UG (haftungsbeschränkt)",
      "url": baseUrl,
      "logo": `${baseUrl}/og-image.png`,
      "description": content.description,
      "foundingDate": "2024",
      "founders": [
        {
          "@type": "Person",
          "name": "xeda.ai Founders"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "DE",
        "addressLocality": "Germany"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "contact@xeda.ai",
        "availableLanguage": ["English", "German", "French", "Spanish", "Italian"]
      },
      "sameAs": [
        "https://linkedin.com/company/xeda-ai",
        "https://twitter.com/xeda_ai"
      ]
    };

    // LocalBusiness Schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "xeda.ai",
      "image": `${baseUrl}/og-image.png`,
      "url": baseUrl,
      "telephone": "",
      "email": "contact@xeda.ai",
      "description": content.description,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "DE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 51.1657,
        "longitude": 10.4515
      },
      "priceRange": "€€€",
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 51.1657,
          "longitude": 10.4515
        },
        "geoRadius": "5000"
      },
      "serviceType": services.map((service) => service.name),
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "AI Services",
        "itemListElement": services.map((service) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service.name,
            "provider": {
              "@type": "Organization",
              "name": "xeda.ai"
            }
          }
        }))
      }
    };

    // WebSite Schema with SearchAction
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "xeda.ai",
      "url": baseUrl,
      "description": content.description,
      "inLanguage": languageCodes[language],
      "publisher": {
        "@type": "Organization",
        "name": "xeda.ai",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/og-image.png`
        }
      }
    };

    // Add JSON-LD scripts
    const addJsonLd = (schema: object) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": Array.from({ length: FAQ_COUNT }, (_, i) => ({
        "@type": "Question",
        "name": t(`faq.q${i + 1}`),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t(`faq.a${i + 1}`)
        }
      }))
    };

    // BreadcrumbList Schema
    const breadcrumbNames: Record<SiteLanguage, string> = {
      en: "Home",
      de: "Startseite",
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": breadcrumbNames[language],
          "item": baseUrl
        }
      ]
    };

    // Individual Service Schemas
    const serviceSchemas = services.map((service) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.name,
      "description": service.description,
      "provider": {
        "@type": "Organization",
        "name": "xeda.ai",
        "url": baseUrl
      },
      "areaServed": {
        "@type": "Country",
        "name": "Germany"
      },
      "serviceType": service.name,
      "url": baseUrl
    }));

    // Article Schema for legal pages
    const legalPages = ["privacy", "terms", "impressum"];
    if (legalPages.includes(page)) {
      const articleTitles: Record<string, Record<SiteLanguage, string>> = {
        privacy: {
          en: "Privacy Policy",
          de: "Datenschutzerklärung",
        },
        terms: {
          en: "Terms of Service",
          de: "Nutzungsbedingungen",
        },
        impressum: {
          en: "Legal Notice (Impressum)",
          de: "Impressum",
        },
      };

      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleTitles[page]?.[language] || title,
        "description": description,
        "image": `${baseUrl}${ogImage}`,
        "author": {
          "@type": "Organization",
          "name": "xeda.ai",
          "url": baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "xeda.ai",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/og-image.png`
          }
        },
        // No datePublished/dateModified: the hard-coded "2024-12-14" here
        // predated the company. Both are optional, and no date beats a false one.
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${baseUrl}${currentPath}`
        },
        "inLanguage": languageCodes[language]
      };

      addJsonLd(articleSchema);
    }

    // WebPage Schema for each page type
    const webPageTypes: Record<string, string> = {
      home: "WebPage",
      privacy: "WebPage",
      terms: "WebPage", 
      impressum: "ContactPage",
    };

    const webPageNames: Record<string, Record<SiteLanguage, string>> = {
      home: {
        en: "xeda.ai - German GenAI Agency",
        de: "xeda.ai - Deutsche GenAI-Agentur",
      },
      privacy: {
        en: "Privacy Policy - xeda.ai",
        de: "Datenschutzerklärung - xeda.ai",
      },
      terms: {
        en: "Terms of Service - xeda.ai",
        de: "Nutzungsbedingungen - xeda.ai",
      },
      impressum: {
        en: "Legal Notice - xeda.ai",
        de: "Impressum - xeda.ai",
      },
    };

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": webPageTypes[page] || "WebPage",
      "name": webPageNames[page]?.[language] || title,
      "description": description,
      "url": `${baseUrl}${currentPath}`,
      "inLanguage": languageCodes[language],
      "isPartOf": {
        "@type": "WebSite",
        "name": "xeda.ai",
        "url": baseUrl
      },
      "about": {
        "@type": "Organization",
        "name": "xeda.ai"
      },
      // No datePublished/dateModified -- see the article schema above.
    };

    addJsonLd(webPageSchema);
    addJsonLd(organizationSchema);
    addJsonLd(localBusinessSchema);
    addJsonLd(websiteSchema);
    
    // Only add FAQ, service, and review schemas on home page
    if (page === "home") {
      addJsonLd(faqSchema);
      serviceSchemas.forEach(schema => addJsonLd(schema));

      // NOTE: A fabricated AggregateRating (4.9 from 47 reviews) with fake review
      // objects was removed here — emitting invented reviews as JSON-LD violates
      // Google's review-snippet guidelines and misrepresents the business. Re-add a
      // real AggregateRating only once genuine, verifiable reviews exist.
    }
    
    addJsonLd(breadcrumbSchema);

  }, [language, t, content, baseUrl, currentPath, title, description, ogImage, page]);

  return null;
};

export default SEOHead;
