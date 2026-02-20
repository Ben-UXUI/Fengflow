import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-display text-[var(--green-deep)] mb-4">
              ☯ FengFlow
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">
              AI-powered Feng Shui room analysis grounded in classical principles.
              Bring harmony to your home.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/editor" className="hover:text-[var(--green-deep)]">
                  Room Analysis
                </Link>
              </li>
              <li>
                <Link href="/masters" className="hover:text-[var(--green-deep)]">
                  Find a Master
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[var(--green-deep)]">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <a href="#" className="hover:text-[var(--green-deep)]">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--green-deep)]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--green-deep)]">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
          <p>© 2026 FengFlow. Built with harmony and balance.</p>
        </div>
      </div>
    </footer>
  )
}
