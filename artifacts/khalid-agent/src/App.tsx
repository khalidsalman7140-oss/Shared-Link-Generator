import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import { I18nProvider } from "@/lib/i18n";
import { InstallPWA } from "@/components/InstallPWA";
import { RatingButton } from "@/components/RatingModal";

const Chat = lazy(() => import("@/pages/chat"));
const Services = lazy(() => import("@/pages/services"));
const Landing = lazy(() => import("@/pages/landing"));
const Pricing = lazy(() => import("@/pages/pricing"));
const AdminPage = lazy(() => import("@/pages/admin"));
const PaymentRequestPage = lazy(() => import("@/pages/payment-request"));
const CareerMapPage = lazy(() => import("@/pages/career-map"));
const GuestChatPage = lazy(() => import("@/pages/guest-chat"));
const AboutPage = lazy(() => import("@/pages/about"));
const VisionPage = lazy(() => import("@/pages/vision"));
const HealthPage = lazy(() => import("@/pages/health"));
const EducationPage = lazy(() => import("@/pages/education"));
const TransportPage = lazy(() => import("@/pages/transport"));
const RealEstatePage = lazy(() => import("@/pages/real-estate"));
const RestaurantsPage = lazy(() => import("@/pages/restaurants"));
const EmergencyPage = lazy(() => import("@/pages/emergency"));
const WebsitePage = lazy(() => import("@/pages/website"));
const BookingPage = lazy(() => import("@/pages/booking"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const ToolsPage = lazy(() => import("@/pages/tools"));
const HubPage = lazy(() => import("@/pages/hub"));
const DesignPage = lazy(() => import("@/pages/design"));
const NotFound = lazy(() => import("@/pages/not-found"));
const OwnerPortal = lazy(() => import("@/pages/owner-portal"));
const DeepServicesPage = lazy(() => import("@/pages/deep-services"));

const SignInPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
    <SignIn routing="path" path={`${basePath}/sign-in`} />
  </div>
);
const SignUpPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
    <SignUp routing="path" path={`${basePath}/sign-up`} />
  </div>
);

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#7C3AED",
    colorForeground: "#FAFAFA",
    colorMutedForeground: "#9CA3AF",
    colorDanger: "#EF4444",
    colorBackground: "#0A0B14",
    colorInput: "#1A1B2E",
    colorInputForeground: "#FAFAFA",
    colorNeutral: "#374151",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0F1022] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#2A2A3E]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButtonText: "text-gray-300",
    formFieldLabel: "text-gray-300",
    footerActionLink: "text-purple-400 hover:text-purple-300",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-500",
    identityPreviewEditButton: "text-purple-400",
    formFieldSuccessText: "text-green-400",
    alertText: "text-gray-200",
    logoBox: "flex justify-center py-2",
    logoImage: "w-16 h-16",
    socialButtonsBlockButton: "border border-[#2A2A3E] bg-[#1A1B2E] hover:bg-[#252640] text-gray-200",
    formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
    formFieldInput: "bg-[#1A1B2E] border-[#2A2A3E] text-white",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#2A2A3E]",
    alert: "border-[#2A2A3E] bg-[#1A1B2E]",
    otpCodeFieldInput: "bg-[#1A1B2E] border-[#2A2A3E] text-white",
    formFieldRow: "text-gray-300",
    main: "gap-4",
  },
};

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

const ADMIN_EMAIL = "khalidsalman7140@gmail.com";

function HomeRedirect() {
  const { isSignedIn, user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    setLocation(email === ADMIN_EMAIL ? "/admin" : "/chat", { replace: true });
  }, [isSignedIn, user, setLocation]);

  if (!isSignedIn) return <Landing />;
  // Spinner while redirecting
  return <PageLoader />;
}

