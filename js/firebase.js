import {
    initializeApp,
    getApp,
    getApps
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDgg7SSc61ant5dqkzbFYT13gjw3_2cDFM",
    authDomain: "pmc-auto-detailing.firebaseapp.com",
    databaseURL: "https://pmc-auto-detailing-default-rtdb.firebaseio.com",
    projectId: "pmc-auto-detailing",
    storageBucket: "pmc-auto-detailing.firebasestorage.app",
    messagingSenderId: "869373982603",
    appId: "1:869373982603:web:9c82ee5c453ccd41f6e18e"
};

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

export {
    app,
    auth,
    db,
    googleProvider
};