import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 rounded-2xl border border-edge glass">
        <h1 className="text-2xl font-display font-semibold text-center mb-2">Log in</h1>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div>
          <label className="text-sm text-white/70">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-black/30 border border-edge outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-white/70">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-black/30 border border-edge outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-xl bg-grad-primary font-medium shadow-glow disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-white/60 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-white underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
