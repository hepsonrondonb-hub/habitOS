import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { DEFAULT_AVATAR_ID } from '../utils/avatars';

interface UserProfile {
    userId: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    photoURL?: string;
    avatarId?: string;
    createdAt: any;
    onboardingCompleted: boolean;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid: string) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserProfile(userSnap.data() as UserProfile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        let unsubscribeProfile: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is signed in, check/create Firestore doc
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    // Create new user document with default avatar (fallback only)
                    // This should rarely happen as RegisterScreen creates the profile
                    const newProfile = {
                        userId: currentUser.uid,
                        name: currentUser.displayName || 'Usuario',
                        email: currentUser.email || '',
                        avatarId: DEFAULT_AVATAR_ID,
                        createdAt: serverTimestamp(),
                        onboardingCompleted: false,
                    };
                    try {
                        await setDoc(userRef, newProfile);
                        setUserProfile(newProfile as any); // Optimistic update
                        console.log('User document created in Firestore (fallback)');
                    } catch (error) {
                        console.error('Error creating user document:', error);
                    }
                } else {
                    setUserProfile(userSnap.data() as UserProfile);
                }

                // Set up real-time listener for profile changes
                unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.data() as UserProfile);
                        console.log('Profile updated in real-time:', snapshot.data());
                    }
                });

                setUser(currentUser);
            } else {
                setUser(null);
                setUserProfile(null);

                // Clean up profile listener if user logs out
                if (unsubscribeProfile) {
                    unsubscribeProfile();
                    unsubscribeProfile = null;
                }
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) {
                unsubscribeProfile();
            }
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.uid);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
