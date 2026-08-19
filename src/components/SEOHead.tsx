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

const serviceDescriptions: Record<SiteLanguage, string[]> = {
  en: ["GenAI SaaS Products", "AI MVPs & Prototypes", "AI Automation", "AI Transformation", "Custom Copilots", "AI Consulting"],
  de: ["GenAI SaaS-Produkte", "KI MVPs & Prototypen", "KI-Automatisierung", "KI-Transformation", "Individuelle Copiloten", "KI-Beratung"],
};

interface ServiceDetail {
  name: string;
  description: string;
}

const serviceDetails: Record<SiteLanguage, ServiceDetail[]> = {
  en: [
    { name: "GenAI SaaS Products", description: "Custom-built Generative AI software-as-a-service products tailored to your business needs, from concept to production deployment." },
    { name: "AI MVPs & Prototypes", description: "Rapid development of AI minimum viable products and prototypes to validate ideas and demonstrate value in 4-8 weeks." },
    { name: "AI Automation", description: "Intelligent automation solutions that streamline workflows, reduce manual tasks, and increase operational efficiency using AI." },
    { name: "AI Transformation", description: "End-to-end AI transformation consulting to help enterprises integrate AI into their core business processes and culture." },
    { name: "Custom Copilots", description: "Bespoke AI copilot assistants designed to augment your team's capabilities with domain-specific knowledge and automation." },
    { name: "AI Consulting", description: "Strategic AI consulting services including roadmap development, technology assessment, and implementation guidance." },
  ],
  de: [
    { name: "GenAI SaaS-Produkte", description: "Maßgeschneiderte Generative-KI-Software-as-a-Service-Produkte für Ihre Geschäftsanforderungen, vom Konzept bis zur Produktion." },
    { name: "KI MVPs & Prototypen", description: "Schnelle Entwicklung von KI-MVPs und Prototypen zur Validierung von Ideen in 4-8 Wochen." },
    { name: "KI-Automatisierung", description: "Intelligente Automatisierungslösungen zur Optimierung von Workflows und Steigerung der operativen Effizienz." },
    { name: "KI-Transformation", description: "Ganzheitliche KI-Transformationsberatung zur Integration von KI in Kerngeschäftsprozesse." },
    { name: "Individuelle Copiloten", description: "Maßgeschneiderte KI-Copilot-Assistenten zur Erweiterung der Teamfähigkeiten mit domänenspezifischem Wissen." },
    { name: "KI-Beratung", description: "Strategische KI-Beratung einschließlich Roadmap-Entwicklung und Technologiebewertung." },
  ],
};

interface FAQItem {
  question: string;
  answer: string;
}

