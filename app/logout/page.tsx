"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.replace("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debe ejecutarse una sola vez al entrar
  }, []);

  return null;
}
