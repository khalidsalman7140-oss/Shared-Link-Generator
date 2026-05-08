import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageSquarePlus, MessageSquare, Trash2, Menu, X, Mail, Globe, Phone, ExternalLink } from "lucide-react";
import { useListGeminiConversations, useCreateGeminiConversation, useDeleteGeminiConversation, getListGeminiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export function AppSidebar({ isOpen, setIsOpen, isMobile }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: conversations, isLoading } = useListGeminiConversations();
  const createMutation = useCreateGeminiConversation();
  const deleteMutation = useDeleteGeminiConversation();

  const handleNewChat = () => {
    createMutation.mutate(
      { data: { title: "محادثة جديدة" } },
      {
        onSuccess: (newConv) => {
          queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
          setLocation(`/?id=${newConv.id}`);
          if (isMobile) setIsOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
          // If we are currently viewing this chat, go to home
          if (location === `/?id=${id}`) {
            setLocation("/");
          }
        },
      }
    );
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border w-72 max-w-[80vw]">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary text-glow">خالد سلمان</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="px-4 pb-4">
        <Button onClick={handleNewChat} className="w-full justify-start gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40">
          <MessageSquarePlus className="h-4 w-4" />
          محادثة جديدة
        </Button>
      </div>

      <div className="px-4 py-2">
        <Link href="/services" className={cn("flex items-center gap-2 px-3 py-2 rounded-md transition-colors", location === "/services" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50")}>
          <ExternalLink className="h-4 w-4" />
          تصفح الخدمات
        </Link>
      </div>

      <Separator className="mx-4 my-2 w-auto bg-sidebar-border/50" />

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {isLoading ? (
             <div className="text-center text-sm text-muted-foreground p-4">جاري التحميل...</div>
          ) : conversations?.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">لا توجد محادثات سابقة</div>
          ) : (
            conversations?.map((conv) => {
              const isActive = location === `/?id=${conv.id}`;
              return (
                <Link key={conv.id} href={`/?id=${conv.id}`} onClick={() => isMobile && setIsOpen(false)}>
                  <div className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50 text-muted-foreground"
                  )}>
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="truncate">{conv.title || "محادثة"}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={(e) => handleDelete(conv.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border/50" />
      
      <div className="p-4 text-xs space-y-3 bg-sidebar-accent/10">
        <h3 className="font-semibold text-sidebar-foreground mb-2">تواصل معي</h3>
        <div className="space-y-2 text-muted-foreground">
          <a href="https://wa.me/967783701365" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Phone className="h-3 w-3" />
            <span dir="ltr">+967 783 701 365</span>
          </a>
          <a href="https://wa.me/967779435445" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Phone className="h-3 w-3" />
            <span dir="ltr">+967 779 435 445</span>
          </a>
          <a href="https://t.me/kshskshg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <MessageSquare className="h-3 w-3" />
            <span dir="ltr">@kshskshg</span>
          </a>
          <a href="mailto:khalidsalman7140@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Mail className="h-3 w-3" />
            <span className="truncate">khalidsalman7140@gmail.com</span>
          </a>
          <a href="https://khalid-salman.codewords.run/about" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Globe className="h-3 w-3" />
            <span>الموقع الشخصي</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar container */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out",
        isMobile ? (isOpen ? "translate-x-0" : "translate-x-full") : "translate-x-0 static h-screen"
      )}>
        {SidebarContent}
      </div>
    </>
  );
}
