import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Mail, CheckCircle2, Home, BookOpen } from "lucide-react";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8 animate-fade-in">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 animate-fade-in-up">
            Thank You for Your Purchase!
          </h1>

          <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Your personalized ebook is being prepared and will be sent to your
            email shortly.
          </p>

          {/* Email Notice */}
          <div
            className="bg-card rounded-2xl p-6 shadow-soft mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">
              Check Your Inbox
            </h2>
            <p className="text-sm text-muted-foreground">
              We've sent your ebook download links to your email address.
              Be sure to check your spam folder if you don't see it within a few minutes.
            </p>
          </div>

          {/* What's Included */}
          <div
            className="bg-secondary/50 rounded-2xl p-6 mb-8 text-left animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              What's in Your Ebook
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>3 personalized PDF modules based on your thinking patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Practical exercises to overcome irrational thoughts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Daily affirmations and mindset strategies</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Link to="/">
            <Button variant="outline" size="lg" className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold text-foreground">MindProfile</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Questions? Contact us at support@mindprofile.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
