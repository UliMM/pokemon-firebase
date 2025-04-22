import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCw1M6KyCSC5bdoh013zlUet-0WQYqmIBY",
    authDomain: "pokemon-firebase-3f4b7.firebaseapp.com",
    projectId: "pokemon-firebase-3f4b7",
    storageBucket: "pokemon-firebase-3f4b7.firebasestorage.app",
    messagingSenderId: "17495235476",
    appId: "1:17495235476:web:be9cd668fa781f15d7cd81",
    measurementId: "G-8BMB3NYP5B"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Exportar tanto el objeto de configuración como default como los servicios nombrados
export default firebaseConfig;
export { 
  auth, 
  db, 
  googleProvider, 
  githubProvider 
};