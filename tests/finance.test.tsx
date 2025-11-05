import { render, screen, waitFor, act } from '@testing-library/react'
import FinanceReportPage from '@/app/finance/page'
import '@testing-library/jest-dom'

const mockData = [
  { _id: '1', description: 'Donation', amount: 100000, date: '2025-01-01' },
  { _id: '2', description: 'Expense', amount: 50000, date: '2025-01-02' },
]

const flushPromises = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  jest.useFakeTimers()
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockData),
    } as Response)
  ) as jest.Mock
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  jest.resetAllMocks()
})

describe('FinanceReportPage', () => {
  it('renders loading initially', () => {
    render(<FinanceReportPage />)
    expect(screen.getByText(/loading data/i)).toBeInTheDocument()
  })

  it('renders finance data when available', async () => {
    render(<FinanceReportPage />)
    await act(async () => {
      jest.advanceTimersByTime(1500)
      await flushPromises()
    })

    for (const item of mockData) {
      expect(await screen.findByText(item.description)).toBeInTheDocument()
      expect(await screen.findByText(`Rp${item.amount.toLocaleString()}`)).toBeInTheDocument()
    }

    expect(await screen.findByText(/Community Finance Report/i)).toBeInTheDocument()
  })

  it('renders correct total', async () => {
    render(<FinanceReportPage />)
    await act(async () => {
      jest.advanceTimersByTime(1500)
      await flushPromises()
    })

    const totalAmount = mockData.reduce((sum, item) => sum + item.amount, 0)
    expect(await screen.findByText(new RegExp(`Total: Rp${totalAmount.toLocaleString()}`))).toBeInTheDocument()
  })

  it('renders "No finance data" if empty', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve([]) } as Response)
    )

    render(<FinanceReportPage />)
    await act(async () => {
      jest.advanceTimersByTime(1500)
      await flushPromises()
    })

    expect(await screen.findByText(/no finance data available/i)).toBeInTheDocument()
  })
})
