import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDToPu61_g6kU8ooq2FRzvEO4J2XWh4Ahs",
  authDomain: "roxy-store-88a91.firebaseapp.com",
  projectId: "roxy-store-88a91",
  storageBucket: "roxy-store-88a91.firebasestorage.app",
  messagingSenderId: "593937519201",
  appId: "1:593937519201:web:f314f7caac941e6afa5020"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);