import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Suspense, lazy } from "react";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import Index from "./pages/Index";

// Route-level code splitting: only the landing page ships in the main bundle;
// every other route loads on demand, shrinking initial JS and time-to-interactive.
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Careers = lazy(() => import("./pages/Careers"));
const Steuerkanzleien = lazy(() => import("./pages/Steuerkanzleien"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Suspense fallback={<SectionSkeleton variant="hero" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/careers" element={<Careers />} />
              <Route path="/steuerkanzleien" element={<Steuerkanzleien />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
