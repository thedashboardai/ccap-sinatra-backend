const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyBJo7W6NhDkFyMJv4vO3Hd9GaRPCBljrWw",
    authDomain: "sinatra-ccap.firebaseapp.com",
    projectId: "sinatra-ccap",
    storageBucket: "sinatra-ccap.firebasestorage.app",
    messagingSenderId: "628301408266",
    appId: "1:628301408266:web:fd46a78ab927033bc597f3",
    measurementId: "G-FHPB4FR785"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = "user@example.com";
const password = "user_password";

(async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken(); 
    console.log('Firebase JWT Token:', idToken);
  } catch (error) {
    console.error('Error signing in:', error.message);
  }
})();


