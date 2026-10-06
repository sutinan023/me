import "./globals.css";
import { Noto_Sans_Thai, DM_Sans } from "next/font/google";
import Header from "@/components/Header";

const thai = Noto_Sans_Thai({ subsets:["thai"], weight:["400","500","600","700","800","900"], variable:"--font-thai", display:"swap" });
const latin = DM_Sans({ subsets:["latin"], weight:["400","500","600","700","800","900"], variable:"--font-latin", display:"swap" });

export const metadata = {
  title: "Personality Type Explorer",
  description: "Research-informed self-discovery through four personality dimensions."
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${thai.variable} ${latin.variable}`}>
      <body style={{fontFamily:"var(--font-thai), var(--font-latin), sans-serif"}}>
        <Header />
        {children}
      </body>
    </html>
  );
}
