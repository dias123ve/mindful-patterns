import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, BookOpen, ArrowRight } from "lucide-react";

interface ComponentData {
  id: string;
  name: string;
  component_key: string;
}

interface OfferSectionProps {
  positiveComponents: ComponentData[];
  negativeComponent: ComponentData | null;
}

const OfferSection = ({ positiveComponents, negativeComponent }: OfferSectionProps) => {
  const navigate = useNavigate();

  const handleSinglePurchase = () => {
    sessionStorage.setItem("purchase_type", "single");
    navigate("/checkout");
  };

  const handleBundlePurchase = () => {
    sessionStorage.setItem("purchase_type", "bundle");
    navigate("/checkout");
  };

  return (
    <div className="space-y-12">
      
      {/* Header */}
      <div className="text-center mb-12 fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          <span>Personalized For You</span>
        </div>
      </div>

      {/* Offer Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        
        {/* Single Ebook Offer */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">
                Fix Your Key Challenge
              </h3>
              {negativeComponent && (
                <p className="text-sm text-muted-foreground">
                  Ebook to steady your {negativeComponent.name}
                </p>
              )}
             

            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-display font-bold text-foreground">$12</span>
              <span className="text-lg text-muted-foreground line-through">$30</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A focused guide to help you improve this key area through clear, gentle improvements.
            </p>
            <ul className="space-y-2 text-sm">
             {negativeComponent && (
  <div className="flex items-center gap-2 text-orange-500 mt-1">
    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
    <span>Challenge Guide: {negativeComponent.name}</span>
  </div>
)}
          </div>

          <Button 
            onClick={handleSinglePurchase} 
            variant="outline" 
            size="lg" 
            className="w-full mt-auto"
          >
            Get the Key Challenge Guide
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Bundle Offer */}
        <div 
          className="relative bg-card rounded-2xl p-6 md:p-8 shadow-medium border-2 border-primary fade-up"
          style={{ animationDelay: "0.12s" }}
        >
          {/* Best Value Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              <Sparkles className="h-3 w-3" />
              Best Value
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4 mt-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">
                Complete Personalized Bundle
              </h3>
              <p className="text-sm text-muted-foreground">
                3 Tailored Ebooks
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-display font-bold text-foreground">$17</span>
              <span className="text-lg text-muted-foreground line-through">$50</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              A full set of guides that help you elevate your best patterns while 
              strengthening your key challenge for holistic personal growth.
            </p>

            <ul className="space-y-2 text-sm">
              {positiveComponents.map((comp) => (
                <li key={comp.id} className="flex items-center gap-2 text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Strength Guide: {comp.name}</span>
                </li>
              ))}

              {negativeComponent && (
                <li className="flex items-center gap-2 text-orange-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>Challenge Guide: {negativeComponent.name}</span>
                </li>
              )}
            </ul>
          </div>

          <Button 
            onClick={handleBundlePurchase} 
            variant="hero" 
            size="lg" 
            className="w-full"
          >
            Get the Full Personalized Bundle
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center fade-up" style={{ animationDelay: "0.24s" }}>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your recommendations are dynamically tailored to your internal behavioral pattern profile.
        </p>
      </div>
    </div>
  );
};

export default OfferSection;
