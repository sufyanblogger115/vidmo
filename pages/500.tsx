import Link from 'next/link';

export default function ServerError() {
  return (
    <div className="max-w-lg mx-auto px-6 py-32 text-center">
      <div className="font-display text-6xl font-semibold text-gradient mb-4">500</div>
      <p className="text-white/60 mb-8">Rendering hit a snag on our end. Your upload is safe — please try again in a moment.</p>
      <Link href="/" className="px-6 py-3 rounded-xl bg-grad-primary font-medium">Back to home</Link>
    </div>
  );
}
