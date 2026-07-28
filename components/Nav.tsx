import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-semibold text-lg tracking-tight">
          Vid<span className="text-gradient">Morph</span>X
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-white/80 hover:text-white">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm px-4 py-2 rounded-xl border border-edge hover:bg-white/5"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm px-4 py-2 hover:text-white text-white/80">
                Log in
              </Link>
              <Link href="/signup" className="text-sm px-4 py-2 hover:text-white text-white/80">
                Sign up
              </Link>
              <Link
                href="/upload"
                className="text-sm px-4 py-2 rounded-xl bg-grad-primary shadow-glow font-medium"
              >
                Start editing
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4 text-white/80">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/upload" className="mt-2 text-center px-4 py-2 rounded-xl bg-grad-primary font-medium">
            Start editing
          </Link>
        </div>
      )}
    </header>
  );
}
