"use client";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply dark mode by default
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1740",
            color: "#f8fafc",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "12px",
            fontFamily: "Cairo, Inter, sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#7c3aed", secondary: "#f8fafc" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#f8fafc" } },
        }}
      />
    </>
  );
}
