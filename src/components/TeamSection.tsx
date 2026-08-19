import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lightbulb, Users, Zap, Linkedin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const TeamMemberCard = ({ member, index }: { member: typeof teamMembers[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const { t } = useLanguage();
  const delays = ["delay-0", "delay-100", "delay-200"];

  return (
    <Card
      ref={ref}
      className={cn(
        "bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 overflow-hidden",
        delays[index % 3],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <CardContent className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20">
          <span className="text-3xl font-bold text-primary">{member.initials}</span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
        <p className="text-sm text-primary font-medium">{t(member.roleKey)}</p>
        {member.bioKey && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{t(member.bioKey)}</p>
        )}
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-background hover:bg-primary/10 border border-border/50 transition-colors"
            aria-label={`${member.name} on LinkedIn`}
          >
            <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </CardContent>
    </Card>
  );
};

const teamMembers = [
  {
    name: "Saad Bakhtiar",
    initials: "SB",
    roleKey: "team.founder.role",
    bioKey: "team.founder.bio",
    linkedin: "https://www.linkedin.com/in/saad-bakhtiar/",
  },
];

const values = [
  {
    icon: Shield,
    titleKey: "team.value1.title",
    descKey: "team.value1.desc",
  },
  {
    icon: Lightbulb,
    titleKey: "team.value2.title",
    descKey: "team.value2.desc",
  },
  {
    icon: Users,
    titleKey: "team.value3.title",
    descKey: "team.value3.desc",
  },
  {
    icon: Zap,
    titleKey: "team.value4.title",
    descKey: "team.value4.desc",
  },
];

const TeamSection = () => {
  const { t } = useLanguage();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();

  return (
    <section id="team" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            {t("team.label")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("team.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("team.subtitle")}
          </p>
        </div>

        {/* Founder */}
        <div className="max-w-sm mx-auto mb-16">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} index={index} />
          ))}
        </div>

        {/* Company Values */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            {t("team.valuesTitle")}
          </h3>
          <div
            ref={valuesRef}
            className={cn(
              "grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700",
              valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t(value.titleKey)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t(value.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
