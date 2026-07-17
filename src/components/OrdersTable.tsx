"use client";

import { useState } from "react";
import { formatPhp } from "@/lib/format";
import { Order, OrderStatus } from "@/lib/types";
import { updateOrderStatus, uploadReceipt } from "@/lib/admin-actions";
import { toast } from "sonner";
import { Loader2, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";

const ease = [0.22, 1, 0.36, 1] as const;

export default function OrdersTable({
  orders,
  loading,
  onUpdate,
}: {
  orders: Order[];
  loading: boolean;
  onUpdate: () => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleUploadReceipt = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("receipt", file);
    
    setUploadingId(id);
    try {
      await uploadReceipt(id, formData);
      toast.success("Receipt uploaded successfully");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload receipt");
    } finally {
      setUploadingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success("Order status updated");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-[1.1rem] border border-border border-dashed bg-card/30">
        <p className="text-sm text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.1rem] border border-border bg-card overflow-hidden"
          >
            {/* Header row */}
            <div 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Order No.</p>
                  <p className="font-mono text-sm">#{order.id.split("-")[0].toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Date</p>
                  <p className="text-sm">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                  <p className="text-sm font-medium">{order.customer_name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total</p>
                  <p className="text-sm font-display">{formatPhp(order.total)}</p>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded-full border ${
                  order.status === 'pending_verification' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  order.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  'bg-primary/10 text-primary border-primary/20'
                }`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {expandedId === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="border-t border-border/50 bg-secondary/10"
                >
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Items */}
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="h-12 w-10 shrink-0 bg-secondary rounded overflow-hidden">
                              {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] uppercase tracking-wider text-primary">{item.brand}</p>
                              <p className="text-sm font-medium">{item.scent_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.quantity} x {formatPhp(item.unit_price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{formatPhp(item.quantity * item.unit_price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Actions */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Shipping Details</h4>
                        {order.address ? (
                          <div className="text-sm space-y-1">
                            <p className="font-medium flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {order.address.full_name}</p>
                            <p className="text-muted-foreground">{order.address.phone}</p>
                            <p className="text-muted-foreground mt-2">
                              {order.address.line1}<br />
                              {order.address.line2 && <>{order.address.line2}<br /></>}
                              {order.address.city}, {order.address.province} {order.address.postal_code}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No address provided</p>
                        )}
                        
                        {order.receipt_url && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Proof of Payment</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); window.open(order.receipt_url!, '_blank'); }}
                              className="border-primary/20 text-primary hover:bg-primary/10"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" /> View Receipt
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Actions</h4>
                        
                        {order.status === 'pending_verification' && (
                          <div className="flex flex-wrap gap-2 items-center">
                            {!order.receipt_url && (
                              <div className="relative">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={uploadingId === order.id}
                                  className="border-primary/20 text-primary hover:bg-primary/10"
                                >
                                  {uploadingId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Upload Receipt"}
                                </Button>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => handleUploadReceipt(order.id, e)}
                                  disabled={uploadingId === order.id}
                                />
                              </div>
                            )}
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'paid'); }}
                              disabled={updatingId === order.id || !order.receipt_url}
                              className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                            >
                              {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Mark Paid"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'cancelled'); }}
                              disabled={updatingId === order.id}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        
                        {order.status === 'paid' && (
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'shipped'); }}
                            disabled={updatingId === order.id}
                          >
                            Mark Shipped
                          </Button>
                        )}

                        {order.status === 'shipped' && (
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'delivered'); }}
                            disabled={updatingId === order.id}
                            className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                          >
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
