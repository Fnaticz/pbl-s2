"use client";
import './globals.css'
import { Poppins } from 'next/font/google'
import NavbarWrapper from './components/NavbarWrapper'
import Footer from './components/Footer'
import SessionWrapper from './components/SessionWrapper'
import { usePathname } from 'next/navigation'

const font = Poppins({
  weight: ['100','200','300','400','500','600','700','800','900'],
  subsets: ['latin'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavAndFooter =
    pathname && (pathname.startsWith("/dashboard") || pathname.startsWith("/forum"));

  return (
    <html lang="id">
      <body className={`${font.className} flex flex-col min-h-screen`}>
        <SessionWrapper>
          {/* Navbar hanya tampil jika bukan halaman dashboard atau forum */}
          {!hideNavAndFooter && <NavbarWrapper />}

          <main className="flex-grow">{children}</main>

          {/* Footer juga disembunyikan di dashboard & forum */}
          {!hideNavAndFooter && <Footer />}
        </SessionWrapper>
      </body>
    </html>
  )
}
