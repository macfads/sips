import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8ThJ_o4FuQ1Va3NdpztckXPFZkrM_x7A",
  authDomain: "sips-3ccf6.firebaseapp.com",
  projectId: "sips-3ccf6",
  storageBucket: "sips-3ccf6.firebasestorage.app",
  messagingSenderId: "531512267234",
  appId: "1:531512267234:web:c002fd0774e438a4b829bb",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
