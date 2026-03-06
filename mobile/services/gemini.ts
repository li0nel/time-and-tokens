/**
 * Firebase AI (Gemini) service initialisation.
 *
 * Kept separate from firebase.ts so that firebase/ai is only loaded
 * in the parts of the app that need it, avoiding unnecessary imports
 * in auth-related code paths and tests.
 */
import { getAI, GoogleAIBackend } from 'firebase/ai'
import { app } from './firebase'

export const ai = getAI(app, { backend: new GoogleAIBackend() })
