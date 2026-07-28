import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-semibold mb-8">Contact us</h1>
      {sent ? (
        <div className="glass rounded-2xl p-8 text-center">Thanks — we'll get back to you shortly.</div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <input required placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-edge" />
          <input required type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-edge" />
          <textarea required placeholder="Message" rows={5} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-edge" />
          <button className="px-6 py-3 rounded-xl bg-grad-primary font-medium">Send message</button>
        </form>
      )}
    </div>
  );
}
