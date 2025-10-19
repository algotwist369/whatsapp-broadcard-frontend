import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { WhatsAppProvider } from '@/components/providers/WhatsAppProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SettingsProvider } from '@/components/providers/SettingsProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp Bulk Messenger',
  description: 'AI-powered bulk WhatsApp messaging with spam detection and professional rewriting',
  keywords: ['whatsapp', 'bulk messaging', 'ai', 'automation', 'business'],
  authors: [{ name: 'Your Name' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent hydration mismatches from browser extensions
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver(() => {
                  // Ignore browser extension modifications
                });
                observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ['bis_skin_checked', '__processed_*']
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <AuthProvider>
            <SettingsProvider>
              <WhatsAppProvider>
                {children}
              </WhatsAppProvider>
            </SettingsProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Toaster
            position="bottom-left"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
      </body>
    </html>
  );
}
