import './globals.css';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { SkipLink } from '../../../components/accessibility/SkipLink';
import { LiveRegion } from '../../../components/accessibility/LiveRegion';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

export const metadata = {
  title: 'BuffrSign - Digital Signatures for Southern Africa',
  description: 'Legally compliant digital signatures for Namibia and Southern Africa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Prevent MetaMask and other extension errors from affecting our app */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress MetaMask connection errors
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('MetaMask')) {
                  e.preventDefault();
                  console.warn('MetaMask connection error suppressed');
                  return false;
                }
              });
              
              // Handle unhandled promise rejections
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && e.reason.message.includes('MetaMask')) {
                  e.preventDefault();
                  console.warn('MetaMask promise rejection suppressed');
                  return false;
                }
              });
            `
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SkipLink href="#main" />
        <LiveRegion politeness="polite">
          <span>Page content updated</span>
        </LiveRegion>
        <Navbar />
        <ErrorBoundary>
          <main id="main" className="flex-1">
            {children}
          </main>
        </ErrorBoundary>
        <Footer />
      </body>
    </html>
  );
}

