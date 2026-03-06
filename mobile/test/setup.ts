// Mock react-native-reanimated with a lightweight inline mock that avoids
// native worklets initialization errors in Jest.
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react') as typeof import('react')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native') as typeof import('react-native')

  const NOOP = () => {}
  const ID = <T>(t: T): T => t

  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      Image: View,
      ScrollView: View,
      FlatList: View,
    },
    // Animated View that just renders as a regular View in tests
    View,
    Text: View,
    Image: View,
    ScrollView: View,
    FlatList: View,
    // Hooks — return stable no-op values
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (factory: () => object) => {
      try {
        return factory()
      } catch {
        return {}
      }
    },
    useAnimatedRef: () => React.createRef(),
    useAnimatedScrollHandler: () => NOOP,
    useAnimatedGestureHandler: () => NOOP,
    useAnimatedReaction: NOOP,
    useDerivedValue: (factory: () => unknown) => ({ value: factory() }),
    useAnimatedProps: ID,
    // Animation creators — just call the callback immediately with value
    withTiming: (toValue: unknown, _config?: unknown, callback?: ((finished: boolean) => void) | null) => {
      callback?.(true)
      return toValue
    },
    withSpring: (toValue: unknown, _config?: unknown, callback?: ((finished: boolean) => void) | null) => {
      callback?.(true)
      return toValue
    },
    withRepeat: (animation: unknown) => animation,
    withSequence: (...animations: unknown[]) => animations[animations.length - 1],
    withDelay: (_delay: unknown, animation: unknown) => animation,
    withDecay: (config: { velocity: unknown }) => config.velocity,
    cancelAnimation: NOOP,
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    runOnUI: (fn: (...args: unknown[]) => unknown) => fn,
    interpolate: (_value: unknown, _range: unknown, _outputRange: unknown[]) => _outputRange[0],
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Easing: {
      linear: ID,
      ease: ID,
      quad: ID,
      cubic: ID,
      bezier: () => ID,
      in: ID,
      out: ID,
      inOut: ID,
    },
    // Animated component factory — wraps in React.forwardRef
    createAnimatedComponent: (Component: React.ComponentType) => React.forwardRef((props: object, ref) =>
      React.createElement(Component, { ...props, ref } as React.ComponentPropsWithRef<typeof Component>)
    ),
    FadeIn: {},
    FadeOut: {},
    SlideInRight: {},
    SlideOutRight: {},
    ReduceMotion: { Never: 'never', Always: 'always', System: 'system' },
    setUpTests: NOOP,
  }
})

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}))

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
    setParams: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: jest.fn(() => null),
  },
  Tabs: {
    Screen: jest.fn(() => null),
  },
  Redirect: jest.fn(() => null),
}))

// Mock @shopify/flash-list
jest.mock('@shopify/flash-list', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react') as typeof import('react')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native') as typeof import('react-native')
  return {
    FlashList: jest.fn(({ data, renderItem }: { data: unknown[]; renderItem: (info: { item: unknown; index: number }) => React.ReactNode }) => {
      return React.createElement(
        View,
        null,
        data.map((item, index) => renderItem({ item, index }))
      )
    }),
    MasonryFlashList: jest.fn(() => React.createElement(View, null)),
  }
})

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}))

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((_auth: unknown, callback: (user: null) => void) => {
    callback(null)
    return jest.fn()
  }),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
}))

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => undefined })),
  getDocs: jest.fn(() => Promise.resolve({ docs: [], forEach: jest.fn() })),
  setDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-doc-id' })),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn((_ref: unknown, callback: (snap: { docs: never[] }) => void) => {
    callback({ docs: [] })
    return jest.fn()
  }),
  query: jest.fn((...args: unknown[]) => args[0]),
  where: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  },
}))
