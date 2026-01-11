import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// ⚠️ REPLACE WITH YOUR REAL FIREBASE CONFIGURATION
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyD2xsA7m07k5dmspqeBF-snauqSpeq0zKg",
    authDomain: "Ytrack-d5b8c.firebaseapp.com",
    projectId: "track-d5b8c",
    storageBucket: "track-d5b8c.firebasestorage.app",
    messagingSenderId: "767887801604",
    appId: "1:767887801604:web:ef5fa97651608acbfaa451"
};

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with Persistence (removes warnings and keeps user logged in)
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
