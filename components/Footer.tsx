import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaDiscord, FaGithub } from 'react-icons/fa';

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/careers', label: 'Careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/refund', label: 'Refund Policy' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/help', label: 'Help Center' },
      { href: '/faq', label: 'FAQ' },
      { href: '/api-docs', label: 'API' },
    ],
  },
  {
    title: 'Social',
    links: [
      { href: 'https://twitter.com', label: 'Twitter', icon: FaTwitter },
      { href: 'https://linkedin.com', label: 'LinkedIn', icon: FaLinkedin },
      { href: 'https://discord.com', label: 'Discord', icon: FaDiscord },
      { href: 'https://github.com', label: 'GitHub', icon: FaGithub },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-edge mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm text-white/50 mb-4">{col.title}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {col.links.map((l: any) => (
                <li key={l.href} className="flex items-center gap-2">
                  {l.icon && <l.icon className="text-white/40" />}
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-10 text-xs text-white/40">
        © {new Date().getFullYear()} VidMorphX. All rights reserved.
      </div>
    </footer>
  );
}
