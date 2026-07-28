const PLANS = [
  { name: 'Starter', price: '$0', tagline: 'Try the pipeline', features: ['5 videos / month', '720p exports', 'Watermarked output', 'Community support'] },
  { name: 'Creator', price: '$19', tagline: 'For regular posting', features: ['60 videos / month', '1080p exports', 'No watermark', 'Auto captions', 'Priority queue'], highlight: true },
  { name: 'Studio', price: '$59', tagline: 'For teams & agencies', features: ['Unlimited videos', '4K exports', 'API access', 'Dedicated queue', 'Priority support'] },
];

export default function Pricing() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-semibold text-center mb-4">Simple, usage-based pricing</h1>
      <p className="text-white/50 text-center mb-16">Start free. Upgrade when your queue does.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((p) => (
          <div key={p.name} className={`glass rounded-3xl p-8 ${p.highlight ? 'shadow-glow border-violet/40' : ''}`}>
            <h3 className="font-display text-xl mb-1">{p.name}</h3>
            <p className="text-white/50 text-sm mb-6">{p.tagline}</p>
            <div className="font-display text-4xl font-semibold mb-6">{p.price}<span className="text-base text-white/40">/mo</span></div>
            <ul className="space-y-3 text-sm text-white/70 mb-8">
              {p.features.map((f) => <li key={f}>· {f}</li>)}
            </ul>
            <button className={`w-full py-3 rounded-xl font-medium ${p.highlight ? 'bg-grad-primary' : 'border border-edge'}`}>
              Get started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
