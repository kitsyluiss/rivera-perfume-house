"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Package, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerOrders, cancelOrder } from "@/lib/order-actions";
import { formatPhp } from "@/lib/format";
import { Order } from "@/lib/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getCustomerOrders();
      setOrders(data);
    } catch (e: any) {
      if (e.message.includes("logged in") || e.message.includes("session")) {
        router.push("/login");
      } else {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      await loadOrders(); // Refresh the list
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20">
      <Link href="/" className="inline-flex items-center text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
      </Link>

      <h1 className="font-display text-3xl tracking-wide text-foreground mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-border border-dashed rounded-[1.1rem] bg-card/30">
          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Discover Fragrances
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shortOrderId = order.id.split("-")[0].toUpperCase();
            return (
              <div key={order.id} className="rounded-[1.1rem] border border-border bg-card overflow-hidden">
                <div className="bg-secondary/20 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Order Placed</p>
                      <p className="text-sm">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total</p>
                      <p className="text-sm font-medium">{formatPhp(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${
                        order.status === 'pending_verification' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Order Number</p>
                    <p className="text-sm font-mono">#{shortOrderId}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {order.status === 'pending_verification' && (
                    <div className="mb-6 rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-foreground font-medium mb-1">Payment Verification Required</p>
                        <p className="text-muted-foreground mb-1">Please send your payment receipt to our Facebook page (<a href="https://www.facebook.com/riverafraghouse/" className="text-primary hover:underline">@riverafraghouse</a>) with your Order Number <strong>#{shortOrderId}</strong>.</p>
                        <p className="text-muted-foreground text-xs italic">* Note: Shipping fee is not included and will be collected upon delivery.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="shrink-0 border-destructive/20 hover:bg-destructive/10 hover:text-destructive text-destructive"
                      >
                        {cancellingId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Cancel Order
                      </Button>
                    </div>
                  )}

                  {order.receipt_url && (
                    <div className="mb-6 rounded-lg bg-secondary/20 border border-border/50 p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-foreground font-medium mb-1">Receipt Uploaded</p>
                        <p className="text-muted-foreground text-xs">Your payment receipt has been received and verified by an admin.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(order.receipt_url!, '_blank')}
                        className="shrink-0 border-primary/20 hover:bg-primary/10 text-primary"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Receipt
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="h-16 w-12 shrink-0 bg-secondary rounded overflow-hidden">
                          {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-[10px] uppercase tracking-wider text-primary">{item.brand}</p>
                          <p className="text-sm font-medium">{item.scent_name}</p>
                        </div>
                        <div className="flex flex-col justify-center text-right text-sm">
                          <p className="text-muted-foreground">{item.quantity} x {formatPhp(item.unit_price)}</p>
                          <p className="font-medium mt-0.5">{formatPhp(item.quantity * item.unit_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
