import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  X,
  Mail,
  Globe,
  Phone,
  ExternalLink,
  LogOut,
  Crown,
  ChevronDown,
  Zap,
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
import { Separator } from "@/components/ui/separator";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

function LanguageSelector() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-start">{current.flag} {current.label}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-popover border border-popover-border rounded-xl shadow-xl overflow-hidden z-50">
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

function UserSection() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t } = useI18n();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const initials = (user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase();
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user.emailAddresses?.[0]?.emailAddress ?? "User";

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-3 px-2">
        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t("freePlan")}</span>
          </div>
        </div>
      </div>

      <Link href="/pricing">
        <Button size="sm" variant="outline" className="w-full gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10 text-xs">
          <Crown className="w-3.5 h-3.5 text-primary" />
          {t("upgradeNow")}
        </Button>
      </Link>

      <button
        onClick={() => signOut(() => setLocation("/"))}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span>{t("signOut")}</span>
      </button>
    </div>
  );
}

export function AppSidebar({ isOpen, setIsOpen, isMobile }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t } = useI18n();

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
          if (location.includes(`id=${id}`)) {
            setLocation("/chat");
          }
        },
      },
    );
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border w-72 max-w-[80vw]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <img src="/logo.svg" alt="KS" className="w-8 h-8 group-hover:opacity-80 transition-opacity" />
            <h2 className="text-lg font-bold text-primary text-glow">خالد سلمان</h2>
          </div>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 space-y-2 shrink-0">
        <Show when="signed-in">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
            disabled={createMutation.isPending}
          >
            <MessageSquarePlus className="h-4 w-4" />
            {t("newChat")}
          </Button>
        </Show>

        <Link
          href="/services"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            location === "/services"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "hover:bg-sidebar-accent/50 text-muted-foreground",
          )}
        >
          <ExternalLink className="h-4 w-4" />
          {t("services")}
        </Link>

        <Link
          href="/pricing"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            location === "/pricing"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "hover:bg-sidebar-accent/50 text-muted-foreground",
          )}
        >
          <Crown className="h-4 w-4" />
          {t("pricing")}
        </Link>
      </div>

      <Separator className="mx-4 w-auto bg-sidebar-border/50" />

      {/* Conversation History */}
      <ScrollArea className="flex-1 px-2 py-2">
        <Show when="signed-in">
          <div className="space-y-1 p-1">
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground p-4">{t("loading")}</div>
            ) : !conversations?.length ? (
              <div className="text-center text-sm text-muted-foreground p-4">{t("noConversations")}</div>
            ) : (
              conversations?.map((conv) => {
                const isActive = location.includes(`id=${conv.id}`);
                return (
                  <Link
                    key={conv.id}
                    href={`/chat?id=${conv.id}`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <div
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50 text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate">{conv.title || t("newChat")}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0"
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
        </Show>
        <Show when="signed-out">
          <div className="text-center p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              سجّل دخولك لحفظ محادثاتك
            </p>
            <Link href="/sign-in">
              <Button size="sm" className="w-full">تسجيل الدخول</Button>
            </Link>
          </div>
        </Show>
      </ScrollArea>

      <Separator className="bg-sidebar-border/50" />

      {/* Language Selector */}
      <div className="px-3 pt-2">
        <LanguageSelector />
      </div>

      <Separator className="bg-sidebar-border/50 my-2" />

      {/* User Section */}
      <Show when="signed-in">
        <UserSection />
      </Show>

      {/* Contact Info */}
      <div className="p-4 text-xs space-y-2 bg-sidebar-accent/10 shrink-0">
        <h3 className="font-semibold text-sidebar-foreground mb-2">{t("contact")}</h3>
        <div className="space-y-1.5 text-muted-foreground">
          <a
            href="https://wa.me/967783701365"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Phone className="h-3 w-3 shrink-0" />
            <span dir="ltr">+967 783 701 365</span>
          </a>
          <a
            href="https://wa.me/967779435445"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Phone className="h-3 w-3 shrink-0" />
            <span dir="ltr">+967 779 435 445</span>
          </a>
          <a
            href="https://t.me/kshskshg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <MessageSquare className="h-3 w-3 shrink-0" />
            <span dir="ltr">@kshskshg</span>
          </a>
          <a
            href="mailto:khalidsalman7140@gmail.com"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">khalidsalman7140@gmail.com</span>
          </a>
          <a
            href="https://khalid-salman.codewords.run/about"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Globe className="h-3 w-3 shrink-0" />
            <span>{t("services")}</span>
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground/60 pt-1">{t("copyright")}</p>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out",
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "translate-x-full"
            : "translate-x-0 static h-screen",
        )}
      >
        {SidebarContent}
      </div>
    </>
  );
}
