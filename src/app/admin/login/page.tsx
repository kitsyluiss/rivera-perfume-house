"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2, Lock } from "lucide-react";
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
import { signIn } from "@/lib/actions";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Signed in successfully");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
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
      >
        <Card className="relative w-full max-w-md overflow-hidden border-border bg-card/80 backdrop-blur-xl">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
          />
          <CardHeader className="pt-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10"
            >
              <Lock className="h-5 w-5 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease }}
            >
              <CardTitle className="font-display text-2xl tracking-wide text-foreground">Rivera Admin Access</CardTitle>
            </motion.div>
            <CardDescription className="text-muted-foreground">
              Sign in to manage your inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                {
                  id: "email",
                  label: "Email",
                  type: "email",
                  value: email,
                  setter: setEmail,
                },
                {
                  id: "password",
                  label: "Password",
                  type: "password",
                  value: password,
                  setter: setPassword,
                },
              ].map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.1, duration: 0.4, ease }}
                  className="space-y-2"
                >
                  <Label htmlFor={field.id} className="text-foreground">
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    required
                    className="border-border bg-secondary/50 text-foreground transition-all duration-200 focus-visible:ring-primary/30"
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.4, ease }}
              >
                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full text-xs uppercase tracking-wider"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}