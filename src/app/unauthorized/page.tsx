import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4">
        Access Denied
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        You do not have permission to access the requested page. If you believe this is an error, please contact support.
      </p>
      
      <div className="flex gap-4">
        <Link href="/">
          <Button className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
