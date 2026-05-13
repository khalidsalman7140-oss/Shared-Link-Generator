import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import { I18nProvider } from "@/lib/i18n";
import { InstallPWA } from "@/components/InstallPWA";
import { RatingButton } from "@/components/RatingModal";
import Chat from "@/pages/chat";
import Services from "@/pages/services";
import Landing from "@/pages/landing";
import Pricing from "@/pages/pricing";
import AdminPage from "@/pages/admin";
import PaymentRequestPage from "@/pages/payment-request";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import NotFound from "@/pages/not-found";

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

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/chat" /></Show>
      <Show when="signed-out"><Landing /></Show>
    </>
  );
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

function SignInRoute() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} />
    </div>
  );
}

function SignUpRoute() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
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
            <Switch>
              <Route path="/" component={HomeRedirect} />
              <Route path="/sign-in/*?" component={SignInRoute} />
              <Route path="/sign-up/*?" component={SignUpRoute} />
              <Route path="/chat" component={ChatRoute} />
              <Route path="/services" component={ServicesRoute} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/subscribe" component={PaymentRequestPage} />
              <Route path="/admin" component={AdminPage} />
              <Route component={NotFound} />
            </Switch>
            <Toaster />
            <InstallPWA />
            <RatingButton />
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
