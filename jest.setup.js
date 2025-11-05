import '@testing-library/jest-dom'

// Silence React act warnings in tests while still surfacing other errors
const originalError = console.error
let errorSpy
beforeAll(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
    const first = args[0]
    if (typeof first === 'string' && first.includes('not wrapped in act')) {
      return
    }
    // @ts-ignore - preserve original behavior for other errors
    originalError(...args)
  })
})

afterAll(() => {
  if (errorSpy) errorSpy.mockRestore()
})