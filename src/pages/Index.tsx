import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Clock, BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-display font-semibold text-foreground">MindProfile</span>
          </Link>
          <Link to="/admin/login">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-16 pb-24">
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Psychology-based self-discovery</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
            Discover Your{" "}
            <span className="text-gradient-primary">Irrational Thinking</span>{" "}
            Pattern
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10">
            Take a 3-minute quiz and get a personalized self-improvement ebook 
            tailored to your unique thinking patterns.
          </p>

          {/* CTA Button */}
          <Link to="/quiz">
            <Button variant="hero" size="xl" className="mb-12">
              Start the Quiz
              <Sparkles className="h-5 w-5 ml-1" />
            </Button>
          </Link>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm">3 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm">Personalized ebook</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm">Science-based</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl -z-10" />
      </main>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-center text-foreground mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Take the Quiz",
                description: "Answer simple questions about your daily thinking patterns.",
              },
              {
                step: "02",
                title: "Get Your Profile",
                description: "Discover your top 3 irrational thinking patterns.",
              },
              {
                step: "03",
                title: "Transform",
                description: "Receive a personalized ebook with strategies to improve.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="text-center p-6 rounded-2xl bg-card shadow-soft animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-display font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MindProfile. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
