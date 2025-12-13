import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PayPalButton } from "@/components/payments/PayPalButton";

type PurchaseType = "single" | "bundle" | "full_series";

const Checkout = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [purchaseType, setPurchaseType] = useState<PurchaseType | null>(null);

  // ===============================
  // INIT CHECKOUT
  // ===============================
  useEffect(() => {
    const init = async () => {
      const submissionId = sessionStorage.getItem("quiz_submission_id");
      const storedPurchaseType = sessionStorage.getItem("purchase_type") as PurchaseType | null;
      const discountExpired = sessionStorage.getItem("discount_expired") === "true";

      if (!submissionId) {
        toast.error("Please complete the quiz first.");
        navigate("/quiz");
        return;
      }

      if (!storedPurchaseType) {
        toast.error("Please select an offer first.");
        navigate("/");
        return;
      }

      setPurchaseType(storedPurchaseType);

      // ===============================
      // PRICE LOGIC
      // ===============================
      let price = 0;
      let productTitle = "";

      if (storedPurchaseType === "single") {
        price = discountExpired ? 20 : 12;
        productTitle = "Main Challenge Guide";
      }

      if (storedPurchaseType === "bundle") {
        price = discountExpired ? 29 : 18;
        productTitle = "Complete Personalized Bundle (3 ebooks)";
      }

      if (storedPurchaseType === "full_series") {
        price = discountExpired ? 99 : 70;
        productTitle = "Full Self Series (16 ebooks)";
      }

      setAmount(price);
      setTitle(productTitle);

      // ===============================
      // LOAD EMAIL FROM QUIZ
      // ===============================
      const { data: submission, error: submissionError } = await supabase
        .from("quiz_submissions")
        .select("email")
        .eq("id", submissionId)
        .single();

      if (submissionError || !submission?.email) {
        toast.error("Email not found. Please enter your email again.");
        navigate("/enter-email-form");
        return;
      }

      // ===============================
      // CREATE ORDER (PENDING)
      // ===============================
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          quiz_submission_id: submissionId,
          user_email: submission.email,
          purchase_type: storedPurchaseType,
          amount: price,
          payment_status: "pending",
          email_sent: false,
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error(orderError);
        toast.error("Failed to create order. Please try again.");
        return;
      }

      setOrderId(order.id);
    };

    init();
  }, [navigate]);

  if (amount === null || !purchaseType || !orderId) {
    return <p className="p-6">Preparing checkout…</p>;
  }

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
          {/* Title */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-muted-foreground">
              Secure checkout for your personalized ebook(s)
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-2xl p-6 shadow-soft mb-6 animate-fade-in-up">
            <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">{title}</span>
              <span className="font-semibold text-foreground">${amount}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-2xl font-display font-bold text-foreground">
                ${amount}.00
              </span>
            </div>
          </div>

          {/* PayPal */}
          <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in-up">
            <h2 className="font-semibold text-foreground mb-4">
              Pay Securely with PayPal
            </h2>

            <PayPalButton
              amount={amount}
              onSuccess={async (details) => {
                try {
                  const paypalOrderId = details?.id;

                  if (!paypalOrderId) {
                    toast.error("Payment succeeded but PayPal ID missing.");
                    return;
                  }

                  // Save PayPal Order ID
                  await supabase
                    .from("orders")
                    .update({
                      paypal_order_id: paypalOrderId,
                      payment_status: "paid",
                    })
                    .eq("id", orderId);

                  // Clear quiz session
                  sessionStorage.removeItem("quiz_submission_id");

                  navigate("/thank-you");
                } catch (err) {
                  console.error(err);
                  toast.error("Payment completed, but failed to finalize order.");
                }
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
