"use client";

import { useEffect, useState } from "react";
import { PaymentMethod, getAllPaymentMethods, togglePaymentMethod, deletePaymentMethod } from "@/lib/payment-actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const AddPaymentMethodForm = dynamic(() => import("./AddPaymentMethodForm"), { ssr: false });

export default function PaymentMethodsTable() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const data = await getAllPaymentMethods();
      setMethods(data);
    } catch (e: any) {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await togglePaymentMethod(id, !currentStatus);
      toast.success(currentStatus ? "Payment method disabled" : "Payment method enabled");
      fetchMethods();
    } catch (e: any) {
      toast.error("Failed to toggle payment method");
    }
  };

  const handleDelete = async (id: string, qrCodeUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await deletePaymentMethod(id, qrCodeUrl);
      toast.success("Payment method deleted");
      fetchMethods();
    } catch (e: any) {
      toast.error("Failed to delete payment method");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display">Payment Methods</h2>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Method
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {methods.map((method) => (
          <div key={method.id} className={`rounded-xl border ${method.is_active ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'} p-5 flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-lg">{method.provider_name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(method.id, method.is_active)} title="Toggle active status">
                  {method.is_active ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 hover:text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
                <button onClick={() => handleDelete(method.id, method.qr_code_url)} title="Delete">
                  <Trash2 className="h-5 w-5 text-destructive/70 hover:text-destructive" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm flex-1 mb-4">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Account Name</p>
                <p className="font-medium">{method.account_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Account Number</p>
                <p className="font-mono text-base tracking-wider text-primary break-all">{method.account_number}</p>
              </div>
            </div>

            {method.qr_code_url ? (
              <div className="aspect-square bg-white rounded-lg p-2 flex items-center justify-center">
                <img src={method.qr_code_url} alt="QR Code" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="aspect-square bg-secondary/30 rounded-lg border border-dashed border-border flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No QR Code</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {methods.length === 0 && (
        <div className="text-center p-12 border border-dashed rounded-xl border-border">
          <p className="text-muted-foreground">No payment methods found.</p>
        </div>
      )}

      <AddPaymentMethodForm open={addOpen} onOpenChange={setAddOpen} onSuccess={fetchMethods} />
    </div>
  );
}
