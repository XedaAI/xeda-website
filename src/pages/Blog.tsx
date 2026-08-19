import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const allBlogPosts = [
  {
    id: 1,
    titleKey: "blog.post1.title",
    excerptKey: "blog.post1.excerpt",
    category: "AI Strategy",
    date: "2024-12-10",
    readTime: "5 min",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    id: 2,
    titleKey: "blog.post2.title",
    excerptKey: "blog.post2.excerpt",
    category: "Technical",
    date: "2024-12-05",
    readTime: "8 min",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    id: 3,
    titleKey: "blog.post3.title",
    excerptKey: "blog.post3.excerpt",
    category: "AI Strategy",
    date: "2024-11-28",
    readTime: "6 min",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    id: 4,
    titleKey: "blogPage.post4.title",
    excerptKey: "blogPage.post4.excerpt",
    category: "AI Strategy",
    date: "2024-11-20",
    readTime: "7 min",
    gradient: "from-primary/15 to-primary/5",
  },
  {
    id: 5,
    titleKey: "blogPage.post5.title",
    excerptKey: "blogPage.post5.excerpt",
    category: "Industry News",
    date: "2024-11-15",
    readTime: "10 min",
    gradient: "from-secondary/15 to-secondary/5",
  },
  {
    id: 6,
    titleKey: "blogPage.post6.title",
    excerptKey: "blogPage.post6.excerpt",
    category: "Technical",
    date: "2024-11-10",
    readTime: "4 min",
    gradient: "from-muted/30 to-muted/10",
  },
];

const categories = ["All", "AI Strategy", "Technical", "Industry News"];

const Blog = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = allBlogPosts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = 
      t(post.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(post.excerptKey).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("blogPage.backHome")}
          </Link>

          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              {t("blog.label")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("blog.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("blog.subtitle")}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("blogPage.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="transition-all"
                  >
                    {category === "All" ? t("blogPage.allCategories") : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`}>
                  <Card
                    className="bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 overflow-hidden group cursor-pointer h-full"
                  >
                    <div className={`h-40 bg-gradient-to-br ${post.gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
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
                      <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {t(post.titleKey)}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {t(post.excerptKey)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {t("blogPage.noResults")}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
