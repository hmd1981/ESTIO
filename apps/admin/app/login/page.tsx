import { AdminLoginForm } from "@/components/admin-login-form";

type Props = { searchParams?: Promise<{ next?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const q = searchParams ? await searchParams : {};
  const next = q.next?.trim() || "/admin";
  return <AdminLoginForm nextPath={next} />;
}
