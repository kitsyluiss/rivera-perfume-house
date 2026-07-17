"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addPaymentMethod } from "@/lib/payment-actions";
import { createClient } from "@/lib/supabase/client";

export default function AddPaymentMethodForm({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const providerName = formData.get("providerName") as string;
    const accountName = formData.get("accountName") as string;
    const accountNumber = formData.get("accountNumber") as string;

    try {
      let qrCodeUrl = null;

      if (file) {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("payment_qrs")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}. Make sure you created the 'payment_qrs' storage bucket.`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("payment_qrs")
          .getPublicUrl(filePath);
          
        qrCodeUrl = publicUrl;
      }

      await addPaymentMethod(providerName, accountName, accountNumber, qrCodeUrl);
      
      toast.success("Payment method added");
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="providerName">Provider (e.g., GCash, BDO)</Label>
            <Input id="providerName" name="providerName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" name="accountName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" name="accountNumber" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qrCode">QR Code Image (Optional)</Label>
            <Input 
              id="qrCode" 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Method
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
