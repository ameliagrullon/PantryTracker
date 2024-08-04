// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3RouStcG3YtU3Tob4sdpE3P33htKroXg",
  authDomain: "inventory-management-248b1.firebaseapp.com",
  projectId: "inventory-management-248b1",
  storageBucket: "inventory-management-248b1.appspot.com",
  messagingSenderId: "357024082907",
  appId: "1:357024082907:web:4c56e1b02e2fcf45e0d5fe",
  measurementId: "G-ED3KHGXR3W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };