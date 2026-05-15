import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { Link, useLocation } from "wouter";

function AvatarMenu() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isSignedIn || !user) return null;

  const email = user.emailAddresses?.[0]?.emailAddress ?? "";
  const initials = (user.firstName?.[0] ?? email?.[0] ?? "U").toUpperCase();
  const displayName = user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : email;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md hover:shadow-lg transition-all ring-2 ring-primary/20 hover:ring-primary/50"
        title={email}
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[220px]" dir="rtl">
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate" dir="ltr">{email}</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                حسابي
              </button>
            </Link>
            <button
              onClick={() => { setOpen(false); signOut(() => setLocation("/")); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Avatar menu — top right corner */}
        <div className="absolute top-3 left-3 z-30">
          <AvatarMenu />
        </div>

        {/* Mobile menu button — top right */}
        {isMobile && (
          <div className="absolute top-3 right-3 z-30">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="h-9 w-9 bg-white/90 backdrop-blur-sm border-gray-200 text-gray-600 shadow-sm"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
