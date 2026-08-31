import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Fraunces, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/content/site";
import { AdSenseLoader } from "@/components/ads/adsense-loader";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { themeInlineBootstrap } from "@/lib/theme/inline-script";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} - AI visual production & digital execution | GCC`,
    template: `%s | ${brand.name}`,
  },
  description: brand.tagline,
  metadataBase: new URL("https://estio.org"),
  openGraph: {
    type: "website",
    locale: "en",
    siteName: brand.name,
    title: `${brand.name} - AI visual production & digital execution`,
    description: brand.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} - AI visual production & digital execution`,
    description: brand.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${dmSans.variable} ${fraunces.variable} ${notoSansArabic.variable} theme-dark min-h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-712088539"
        />
        <script
          // Google tag (gtag.js) — AW-712088539
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-712088539');`,
          }}
        />
        <script
          // Sync document element before React/CSS using the locale segment in the URL.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname.split("/").filter(Boolean)[0];var r=document.documentElement;if(p==="ar"){r.setAttribute("lang","ar");r.setAttribute("dir","rtl");}else if(p==="en"){r.setAttribute("lang","en");r.setAttribute("dir","ltr");}}catch(e){}})();`,
          }}
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="relative min-h-full flex flex-col font-sans text-[var(--text-body)]">
        <script
          dangerouslySetInnerHTML={{ __html: themeInlineBootstrap }}
        />
        <AdSenseLoader />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
