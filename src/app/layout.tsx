import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";

export const metadata: Metadata = {
  title: "t'day - How was your day?",
  description:
    "The world's first collective online journal. Rate your day anonymously, track changes over time, and read ratings from all around the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Courgette&family=Open+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="bg-cream text-gray-800 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
