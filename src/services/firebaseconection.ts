// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmBU86w0JIolrPvrFDwvfAfQhZYvX_Feo",
  authDomain: "tarfas-app.firebaseapp.com",
  projectId: "tarfas-app",
  storageBucket: "tarfas-app.appspot.com",
  messagingSenderId: "653847423074",
  appId: "1:653847423074:web:85c37e490eedff73b8c93b"
};

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(FirebaseApp);

export {db};