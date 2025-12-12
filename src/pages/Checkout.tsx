import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { PayPalButton } from "@/components/payments/PayPalButton";

const Checkout = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    // Check quiz submission
    const submissionId = sessionStorage.getItem("quiz_submission_id");
    if (!submissionId) {
      toast.error("Please complete the quiz first.");
      navigate("/quiz");
      return;
    }

    // Check chosen purchase type
    const purchaseType = sessionStorage.getItem("purchase_type");

    if (!purchaseType) {
      toast.error("Please select an offer first.");
      navigate("/");
      return;
    }

    // Pricing logic
    if (purchaseType === "single") setAmount(17);
    if (purchaseType === "bundle") setAmount(18);
    if (purchaseType === "full_series") setAmount(70);
  }, [navigate]);

  if (amount === null) return <p className="p-6">Loading checkout…</p>;

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

      {/* Main */}
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
                <span className="font-semibold text-foreground">${amount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-2xl font-display font-bold text-foreground">
                ${amount}.00
              </span>
            </div>
          </div>

          {/* ⭐ PAYPAL PAYMENT BUTTON */}
          <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in-up">
            <h2 className="font-semibold text-foreground mb-4">
              Pay Securely with PayPal
            </h2>

            <PayPalButton
              amount={amount}
              onSuccess={(details) => {
                console.log("Payment success:", details);

                // Clear quiz flag
                sessionStorage.removeItem("quiz_submission_id");

                // Redirect
                navigate("/thank-you");
              }}
            />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
