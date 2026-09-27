'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc, getDocs, collectionGroup, query, where, limit } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { UserAuthLookup } from '@/lib/tipos';

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  claims: { [key: string]: any } | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
  isAdmin: boolean;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  isAdmin: boolean;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  userError: Error | null;
  profile: UserAuthLookup | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState & { profile: UserAuthLookup | null } | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
    claims: null,
  });
  const [profile, setProfile] = useState<UserAuthLookup | null>(null);

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth || !firestore) { // If no Auth service instance, cannot determine user state
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth and Firestore services not provided."), claims: null });
      setProfile(null);
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null, claims: null }); // Reset on auth instance change
    setProfile(null);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => { // Auth state determined
        if (firebaseUser) {
            try {
                // Fetch claims first
                const idTokenResult = await firebaseUser.getIdTokenResult(true);
                
                // Fetch profile from the new lookup collection
                const userProfileRef = doc(firestore, `user_auth_lookup/${firebaseUser.uid}`);
                const userProfileSnap = await getDoc(userProfileRef);

                let userProfileData: UserAuthLookup | null = null;
                if (userProfileSnap.exists()) {
                    userProfileData = userProfileSnap.data() as UserAuthLookup;
                }
                
                setProfile(userProfileData);
                setUserAuthState({ 
                    user: firebaseUser, 
                    isUserLoading: false, 
                    userError: null, 
                    claims: idTokenResult.claims 
                });

            } catch (error) {
                 console.error("FirebaseProvider: Error fetching user data:", error);
                 setUserAuthState({ 
                    user: firebaseUser, 
                    isUserLoading: false, 
                    userError: error as Error, 
                    claims: null
                });
                 setProfile(null);
            }
        } else {
            // No user logged in
            setUserAuthState({ user: null, isUserLoading: false, userError: null, claims: null });
            setProfile(null);
        }
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error, claims: null });
        setProfile(null);
      }
    );
    return () => unsubscribe(); // Cleanup
  }, [auth, firestore]); // Depends on the auth instance

  // Memoize the context value
  const contextValue = useMemo(() => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    const isAdmin = !!userAuthState.claims?.admin;
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
      isAdmin,
      profile,
    };
  }, [firebaseApp, firestore, auth, userAuthState, profile]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser & { profile: UserAuthLookup | null } => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    isAdmin: context.isAdmin,
    profile: context.profile
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { 
  const { user, isUserLoading, userError, isAdmin, profile } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError, isAdmin, profile };
};
