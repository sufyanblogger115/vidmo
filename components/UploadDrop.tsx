import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { useRouter } from 'next/router';

export default function UploadDrop() {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    // Files picked on the homepage are handed to the /upload page, which
    // owns the actual upload + options flow.
    (window as any).__vmx_pending_files = files;
    router.push('/upload?from=drop');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={`glass rounded-3xl p-10 md:p-14 text-center transition-shadow ${dragging ? 'shadow-glow' : 'shadow-panel'}`}
    >
      <div className="mx-auto w-16 h-16 rounded-2xl bg-grad-primary flex items-center justify-center mb-6">
        <HiOutlineCloudUpload className="text-3xl" />
      </div>
      <p className="font-display text-xl mb-2">Drop your footage here</p>
      <p className="text-white/50 text-sm mb-8">MP4, MOV, WebM, or MKV · up to 2GB per file · multiple files supported</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => inputRef.current?.click()}
          className="px-6 py-3 rounded-xl bg-grad-primary font-medium shadow-glow"
        >
          Upload videos
        </button>
        <button
          onClick={() => router.push('/upload')}
          className="px-6 py-3 rounded-xl border border-edge hover:bg-white/5 font-medium"
        >
          Start editing
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}
