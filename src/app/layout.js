import "./globals.css";

export const metadata = {
  title: "Fluxia Chat",
  description: "Plataformas de chat personalizadas para sua empresa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
