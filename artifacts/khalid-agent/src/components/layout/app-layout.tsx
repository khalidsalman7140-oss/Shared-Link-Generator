import { useState, useEffect } from "react";
import { AppSidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useUser } from "@clerk/react";

function TopBar() {
  const { user, isSignedIn } = useUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const initials = (user?.firstName?.[0] ?? email?.[0] ?? "U").toUpperCase();

  if (!isSignedIn) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-end px-4 py-2 pointer-events-none">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm pointer-events-auto" dir="ltr">
        <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden shrink-0">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-[10px]">{initials}</span>
          )}
        </div>
        <span className="text-xs text-gray-600 font-medium max-w-[160px] truncate">{email}</span>
      </div>
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
        <TopBar />
        {isMobile && (
          <div className="absolute top-3 right-3 z-30">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="h-9 w-9 bg-white/80 backdrop-blur-sm border-gray-200 text-gray-600 shadow-sm"
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
