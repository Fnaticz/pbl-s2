import type {Metadata} from 'next' 
import './globals.css'
import {Poppins} from 'next/font/google'
import Navbar from './components/navbar'
import Footer from './components/Footer'

const font = Poppins({
  weight:['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin']
})

export const metadata = {
  title: 'Spartan Community',
  description: 'Komunitas Offroad Banyuwangi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${font.className} flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

