"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TitleProvider } from "@/components/providers/title-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { MainNavbar } from "@/components/navbar";
import { MainFooter } from "@/components/footer";
import { MiniPlayer } from "@/components/mini-player";
import { MusicPlayerErrorBoundary } from "@/components/error-boundary";
import { Spotlight } from "@/components/ui/spotlight-new";

const LANDING_ROUTES = [
  "/",
  "/gallery",
  "/projects",
  "/techstack-&-certificate",
];

const isLandingPage = (pathname: string): boolean => {
  if (pathname === "/") return true;
  return LANDING_ROUTES.some(
    (route) => route !== "/" && pathname.startsWith(route)
  );
};

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const showLandingLayout = isLandingPage(pathname);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      enableColorScheme={false}
    >
      <ToastProvider />
      <TitleProvider>
        {showLandingLayout ? (
          <div className="relative flex flex-col min-h-screen">
            <div className="fixed inset-0 z-0">
              <div className="absolute inset-0 opacity-60 dark:opacity-40 bg-size-[40px_40px] bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
              <Spotlight
                gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .12) 0, hsla(210, 100%, 55%, .06) 50%, hsla(210, 100%, 45%, 0) 80%)"
                gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .04) 80%, transparent 100%)"
                gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 45%, .03) 80%, transparent 100%)"
                translateY={-350}
                width={560}
                height={1380}
                smallWidth={240}
                duration={7}
                xOffset={100}
              />
            </div>
            <div className="relative z-10 flex flex-col min-h-screen">
              <MainNavbar />
              <main className="flex-1">{children}</main>
              <MainFooter />
              <MusicPlayerErrorBoundary>
                <MiniPlayer />
              </MusicPlayerErrorBoundary>
            </div>
          </div>
        ) : (
          <>{children}</>
        )}
      </TitleProvider>
    </ThemeProvider>
  );
};
