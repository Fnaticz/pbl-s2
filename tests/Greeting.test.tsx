import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Greeting from '@/app/components/Greeting'

test('menampilkan teks dengan nama yang diberikan', () => {
  render(<Greeting name="Next.js" />)
  expect(screen.getByText('Hello, Next.js!')).toBeInTheDocument()
})
