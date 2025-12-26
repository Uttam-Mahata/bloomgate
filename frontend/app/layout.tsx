import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "BloomGate | Smart Exam Paper Generator",
  description: "Advanced examination paper generation system with BloomJoin technology for distributed synchronization",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-grid bg-gradient-mesh min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
