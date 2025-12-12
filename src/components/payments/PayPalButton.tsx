import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: number;
  onSuccess?: (details: any) => void;
}

export function PayPalButton({ amount, onSuccess }: PayPalButtonProps) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!clientId) {
    console.error("Missing PayPal Client ID in env: VITE_PAYPAL_CLIENT_ID");
    return <div>Payment system is not configured.</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        currency: "USD",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: amount.toString() },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order!.capture().then((details) => {
            console.log("Payment completed:", details);
            if (onSuccess) onSuccess(details);
          });
        }}
      />
    </PayPalScriptProvider>
  );
}
