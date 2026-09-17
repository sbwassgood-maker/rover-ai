"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_30%,#000_10%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[560px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Link href="/"><Logo size={26} /></Link></div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h1 className="text-center text-xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-center text-[13.5px] text-muted">Log in to your intelligent workspace.</p>

          <form
            onSubmit={(e) => { e.preventDefault(); router.push("/app"); }}
            className="mt-6 space-y-4"
          >
            <Field label="Email"><Input type="email" defaultValue="alex@northstar.co" className="h-11" /></Field>
            <Field label="Password"><Input type="password" defaultValue="password" className="h-11" /></Field>
            <Button className="w-full" type="submit">Log in</Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[12px] text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" onClick={() => router.push("/app")}>Continue with SSO</Button>
            <Button variant="secondary" className="w-full" onClick={() => router.push("/app")}>Continue with Google</Button>
          </div>
        </div>
        <p className="mt-5 text-center text-[12px] text-muted">
          New to Rover? <Link href="/onboarding" className="font-medium text-ink hover:underline">Start for free</Link>
        </p>
      </div>
    </main>
  );
}
