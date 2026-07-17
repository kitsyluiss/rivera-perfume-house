"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { getActivePaymentMethods, PaymentMethod } from "@/lib/payment-actions";
import { useEffect, useState, use } from "react";

export default function CheckoutSuccessPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const unwrappedParams = use(searchParams);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivePaymentMethods()
      .then(setMethods)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return <CheckoutSuccessPage searchParams={unwrappedParams} paymentMethods={methods} loading={loading} />;
}

function CheckoutSuccessPage({
  searchParams,
  paymentMethods,
  loading
}: {
  searchParams: { order_id?: string };
  paymentMethods: PaymentMethod[];
  loading: boolean;
}) {
  const orderId = searchParams.order_id;
  const shortOrderId = orderId ? orderId.split("-")[0].toUpperCase() : "UNKNOWN";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20">
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
        >
          <CheckCircle2 className="h-10 w-10" />
        </motion.div>
        <h1 className="font-display text-4xl mb-4 text-foreground">Order Placed!</h1>
        <p className="text-muted-foreground text-lg">
          Your order <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded">#{shortOrderId}</span> has been received.
        </p>
      </div>

      <div className="rounded-[1.1rem] border border-border bg-card overflow-hidden">
        <div className="bg-primary/5 border-b border-border/50 p-6 text-center">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-2">Next Step: Payment Verification</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Please complete your payment via any of our official channels below and send us the receipt to finalize your order.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Payment Details */}
          {loading ? (
            <div className="flex justify-center p-8"><span className="text-muted-foreground text-sm">Loading payment options...</span></div>
          ) : paymentMethods.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex flex-col rounded-xl border border-border bg-secondary/30 overflow-hidden">
                  <div className="p-5 flex-1">
                    <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                        <Wallet className="h-3 w-3" />
                      </div>
                      {method.provider_name}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Account Name</p>
                        <p className="font-medium">{method.account_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Account Number</p>
                        <p className="font-medium font-mono text-lg tracking-widest text-primary break-all">{method.account_number}</p>
                      </div>
                    </div>
                  </div>
                  {method.qr_code_url && (
                    <div className="border-t border-border/50 bg-card p-4 flex justify-center items-center">
                      <div className="bg-white p-2 rounded-lg inline-block">
                        <img src={method.qr_code_url} alt={`${method.provider_name} QR`} className="w-32 h-32 object-contain mix-blend-multiply" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No payment methods configured yet.</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-display text-lg border-b border-border/50 pb-2">How to verify your payment</h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
              <li>Transfer the exact total amount to one of the accounts above.</li>
              <li>Take a screenshot of the successful transaction.</li>
              <li>Message us on our Facebook page with your Order Number (<strong>#{shortOrderId}</strong>) and the screenshot.</li>
              <li>Once verified, we will process and ship your order immediately.</li>
              <li>Please note that the shipping fee is not included and will be collected upon delivery.</li>
            </ol>
          </div>

          <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-4">
            <a href="https://www.facebook.com/riverafraghouse/" target="_blank" rel="noreferrer" className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
                Send Receipt on Facebook <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/orders" className="flex-1">
              <Button variant="outline" className="w-full h-12">
                View My Orders <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
