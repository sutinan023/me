import "./globals.css";
import localFont from "next/font/local";
import Header from "@/components/Header";

const thai = localFont({ src:"./fonts/NotoSansThai-Variable.ttf", weight:"400 900", style:"normal", variable:"--font-thai", display:"swap" });
const latin = localFont({ src:"./fonts/DMSans-Variable.ttf", weight:"400 900", style:"normal", variable:"--font-latin", display:"swap" });

export const metadata = {
  title: "Personality Type Explorer",
  description: "Research-informed self-discovery through four personality dimensions.",
  icons: {
    icon: { url: '/mark.svg', type: 'image/svg+xml' },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" data-scroll-behavior="smooth" className={`${thai.variable} ${latin.variable}`}>
      <body style={{fontFamily:"var(--font-thai), var(--font-latin), sans-serif"}}>
        <Header />
        {children}
      </body>
    </html>
  );
}
