import { render, screen, waitFor } from "@testing-library/react";
import FinanceReportPage from "@/app/finance/page";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("FinanceReportPage", () => {

  it("menampilkan pesan 'No finance data available yet' jika tidak ada data", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;

    render(<FinanceReportPage />);
    jest.advanceTimersByTime(1500);
    await waitFor(() => {
      expect(
        screen.getByText(/no finance data available yet/i)
      ).toBeInTheDocument();
    });
  });

  it("menampilkan data dan total kalau ada data", async () => {
    const mockData = [
      { _id: "1", description: "Community Donation", amount: 100000, date: new Date("2025-11-01").toISOString() },
      { _id: "2", description: "Event Sponsorship", amount: 250000, date: new Date("2025-11-02").toISOString() },
    ];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    ) as jest.Mock;

    render(<FinanceReportPage />);
    jest.advanceTimersByTime(1500);
    await waitFor(() => {
      expect(screen.getByText(/community donation/i)).toBeInTheDocument();
      expect(screen.getByText(/event sponsorship/i)).toBeInTheDocument();
      expect(screen.getByText(/total: rp350,000/i)).toBeInTheDocument();
    });
  });
});
