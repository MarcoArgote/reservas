"use client";

import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ToastProvider>
  );
}
