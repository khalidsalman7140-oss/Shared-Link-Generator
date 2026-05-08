import { useState, useEffect } from "react";
import { AppSidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {isMobile && (
          <div className="absolute top-4 right-4 z-30">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)}
              className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-hidden relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          {children}
        </div>
      </main>
    </div>
  );
}
