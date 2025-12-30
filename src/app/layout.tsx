import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "aos/dist/aos.css";
import { ClientLayout } from "./client-layout";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Andino Ferdiansah - Full Stack Developer",
    template: "%s | Andino Ferdiansah",
  },
  description:
    "Portfolio of Andino Ferdiansah - Full Stack Developer specializing in React, Next.js, Vue.js, Laravel, and modern web technologies.",
  keywords: [
    "Andino Ferdiansah",
    "Full Stack Developer",
    "React Developer",
    "Next.js Developer",
    "Vue.js Developer",
    "Laravel Developer",
    "TypeScript",
    "JavaScript",
    "Portfolio",
    "Web Development",
  ],
  authors: [{ name: "Andino Ferdiansah" }],
  creator: "Andino Ferdiansah",
  publisher: "Andino Ferdiansah",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://andinoferdi-portfolio.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://andinoferdi-portfolio.vercel.app",
    title: "Andino Ferdiansah - Full Stack Developer",
    description:
      "Portfolio of Andino Ferdiansah - Full Stack Developer specializing in React, Next.js, Vue.js, Laravel, and modern web technologies.",
    siteName: "Andino Ferdiansah Portfolio",
    images: [
      {
        url: "/images/self/1.jpg",
        width: 1200,
        height: 630,
        alt: "Andino Ferdiansah - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Andino Ferdiansah - Full Stack Developer",
    description:
      "Portfolio of Andino Ferdiansah - Full Stack Developer specializing in React, Next.js, Vue.js, Laravel, and modern web technologies.",
    images: ["/images/self/1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

const themeScript = `
  try {
    var theme = localStorage.getItem('theme');
    var isDark = theme === 'dark' || 
      ((!theme || theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
`;

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className={poppins.className}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
};

export default RootLayout;
