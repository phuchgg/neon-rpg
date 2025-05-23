// firebaseConfig.ts
// utils/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // ✅ no /react-native
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCaZfPgzL4SFjnv2PiS8cmXoBWb25XXiZE",
  authDomain: "neonrgpapp.firebaseapp.com",
  projectId: "neonrgpapp",
  storageBucket: "neonrgpapp.appspot.com",
  messagingSenderId: "33455825656",
  appId: "1:33455825656:android:2465a27e5eeb61e8a2910d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };