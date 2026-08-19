import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Linkedin, Mail, Loader2 } from "lucide-react";
import TableOfContents from "@/components/TableOfContents";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface AuthorData {
  name: string;
  role: string; // translation key, resolved via t()
  initials?: string;
  bio?: string; // translation key, resolved via t()
  image?: string;
  linkedin?: string;
  twitter?: string;
}

const authors: Record<string, AuthorData> = {
  Saad: {
    name: "Saad Bakhtiar",
    role: "team.founder.role",
    initials: "SB",
    bio: "team.founder.bio",
    linkedin: "https://www.linkedin.com/in/saad-bakhtiar/",
  },
};

interface BlogPostData {
  id: number;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  gradient: string;
}

const allBlogPosts: BlogPostData[] = [
  {
    id: 1,
    titleKey: "blog.post1.title",
    excerptKey: "blog.post1.excerpt",
    contentKey: "blogPost.post1.content",
    category: "AI Strategy",
    date: "2024-12-10",
    readTime: "5 min",
    author: "Saad",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    id: 2,
    titleKey: "blog.post2.title",
    excerptKey: "blog.post2.excerpt",
    contentKey: "blogPost.post2.content",
    category: "Technical",
    date: "2024-12-05",
    readTime: "8 min",
    author: "Saad",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    id: 3,
    titleKey: "blog.post3.title",
    excerptKey: "blog.post3.excerpt",
    contentKey: "blogPost.post3.content",
    category: "Case Study",
    date: "2024-11-28",
    readTime: "6 min",
    author: "Saad",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    id: 4,
    titleKey: "blogPage.post4.title",
    excerptKey: "blogPage.post4.excerpt",
    contentKey: "blogPost.post4.content",
    category: "AI Strategy",
    date: "2024-11-20",
    readTime: "7 min",
    author: "Saad",
    gradient: "from-primary/15 to-primary/5",
  },
  {
    id: 5,
    titleKey: "blogPage.post5.title",
    excerptKey: "blogPage.post5.excerpt",
    contentKey: "blogPost.post5.content",
    category: "Technical",
    date: "2024-11-15",
    readTime: "10 min",
    author: "Saad",
    gradient: "from-secondary/15 to-secondary/5",
  },
  {
    id: 6,
    titleKey: "blogPage.post6.title",
    excerptKey: "blogPage.post6.excerpt",
    contentKey: "blogPost.post6.content",
    category: "Industry News",
    date: "2024-11-10",
    readTime: "4 min",
    author: "Saad",
    gradient: "from-muted/30 to-muted/10",
  },
];

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: t("footer.newsletter.invalidEmail"),
        description: t("footer.newsletter.enterValid"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Subscription is persisted server-side by the edge function (validation +
      // honeypot + rate limiting); anon INSERT to the table is disabled by RLS.
      const normalizedEmail = email.toLowerCase().trim();
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email: normalizedEmail },
      });

      if (error) throw error;

      if (data?.alreadySubscribed) {
        toast({
          title: t("footer.newsletter.alreadySubscribed"),
          description: t("footer.newsletter.alreadyOnList"),
        });
      } else {
        supabase.functions.invoke("sync-mailchimp", {
          body: { email: normalizedEmail },
        }).catch((err) => console.error("Mailchimp sync error:", err));

        toast({
          title: t("footer.newsletter.subscribed"),
          description: t("footer.newsletter.thankYou"),
        });
      }

      setEmail("");
    } catch (error: any) {
      toast({
        title: t("footer.newsletter.error"),
        description: t("footer.newsletter.tryLater"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const post = allBlogPosts.find((p) => p.id === Number(id));
  
  const relatedPosts = allBlogPosts
    .filter((p) => p.id !== Number(id))
    .filter((p) => post ? p.category === post.category : true)
    .slice(0, 2);

  // If not enough related posts by category, add more from other categories
  if (relatedPosts.length < 2) {
    const otherPosts = allBlogPosts
      .filter((p) => p.id !== Number(id) && !relatedPosts.includes(p))
      .slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...otherPosts);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  // Calculate reading time based on actual content (average 200 words per minute)
  const calculateReadingTime = (contentKey: string, excerptKey: string): number => {
    const content = t(contentKey) + " " + t(excerptKey);
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return Math.max(1, readingTime); // Minimum 1 minute
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t("blogPost.notFound")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t("blogPost.notFoundDesc")}
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("blogPost.backToBlog")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar with Time Remaining */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-muted/30">
          <div 
            className="h-full bg-primary transition-all duration-150 ease-out"
            style={{ width: `${readProgress}%` }}
          />
        </div>
        {post && readProgress < 95 && (
          <div className="absolute right-4 top-2 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1 text-xs text-muted-foreground shadow-sm">
            {Math.max(1, Math.ceil(calculateReadingTime(post.contentKey, post.excerptKey) * (1 - readProgress / 100)))} {t("blogPost.minRemaining")}
          </div>
        )}
      </div>
      
      <SEOHead />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex gap-8 max-w-6xl mx-auto">
            {/* Table of Contents - Desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <TableOfContents
                sections={[
                  { id: "introduction", label: t("blogPost.toc.introduction") },
                  { id: "content", label: t("blogPost.toc.content") },
                  { id: "author", label: t("blogPost.toc.author") },
                  { id: "newsletter", label: t("blogPost.toc.newsletter") },
                  { id: "related", label: t("blogPost.toc.related") },
                ]}
              />
            </aside>

            <article className="flex-1 max-w-4xl">
          {/* Back Link */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("blogPost.backToBlog")}
          </Link>

          {/* Article Header */}
          <header id="introduction" className="mb-8 scroll-mt-28">
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {t(post.titleKey)}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {authors[post.author]?.name ?? post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(post.date)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {calculateReadingTime(post.contentKey, post.excerptKey)} {t("blogPost.readTime")}
              </div>
            </div>
            
            {/* Social Share Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <span className="text-sm text-muted-foreground">{t("blogPost.share")}:</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const title = encodeURIComponent(t(post.titleKey));
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
                }}
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const title = encodeURIComponent(t(post.titleKey));
                  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'noopener,noreferrer');
                }}
                aria-label="Share on X"
              >
                <XIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  const subject = encodeURIComponent(t(post.titleKey));
                  const body = encodeURIComponent(`${t(post.titleKey)}\n\n${window.location.href}`);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
                aria-label="Share via Email"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Featured Image */}
          <div className={`h-64 md:h-80 rounded-xl bg-gradient-to-br ${post.gradient} mb-8`} />

          {/* Article Content */}
          <div id="content" className="prose prose-lg dark:prose-invert max-w-none mb-12 scroll-mt-28">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t(post.excerptKey)}
            </p>
            <div className="text-foreground/90 leading-relaxed whitespace-pre-line">
              {t(post.contentKey)}
            </div>
          </div>

          {/* Author Bio Section */}
          {authors[post.author] && (
            <div id="author" className="bg-muted/30 rounded-xl p-6 md:p-8 mb-12 border border-border/50 scroll-mt-28">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {authors[post.author].image ? (
                  <img
                    src={authors[post.author].image}
                    alt={authors[post.author].name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {authors[post.author].initials ?? authors[post.author].name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {authors[post.author].name}
                    </h3>
                    <span className="text-sm text-primary font-medium">
                      {t(authors[post.author].role)}
                    </span>
                  </div>
                  {authors[post.author].bio && (
                    <p className="text-muted-foreground mb-4">
                      {t(authors[post.author].bio!)}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {authors[post.author].linkedin && (
                      <a
                        href={authors[post.author].linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                        aria-label={`${authors[post.author].name} on LinkedIn`}
                      >
                        <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                    {authors[post.author].twitter && (
                      <a
                        href={authors[post.author].twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                        aria-label={`${authors[post.author].name} on X`}
                      >
                        <XIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-muted/50 rounded-xl p-8 text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t("blogPost.ctaTitle")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t("blogPost.ctaDesc")}
            </p>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {t("blogPost.ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Newsletter Section */}
          <div id="newsletter" className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 text-center mb-16 border border-border/50 scroll-mt-28">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {t("blogPost.newsletter.title")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t("blogPost.newsletter.desc")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("footer.newsletter.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("blogPost.newsletter.button")}
              </Button>
            </form>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section id="related" className="scroll-mt-28">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t("blogPost.relatedPosts")}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} to={`/blog/${relatedPost.id}`}>
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 overflow-hidden group cursor-pointer h-full">
                      <div className={`h-32 bg-gradient-to-br ${relatedPost.gradient}`} />
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="text-xs mb-3">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {t(relatedPost.titleKey)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {t(relatedPost.excerptKey)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
