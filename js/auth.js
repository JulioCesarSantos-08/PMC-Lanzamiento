import {
    auth,
    db,
    googleProvider
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pageType =
    document.body.dataset.authPage || "";

const pageLoader =
    document.getElementById("pageLoader");

const menuButton =
    document.getElementById("menuButton");

const menuClose =
    document.getElementById("menuClose");

const mobileMenu =
    document.getElementById("mobileMenu");

const menuBackdrop =
    mobileMenu?.querySelector(
        ".mobile-menu__backdrop"
    );

const mobileLinks =
    mobileMenu?.querySelectorAll("a");

const authMessage =
    document.getElementById("authMessage");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginSubmit =
    document.getElementById("loginSubmit");

const loginPasswordToggle =
    document.getElementById(
        "loginPasswordToggle"
    );

const googleLoginButton =
    document.getElementById(
        "googleLoginButton"
    );

const forgotPasswordButton =
    document.getElementById(
        "forgotPasswordButton"
    );

const forgotPasswordModal =
    document.getElementById(
        "forgotPasswordModal"
    );

const forgotPasswordBackdrop =
    document.getElementById(
        "forgotPasswordBackdrop"
    );

const forgotPasswordClose =
    document.getElementById(
        "forgotPasswordClose"
    );

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );

const recoveryEmail =
    document.getElementById(
        "recoveryEmail"
    );

const recoverySubmit =
    document.getElementById(
        "recoverySubmit"
    );

const registerForm =
    document.getElementById(
        "registerForm"
    );

const registerName =
    document.getElementById(
        "registerName"
    );

const registerPhone =
    document.getElementById(
        "registerPhone"
    );

const registerEmail =
    document.getElementById(
        "registerEmail"
    );

const registerPassword =
    document.getElementById(
        "registerPassword"
    );

const registerPasswordConfirm =
    document.getElementById(
        "registerPasswordConfirm"
    );

const registerTerms =
    document.getElementById(
        "registerTerms"
    );

const registerSubmit =
    document.getElementById(
        "registerSubmit"
    );

const registerPasswordToggle =
    document.getElementById(
        "registerPasswordToggle"
    );

const registerPasswordConfirmToggle =
    document.getElementById(
        "registerPasswordConfirmToggle"
    );

const googleRegisterButton =
    document.getElementById(
        "googleRegisterButton"
    );

const passwordStrength =
    document.querySelector(
        ".auth-password-strength"
    );

const passwordStrengthText =
    document.getElementById(
        "passwordStrengthText"
    );

const registerLink =
    document.getElementById(
        "registerLink"
    );

const loginLink =
    document.getElementById(
        "loginLink"
    );

let authActionRunning = false;

auth.languageCode = "es";

function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function hideLoader() {
    if (!pageLoader) {
        return;
    }

    window.setTimeout(() => {
        pageLoader.classList.add(
            "is-hidden"
        );
    }, 280);
}

function openMobileMenu() {
    if (
        !mobileMenu ||
        !menuButton
    ) {
        return;
    }

    mobileMenu.classList.add(
        "is-open"
    );

    mobileMenu.setAttribute(
        "aria-hidden",
        "false"
    );

    menuButton.setAttribute(
        "aria-expanded",
        "true"
    );

    document.body.classList.add(
        "menu-open"
    );
}

function closeMobileMenu() {
    if (
        !mobileMenu ||
        !menuButton
    ) {
        return;
    }

    mobileMenu.classList.remove(
        "is-open"
    );

    mobileMenu.setAttribute(
        "aria-hidden",
        "true"
    );

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    document.body.classList.remove(
        "menu-open"
    );
}

function toggleMobileMenu() {
    if (
        mobileMenu?.classList.contains(
            "is-open"
        )
    ) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function getReturnCandidate() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const fromUrl =
        params.get("return");

    if (fromUrl) {
        return fromUrl;
    }

    const fromSession =
        sessionStorage.getItem(
            "pmcLoginReturn"
        );

    if (fromSession) {
        return fromSession;
    }

    return "cuenta.html";
}

