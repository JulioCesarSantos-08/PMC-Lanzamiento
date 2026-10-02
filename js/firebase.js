import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    onSnapshot,
    serverTimestamp
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const comunidadRef = doc(
    db,
    "lanzamiento",
    "comunidad"
);

let heartRequestInProgress = false;

async function ensureCommunityDocument() {
    try {
        const snapshot = await getDoc(comunidadRef);

        if (snapshot.exists()) {
            return;
        }

        await setDoc(comunidadRef, {
            corazones: 0,
            creadoEn: serverTimestamp(),
            actualizadoEn: serverTimestamp()
        });
    } catch (error) {
        console.error(
            "No se pudo inicializar la comunidad PMC:",
            error
        );
    }
}

function listenToCommunity() {
    return onSnapshot(
        comunidadRef,
        (snapshot) => {
            if (!snapshot.exists()) {
                return;
            }

            const data = snapshot.data();

            const total = Number(
                data.corazones ?? 0
            );

            window.dispatchEvent(
                new CustomEvent(
                    "pmc-heart-total",
                    {
                        detail: {
                            total
                        }
                    }
                )
            );
        },
        (error) => {
            console.error(
                "No se pudo escuchar la comunidad PMC:",
                error
            );
        }
    );
}

async function addHeart() {
    if (heartRequestInProgress) {
        return;
    }

    heartRequestInProgress = true;

    try {
        const alreadyLiked =
            localStorage.getItem(
                "pmcHeartFirebaseSaved"
            ) === "true";

        if (alreadyLiked) {
            return;
        }

        const snapshot = await getDoc(
            comunidadRef
        );

        if (!snapshot.exists()) {
            await setDoc(
                comunidadRef,
                {
                    corazones: 1,
                    creadoEn: serverTimestamp(),
                    actualizadoEn: serverTimestamp()
                }
            );
        } else {
            await updateDoc(
                comunidadRef,
                {
                    corazones: increment(1),
                    actualizadoEn: serverTimestamp()
                }
            );
        }

        localStorage.setItem(
            "pmcHeartFirebaseSaved",
            "true"
        );
    } catch (error) {
        console.error(
            "No se pudo registrar el corazón PMC:",
            error
        );
    } finally {
        heartRequestInProgress = false;
    }
}

window.addEventListener(
    "pmc-heart-added",
    addHeart
);

async function startPMCCommunity() {
    await ensureCommunityDocument();

    listenToCommunity();
}

startPMCCommunity();

export {
    app,
    db
};