import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shareImage = {
  url: "https://www.pfpchain.com/og.png",
  width: 1200,
  height: 630,
  alt: "PFP Chain — Privacy-Funded Permanence",
  type: "image/png",
} as const;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pfpchain.com"),
  title: {
    default: "PFP Chain: Privacy-Funded Permanence",
    template: "%s | PFP Chain",
  },
  description:
    "PFP Chain: Privacy-Funded Permanence — experimental public testnet, join steps, boot peers, and live tip from the public mesh.",
  openGraph: {
    siteName: "PFP Chain",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [shareImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
