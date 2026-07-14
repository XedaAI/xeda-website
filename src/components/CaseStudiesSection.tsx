import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, CalendarClock, PhoneCall, CalendarCheck } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// Real products built and operated by xeda.ai. No fabricated clients or metrics —
// these are our own GenAI/software products, described by what they actually do.
const products = [
  {
    icon: CalendarClock,
    name: "FahrPlan",
    category: "Vertical SaaS",
    tagline: "Scheduling platform for driving schools",
    description:
      "A multi-tenant SaaS that lets driving schools manage instructors, publish available slots, and take student bookings from a live weekly calendar — with self-serve signup, free trials, and subscription billing.",
    highlights: [
      "Multi-tenant with self-serve onboarding & trials",
      "Instructor slot publishing + student booking",
      "Stripe subscription billing",
      "Bilingual DE/EN, GDPR-ready legal pages",
    ],
    tags: ["Next.js", "Stripe", "SQLite", "Docker"],
  },
  {
    icon: PhoneCall,
    name: "Handwerker Rezeption",
    category: "Voice AI",
    tagline: "AI phone receptionist for tradespeople",
    description:
      "An AI receptionist for German trade businesses that answers calls around the clock — it understands the caller, captures the job details, and logs every enquiry to a dashboard so no lead is ever missed.",
    highlights: [
      "24/7 AI call answering in German",
      "Automatic job & lead capture",
      "Multi-tenant business dashboard",
      "Pluggable voice + telephony stack",
    ],
    tags: ["Python", "LLMs", "Voice AI", "Telephony"],
  },
  {
    icon: CalendarCheck,
    name: "OmniBook",
    category: "Booking Platform",
    tagline: "Appointment booking for service businesses",
    description:
      "A booking and scheduling platform for service businesses, built on a layered, multi-tenant backend with secure authentication, versioned database migrations, and a modern TypeScript front end.",
    highlights: [
      "Availability & appointment booking",
      "Secure multi-tenant authentication",
      "PostgreSQL with versioned migrations",
      "React 19 + TypeScript front end",
    ],
    tags: ["FastAPI", "React", "PostgreSQL", "Docker"],
  },
];

const ProductCard = ({ product, index }: { product: typeof products[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const delays = ["delay-0", "delay-100", "delay-200"];
  const Icon = product.icon;

  return (
    <Card
      ref={ref}
      className={cn(
        "bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 overflow-hidden",
        delays[index % 3],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-1">{product.name}</h3>
        <p className="text-sm text-primary font-medium mb-4">{product.tagline}</p>

        <p className="text-sm text-foreground/80 leading-relaxed mb-6">
          {product.description}
        </p>

        <div className="border-t border-border pt-4 mb-4">
          <ul className="space-y-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CaseStudiesSection = () => {
  return (
    <section id="case-studies" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            What We've Built
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            We don't just advise on AI — we ship it
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These are our own products: real software we've designed, built, and operate.
            The same team builds for our clients.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            Want something like this built for your business? Book a free audit
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
