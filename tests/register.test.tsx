import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import RegisterPage from "@/app/register/page"
import "@testing-library/jest-dom"

global.fetch = jest.fn()

const waitForLoadingToComplete = async () => {
  await waitFor(
    () => {
      expect(screen.queryByText(/loading data, please wait/i)).not.toBeInTheDocument()
    },
    { timeout: 2000 }
  )
}

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("Validasi form belum lengkap", async () => {
    render(<RegisterPage />)

    await waitForLoadingToComplete()

    const form = document.querySelector("form")
    if (form) {
      fireEvent.submit(form)
    } else {
      const registerButton = screen.getByRole("button", { name: /register/i })
      fireEvent.click(registerButton)
    }

    await waitFor(() => {
      expect(
        screen.getByText(/please complete all fields before submitting/i)
      ).toBeInTheDocument()
    })
  })

  it("Indikator kekuatan password", async () => {
    render(<RegisterPage />)

    await waitForLoadingToComplete()

    const passwordInput = screen.getByPlaceholderText(/password/i)

    fireEvent.change(passwordInput, { target: { value: "abc" } })
    expect(screen.getByText(/password strength: weak/i)).toBeInTheDocument()

    fireEvent.change(passwordInput, { target: { value: "abcdef" } })
    expect(screen.getByText(/password strength: medium/i)).toBeInTheDocument()

    fireEvent.change(passwordInput, { target: { value: "Abcdef1" } })
    expect(screen.getByText(/password strength: strong/i)).toBeInTheDocument()
  })

  it("Submit form berhasil (response 200)", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: "User registered successfully" }),
    })

    render(<RegisterPage />)

    await waitForLoadingToComplete()

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "tester" },
    })
    fireEvent.change(screen.getByPlaceholderText(/email or phone/i), {
      target: { value: "tester@mail.com" },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "Abcdef1" },
    })
    fireEvent.change(screen.getByPlaceholderText(/address/i), {
      target: { value: "Jakarta" },
    })

    const form = document.querySelector("form")
    if (form) {
      fireEvent.submit(form)
    } else {
      fireEvent.click(screen.getByRole("button", { name: /register/i }))
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/register", expect.any(Object))
    })

    await waitFor(() => {
      expect(screen.getByText(/registration successful!/i)).toBeInTheDocument()
    })
  })
})
