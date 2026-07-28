import { motion } from 'framer-motion';
import UploadDrop from '@/components/UploadDrop';
import {
  HiOutlineFilm, HiOutlineColorSwatch, HiOutlineMicrophone, HiOutlineScissors,
  HiOutlineDeviceMobile, HiOutlineSparkles, HiOutlineChatAlt2, HiOutlineLightningBolt,
} from 'react-icons/hi';

const FEATURES = [
  { icon: HiOutlineScissors, title: 'Smart cuts & auto trim', desc: 'Scene detection finds every cut point and silence removal trims dead air automatically.' },
  { icon: HiOutlineDeviceMobile, title: 'Reframe for every platform', desc: 'Vertical, square, or horizontal exports for TikTok, Reels, Shorts, and YouTube in one pass.' },
  { icon: HiOutlineColorSwatch, title: 'Color grading', desc: 'Auto exposure, contrast, and cinematic LUT-style grades tuned per clip.' },
  { icon: HiOutlineMicrophone, title: 'Audio cleanup', desc: 'Noise reduction and loudness normalization so every video sounds broadcast-ready.' },
  { icon: HiOutlineChatAlt2, title: 'Auto captions', desc: 'Gemini-powered transcription generates styled, burned-in subtitles automatically.' },
  { icon: HiOutlineFilm, title: 'Cinematic effects', desc: 'Film grain, vignette, glow, and transitions applied with restraint, not overkill.' },
  { icon: HiOutlineLightningBolt, title: 'Stabilization & sharpening', desc: 'Shaky handheld footage gets smoothed; soft footage gets crisped up.' },
  { icon: HiOutlineSparkles, title: 'Metadata generator', desc: 'Titles, descriptions, and hashtags generated from your finished video.' },
];

const STATS = [
  { value: '40+', label: 'Automated edits per video' },
  { value: '3.2M', label: 'Clips processed' },
  { value: '99.9%', label: 'Render success rate' },
  { value: '<6min', label: 'Avg. turnaround' },
];

export default function Home() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-white/60 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
            Now processing with Gemini 2.5
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
            Upload raw footage.
            <br />
            <span className="text-gradient">Get a finished cut.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-white/60 text-lg max-w-lg"
          >
            No timeline, no keyframes, no editing skills required. VidMorphX detects
            scenes, cleans audio, reframes for your platform, grades color, and
            captions your video — automatically.
          </motion.p>
        </div>

        <UploadDrop />
      </section>

      <section className="border-y border-edge bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-semibold text-gradient">{s.value}</div>
              <div className="text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="font-display text-3xl font-semibold text-center mb-4">Everything a professional editor does. Automatically.</h2>
        <p className="text-white/50 text-center max-w-xl mx-auto mb-16">
          Every upload runs through the same pipeline a video editor would use — just without you touching a timeline.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 hover:shadow-glow transition-shadow"
            >
              <f.icon className="text-2xl text-violet mb-4" />
              <h3 className="font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-white/50">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="glass rounded-3xl p-12 text-center shadow-panel">
          <h2 className="font-display text-3xl font-semibold mb-4">Ready to skip the timeline?</h2>
          <p className="text-white/50 mb-8">Drop in a clip and see the full pipeline run in minutes.</p>
          <a href="/upload" className="inline-block px-8 py-3 rounded-xl bg-grad-primary font-medium shadow-glow">
            Start editing free
          </a>
        </div>
      </section>
    </>
  );
}
