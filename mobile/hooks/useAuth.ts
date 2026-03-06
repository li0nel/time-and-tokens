import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebaseAuth } from '../services/firebase'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
}

/**
 * Subscribes to Firebase Auth state changes.
 *
 * Returns:
 * - `user`    — the currently signed-in User, or null.
 * - `loading` — true while the initial auth state is being resolved.
 * - `error`   — an error message if auth state could not be determined.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
