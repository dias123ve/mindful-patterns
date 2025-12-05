import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, CreditCard, Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  useEffect(() => {
    // Check if user has quiz submission
    const submissionId = sessionStorage.getItem("quiz_submission_id");
    if (!submissionId) {
      toast.error("Please complete the quiz first.");
      navigate("/quiz");
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === "cardNumber") {
      // Format card number with spaces
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    } else if (name === "expiry") {
      // Format expiry as MM/YY
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    } else if (name === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.cardNumber || !formData.expiry || !formData.cvc || !formData.name) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    // Simulate payment processing
    // In production, this would integrate with Stripe
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Clear quiz submission from session
      sessionStorage.removeItem("quiz_submission_id");
      
      // Navigate to thank you page
      navigate("/thank-you");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">
            MindProfile
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-muted-foreground">
              Secure checkout for your personalized ebook
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-2xl p-6 shadow-soft mb-6 animate-fade-in-up">
            <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">
                Personalized MindProfile Ebook
              </span>
              <div className="text-right">
                <span className="text-sm text-muted-foreground line-through mr-2">
                  $100
                </span>
                <span className="font-semibold text-foreground">$17</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-2xl font-display font-bold text-foreground">
                $17.00
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in-up"
          >
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Payment Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    name="expiry"
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    name="cvc"
                    placeholder="123"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="hero"
              size="lg"
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay $17.00
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Secure 256-bit SSL encryption</span>
            </div>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By completing this purchase, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
