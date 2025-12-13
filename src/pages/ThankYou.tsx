import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Mail,
  CheckCircle2,
  Home,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";

const ThankYou = () => {
  const [purchaseType, setPurchaseType] = useState<string | null>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const type = sessionStorage.getItem("purchase_type");
    setPurchaseType(type);

    const stored = sessionStorage.getItem("guide_components");
    if (stored) setComponents(JSON.parse(stored));

    const email = sessionStorage.getItem("user_email");
    setUserEmail(email);
  }, []);

  const getPurchasedDescription = () => {
    if (purchaseType === "single") {
      return "your personalized Challenge Guide";
    }
    if (purchaseType === "bundle") {
      return "your 3-ebook Personalized Bundle";
    }
    if (purchaseType === "full_series") {
      return "your complete 16-ebook Self Series collection";
    }
    return "your personalized ebook package";
  };

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
            Thank You for Your Purchase
          </h1>

          <p
            className="text-muted-foreground mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {getPurchasedDescription()} is now being prepared and delivered.
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
              Delivery in Progress
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Your guides will be sent to
              {userEmail ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {userEmail}
                  </span>
                </>
              ) : (
                " your email address"
              )}
              .  
              <br />
              Please allow up to <b>10 minutes</b> for delivery.
            </p>

            <p className="text-xs text-muted-foreground mt-3">
              If you don’t see the email, check your Spam or Promotions folder.
            </p>
          </div>

          {/* Personalized Components */}
          {components.length > 0 && (
            <div
              className="bg-secondary/50 rounded-2xl p-6 mb-8 text-left animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Included Guides
              </h3>

              <ul className="space-y-3 text-sm text-muted-foreground">
                {components.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>
                      <b>{c.name}</b>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <Link to="/">
            <Button
              variant="outline"
              size="lg"
              className="animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold text-foreground">
                MindProfile
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at <b>arsippenma@gmail.com</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
