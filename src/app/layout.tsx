import './globals.css'
import { Poppins } from 'next/font/google'
import NavbarWrapper from './components/NavbarWrapper'
import Footer from './components/Footer'
import SessionWrapper from './components/SessionWrapper'
import { useEffect } from 'react'
import socket from '../../lib/socket'

const font = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
})

export const metadata = {
  title: 'Spartan Community',
  description: 'Komunitas Offroad Banyuwangi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/socket')
    socket.connect()
    return () => { socket.disconnect() }
  }, [])
  return (
    <html lang="id">
      <body className={`${font.className} flex flex-col min-h-screen`}>
        <SessionWrapper>
          <NavbarWrapper />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  )
}