function ChatRoute() {
  return (
    <>
      <Show when="signed-in">
        <AppLayout><Chat /></AppLayout>
      </Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function ServicesRoute() {
  return (
    <>
      <Show when="signed-in"><AppLayout><Services /></AppLayout></Show>
      <Show when="signed-out"><Services /></Show>
    </>
  );
}

/* ── WhatsApp-style notification badge ── */
function NotificationBadge() {
  const { isSignedIn } = useUser();
  const baseTitle = "يمن شات";

  useEffect(() => {
    if (!isSignedIn) { document.title = baseTitle; return; }

    let lastCount = 0;

    const poll = async () => {
      try {
        const r = await fetch("/api/messages");
        if (!r.ok) return;
        const msgs = await r.json() as Array<{ direction: string; isRead: boolean }>;
        const unread = msgs.filter(m => m.direction === "admin_to_user" && !m.isRead).length;
        if (unread !== lastCount) {
          lastCount = unread;
          document.title = unread > 0 ? `(${unread}) ${baseTitle}` : baseTitle;
          if (unread > 0 && "Notification" in window && Notification.permission === "granted") {
            new Notification("يمن شات — رسالة جديدة من الإدارة", {
              body: `لديك ${unread} رسالة جديدة من خالد سلمان`,
              icon: "/logo.svg",
            });
          }
        }
      } catch {}
    };

    // Request notification permission silently
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    poll();
    const id = setInterval(poll, 25000);
    return () => { clearInterval(id); document.title = baseTitle; };
  }, [isSignedIn]);

  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  const loggedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      if (userId && !loggedRef.current) {
        loggedRef.current = true;
        fetch("/api/auth/log-activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login", details: navigator.userAgent.slice(0, 200) }),
        }).catch(() => {});
      }
      if (!userId) loggedRef.current = false;
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AppRouter() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "مرحباً بعودتك", subtitle: "سجّل دخولك للوصول إلى حسابك" } },
        signUp: { start: { title: "إنشاء حساب جديد", subtitle: "انضم إلى منصة خالد سلمان الذكية" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <I18nProvider>
          <TooltipProvider>
            <Suspense fallback={<PageLoader />}>
              <Switch>
                <Route path="/" component={HomeRedirect} />
                <Route path="/sign-in/*?" component={SignInPage} />
                <Route path="/sign-up/*?" component={SignUpPage} />
                <Route path="/chat" component={ChatRoute} />
                <Route path="/services" component={ServicesRoute} />
                <Route path="/pricing" component={Pricing} />
                <Route path="/subscribe" component={PaymentRequestPage} />
                <Route path="/career-map" component={CareerMapPage} />
                <Route path="/guest-chat" component={GuestChatPage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/vision" component={() => (
                  <>
                    <Show when="signed-in"><VisionPage /></Show>
                    <Show when="signed-out"><Redirect to="/sign-in" /></Show>
                  </>
                )} />
                <Route path="/health" component={HealthPage} />
                <Route path="/education" component={EducationPage} />
                <Route path="/transport" component={TransportPage} />
                <Route path="/real-estate" component={RealEstatePage} />
                <Route path="/restaurants" component={RestaurantsPage} />
                <Route path="/emergency" component={EmergencyPage} />
                <Route path="/website" component={WebsitePage} />
                <Route path="/booking" component={BookingPage} />
                <Route path="/dashboard" component={DashboardPage} />
                <Route path="/tools" component={() => (
                  <>
                    <Show when="signed-in"><ToolsPage /></Show>
                    <Show when="signed-out"><Redirect to="/sign-in" /></Show>
                  </>
                )} />
                <Route path="/admin" component={AdminPage} />
                <Route path="/owner" component={OwnerPortal} />
                <Route path="/hub" component={HubPage} />
                <Route path="/design" component={DesignPage} />
                <Route path="/deep-services" component={() => (
                  <>
                    <Show when="signed-in"><DeepServicesPage /></Show>
                    <Show when="signed-out"><Redirect to="/sign-in" /></Show>
                  </>
                )} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
            <Toaster />
            <InstallPWA />
            <RatingButton />
            <NotificationBadge />
          </TooltipProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRouter />
    </WouterRouter>
  );
}

export default App;
