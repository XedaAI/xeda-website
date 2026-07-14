import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    titleKey: "blog.post1.title",
    excerptKey: "blog.post1.excerpt",
    category: "AI Strategy",
    date: "2024-12-10",
    readTime: "5 min",
    image: "from-primary/20 to-primary/5",
  },
  {
    id: 2,
    titleKey: "blog.post2.title",
    excerptKey: "blog.post2.excerpt",
    category: "Technical",
    date: "2024-12-05",
    readTime: "8 min",
    image: "from-secondary/20 to-secondary/5",
  },
  {
    id: 3,
    titleKey: "blog.post3.title",
    excerptKey: "blog.post3.excerpt",
    category: "AI Strategy",
    date: "2024-11-28",
    readTime: "6 min",
    image: "from-accent/20 to-accent/5",
  },
];

const BlogCard = ({ post, index }: { post: typeof blogPosts[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const { t } = useLanguage();
  const delays = ["delay-0", "delay-100", "delay-200"];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <Card
      ref={ref}
      className={cn(
        "bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 overflow-hidden group cursor-pointer",
        delays[index % 3],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className={cn("h-40 bg-gradient-to-br", post.image)} />
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary" className="text-xs">
            {post.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {post.readTime}
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {t(post.titleKey)}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {t(post.excerptKey)}
        </p>
        <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
          {t("blog.readMore")}
          <ArrowRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
};

const BlogSection = () => {
  const { t } = useLanguage();

  return (
    <section id="blog" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            {t("blog.label")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("blog.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("blog.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            {t("blog.viewAll")}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
