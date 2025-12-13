import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HoopXmas Raffle Ticket",
  description: "Predict NBA Christmas Day scores and win up to 200,000 USDT! Join the HoopX Score Prediction Challenge.",
  keywords: ["NBA", "Christmas", "Basketball", "Prediction", "HoopX", "Solana", "Crypto"],
  themeColor: "#91000A",
  openGraph: {
    title: "HoopXmas Raffle Ticket",
    description: "Predict NBA Christmas Day scores and win up to 200,000 USDT!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
