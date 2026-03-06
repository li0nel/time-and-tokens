import { renderHook, waitFor } from '@testing-library/react-native'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuth } from '../../hooks/useAuth'

// firebase/auth is mocked in test/setup.ts
// We cast the mock so we can control its behaviour per test.
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts with loading=true and user=null', () => {
    // onAuthStateChanged never calls back — simulates pending resolution.
    mockOnAuthStateChanged.mockImplementation(
      () => jest.fn() as unknown as ReturnType<typeof onAuthStateChanged>,
    )

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('sets user when onAuthStateChanged fires with a user', async () => {
    const fakeUser = { uid: 'test-uid', email: 'test@example.com' }

    mockOnAuthStateChanged.mockImplementation((_auth, next) => {
      if (typeof next === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next(fakeUser as any)
      }
      return jest.fn() as unknown as ReturnType<typeof onAuthStateChanged>
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(fakeUser)
    expect(result.current.error).toBeNull()
  })

  it('sets user to null when auth state resolves without a user', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, next) => {
      if (typeof next === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next(null as any)
      }
      return jest.fn() as unknown as ReturnType<typeof onAuthStateChanged>
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('unsubscribes from onAuthStateChanged on unmount', () => {
    const unsubscribe = jest.fn()

    mockOnAuthStateChanged.mockImplementation(
      () => unsubscribe as unknown as ReturnType<typeof onAuthStateChanged>,
    )

    const { unmount } = renderHook(() => useAuth())
    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
