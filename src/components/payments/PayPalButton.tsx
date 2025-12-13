import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: number;
  onSuccess?: (payload: {
    paypalOrderId: string;
    captureDetails: any;
  }) => void;
}

export function PayPalButton({ amount, onSuccess }: PayPalButtonProps) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!clientId) {
    console.error("Missing PayPal Client ID");
    return <div>Payment system is not configured.</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(_, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toString(),
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          if (!actions.order) {
            throw new Error("PayPal order not found");
          }

          return actions.order.capture().then((details) => {
            onSuccess?.({
              paypalOrderId: data.orderID, // ⭐ INI YANG DIPAKAI BACKEND
              captureDetails: details,
            });
          });
        }}
      />
    </PayPalScriptProvider>
  );
}
