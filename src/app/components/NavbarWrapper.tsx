'use client'

import dynamic from 'next/dynamic'
import SessionWrapper from './SessionWrapper'

const Navbar = dynamic(() => import('./navbar'), { ssr: false })

export default function NavbarWrapper() {
  return(
    <SessionWrapper>
      <Navbar />
    </SessionWrapper>
  );
}
