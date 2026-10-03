import type { Metadata } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/shared/components/motion/motion-provider";
import { a11yInlineScript } from "@/app/components/accessibility-preferences";
import "./globals.css";

const roboto = localFont({
  variable: "--font-roboto",
  display: "swap",
  src: [
    { path: "./fonts/roboto-100.ttf", weight: "100", style: "normal" },
    { path: "./fonts/roboto-300.ttf", weight: "300", style: "normal" },
    { path: "./fonts/roboto-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/roboto-500.ttf", weight: "500", style: "normal" },
  ],
});
export const metadata: Metadata = {
  title: "Hubmi — razem możemy więcej",
  description: "Zgłoś problem lub zaoferuj pomoc. Łączymy potrzeby mieszkańców Małopolski z pomysłami i rozwiązaniami społecznymi.",
  metadataBase: new URL("https://www.hubmi-innovations.org"),
  alternates: {
    canonical: "/",
  },
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${roboto.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* text/plain on the client stops React's dev warning; the server copy runs during parsing. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: a11yInlineScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
