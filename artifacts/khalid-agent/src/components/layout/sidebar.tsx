import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  X,
  LogOut,
  Globe,
  ChevronDown,
  ChevronRight,
  Zap,
  LayoutDashboard,
  Wand2,
  CalendarCheck,
  User,
  Info,
  Wrench,
} from "lucide-react";
import { useUser, useClerk, Show } from "@clerk/react";
import {
  useListGeminiConversations,
  useCreateGeminiConversation,
  useDeleteGeminiConversation,
  getListGeminiConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { GlobalVoiceToggle } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

function LanguageSelector() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
      >
        <Globe className="w-4 h-4 shrink-0 text-blue-400" />
        <span className="flex-1 text-start font-medium">اللغات</span>
        <span className="text-xs opacity-60">{current.flag} {current.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform opacity-50", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-sidebar-border rounded-xl shadow-2xl overflow-hidden z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:bg-accent/50",
                lang === l.code && "bg-primary/10 text-primary font-medium",
              )}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppSidebar({ isOpen, setIsOpen, isMobile }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t } = useI18n();
  const [projectsOpen, setProjectsOpen] = useState(false);

  const { data: conversations, isLoading } = useListGeminiConversations();
  const createMutation = useCreateGeminiConversation();
  const deleteMutation = useDeleteGeminiConversation();

  const handleNewChat = () => {
    createMutation.mutate(
      { data: { title: t("newChat") } },
      {
        onSuccess: (newConv) => {
          queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
          setLocation(`/chat?id=${newConv.id}`);
          if (isMobile) setIsOpen(false);
        },
      },
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
          if (location.includes(`id=${id}`)) setLocation("/chat");
        },
      },
    );
  };

  const navItem = (
    href: string,
    icon: React.ReactNode,
    label: string,
    badge?: React.ReactNode,
    highlight?: boolean,
  ) => {
    const active = location === href || (href !== "/" && location.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => isMobile && setIsOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
            : highlight
            ? "text-primary/80 hover:bg-primary/10 hover:text-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        )}
      >
        <span className={cn("shrink-0", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")}>
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {badge}
      </Link>
    );
  };

  const displayEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const initials = (user?.firstName?.[0] ?? displayEmail?.[0] ?? "U").toUpperCase();

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border w-68 max-w-[80vw]" style={{ width: "272px" }}>

      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between shrink-0 border-b border-sidebar-border/50">
        <Link href="/" onClick={() => isMobile && setIsOpen(false)}>
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <img src="/logo.svg" alt="KS" className="w-8 h-8 group-hover:opacity-80 transition-opacity" />
            <div>
              <h2 className="text-base font-bold text-primary leading-tight">يمن شات</h2>
              <p className="text-[10px] text-sidebar-foreground/50 leading-tight">Yemen Chat</p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <GlobalVoiceToggle />
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <div className="px-2 space-y-0.5">

          {/* 1. اللغات */}
          <LanguageSelector />

          {/* 2. الخدمات */}
          {navItem("/services", <Wrench className="w-4 h-4 text-orange-400" />, "الخدمات")}

          {/* 3. مشاريعك */}
          <Show when="signed-in">
            <div>
              <button
                onClick={() => setProjectsOpen(!projectsOpen)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0 opacity-80" />
                <span className="flex-1 text-start">مشاريعك</span>
                {conversations?.length ? (
                  <span className="text-[10px] bg-sidebar-accent text-sidebar-foreground/60 rounded-full px-1.5 py-0.5">{conversations.length}</span>
                ) : null}
                <ChevronRight className={cn("w-3.5 h-3.5 opacity-40 transition-transform", projectsOpen && "rotate-90")} />
              </button>

              {projectsOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-sidebar-border/40 pl-3">
                  <button
                    onClick={handleNewChat}
                    disabled={createMutation.isPending}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    {t("newChat")}
                  </button>
                  {isLoading ? (
                    <p className="text-xs text-muted-foreground px-2 py-2">{t("loading")}</p>
                  ) : !conversations?.length ? (
                    <p className="text-xs text-muted-foreground px-2 py-2">{t("noConversations")}</p>
                  ) : (
                    conversations.slice(0, 12).map((conv) => {
                      const isActive = location.includes(`id=${conv.id}`);
                      return (
                        <Link
                          key={conv.id}
                          href={`/chat?id=${conv.id}`}
                          onClick={() => isMobile && setIsOpen(false)}
                        >
                          <div className={cn(
                            "group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50 text-muted-foreground",
                          )}>
                            <span className="truncate flex-1">{conv.title || t("newChat")}</span>
                            <button
                              className="opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0 ml-1 transition-all"
                              onClick={(e) => handleDelete(conv.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </Show>

          {/* 4. حسابي */}
          <Show when="signed-in">
            {navItem("/dashboard", <LayoutDashboard className="w-4 h-4 text-indigo-400" />, "حسابي")}
          </Show>

          {/* 5. الدردشة */}
          {navItem("/chat", <MessageSquare className="w-4 h-4 text-primary" />, "الدردشة")}

          {/* 6. الإنتاج والاستهلاك */}
          <Show when="signed-in">
            {navItem(
              "/tools",
              <Wand2 className="w-4 h-4 text-yellow-400" />,
              "الإنتاج والاستهلاك",
              <span className="text-[9px] bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 rounded-full px-1.5 py-0.5">PRO</span>,
              true,
            )}
          </Show>

          {/* 7. تقديم عمل */}
          {navItem("/booking", <CalendarCheck className="w-4 h-4 text-emerald-400" />, "تقديم عمل")}

          {/* 8. عن خالد */}
          {navItem("/about", <Info className="w-4 h-4 text-pink-400" />, "عن خالد")}
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="shrink-0 border-t border-sidebar-border/50 px-3 py-3">
        <Show when="signed-in">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-xs">{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : displayEmail}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
              </div>
            </div>
            <button
              onClick={() => signOut(() => setLocation("/"))}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>{t("signOut")}</span>
            </button>
          </div>
        </Show>
        <Show when="signed-out">
          <div className="space-y-1.5">
            <Link href="/sign-in" onClick={() => isMobile && setIsOpen(false)}>
              <Button size="sm" className="w-full text-xs gap-1.5">
                <User className="w-3.5 h-3.5" />
                تسجيل الدخول
              </Button>
            </Link>
            <p className="text-[10px] text-muted-foreground/60 text-center">تسجيل مجاني — مرة واحدة فقط</p>
          </div>
        </Show>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out",
          isMobile ? (isOpen ? "translate-x-0" : "translate-x-full") : "translate-x-0 static h-screen",
        )}
      >
        {SidebarContent}
      </div>
    </>
  );
}
