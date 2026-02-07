import { Navbar } from "@/components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-8">
          {children}
        </div>
      </main>
      {/* Optional Footer */}
      <footer className="border-t border-cream-dark bg-white py-8 mt-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <h3 className="mb-4 text-lg font-bold text-forest">t'day</h3>
              <p className="text-warm-gray">
                Track your daily mood and connect with a global community focused on wellbeing.
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-forest">Product</h4>
              <ul className="space-y-2 text-warm-gray">
                <li><a href="/features" className="hover:text-forest transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-forest transition-colors">Pricing</a></li>
                <li><a href="/download" className="hover:text-forest transition-colors">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-forest">Company</h4>
              <ul className="space-y-2 text-warm-gray">
                <li><a href="/about" className="hover:text-forest transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-forest transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-forest transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-forest">Legal</h4>
              <ul className="space-y-2 text-warm-gray">
                <li><a href="/privacy" className="hover:text-forest transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-forest transition-colors">Terms</a></li>
                <li><a href="/cookies" className="hover:text-forest transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cream-dark pt-8 text-center text-warm-gray">
            <p>&copy; 2024 t'day. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
