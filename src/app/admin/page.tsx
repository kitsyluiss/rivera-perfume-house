import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/LoginForm";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}