'use client'

import dynamic from 'next/dynamic'
import SessionWrapper from './SessionWrapper'
import SocketInitializer from '../components/SocketInitializer'

const Navbar = dynamic(() => import('./navbar'), { ssr: false })

export default function NavbarWrapper() {
  return(
    <SessionWrapper>
      <SocketInitializer />
      <Navbar />
    </SessionWrapper>
  );
}
