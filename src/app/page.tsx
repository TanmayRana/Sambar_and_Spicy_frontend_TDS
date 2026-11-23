"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
export default function Home() {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(user ? "/billing" : "/login");
  }, [ready, user, router]);
  return (
    <div className="grid min-h-dvh place-items-center bg-background text-muted-foreground">
      Loading workspace...
    </div>
  );
}
