import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-6 py-32 text-center">
      <div className="font-display text-6xl font-semibold text-gradient mb-4">404</div>
      <p className="text-white/60 mb-8">This clip didn't make the final cut. The page you're looking for doesn't exist.</p>
      <Link href="/" className="px-6 py-3 rounded-xl bg-grad-primary font-medium">Back to home</Link>
    </div>
  );
}
