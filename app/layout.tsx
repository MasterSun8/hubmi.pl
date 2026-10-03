import type { Metadata } from "next";
import localFont from "next/font/local";
import { a11yInlineScript } from "@/components/ui/accessibility-preferences";
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
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${roboto.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: a11yInlineScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
