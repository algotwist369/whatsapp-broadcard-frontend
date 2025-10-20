import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { WhatsAppProvider } from '@/components/providers/WhatsAppProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SettingsProvider } from '@/components/providers/SettingsProvider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: 'WhatsApp Bulk Messenger',
  description: 'AI-powered bulk WhatsApp messaging with spam detection and professional rewriting',
  keywords: ['whatsapp', 'bulk messaging', 'ai', 'automation', 'business'],
  authors: [{ name: 'Your Name' }],
  other: {
    'font-display': 'swap',
  },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent hydration mismatches from browser extensions
              if (typeof window !== 'undefined') {
                // Wait for DOM to be ready before setting up observer
                const setupObserver = () => {
                  if (document.body) {
                    const observer = new MutationObserver((mutations) => {
                      mutations.forEach((mutation) => {
                        // Ignore browser extension modifications
                        if (mutation.type === 'attributes') {
                          const target = mutation.target;
                          if (target && target.nodeType === Node.ELEMENT_NODE) {
                            const element = target;
                            // Remove problematic attributes added by extensions
                            if (element.hasAttribute('bis_skin_checked')) {
                              element.removeAttribute('bis_skin_checked');
                            }
                            // Remove other extension attributes
                            Array.from(element.attributes).forEach(attr => {
                              if (attr.name.startsWith('__processed_') || 
                                  attr.name.includes('extension') ||
                                  attr.name.includes('browser')) {
                                element.removeAttribute(attr.name);
                              }
                            });
                          }
                        }
                      });
                    });
                    
                    observer.observe(document.body, {
                      attributes: true,
                      // Only safe explicit attributes in filter; we'll inspect others in callback
                      attributeFilter: ['bis_skin_checked'],
                      subtree: true
                    });
                  } else {
                    // Retry if body is not ready
                    setTimeout(setupObserver, 10);
                  }
                };
                
                // Start observer setup
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', setupObserver);
                } else {
                  setupObserver();
                }
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
