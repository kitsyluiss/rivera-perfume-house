"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
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
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
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
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethodId === method.id;
                return (
                  <motion.div 
                    key={method.id} 
                    layout
                    className={`flex flex-col rounded-xl border transition-colors cursor-pointer overflow-hidden ${
                      isSelected ? "border-primary bg-secondary/30" : "border-border bg-card hover:border-primary/50 hover:bg-secondary/10"
                    }`}
                    onClick={() => setSelectedMethodId(isSelected ? null : method.id)}
                  >
                    <div className="p-5 flex items-center justify-between">
                      <h3 className="font-medium text-foreground flex items-center gap-3">
                        <div className={`h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                          isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                        }`}>
                          <Wallet className="h-4 w-4" />
                        </div>
                        <span className="text-lg">{method.provider_name}</span>
                      </h3>
                      <div className={`text-xs uppercase tracking-wider font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {isSelected ? "Selected" : "Select"}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border/50"
                        >
                          <div className="p-5 pt-4">
                            <div className="space-y-4 text-sm mb-5">
                              <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Account Name</p>
                                <p className="font-medium text-base">{method.account_name}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Account Number</p>
                                <p className="font-medium font-mono text-xl tracking-widest text-primary break-all">{method.account_number}</p>
                              </div>
                            </div>
                            
                            {method.qr_code_url && (
                              <div className="bg-white/5 p-4 rounded-xl flex justify-center items-center">
                                <div className="bg-white p-2 rounded-lg inline-block shadow-sm">
                                  <img src={method.qr_code_url} alt={`${method.provider_name} QR`} className="w-40 h-40 object-contain mix-blend-multiply" />
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
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
