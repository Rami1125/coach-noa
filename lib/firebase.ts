/**
 * Firebase Client & Initialization Configuration
 * ח. סבן חומרי בניין (1994) בע״מ - נועה AI
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot,
  doc,
  setDoc,
  type Firestore
} from "firebase/firestore";

export const firebaseConfig = {
  projectId: "gen-lang-client-0128713331",
  appId: "1:1091656935060:web:a7c1fba39af94a20fc3681",
  apiKey: "AIzaSyDyK1mBNz5ynUw-YAY1qadVh1XQXHVLbqM",
  authDomain: "gen-lang-client-0128713331.firebaseapp.com",
};

// Initialize Firebase App safely (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);

export { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot,
  doc,
  setDoc
};
