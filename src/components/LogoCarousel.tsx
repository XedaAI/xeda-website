import { cn } from "@/lib/utils";

const logos = [
  "TechFlow",
  "DataScale",
  "InnovateTech",
  "CloudFirst",
  "NexGen Systems",
  "QuantumCore",
  "SynergyAI",
  "VelocityLabs",
];

const LogoCarousel = () => {
  return (
    <div className="w-full overflow-hidden py-8">
      <div className="relative">
        {/* Gradient masks for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/30 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/30 to-transparent z-10" />
        
        {/* Scrolling container */}
        <div className="flex animate-scroll">
          {/* Double the logos for seamless loop */}
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className={cn(
                "flex-shrink-0 mx-8 md:mx-12",
                "text-xl md:text-2xl font-semibold text-muted-foreground/60",
                "hover:text-primary transition-colors duration-300"
              )}
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoCarousel;