function getSafeReturnTarget() {
    const candidate =
        getReturnCandidate();

    try {
        const target =
            new URL(
                candidate,
                window.location.href
            );

        if (
            target.origin !==
            window.location.origin
        ) {
            return "cuenta.html";
        }

        const path =
            `${target.pathname}${target.search}${target.hash}`;

        if (
            path.includes("\\") ||
            path.toLowerCase().includes(
                "javascript:"
            )
        ) {
            return "cuenta.html";
        }

        return path;
    } catch {
        return "cuenta.html";
    }
}

function updateAuthLinks() {
    const target =
        getSafeReturnTarget();

    if (registerLink) {
        registerLink.href =
            `registro.html?return=${encodeURIComponent(target)}`;
    }

    if (loginLink) {
        loginLink.href =
            `login.html?return=${encodeURIComponent(target)}`;
    }
}

function showMessage(
    message,
    type = "error"
) {
    if (!authMessage) {
        return;
    }

    authMessage.hidden = false;

    authMessage.classList.remove(
        "is-success",
        "is-info"
    );

    let icon =
        "circle-alert";

    if (type === "success") {
        authMessage.classList.add(
            "is-success"
        );

        icon = "circle-check";
    }

    if (type === "info") {
        authMessage.classList.add(
            "is-info"
        );

        icon = "info";
    }

    authMessage.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${escapeHTML(message)}</span>
    `;

    initIcons();
}

function hideMessage() {
    if (!authMessage) {
        return;
    }

    authMessage.hidden = true;
    authMessage.innerHTML = "";
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getAuthErrorMessage(error) {
    const code =
        error?.code || "";

    const messages = {
        "auth/invalid-email":
            "El correo electrónico no es válido.",

        "auth/missing-password":
            "Escribe tu contraseña.",

        "auth/weak-password":
            "La contraseña es demasiado débil. Utiliza al menos 6 caracteres.",

        "auth/email-already-in-use":
            "Ya existe una cuenta registrada con este correo electrónico.",

        "auth/invalid-credential":
            "El correo o la contraseña son incorrectos.",

        "auth/user-not-found":
            "No encontramos una cuenta registrada con ese correo.",

        "auth/wrong-password":
            "La contraseña es incorrecta.",

        "auth/too-many-requests":
            "Se realizaron demasiados intentos. Espera un momento antes de volver a intentarlo.",

        "auth/network-request-failed":
            "No pudimos conectar con Firebase. Revisa tu conexión a internet.",

        "auth/popup-closed-by-user":
            "Se cerró la ventana de Google antes de terminar el proceso.",

        "auth/popup-blocked":
            "El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo nuevamente.",

        "auth/cancelled-popup-request":
            "La solicitud de acceso con Google fue cancelada.",

        "auth/account-exists-with-different-credential":
            "Ya existe una cuenta con este correo utilizando otro método de acceso.",

        "auth/operation-not-allowed":
            "Este método de inicio de sesión todavía no está habilitado en Firebase.",

        "auth/user-disabled":
            "Esta cuenta se encuentra deshabilitada.",

        "auth/requires-recent-login":
            "Por seguridad debes iniciar sesión nuevamente."
    };

    return (
        messages[code] ||
        "Ocurrió un problema. Inténtalo nuevamente."
    );
}

function setButtonLoading(
    button,
    loading,
    loadingText = "Procesando..."
) {
    if (!button) {
        return;
    }

    if (loading) {
        if (
            !button.dataset.originalHtml
        ) {
            button.dataset.originalHtml =
                button.innerHTML;
        }

        button.disabled = true;

        button.innerHTML = `
            ${escapeHTML(loadingText)}
            <i data-lucide="loader-circle"></i>
        `;

        initIcons();

        return;
    }

    button.disabled = false;

    if (
        button.dataset.originalHtml
    ) {
        button.innerHTML =
            button.dataset.originalHtml;

        delete button.dataset.originalHtml;

        initIcons();
    }
}

function getProviderName(user) {
    const provider =
        user?.providerData?.[0]
            ?.providerId;

    if (
        provider ===
        "google.com"
    ) {
        return "google";
    }

    if (
        provider ===
        "password"
    ) {
        return "correo";
    }

    return provider || "firebase";
}

async function ensureUserDocument(
    user,
    extraData = {}
) {
    if (!user) {
        return;
    }

    const userRef =
        doc(
            db,
            "usuarios",
            user.uid
        );

    const snapshot =
        await getDoc(
            userRef
        );

    if (!snapshot.exists()) {
        const newUser = {
            uid:
                user.uid,
            nombre:
                extraData.nombre ||
                user.displayName ||
                "",
            email:
                user.email ||
                extraData.email ||
                "",
            telefono:
                extraData.telefono ||
                user.phoneNumber ||
                "",
            fotoURL:
                user.photoURL ||
                "",
            rol:
                "cliente",
            permisos: {
                cliente: true
            },
            activo:
                true,
            proveedor:
                getProviderName(
                    user
                ),
            creadoEn:
                serverTimestamp(),
            actualizadoEn:
                serverTimestamp(),
            ultimoAccesoEn:
                serverTimestamp()
        };

        await setDoc(
            userRef,
            newUser
        );

        return;
    }

    const existing =
        snapshot.data();

    const updates = {
        email:
            user.email ||
            existing.email ||
            "",
        actualizadoEn:
            serverTimestamp(),
        ultimoAccesoEn:
            serverTimestamp()
    };

    const name =
        extraData.nombre ||
        user.displayName;

    if (name) {
        updates.nombre = name;
    }

    const phone =
        extraData.telefono ||
        user.phoneNumber;

    if (phone) {
        updates.telefono = phone;
    }

    if (
        user.photoURL
    ) {
        updates.fotoURL =
            user.photoURL;
    }

    if (
        !existing.proveedor
    ) {
        updates.proveedor =
            getProviderName(
                user
            );
    }

    await setDoc(
        userRef,
        updates,
        {
            merge: true
        }
    );
}

function redirectAfterAuth() {
    const target =
        getSafeReturnTarget();

    sessionStorage.removeItem(
        "pmcLoginReturn"
    );

    window.location.href =
        target;
}

async function handleLoginSubmit(
    event
) {
    event.preventDefault();

    if (
        authActionRunning
    ) {
        return;
    }

    hideMessage();

    const email =
        loginEmail?.value
            .trim()
            .toLowerCase();

    const password =
        loginPassword?.value || "";

    if (
        !email ||
        !password
    ) {
        showMessage(
            "Escribe tu correo y contraseña."
        );

        return;
    }

    authActionRunning = true;

    setButtonLoading(
        loginSubmit,
        true,
        "Iniciando sesión..."
    );

    try {
        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        await ensureUserDocument(
            credential.user
        );

        redirectAfterAuth();
    } catch (error) {
        console.error(
            "Error al iniciar sesión:",
            error
        );

        showMessage(
            getAuthErrorMessage(
                error
            )
        );
    } finally {
        authActionRunning = false;

        setButtonLoading(
            loginSubmit,
            false
        );
    }
}

async function handleGoogleAuth(
    button
) {
    if (
        authActionRunning
    ) {
        return;
    }

    hideMessage();

    authActionRunning = true;

    setButtonLoading(
        button,
        true,
        "Conectando con Google..."
    );

    try {
        const credential =
            await signInWithPopup(
                auth,
                googleProvider
            );

        await ensureUserDocument(
            credential.user
        );

        redirectAfterAuth();
    } catch (error) {
        console.error(
            "Error con Google:",
            error
        );

        showMessage(
            getAuthErrorMessage(
                error
            )
        );
    } finally {
        authActionRunning = false;

        setButtonLoading(
            button,
            false
        );
    }
}

function sanitizePhone(value) {
    return String(value ?? "")
        .replace(/\D/g, "")
        .slice(0, 10);
}

function getPasswordStrength(
    password
) {
    if (!password) {
        return 0;
    }

    let score = 0;

    if (
        password.length >= 6
    ) {
        score++;
    }

    if (
        password.length >= 10
    ) {
        score++;
    }

    if (
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password)
    ) {
        score++;
    }

    if (
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(
            password
        )
    ) {
        score++;
    }

    return Math.min(
        score,
        4
    );
}

function updatePasswordStrength() {
    if (
        !registerPassword ||
        !passwordStrength ||
        !passwordStrengthText
    ) {
        return;
    }

    const password =
        registerPassword.value;

    const strength =
        getPasswordStrength(
            password
        );

    passwordStrength.dataset.strength =
        String(strength);

    const labels = {
        0: "Usa al menos 6 caracteres.",
        1: "Contraseña básica.",
        2: "Contraseña aceptable.",
        3: "Buena contraseña.",
        4: "Contraseña fuerte."
    };

    passwordStrengthText.textContent =
        labels[strength];
}

async function handleRegisterSubmit(
    event
) {
    event.preventDefault();

    if (
        authActionRunning
    ) {
        return;
    }

    hideMessage();

    const name =
        registerName?.value
            .trim()
            .replace(
                /\s+/g,
                " "
            );

    const phone =
        sanitizePhone(
            registerPhone?.value
        );

    const email =
        registerEmail?.value
            .trim()
            .toLowerCase();

    const password =
        registerPassword?.value || "";

    const confirmPassword =
        registerPasswordConfirm
            ?.value || "";

    if (
        !name ||
        name.length < 3
    ) {
        showMessage(
            "Escribe tu nombre completo."
        );

        registerName?.focus();

        return;
    }

    if (
        phone.length !== 10
    ) {
        showMessage(
            "El número de celular debe contener exactamente 10 dígitos."
        );

        registerPhone?.focus();

        return;
    }

    if (!email) {
        showMessage(
            "Escribe un correo electrónico válido."
        );

        registerEmail?.focus();

        return;
    }

    if (
        password.length < 6
    ) {
        showMessage(
            "La contraseña debe tener al menos 6 caracteres."
        );

        registerPassword?.focus();

        return;
    }

    if (
        password !==
        confirmPassword
    ) {
        showMessage(
            "Las contraseñas no coinciden."
        );

        registerPasswordConfirm
            ?.focus();

        return;
    }

    if (
        !registerTerms?.checked
    ) {
        showMessage(
            "Debes aceptar el uso de datos para crear tu cuenta."
        );

        return;
    }

    authActionRunning = true;

    setButtonLoading(
        registerSubmit,
        true,
        "Creando cuenta..."
    );

    try {
        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        await updateProfile(
            credential.user,
            {
                displayName:
                    name
            }
        );

        await ensureUserDocument(
            credential.user,
            {
                nombre:
                    name,
                telefono:
                    phone,
                email:
                    email
            }
        );

        redirectAfterAuth();
    } catch (error) {
        console.error(
            "Error al registrar cuenta:",
            error
        );

        showMessage(
            getAuthErrorMessage(
                error
            )
        );
    } finally {
        authActionRunning = false;

        setButtonLoading(
            registerSubmit,
            false
        );
    }
}

function togglePasswordVisibility(
    input,
    button
) {
    if (
        !input ||
        !button
    ) {
        return;
    }

    const showing =
        input.type === "text";

    input.type =
        showing
            ? "password"
            : "text";

    button.setAttribute(
        "aria-label",
        showing
            ? "Mostrar contraseña"
            : "Ocultar contraseña"
    );

    button.innerHTML =
        showing
            ? '<i data-lucide="eye"></i>'
            : '<i data-lucide="eye-off"></i>';

    initIcons();
}

function openForgotPasswordModal() {
    if (
        !forgotPasswordModal
    ) {
        return;
    }

    if (
        recoveryEmail &&
        loginEmail?.value
    ) {
        recoveryEmail.value =
            loginEmail.value.trim();
    }

    forgotPasswordModal.classList.add(
        "is-open"
    );

    forgotPasswordModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    window.setTimeout(
        () => {
            recoveryEmail?.focus();
        },
        180
    );
}

function closeForgotPasswordModal() {
    if (
        !forgotPasswordModal
    ) {
        return;
    }

    forgotPasswordModal.classList.remove(
        "is-open"
    );

    forgotPasswordModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );
}

async function handlePasswordRecovery(
    event
) {
    event.preventDefault();

    if (
        authActionRunning
    ) {
        return;
    }

    const email =
        recoveryEmail?.value
            .trim()
            .toLowerCase();

    if (!email) {
        return;
    }

    authActionRunning = true;

    setButtonLoading(
        recoverySubmit,
        true,
        "Enviando..."
    );

    try {
        await sendPasswordResetEmail(
            auth,
            email
        );

        closeForgotPasswordModal();

        showMessage(
            "Si el correo está asociado a una cuenta, recibirás un enlace para restablecer tu contraseña.",
            "success"
        );
    } catch (error) {
        console.error(
            "Error al recuperar contraseña:",
            error
        );

        closeForgotPasswordModal();

        if (
            error?.code ===
            "auth/user-not-found"
        ) {
            showMessage(
                "Si el correo está asociado a una cuenta, recibirás un enlace para restablecer tu contraseña.",
                "success"
            );
        } else {
            showMessage(
                getAuthErrorMessage(
                    error
                )
            );
        }
    } finally {
        authActionRunning = false;

        setButtonLoading(
            recoverySubmit,
            false
        );
    }
}

function bindPhoneInput() {
    registerPhone?.addEventListener(
        "input",
        () => {
            registerPhone.value =
                sanitizePhone(
                    registerPhone.value
                );
        }
    );
}

function bindPasswordControls() {
    loginPasswordToggle?.addEventListener(
        "click",
        () => {
            togglePasswordVisibility(
                loginPassword,
                loginPasswordToggle
            );
        }
    );

    registerPasswordToggle?.addEventListener(
        "click",
        () => {
            togglePasswordVisibility(
                registerPassword,
                registerPasswordToggle
            );
        }
    );

    registerPasswordConfirmToggle?.addEventListener(
        "click",
        () => {
            togglePasswordVisibility(
                registerPasswordConfirm,
                registerPasswordConfirmToggle
            );
        }
    );

    registerPassword?.addEventListener(
        "input",
        updatePasswordStrength
    );
}

function bindModal() {
    forgotPasswordButton?.addEventListener(
        "click",
        openForgotPasswordModal
    );

    forgotPasswordClose?.addEventListener(
        "click",
        closeForgotPasswordModal
    );

    forgotPasswordBackdrop?.addEventListener(
        "click",
        closeForgotPasswordModal
    );

    forgotPasswordForm?.addEventListener(
        "submit",
        handlePasswordRecovery
    );
}

function bindForms() {
    loginForm?.addEventListener(
        "submit",
        handleLoginSubmit
    );

    registerForm?.addEventListener(
        "submit",
        handleRegisterSubmit
    );

    googleLoginButton?.addEventListener(
        "click",
        () => {
            handleGoogleAuth(
                googleLoginButton
            );
        }
    );

    googleRegisterButton?.addEventListener(
        "click",
        () => {
            handleGoogleAuth(
                googleRegisterButton
            );
        }
    );
}

function bindMobileNavigation() {
    menuButton?.addEventListener(
        "click",
        toggleMobileMenu
    );

    menuClose?.addEventListener(
        "click",
        closeMobileMenu
    );

    menuBackdrop?.addEventListener(
        "click",
        closeMobileMenu
    );

    mobileLinks?.forEach(
        (link) => {
            link.addEventListener(
                "click",
                closeMobileMenu
            );
        }
    );

    window.addEventListener(
        "resize",
        () => {
            if (
                window.innerWidth >
                900
            ) {
                closeMobileMenu();
            }
        }
    );
}

function bindKeyboard() {
    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            if (
                forgotPasswordModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeForgotPasswordModal();

                return;
            }

            if (
                mobileMenu
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeMobileMenu();
            }
        }
    );
}

function waitForInitialAuth() {
    return new Promise(
        (resolve) => {
            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {
                        unsubscribe();

                        resolve(
                            user || null
                        );
                    },
                    () => {
                        unsubscribe();

                        resolve(null);
                    }
                );
        }
    );
}

async function checkExistingSession() {
    const user =
        await waitForInitialAuth();

    if (!user) {
        return;
    }

    try {
        await ensureUserDocument(
            user
        );
    } catch (error) {
        console.error(
            "No se pudo actualizar el perfil del usuario:",
            error
        );
    }

    redirectAfterAuth();
}

async function init() {
    initIcons();

    updateAuthLinks();

    bindMobileNavigation();
    bindKeyboard();
    bindForms();
    bindModal();
    bindPasswordControls();
    bindPhoneInput();

    if (
        pageType ===
        "register"
    ) {
        updatePasswordStrength();
    }

    await checkExistingSession();
}

document.addEventListener(
    "DOMContentLoaded",
    init
);

window.addEventListener(
    "load",
    hideLoader
);

window.setTimeout(
    hideLoader,
    2300
);