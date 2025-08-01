import Header from '@/components/Header';

export const metadata = {
  title: 'Cure Point',
};
import './global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="">
          <Header />
          <main className={'h-[calc(100vh-64px)] mt-16'}>{children}</main>
        </main>
      </body>
    </html>
  );
}
