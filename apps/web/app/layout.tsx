import './globals.css';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
export const metadata = {
  title: 'BuffrSign - Digital Signatures for Namibia',
  description: 'ETA 2019 compliant digital signature platform for Namibia and Southern Africa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-base-200">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="container mx-auto p-4 flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

