"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { recordLogin } from "@/actions/gamification";

export function LoginTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      recordLogin().catch(() => {});
    }
  }, [session?.user?.id]);

  return null;
}
