import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import LogoCarousel from "./LogoCarousel";

const TestimonialCard = ({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const delays = ["delay-0", "delay-100", "delay-200"];
  
  return (
    <Card 
      ref={ref}
      className={cn(
        "bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30",
        delays[index % 3],
        isVisible
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-5 w-5 fill-primary text-primary"
            />
          ))}
        </div>
        <Quote className="h-8 w-8 text-primary/40 mb-4" />
        <blockquote className="text-foreground mb-6 leading-relaxed">
          "{testimonial.quote}"
        </blockquote>
        <div className="border-t border-border pt-4">
          <p className="font-semibold text-foreground">
            {testimonial.author}
          </p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const testimonials = [
  {
    quote:
      "xeda.ai helped us implement an AI-powered customer service solution that reduced response times by 60%. Their team understood our needs from day one.",
    author: "Sarah M.",
    role: "Head of Operations",
    company: "TechFlow GmbH",
  },
  {
    quote:
      "The GenAI transformation they delivered was seamless. We went from concept to production in just 8 weeks, with full team training included.",
    author: "Michael K.",
    role: "CTO",
    company: "DataScale Solutions",
  },
  {
    quote:
      "Working with xeda.ai felt like having an in-house AI team. Their developers integrated perfectly with our workflow and delivered beyond expectations.",
    author: "Laura T.",
    role: "Product Director",
    company: "InnovateTech AG",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-primary text-primary"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-primary">4.9/5</span>
            <span className="text-sm text-muted-foreground">from our clients</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our clients say about working with xeda.ai
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>

        <div className="mt-16">
          <LogoCarousel />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
