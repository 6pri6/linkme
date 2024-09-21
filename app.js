import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import{getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js"

const firebaseConfig = {
 apiKey: "AIzaSyDgpSH86JYHKYtaojXdQV8c-fRnFgjFJto",
 authDomain: "linkme-55a65.firebaseapp.com",
 projectId: "linkme-55a65",
 storageBucket: "linkme-55a65.appspot.com",
 messagingSenderId: "935410228226",
 appId: "1:935410228226:web:c51c0b6d33134c8d535b1b",
 measurementId: "G-H4T6CT8BHS"
};

firebase.initializeApp(firebaseConfig);
const auth=getAuth();
const db=getFirestore();
// Initialiser Vue.js
const app = Vue.createApp({
  data() {
    return {
      user: {
        displayName: '',
        socialLinks: []
      }
    };
  },
  methods: {
    // Fonction pour récupérer les données utilisateur depuis Firestore
    async fetchUserData() {
      const username = this.getUsernameFromUrl();
      const userRef = db.collection('users').doc(username);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        this.user = userDoc.data();
      } else {
        console.log("Utilisateur non trouvé.");
      }
    },
    // Fonction pour extraire le nom d'utilisateur depuis l'URL
    getUsernameFromUrl() {
      const path = window.location.pathname;
      return path.split("/")[1]; // Supposer que l'URL soit du type monsite.com/username
    },
    // Fonction pour rediriger vers le lien cliqué
    goTo(link) {
      window.open(link, '_blank'); // Ouvre le lien dans une nouvelle page
    }
  },
  mounted() {
    this.fetchUserData(); // Appeler la fonction quand le composant est monté
  }
});

// Monter l'application Vue sur la div avec l'ID 'app'
app.mount('#app');
