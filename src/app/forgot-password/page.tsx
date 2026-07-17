"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Loader2, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendPasswordReset } from "@/lib/actions";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Create redirect URL to the reset-password page
      const redirectUrl = `${window.location.origin}/reset-password`;
      await sendPasswordReset(email, redirectUrl);
      setSuccess(true);
      toast.success("Reset link sent successfully!");
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20">
      <motion.div
        className="absolute h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(38 44% 61% / 0.06), transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 30, -20, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease }}
        className="w-full max-w-md z-10"
      >
        <Card className="relative overflow-hidden border-border bg-card/80 backdrop-blur-xl">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
          />
          
          {success ? (
            <div className="px-6 py-12 sm:px-8 text-center flex flex-col items-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl tracking-wide text-foreground mb-4">
                Check Your Email
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                We've sent a password reset link to <strong>{email}</strong>. Please click the link to choose a new password.
              </p>
              <Link href="/login" className="w-full">
                <Button className="w-full h-11 text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <CardHeader className="pt-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5, ease }}
                >
                  <CardTitle className="font-display text-2xl tracking-wide text-foreground">Reset Password</CardTitle>
                </motion.div>
                <CardDescription className="text-muted-foreground mt-2">
                  Enter your email address to receive a reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45, duration: 0.4, ease }}
                    className="space-y-2 relative"
                  >
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 border-border bg-secondary/50 text-foreground transition-all duration-200 focus-visible:ring-primary/30"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4, ease }}
                    className="pt-2"
                  >
                    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full text-xs uppercase tracking-wider"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </CardContent>
              <div className="flex justify-center border-t border-border/50 bg-secondary/10 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium transition-all">
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
