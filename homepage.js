import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgpSH86JYHKYtaojXdQV8c-fRnFgjFJto",
  authDomain: "linkme-55a65.firebaseapp.com",
  projectId: "linkme-55a65",
  storageBucket: "linkme-55a65.appspot.com",
  messagingSenderId: "935410228226",
  appId: "1:935410228226:web:c51c0b6d33134c8d535b1b",
  measurementId: "G-H4T6CT8BHS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  const loggedInUserId = localStorage.getItem("loggedInUserId");
  if (loggedInUserId) {
    console.log(user);
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById("loggedUserFName").innerText =
            userData.firstName;
          document.getElementById("loggedUserEmail").innerText = userData.email;
          document.getElementById("loggedUserLName").innerText =
            userData.lastName;
        } else {
          console.log("no document found matching id");
        }
      })
      .catch((error) => {
        console.log("Error getting document");
      });
  } else {
    console.log("User Id not Found in Local storage");
  }
});

const logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("loggedInUserId");
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error Signing out:", error);
    });
});



// Fonction pour ajouter des réseaux sociaux dynamiquement
document.addEventListener("DOMContentLoaded", function () {
  const maxNetworks = 5; // Nombre maximum de div addsocial
  let socialCount = 0; // Nombre de div addsocial initial

  // Dropdown des réseaux sociaux possibles
  const socialNetworks = [
      { value: "twitter", text: "Twitter" },
      { value: "facebook", text: "Facebook" },
      { value: "instagram", text: "Instagram" },
      { value: "linkedin", text: "LinkedIn" },
      { value: "youtube", text: "YouTube" }
  ];

  // Conteneur principal
  const socialContainer = document.getElementById('social-container');

  // Fonction pour créer une nouvelle div addsocial
  function createAddSocialDiv(network = "", link = "", customName = "") {
      const div = document.createElement('div');
      div.className = 'addsocial';

      // Dropdown des réseaux sociaux
      const select = document.createElement('select');
      select.name = 'social-select';
      socialNetworks.forEach(networkOption => {
          const option = document.createElement('option');
          option.value = networkOption.value;
          option.text = networkOption.text;
          if (networkOption.value === network) {
              option.selected = true; // Préselectionne l'option
          }
          select.appendChild(option);
      });

      // Input pour le lien du réseau
      const input = document.createElement('input');
      input.type = 'url';
      input.name = 'social-link';
      input.placeholder = 'Collez le lien ici';
      input.required = true;
      input.value = link; // Pré-rempli avec la valeur si disponible

      // Input pour le nom personnalisé
      const customNameInput = document.createElement('input');
      customNameInput.type = 'text';
      customNameInput.name = 'custom-name';
      customNameInput.placeholder = 'Nom à afficher';
      customNameInput.maxLength = 30;
      customNameInput.required = true;
      customNameInput.value = customName; // Pré-rempli avec la valeur si disponible

      // Bouton pour supprimer cette div
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Supprimer';
      removeButton.className = 'remove-social';
      removeButton.addEventListener('click', function () {
          if (socialCount > 1) {
              socialContainer.removeChild(div);
              socialCount--;
          }
      });

      // Ajout des éléments à la div
      div.appendChild(select);
      div.appendChild(input);
      div.appendChild(customNameInput);
      div.appendChild(removeButton);

      return div;
  }

  // Fonction pour charger les réseaux sociaux enregistrés
  async function loadUserSocialLinks(userId) {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.socialLinks && Array.isArray(userData.socialLinks)) {
              userData.socialLinks.forEach(social => {
                  socialContainer.appendChild(createAddSocialDiv(social.network, social.link, social.customName));
                  socialCount++;
              });
          }
      }

      // Ajouter une div vide si moins de réseaux existants pour permettre à l'utilisateur d'ajouter plus de réseaux
      if (socialCount === 0 || socialCount < maxNetworks) {
          socialContainer.appendChild(createAddSocialDiv());
          socialCount++;
      }
  }

  // Authentification de l'utilisateur
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
      if (user) {
          // Charger les réseaux sociaux de l'utilisateur à partir de Firestore
          loadUserSocialLinks(user.uid);
      } else {
          // Rediriger ou afficher un message si l'utilisateur n'est pas connecté
          alert("Vous devez être connecté pour accéder à cette page.");
          window.location.href = "login.html"; // Exemple de redirection
      }
  });

  // Bouton pour ajouter une nouvelle div addsocial
  const addSocialButton = document.getElementById('add-social');
  addSocialButton.addEventListener('click', function () {
      if (socialCount < maxNetworks) {
          socialContainer.appendChild(createAddSocialDiv());
          socialCount++;
      } else {
          alert('Nombre maximum de réseaux atteint !');
      }
  });

  // Bouton pour soumettre les réseaux sociaux choisis et enregistrer dans Firestore
  const saveButton = document.getElementById('save-socials');
  saveButton.addEventListener('click', async function (event) {
      event.preventDefault();
      const userId = auth.currentUser.uid; // Assurer que l'utilisateur est connecté

      const socialLinks = [];
      const selects = document.querySelectorAll('select[name="social-select"]');
      const links = document.querySelectorAll('input[name="social-link"]');
      const customNames = document.querySelectorAll('input[name="custom-name"]');

      // Récupérer les valeurs des dropdowns, des inputs et des noms personnalisés
      selects.forEach((select, index) => {
          const network = select.value;
          const link = links[index].value;
          const customName = customNames[index].value;
          socialLinks.push({ network, link, customName });
      });

      // Enregistrer les réseaux sociaux dans Firestore
      try {
          await setDoc(doc(db, "users", userId), { socialLinks }, { merge: true });
          alert('Réseaux sociaux enregistrés avec succès !');
      } catch (error) {
          console.error('Erreur lors de l\'enregistrement des réseaux sociaux : ', error);
      }
  });
});