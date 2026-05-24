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

export const metadata: Metadata = {
  verification: {
    google: '8rdv6-oBxoLXhDcxQa41xRmsPNIYtLRMosa_A3xjWdY',
  },
  title: "YouTube コメント マインドマップ | コメントをAIで自動分析・可視化",
  description: "YouTubeのURLを貼り付けるだけで、最大100件のコメントをAIが自動分析してマインドマップを作成します。視聴者の声を一瞬で見える化する無料ツールです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
