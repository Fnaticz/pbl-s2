import { render, screen, waitFor, fireEvent, act } from "@testing-library/react"
import GalleryPage from "@/app/gallery/page"
import { useSession } from "next-auth/react"

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}))

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

global.fetch = jest.fn()

const flushPromises = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe("GalleryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders data when response 200", async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { username: "tester" } },
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          _id: "1",
          type: "image",
          url: "https://example.com/img.jpg",
          username: "tester",
          createdAt: "2025-11-06",
        },
      ],
    })

    render(<GalleryPage />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/media")
    })

    await waitFor(() => {
      expect(screen.queryByText(/loading data/i)).not.toBeInTheDocument()
    }, { timeout: 3000 })

    await waitFor(() => {
      expect(screen.getByText(/uploaded by: tester/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it("uploads file successfully", async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { username: "tester" } },
    })

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: "2",
          type: "image",
          url: "https://example.com/upload.jpg",
          username: "tester",
          createdAt: "2025-11-06",
        }),
      })

    const { container } = render(<GalleryPage />)

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/media")
    })

    await waitFor(() => {
      expect(screen.queryByText(/loading data/i)).not.toBeInTheDocument()
    })

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).not.toBeNull()
    
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" })

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
      await flushPromises()
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/media/upload", expect.any(Object))
    })
  })

  it("deletes media successfully", async () => {
    window.confirm = jest.fn(() => true)

    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { username: "tester" } },
    })

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            _id: "123",
            type: "image",
            url: "https://example.com/image.jpg",
            username: "tester",
            createdAt: "2025-11-06",
          },
        ],
      })
      .mockResolvedValueOnce({ ok: true })

    render(<GalleryPage />)

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/media")
    })

    // Wait for data to be rendered
    await waitFor(() => {
      expect(screen.queryByText(/loading data/i)).not.toBeInTheDocument()
    }, { timeout: 3000 })

    await waitFor(() => {
      expect(screen.getByText(/uploaded by: tester/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    const deleteButton = screen.getByRole("button", { name: /delete/i })
    
    await act(async () => {
      fireEvent.click(deleteButton)
      await flushPromises()
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/media/123", { method: "DELETE" })
    })
  })
})
