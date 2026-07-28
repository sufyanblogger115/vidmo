import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import '../styles.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>VidMorphX — AI video editing that runs itself</title>
        <meta
          name="description"
          content="Upload your raw footage. VidMorphX detects scenes, cleans audio, reframes, grades, captions, and exports for every platform automatically."
        />
        <meta property="og:title" content="VidMorphX" />
        <meta property="og:description" content="AI video editing that runs itself." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col bg-aurora">
        <Nav />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
