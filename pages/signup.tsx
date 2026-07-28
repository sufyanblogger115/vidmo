import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        setError('Account created — please log in.');
        router.push('/login');
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 rounded-2xl border border-edge glass">
        <h1 className="text-2xl font-display font-semibold text-center mb-2">Create your account</h1>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div>
          <label className="text-sm text-white/70">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-black/30 border border-edge outline-none"
          />
        </div>

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
            minLength={6}
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
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="text-sm text-white/60 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-white underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
