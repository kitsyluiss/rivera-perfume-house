"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Loader2, ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCartItems } from "@/lib/cart-actions";
import { getAddresses, saveAddress, createOrder } from "@/lib/checkout-actions";
import { formatPhp } from "@/lib/format";
import { toast } from "sonner";
import { CartItem, Address } from "@/lib/types";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cartData, addressData] = await Promise.all([
        getCartItems(),
        getAddresses()
      ]);
      if (Array.isArray(cartData)) {
        setItems(cartData as unknown as CartItem[]);
        if (cartData.length === 0) {
          router.push("/cart");
        }
      } else {
        toast.error((cartData as any).error || "Failed to load cart items");
      }

      if (Array.isArray(addressData)) {
        setAddresses(addressData as unknown as Address[]);
        if (addressData.length > 0) {
          setSelectedAddress(addressData[0].id);
        } else {
          setShowAddressForm(true);
        }
      } else {
        setShowAddressForm(true);
      }
    } catch (e: any) {
      if (e.message.includes("logged in") || e.message.includes("session")) {
        router.push("/login");
      } else {
        toast.error("Failed to load checkout");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const result = await saveAddress(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const newAddress = result.data;
      if (newAddress) {
        setAddresses([newAddress, ...addresses]);
        setSelectedAddress(newAddress.id);
      }
      setShowAddressForm(false);
      toast.success("Address saved");
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    if (!selectedAddress) {
      setCheckoutError("Please select a shipping address");
      return;
    }

    setPlacingOrder(true);
    try {
      const result = await createOrder(selectedAddress);
      if (result?.error) {
        setCheckoutError(result.error);
      } else if (result?.orderId) {
        router.push(`/checkout/success?order_id=${result.orderId}`);
      }
    } catch (e: any) {
      setCheckoutError(e.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    if (!item.perfume) return sum;
    const hasFlashSale = item.perfume.flash_sale_price != null && 
      item.perfume.flash_sale_end != null && 
      new Date(item.perfume.flash_sale_end) > new Date();
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20">
      <Link href="/cart" className="inline-flex items-center text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="font-display text-3xl tracking-wide text-foreground mb-6">Checkout</h1>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left Column - Shipping Details */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="rounded-[1.1rem] border border-border bg-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl">Shipping Address</h2>
              {!showAddressForm && (
                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                  Add New
                </Button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleSaveAddress} className="space-y-4 border-t border-border/50 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" name="full_name" required className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" required className="bg-secondary/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input id="line1" name="line1" required className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                  <Input id="line2" name="line2" className="bg-secondary/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="city">City/Municipality</Label>
                    <Input id="city" name="city" required className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" name="postal_code" required className="bg-secondary/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" name="province" required className="bg-secondary/50" />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  {addresses.length > 0 && (
                    <Button type="button" variant="ghost" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Save Address
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                      selectedAddress === addr.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-secondary/20 hover:border-primary/40"
                    }`}
                  >
                    {selectedAddress === addr.id && (
                      <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
                    )}
                    <MapPin className="mb-3 h-5 w-5 text-muted-foreground" />
                    <p className="font-medium text-foreground mb-1">{addr.full_name}</p>
                    <p className="text-sm text-muted-foreground">{addr.phone}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {addr.line1}, {addr.line2 && `${addr.line2}, `}
                      {addr.city}, {addr.province} {addr.postal_code}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="rounded-[1.1rem] border border-border bg-card p-6">
            <h2 className="font-display text-xl mb-4">Payment Method</h2>
            <div className="rounded-xl border border-primary bg-primary/5 p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="font-medium">Manual Payment & Verification</p>
              </div>
              <p className="text-sm text-muted-foreground pl-8">
                You will receive instructions to send your payment via GCash or Bank Transfer on the next screen. Your order will be processed once we verify your receipt.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column - Review */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[1.1rem] border border-border bg-card p-6">
            <h2 className="font-display text-xl mb-6">Review Order</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-12 shrink-0 rounded bg-secondary overflow-hidden">
                    {item.perfume?.image_url && (
                      <img src={item.perfume.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.perfume?.brand}</p>
                    <p className="text-sm font-medium">{item.perfume?.scent_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex flex-col justify-center text-right text-sm">
                    {(() => {
                      if (!item.perfume) return null;
                      const hasFlashSale = item.perfume.flash_sale_price != null && 
                        item.perfume.flash_sale_end != null && 
                        new Date(item.perfume.flash_sale_end) > new Date();
                      
                      const price = hasFlashSale ? item.perfume.flash_sale_price! : item.perfume.target_sale_price;
                      return formatPhp(price * item.quantity);
                    })()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border/50 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{formatPhp(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">Free</span>
              </div>
            </div>
            
            <div className="border-t border-border/50 pt-4 mb-8">
              <div className="flex justify-between font-display text-xl">
                <span>Total</span>
                <span>{formatPhp(subtotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <motion.div
                animate={checkoutError ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || !selectedAddress || showAddressForm}
                  className="w-full h-12 text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {placingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Order"}
                </Button>
              </motion.div>
              {checkoutError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive font-medium text-center"
                >
                  {checkoutError}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
