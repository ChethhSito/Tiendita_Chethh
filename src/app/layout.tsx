import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
const font = Montserrat({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "La Tiendita de Chethh",
  description:
    "Tecnología, ropa, zapatillas y accesorios con una nueva historia por delante.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={font.className}>{children}</body>
    </html>
  );
}
