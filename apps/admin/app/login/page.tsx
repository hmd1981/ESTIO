import { AdminLoginForm } from "@/components/admin-login-form";

type Props = {
  searchParams?: Promise<{ next?: string; session?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const q = searchParams ? await searchParams : {};
  const next = q.next?.trim() || "/admin";
  const sessionExpired = q.session === "expired";
  return (
    <AdminLoginForm nextPath={next} sessionExpired={sessionExpired} />
  );
}
