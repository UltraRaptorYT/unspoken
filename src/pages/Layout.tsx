import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/toaster";

function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="min-h-[100dvh] bg-white dark:bg-slate-900 h-full flex flex-col dark:text-white text-black">
        <Outlet />
        <Toaster />
      </main>
      <div className="absolute bottom-3 left-3">
        <ThemeToggle></ThemeToggle>
      </div>
    </ThemeProvider>
  );
}

export default Layout;
