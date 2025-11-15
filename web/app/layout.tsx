import type { Metadata } from 'next';
import './globals.css';
import { clsx } from 'clsx';

export const metadata: Metadata = {
  title: 'AI Mirror Mirror',
  description: "Mirror in the cloud, who's the tardiest around?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={clsx('min-h-dvh antialiased bg-gradient-to-b from-cloud-50 to-white text-slate-800')}> 
        <div className="container py-10">{children}</div>
      </body>
    </html>
  );
}