const faqContent: Record<SiteLanguage, FAQItem[]> = {
  en: [
    { question: "What types of AI solutions does xeda.ai offer?", answer: "We specialize in GenAI SaaS products, AI MVPs, automation solutions, AI transformation consulting, and custom copilots for businesses. Our solutions range from customer service chatbots to complex document processing systems and predictive analytics platforms." },
    { question: "How long does a typical AI project take?", answer: "Project timelines vary based on complexity. An AI MVP can be delivered in 4-8 weeks, while larger transformation projects typically take 3-6 months. We follow an agile approach with regular milestones so you see progress early and often." },
    { question: "Do I need technical expertise to work with xeda.ai?", answer: "Not at all. We handle all technical aspects of the project. Our team works closely with your business stakeholders to understand your needs and translate them into effective AI solutions. We also provide training to ensure your team can use and maintain the solutions." },
    { question: "How do you ensure data security and privacy?", answer: "Security is paramount in everything we build. We follow GDPR compliance, implement end-to-end encryption, and can deploy solutions on-premise or in your private cloud if required. All our developers follow strict security protocols and sign NDAs." },
    { question: "What makes xeda.ai different from other AI agencies?", answer: "We combine German engineering precision with cutting-edge AI expertise. Our team consists of senior developers and AI specialists who have built production systems for enterprises. We focus on practical, deployable solutions rather than experimental prototypes." },
    { question: "Do you offer ongoing support after project completion?", answer: "Yes, we offer flexible support and maintenance packages. This includes monitoring, updates, performance optimization, and continued development as your needs evolve. Many clients choose to work with us on a retainer basis for ongoing AI initiatives." },
  ],
  de: [
    { question: "Welche Arten von KI-Lösungen bietet xeda.ai an?", answer: "Wir spezialisieren uns auf GenAI SaaS-Produkte, KI-MVPs, Automatisierungslösungen, KI-Transformationsberatung und individuelle Copiloten für Unternehmen." },
    { question: "Wie lange dauert ein typisches KI-Projekt?", answer: "Projektzeiten variieren je nach Komplexität. Ein KI-MVP kann in 4-8 Wochen geliefert werden, während größere Transformationsprojekte 3-6 Monate dauern können." },
    { question: "Brauche ich technisches Know-how, um mit xeda.ai zu arbeiten?", answer: "Überhaupt nicht. Wir übernehmen alle technischen Aspekte des Projekts. Unser Team arbeitet eng mit Ihren Stakeholdern zusammen." },
    { question: "Wie stellen Sie Datensicherheit und Datenschutz sicher?", answer: "Sicherheit ist in allem, was wir bauen, oberstes Gebot. Wir folgen der DSGVO, implementieren End-to-End-Verschlüsselung und können Lösungen On-Premise deployen." },
    { question: "Was unterscheidet xeda.ai von anderen KI-Agenturen?", answer: "Wir kombinieren deutsche Ingenieurskunst mit modernster KI-Expertise. Unser Team besteht aus Senior-Entwicklern, die Produktionssysteme für Unternehmen gebaut haben." },
    { question: "Bieten Sie fortlaufenden Support nach Projektabschluss?", answer: "Ja, wir bieten flexible Support- und Wartungspakete. Viele Kunden arbeiten mit uns auf Retainer-Basis für laufende KI-Initiativen." },
  ],
};

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
    fr: { title: "xeda.ai | Agence GenAI Allemande - Produits & Implémentation IA", description: "Nous créons des produits IA prêts pour la production.", image: "/og-image.png" },
    es: { title: "xeda.ai | Agencia GenAI Alemana - Productos e Implementación de IA", description: "Creamos productos de IA listos para producción.", image: "/og-image.png" },
    it: { title: "xeda.ai | Agenzia GenAI Tedesca - Prodotti e Implementazione IA", description: "Creiamo prodotti IA pronti per la produzione.", image: "/og-image.png" },
  },
  privacy: {
    en: { title: "Privacy Policy | xeda.ai", description: "Learn how xeda.ai protects your privacy and handles your personal data. GDPR compliant privacy practices.", image: "/og-privacy.png" },
    de: { title: "Datenschutzerklärung | xeda.ai", description: "Erfahren Sie, wie xeda.ai Ihre Privatsphäre schützt. DSGVO-konforme Datenschutzpraktiken.", image: "/og-privacy.png" },
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
    fr: { title: "Mentions Légales | xeda.ai", description: "Informations légales et coordonnées de Xeda UG (haftungsbeschränkt).", image: "/og-impressum.png" },
    es: { title: "Aviso Legal | xeda.ai", description: "Información legal y datos de la empresa Xeda UG (haftungsbeschränkt).", image: "/og-impressum.png" },
    it: { title: "Note Legali | xeda.ai", description: "Informazioni legali e dati aziendali di Xeda UG (haftungsbeschränkt).", image: "/og-impressum.png" },
  },
};

const SEOHead = ({ page = "home", customTitle, customDescription, customImage }: SEOHeadProps) => {
  const { language } = useLanguage();
  const content = seoContent[language];
  const pageData = pageContent[page]?.[language] || pageContent.home[language];
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://xeda.ai";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const title = customTitle || pageData.title;
  const description = customDescription || pageData.description;
  const ogImage = customImage || pageData.image;

  useEffect(() => {
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
      "serviceType": serviceDescriptions[language],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "AI Services",
        "itemListElement": serviceDescriptions[language].map((service, index) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service,
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
      "mainEntity": faqContent[language].map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
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
    const serviceSchemas = serviceDetails[language].map((service, index) => ({
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
      "serviceType": "AI Consulting and Development",
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
        "datePublished": "2024-12-14",
        "dateModified": "2024-12-14",
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
      "datePublished": "2024-12-14",
      "dateModified": "2024-12-14"
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

  }, [language, content, baseUrl, currentPath, title, description, ogImage, page]);

  return null;
};

export default SEOHead;
