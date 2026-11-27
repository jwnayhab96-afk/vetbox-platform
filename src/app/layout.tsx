import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EmergencySosModal } from "@/components/shared/emergency-sos-modal";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "VetBox" },
  title: {
    template: "%s | فيت بوكس - VetBox",
    default: "فيت بوكس (VetBox) | منظومة الرعاية البيطرية المتكاملة",
  },
  description:
    "ملف طبي رقمي موثق لكل حيوان، متابعة دورية للتطعيمات والجرعات، وتواصل مباشر مع أفضل الأطباء والعيادات البيطرية في مصر.",
  keywords: [
    "بيطري",
    "طبيب بيطري",
    "عيادة بيطرية",
    "تطعيمات الكلاب",
    "تطعيمات القطط",
    "ملف طبي للحيوانات",
    "رعاية بيطرية مصر",
    "فيت بوكس",
    "VetBox",
  ],
  authors: [{ name: "VetBox Team" }],
  creator: "VetBox Egypt",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "فيت بوكس - VetBox | رعاية حيوانك أسهل وأكثر أماناً",
    description:
      "المنصة البيطرية الموحدة لربط المربين بالأطباء والعيادات، وحفظ التاريخ الطبي والتطعيمات لكل حيوان.",
    siteName: "VetBox",
    locale: "ar_EG",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#164e3f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Outfit:wght@700;800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
        {children}
        <Footer />
        <EmergencySosModal />
      </body>
    </html>
  );
}
