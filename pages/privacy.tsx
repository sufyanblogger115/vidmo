export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-semibold mb-8">Privacy Policy</h1>
      <div className="text-white/60 leading-relaxed space-y-4 text-sm">
        <p>We collect the minimum data needed to process your videos: account details, uploaded files, and processing metadata.</p>
        <p>Uploaded videos are stored only for as long as needed to process and deliver your edited output, after which they are deleted from our servers.</p>
        <p>We do not sell your data or your footage to third parties. Processing may involve sending audio/video data to our AI providers (e.g. Google Gemini) solely to generate captions and metadata for your job.</p>
        <p>You can request deletion of your account and all associated data at any time by contacting support.</p>
      </div>
    </div>
  );
}
