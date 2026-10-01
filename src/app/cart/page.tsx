"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Minus, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartItems, updateCartQuantity, removeFromCart, clearCart } from "@/lib/cart-actions";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";
import { CartItem } from "@/lib/types";
import { getAvifUrl } from "@/lib/get-avif";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cartErrors, setCartErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const result: any = await getCartItems();
      if (result?.error) {
        if (result.error.includes("not logged in") || result.error.includes("session")) {
          router.push("/login");
        } else {
          toast.error("Failed to load cart");
        }
      } else {
        setItems(result as unknown as CartItem[]);
      }
    } catch (e: any) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, current: number, delta: number) => {
    const newQty = Number(current) + Number(delta);
    if (newQty < 1) return;
    
    setCartErrors(prev => ({ ...prev, [id]: "" }));
    setActionLoading(`update-${id}`);
    try {
      const result = await updateCartQuantity(id, newQty);
      if (result?.error) {
        setCartErrors(prev => ({ ...prev, [id]: result.error }));
      } else {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity: newQty } : item));
      }
    } catch (e: any) {
      setCartErrors(prev => ({ ...prev, [id]: e.message || "Failed to update quantity" }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (id: string) => {
    setCartErrors(prev => ({ ...prev, [id]: "" }));
    setActionLoading(`remove-${id}`);
    try {
      const result = await removeFromCart(id);
      if (result?.error) {
        setCartErrors(prev => ({ ...prev, [id]: result.error }));
      } else {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Item removed from cart");
      }
    } catch (e: any) {
      setCartErrors(prev => ({ ...prev, [id]: e.message || "Failed to remove item" }));
    } finally {
      setActionLoading(null);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    if (!item.perfume) return sum;
    const hasFlashSale = item.perfume.flash_sale_price != null && 
      item.perfume.flash_sale_end != null && 
      new Date(item.perfume.flash_sale_end) > new Date() &&
      (item.perfume.flash_sale_stock == null || item.perfume.flash_sale_stock > 0);
    const price = hasFlashSale ? item.perfume.flash_sale_price! : item.perfume.target_sale_price;
    return sum + price * item.quantity;
  }, 0);

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
        <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
      </Link>

      <h1 className="font-display text-3xl tracking-wide text-foreground mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 border border-border border-dashed rounded-[1.1rem] bg-card/30">
          <p className="text-muted-foreground mb-6">Your cart is empty.</p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Discover Fragrances
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  className="flex gap-4 sm:gap-6 rounded-[1.1rem] border border-border bg-card p-4 sm:p-5"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary sm:h-32 sm:w-28">
                    {(() => {
                      const img = item.perfume?.image_url || (item.perfume && getAvifUrl(item.perfume) !== "/logo.svg" ? getAvifUrl(item.perfume) : null);
                      return img ? (
                        <Image
                          src={img}
                          alt={item.perfume?.scent_name || "Perfume"}
                          fill
                          sizes="(max-width: 640px) 5rem, 7rem"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground/30 text-center">
                          No image
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-body mb-1">
                          {item.perfume?.brand}
                        </p>
                        <h3 className="font-display text-base sm:text-xl text-foreground">
                          {item.perfume?.scent_name}
                        </h3>
                      </div>
                      <div className="text-right">
                        {(() => {
                          if (!item.perfume) return null;
                          const hasFlashSale = item.perfume.flash_sale_price != null && 
                            item.perfume.flash_sale_end != null && 
                            new Date(item.perfume.flash_sale_end) > new Date() &&
                            (item.perfume.flash_sale_stock == null || item.perfume.flash_sale_stock > 0);
                          
                          if (hasFlashSale) {
                            return (
                              <>
                                <p className="font-display text-base sm:text-lg whitespace-nowrap text-foreground">
                                  {formatPhp(item.perfume.flash_sale_price!)}
                                </p>
                                <p className="text-[10px] text-muted-foreground line-through mt-0.5 whitespace-nowrap">
                                  {formatPhp(item.perfume.target_sale_price)}
                                </p>
                              </>
                            );
                          }
                          return (
                            <p className="font-display text-base sm:text-lg whitespace-nowrap text-foreground">
                              {formatPhp(item.perfume.target_sale_price)}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex flex-col mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full border border-border bg-background px-1 py-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            disabled={actionLoading === `update-${item.id}` || item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.perfume?.scent_name || "item"}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={actionLoading === `update-${item.id}` || (item.perfume && item.quantity >= item.perfume.quantity)}
                            aria-label={`Increase quantity of ${item.perfume?.scent_name || "item"}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={actionLoading === `remove-${item.id}`}
                          aria-label={`Remove ${item.perfume?.scent_name || "item"} from cart`}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-destructive"
                          title="Remove item"
                        >
                          {actionLoading === `remove-${item.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      {cartErrors[item.id] && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0, x: [-2, 2, -2, 2, 0] }}
                          transition={{ duration: 0.3 }}
                          className="text-xs text-destructive font-medium mt-2"
                        >
                          {cartErrors[item.id]}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-[1.1rem] border border-border bg-card p-6">
              <h2 className="font-display text-lg mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatPhp(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-border/50 pt-4 mb-8">
                <div className="flex justify-between font-display text-xl">
                  <span>Estimated Total</span>
                  <span>{formatPhp(subtotal)}</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full">
                <Button
                  className="w-full h-12 text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
