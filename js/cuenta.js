import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

const currentYear =
    document.getElementById("currentYear");

const headerAccountButton =
    document.getElementById(
        "headerAccountButton"
    );

const accountFirstName =
    document.getElementById(
        "accountFirstName"
    );

const accountAvatarImage =
    document.getElementById(
        "accountAvatarImage"
    );

const accountAvatarInitials =
    document.getElementById(
        "accountAvatarInitials"
    );

const accountSidebarName =
    document.getElementById(
        "accountSidebarName"
    );

const accountSidebarEmail =
    document.getElementById(
        "accountSidebarEmail"
    );

const navigationItems =
    document.querySelectorAll(
        "[data-account-section]"
    );

const accountViews =
    document.querySelectorAll(
        "[data-account-view]"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const sidebarAppointmentCount =
    document.getElementById(
        "sidebarAppointmentCount"
    );

const statUpcomingAppointments =
    document.getElementById(
        "statUpcomingAppointments"
    );

const statVehicles =
    document.getElementById(
        "statVehicles"
    );

const statCompletedServices =
    document.getElementById(
        "statCompletedServices"
    );

const statReceipts =
    document.getElementById(
        "statReceipts"
    );

const nextAppointmentCard =
    document.getElementById(
        "nextAppointmentCard"
    );

const recentActivity =
    document.getElementById(
        "recentActivity"
    );

const appointmentFilters =
    document.getElementById(
        "appointmentFilters"
    );

const appointmentsList =
    document.getElementById(
        "appointmentsList"
    );

const appointmentsEmpty =
    document.getElementById(
        "appointmentsEmpty"
    );

const vehiclesGrid =
    document.getElementById(
        "vehiclesGrid"
    );

const vehiclesEmpty =
    document.getElementById(
        "vehiclesEmpty"
    );

const openVehicleModalButton =
    document.getElementById(
        "openVehicleModal"
    );

const emptyAddVehicle =
    document.getElementById(
        "emptyAddVehicle"
    );

const vehicleModal =
    document.getElementById(
        "vehicleModal"
    );

const vehicleModalBackdrop =
    document.getElementById(
        "vehicleModalBackdrop"
    );

const vehicleModalClose =
    document.getElementById(
        "vehicleModalClose"
    );

const cancelVehicleButton =
    document.getElementById(
        "cancelVehicleButton"
    );

const vehicleModalTitle =
    document.getElementById(
        "vehicleModalTitle"
    );

const vehicleForm =
    document.getElementById(
        "vehicleForm"
    );

const vehicleEditId =
    document.getElementById(
        "vehicleEditId"
    );

const accountVehicleType =
    document.getElementById(
        "accountVehicleType"
    );

const accountVehicleBrand =
    document.getElementById(
        "accountVehicleBrand"
    );

const accountVehicleModel =
    document.getElementById(
        "accountVehicleModel"
    );

const accountVehicleYear =
    document.getElementById(
        "accountVehicleYear"
    );

const accountVehicleColor =
    document.getElementById(
        "accountVehicleColor"
    );

const saveVehicleButton =
    document.getElementById(
        "saveVehicleButton"
    );

const receiptsList =
    document.getElementById(
        "receiptsList"
    );

const receiptsEmpty =
    document.getElementById(
        "receiptsEmpty"
    );

const profileForm =
    document.getElementById(
        "profileForm"
    );

const profileName =
    document.getElementById(
        "profileName"
    );

const profilePhone =
    document.getElementById(
        "profilePhone"
    );

const profileEmail =
    document.getElementById(
        "profileEmail"
    );

const profileProvider =
    document.getElementById(
        "profileProvider"
    );

const profileCreatedAt =
    document.getElementById(
        "profileCreatedAt"
    );

const profileLastLogin =
    document.getElementById(
        "profileLastLogin"
    );

const saveProfileButton =
    document.getElementById(
        "saveProfileButton"
    );

const accountToast =
    document.getElementById(
        "accountToast"
    );

const accountToastText =
    document.getElementById(
        "accountToastText"
    );

let currentUser = null;
let currentUserData = {};
let appointments = [];
let vehicles = [];
let receipts = [];
let appointmentFilter = "proximas";
let toastTimer = null;
let vehicleSaving = false;
let profileSaving = false;
let accountLoadingErrors = [];

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

function setCurrentYear() {
    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function sanitizePhone(value) {
    return String(value ?? "")
        .replace(/\D/g, "")
        .slice(0, 10);
}

function formatCurrency(value) {
    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return String(value ?? "");
    }

    return new Intl.NumberFormat(
        "es-MX",
        {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0
        }
    ).format(amount);
}

function getDateFromValue(value) {
    if (!value) {
        return null;
    }

    if (
        typeof value.toDate ===
        "function"
    ) {
        return value.toDate();
    }

    if (
        value instanceof Date
    ) {
        return value;
    }

    if (
        typeof value === "number"
    ) {
        const date =
            new Date(value);

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }

    if (
        typeof value === "string"
    ) {
        const date =
            new Date(value);

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }

    return null;
}

function getAppointmentDate(
    appointment
) {
    if (
        appointment.fechaKey
    ) {
        const parts =
            String(
                appointment.fechaKey
            )
                .split("-")
                .map(Number);

        if (
            parts.length === 3 &&
            parts.every(
                Number.isFinite
            )
        ) {
            const [
                year,
                month,
                day
            ] = parts;

            const time =
                String(
                    appointment.horaInicio ||
                    "00:00"
                )
                    .split(":")
                    .map(Number);

            return new Date(
                year,
                month - 1,
                day,
                time[0] || 0,
                time[1] || 0
            );
        }
    }

    return (
        getDateFromValue(
            appointment.fecha
        ) ||
        getDateFromValue(
            appointment.creadoEn
        )
    );
}

function formatDate(
    date,
    includeYear = true
) {
    if (!date) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day: "numeric",
            month: "long",
            ...(includeYear
                ? {
                    year: "numeric"
                }
                : {})
        }
    ).format(date);
}

function formatDateTime(
    date
) {
    if (!date) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}

function formatTime(
    value
) {
    if (!value) {
        return "";
    }

    const parts =
        String(value)
            .split(":")
            .map(Number);

    if (
        parts.length < 2
    ) {
        return value;
    }

    const date =
        new Date(
            2000,
            0,
            1,
            parts[0],
            parts[1]
        );

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}

function capitalize(value) {
    const text =
        String(value || "");

    if (!text) {
        return "";
    }

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}

function getInitials(name) {
    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "PMC";
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    ).toUpperCase();
}

function getFirstName(name) {
    const first =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)[0];

    return first || "cliente";
}

function getVehicleTypeLabel(
    type
) {
    const labels = {
        hatchback: "Hatchback",
        sedan: "Sedán",
        suv: "SUV",
        pickup: "Pick-up",
        camioneta: "Camioneta",
        otro: "Otro"
    };

    return (
        labels[type] ||
        type ||
        "Vehículo"
    );
}

function getStatusLabel(
    status
) {
    const normalized =
        normalizeText(status)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    const labels = {
        agendada: "Agendada",
        confirmada: "Confirmada",
        recibido: "Vehículo recibido",
        en_proceso: "En proceso",
        proceso: "En proceso",
        terminado: "Terminado",
        entregado: "Entregado",
        cancelado: "Cancelada",
        cancelada: "Cancelada"
    };

    return (
        labels[normalized] ||
        capitalize(
            String(status || "Agendada")
        )
    );
}

function getStatusClass(
    status
) {
    const normalized =
        normalizeText(status)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    if (
        normalized === "entregado" ||
        normalized === "terminado"
    ) {
        return "is-completed";
    }

    if (
        normalized === "cancelado" ||
        normalized === "cancelada"
    ) {
        return "is-cancelled";
    }

    return "";
}

function isFinalStatus(
    status
) {
    const normalized =
        normalizeText(status)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    return [
        "entregado",
        "cancelado",
        "cancelada"
    ].includes(normalized);
}

function isActiveWorkStatus(
    status
) {
    const normalized =
        normalizeText(status)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    return [
        "recibido",
        "en_proceso",
        "proceso",
        "terminado"
    ].includes(normalized);
}

function isAppointmentUpcoming(
    appointment
) {
    const status =
        appointment.estado ||
        "agendada";

    if (
        isFinalStatus(status)
    ) {
        return false;
    }

    if (
        isActiveWorkStatus(
            status
        )
    ) {
        return true;
    }

    const date =
        getAppointmentDate(
            appointment
        );

    if (!date) {
        return true;
    }

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const appointmentDay =
        new Date(date);

    appointmentDay.setHours(
        0,
        0,
        0,
        0
    );

    return (
        appointmentDay >= today
    );
}

function isCompletedService(
    appointment
) {
    const normalized =
        normalizeText(
            appointment.estado
        )
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    return [
        "terminado",
        "entregado"
    ].includes(normalized);
}

function getVehicleDescription(
    appointment
) {
    const vehicle =
        appointment.vehiculo ||
        {};

    const main =
        [
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio
        ]
            .filter(Boolean)
            .join(" ");

    return (
        main ||
        getVehicleTypeLabel(
            vehicle.tipo
        )
    );
}

function getAppointmentPrice(
    appointment
) {
    const value =
        appointment.precioFinal ??
        appointment.total ??
        appointment.precioEstimado;

    if (
        value == null ||
        value === ""
    ) {
        return "Por confirmar";
    }

    return formatCurrency(
        value
    );
}

function safeExternalUrl(value) {
    if (!value) {
        return "";
    }

    try {
        const url =
            new URL(
                value,
                window.location.origin
            );

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return "";
        }

        return url.href;
    } catch {
        return "";
    }
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

function showToast(
    message,
    type = "success"
) {
    if (
        !accountToast ||
        !accountToastText
    ) {
        return;
    }

    if (toastTimer) {
        window.clearTimeout(
            toastTimer
        );
    }

    accountToast.classList.remove(
        "is-error"
    );

    if (type === "error") {
        accountToast.classList.add(
            "is-error"
        );
    }

    accountToastText.textContent =
        message;

    accountToast.innerHTML = `
        <i data-lucide="${
            type === "error"
                ? "circle-alert"
                : "circle-check"
        }"></i>

        <span id="accountToastText">
            ${escapeHTML(message)}
        </span>
    `;

    accountToast.classList.add(
        "is-visible"
    );

    initIcons();

    toastTimer =
        window.setTimeout(
            () => {
                accountToast.classList.remove(
                    "is-visible"
                );
            },
            3500
        );
}

function setButtonLoading(
    button,
    loading,
    loadingText
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
            ${escapeHTML(
                loadingText ||
                "Guardando..."
            )}

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

async function waitForUser() {
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

function redirectToLogin() {
    const returnUrl =
        "cuenta.html" +
        window.location.search +
        window.location.hash;

    window.location.href =
        `login.html?return=${encodeURIComponent(
            returnUrl
        )}`;
}

async function ensureUserDocument() {
    if (!currentUser) {
        return;
    }

    const reference =
        doc(
            db,
            "usuarios",
            currentUser.uid
        );

    const snapshot =
        await getDoc(
            reference
        );

    if (!snapshot.exists()) {
        await setDoc(
            reference,
            {
                uid:
                    currentUser.uid,
                nombre:
                    currentUser.displayName ||
                    "",
                email:
                    currentUser.email ||
                    "",
                telefono:
                    currentUser.phoneNumber ||
                    "",
                fotoURL:
                    currentUser.photoURL ||
                    "",
                rol:
                    "cliente",
                permisos: {
                    cliente: true
                },
                activo:
                    true,
                creadoEn:
                    serverTimestamp(),
                actualizadoEn:
                    serverTimestamp(),
                ultimoAccesoEn:
                    serverTimestamp()
            }
        );

        return;
    }

    await setDoc(
        reference,
        {
            email:
                currentUser.email ||
                snapshot.data()
                    .email ||
                "",
            fotoURL:
                currentUser.photoURL ||
                snapshot.data()
                    .fotoURL ||
                "",
            ultimoAccesoEn:
                serverTimestamp()
        },
        {
            merge: true
        }
    );
}

async function loadUserData() {
    if (!currentUser) {
        return;
    }

    try {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "usuarios",
                    currentUser.uid
                )
            );

        currentUserData =
            snapshot.exists()
                ? snapshot.data()
                : {};
    } catch (error) {
        console.error(
            "No se pudo cargar el perfil:",
            error
        );

        accountLoadingErrors.push(
            "perfil"
        );

        currentUserData = {};
    }
}

async function loadAppointments() {
    if (!currentUser) {
        return;
    }

    try {
        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "citas"
                    ),
                    where(
                        "clienteUid",
                        "==",
                        currentUser.uid
                    )
                )
            );

        appointments =
            snapshot.docs
                .map(
                    (
                        documentSnapshot
                    ) => ({
                        id:
                            documentSnapshot.id,
                        ...documentSnapshot.data()
                    })
                )
                .sort(
                    (a, b) => {
                        const dateA =
                            getAppointmentDate(
                                a
                            )?.getTime() ||
                            0;

                        const dateB =
                            getAppointmentDate(
                                b
                            )?.getTime() ||
                            0;

                        return (
                            dateB -
                            dateA
                        );
                    }
                );
    } catch (error) {
        console.error(
            "No se pudieron cargar las citas:",
            error
        );

        accountLoadingErrors.push(
            "citas"
        );

        appointments = [];
    }
}

async function loadVehicles() {
    if (!currentUser) {
        return;
    }

    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios",
                    currentUser.uid,
                    "vehiculos"
                )
            );

        vehicles =
            snapshot.docs
                .map(
                    (
                        documentSnapshot
                    ) => ({
                        id:
                            documentSnapshot.id,
                        ...documentSnapshot.data()
                    })
                )
                .sort(
                    (a, b) => {
                        const dateA =
                            getDateFromValue(
                                a.creadoEn
                            )?.getTime() ||
                            0;

                        const dateB =
                            getDateFromValue(
                                b.creadoEn
                            )?.getTime() ||
                            0;

                        return (
                            dateB -
                            dateA
                        );
                    }
                );
    } catch (error) {
        console.error(
            "No se pudieron cargar los vehículos:",
            error
        );

        accountLoadingErrors.push(
            "vehículos"
        );

        vehicles = [];
    }
}

async function loadReceipts() {
    if (!currentUser) {
        return;
    }

    try {
        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "recibos"
                    ),
                    where(
                        "clienteUid",
                        "==",
                        currentUser.uid
                    )
                )
            );

        receipts =
            snapshot.docs
                .map(
                    (
                        documentSnapshot
                    ) => ({
                        id:
                            documentSnapshot.id,
                        ...documentSnapshot.data()
                    })
                )
                .sort(
                    (a, b) => {
                        const dateA =
                            getDateFromValue(
                                a.emitidoEn ||
                                a.creadoEn ||
                                a.fecha
                            )?.getTime() ||
                            0;

                        const dateB =
                            getDateFromValue(
                                b.emitidoEn ||
                                b.creadoEn ||
                                b.fecha
                            )?.getTime() ||
                            0;

                        return (
                            dateB -
                            dateA
                        );
                    }
                );
    } catch (error) {
        console.error(
            "No se pudieron cargar los recibos:",
            error
        );

        accountLoadingErrors.push(
            "recibos"
        );

        receipts = [];
    }
}

function renderAvatar() {
    const name =
        currentUserData.nombre ||
        currentUser?.displayName ||
        "Cliente PMC";

    const photo =
        currentUserData.fotoURL ||
        currentUser?.photoURL ||
        "";

    accountAvatarInitials.textContent =
        getInitials(name);

    if (photo) {
        accountAvatarImage.src =
            photo;

        accountAvatarImage.alt =
            name;

        accountAvatarImage.hidden =
            false;

        accountAvatarInitials.hidden =
            true;

        accountAvatarImage.onerror =
            () => {
                accountAvatarImage.hidden =
                    true;

                accountAvatarInitials.hidden =
                    false;
            };
    } else {
        accountAvatarImage.hidden =
            true;

        accountAvatarInitials.hidden =
            false;
    }
}

function renderProfileHeader() {
    const name =
        currentUserData.nombre ||
        currentUser?.displayName ||
        "Cliente PMC";

    const email =
        currentUserData.email ||
        currentUser?.email ||
        "";

    accountFirstName.textContent =
        getFirstName(name);

    accountSidebarName.textContent =
        name;

    accountSidebarEmail.textContent =
        email;

    renderAvatar();
}

function renderProfileForm() {
    const name =
        currentUserData.nombre ||
        currentUser?.displayName ||
        "";

    const phone =
        currentUserData.telefono ||
        currentUser?.phoneNumber ||
        "";

    const email =
        currentUserData.email ||
        currentUser?.email ||
        "";

    profileName.value =
        name;

    profilePhone.value =
        sanitizePhone(
            phone
        );

    profileEmail.value =
        email;

    const provider =
        currentUser
            ?.providerData?.[0]
            ?.providerId;

    if (
        provider === "google.com"
    ) {
        profileProvider.textContent =
            "Google";
    } else if (
        provider === "password"
    ) {
        profileProvider.textContent =
            "Correo y contraseña";
    } else {
        profileProvider.textContent =
            provider ||
            "Firebase";
    }

    const createdDate =
        getDateFromValue(
            currentUserData.creadoEn
        ) ||
        getDateFromValue(
            currentUser
                ?.metadata
                ?.creationTime
        );

    const lastLoginDate =
        getDateFromValue(
            currentUser
                ?.metadata
                ?.lastSignInTime
        ) ||
        getDateFromValue(
            currentUserData
                .ultimoAccesoEn
        );

    profileCreatedAt.textContent =
        createdDate
            ? formatDateTime(
                createdDate
            )
            : "-";

    profileLastLogin.textContent =
        lastLoginDate
            ? formatDateTime(
                lastLoginDate
            )
            : "-";
}

function getUpcomingAppointments() {
    return appointments
        .filter(
            isAppointmentUpcoming
        )
        .sort(
            (a, b) => {
                const dateA =
                    getAppointmentDate(
                        a
                    )?.getTime() ||
                    Number.MAX_SAFE_INTEGER;

                const dateB =
                    getAppointmentDate(
                        b
                    )?.getTime() ||
                    Number.MAX_SAFE_INTEGER;

                return (
                    dateA -
                    dateB
                );
            }
        );
}

function renderStats() {
    const upcoming =
        getUpcomingAppointments();

    const completed =
        appointments.filter(
            isCompletedService
        );

    statUpcomingAppointments.textContent =
        String(
            upcoming.length
        );

    statVehicles.textContent =
        String(
            vehicles.length
        );

    statCompletedServices.textContent =
        String(
            completed.length
        );

    statReceipts.textContent =
        String(
            receipts.length
        );

    if (
        upcoming.length
    ) {
        sidebarAppointmentCount.hidden =
            false;

        sidebarAppointmentCount.textContent =
            String(
                upcoming.length
            );
    } else {
        sidebarAppointmentCount.hidden =
            true;
    }
}

function createAppointmentCard(
    appointment
) {
    const date =
        getAppointmentDate(
            appointment
        );

    const status =
        appointment.estado ||
        "agendada";

    const statusClass =
        getStatusClass(
            status
        );

    const serviceName =
        appointment.servicioNombre ||
        "Servicio PMC";

    const category =
        appointment.categoria ||
        "PMC Auto Detailing";

    const vehicle =
        getVehicleDescription(
            appointment
        );

    return `
        <article
            class="account-appointment-card"
            data-appointment-id="${escapeHTML(
                appointment.id
            )}"
        >

            <div class="account-appointment-card__top">

                <div>

                    <span class="account-appointment-card__category">
                        ${escapeHTML(
                            category
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            serviceName
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            vehicle
                        )}
                    </p>

                </div>

                <span class="account-status ${statusClass}">
                    ${escapeHTML(
                        getStatusLabel(
                            status
                        )
                    )}
                </span>

            </div>

            <div class="account-appointment-card__meta">

                <span>
                    <i data-lucide="calendar-days"></i>

                    ${escapeHTML(
                        date
                            ? capitalize(
                                formatDate(
                                    date
                                )
                            )
                            : "Sin fecha"
                    )}
                </span>

                ${
                    appointment.horaInicio
                        ? `
                            <span>
                                <i data-lucide="clock-3"></i>

                                ${escapeHTML(
                                    formatTime(
                                        appointment.horaInicio
                                    )
                                )}
                            </span>
                          `
                        : ""
                }

                <span>
                    <i data-lucide="wallet-cards"></i>

                    ${escapeHTML(
                        getAppointmentPrice(
                            appointment
                        )
                    )}
                </span>

            </div>

        </article>
    `;
}

function renderNextAppointment() {
    const upcoming =
        getUpcomingAppointments();

    if (!upcoming.length) {
        nextAppointmentCard.innerHTML = `
            <div class="account-empty-inline">

                <i data-lucide="calendar-plus-2"></i>

                <div>

                    <strong>
                        Sin próximas citas
                    </strong>

                    <span>
                        Agenda un servicio cuando lo necesites.
                    </span>

                </div>

            </div>
        `;

        initIcons();

        return;
    }

    nextAppointmentCard.innerHTML =
        createAppointmentCard(
            upcoming[0]
        );

    initIcons();
}

function renderRecentActivity() {
    if (!appointments.length) {
        recentActivity.innerHTML = `
            <div class="account-empty-inline">

                <i data-lucide="sparkles"></i>

                <div>

                    <strong>
                        Aún no hay actividad
                    </strong>

                    <span>
                        Aquí aparecerán tus servicios y citas recientes.
                    </span>

                </div>

            </div>
        `;

        initIcons();

        return;
    }

    const items =
        [...appointments]
            .sort(
                (a, b) => {
                    const dateA =
                        getDateFromValue(
                            a.actualizadoEn ||
                            a.creadoEn
                        )?.getTime() ||
                        getAppointmentDate(
                            a
                        )?.getTime() ||
                        0;

                    const dateB =
                        getDateFromValue(
                            b.actualizadoEn ||
                            b.creadoEn
                        )?.getTime() ||
                        getAppointmentDate(
                            b
                        )?.getTime() ||
                        0;

                    return (
                        dateB -
                        dateA
                    );
                }
            )
            .slice(
                0,
                4
            );

    recentActivity.innerHTML =
        items
            .map(
                (
                    appointment
                ) => {
                    const date =
                        getAppointmentDate(
                            appointment
                        );

                    return `
                        <div class="account-activity-item">

                            <div class="account-activity-item__icon">
                                <i data-lucide="sparkles"></i>
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        appointment.servicioNombre ||
                                        "Servicio PMC"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        getStatusLabel(
                                            appointment.estado
                                        )
                                    )}

                                    ${
                                        date
                                            ? ` · ${escapeHTML(
                                                capitalize(
                                                    formatDate(
                                                        date,
                                                        false
                                                    )
                                                )
                                            )}`
                                            : ""
                                    }
                                </span>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");

    initIcons();
}

function getFilteredAppointments() {
    if (
        appointmentFilter ===
        "todas"
    ) {
        return [
            ...appointments
        ];
    }

    if (
        appointmentFilter ===
        "historial"
    ) {
        return appointments.filter(
            (appointment) =>
                !isAppointmentUpcoming(
                    appointment
                )
        );
    }

    return getUpcomingAppointments();
}

function renderAppointments() {
    const filtered =
        getFilteredAppointments();

    appointmentsList.innerHTML =
        "";

    if (!filtered.length) {
        appointmentsList.hidden =
            true;

        appointmentsEmpty.hidden =
            false;

        return;
    }

    appointmentsList.hidden =
        false;

    appointmentsEmpty.hidden =
        true;

    appointmentsList.innerHTML =
        filtered
            .map(
                createAppointmentCard
            )
            .join("");

    initIcons();
}

function renderVehicles() {
    vehiclesGrid.innerHTML =
        "";

    if (!vehicles.length) {
        vehiclesGrid.hidden =
            true;

        vehiclesEmpty.hidden =
            false;

        return;
    }

    vehiclesGrid.hidden =
        false;

    vehiclesEmpty.hidden =
        true;

    vehiclesGrid.innerHTML =
        vehicles
            .map(
                (vehicle) => `
                    <article
                        class="account-vehicle-card"
                        data-vehicle-id="${escapeHTML(
                            vehicle.id
                        )}"
                    >

                        <div class="account-vehicle-card__top">

                            <div class="account-vehicle-card__icon">
                                <i data-lucide="car-front"></i>
                            </div>

                            <div class="account-vehicle-card__actions">

                                <button
                                    type="button"
                                    data-vehicle-action="edit"
                                    data-vehicle-id="${escapeHTML(
                                        vehicle.id
                                    )}"
                                    aria-label="Editar vehículo"
                                >
                                    <i data-lucide="pencil"></i>
                                </button>

                                <button
                                    type="button"
                                    data-vehicle-action="delete"
                                    data-vehicle-id="${escapeHTML(
                                        vehicle.id
                                    )}"
                                    aria-label="Eliminar vehículo"
                                >
                                    <i data-lucide="trash-2"></i>
                                </button>

                            </div>

                        </div>

                        <div class="account-vehicle-card__content">

                            <span class="account-vehicle-card__type">
                                ${escapeHTML(
                                    getVehicleTypeLabel(
                                        vehicle.tipo
                                    )
                                )}
                            </span>

                            <h3>
                                ${escapeHTML(
                                    [
                                        vehicle.marca,
                                        vehicle.modelo
                                    ]
                                        .filter(Boolean)
                                        .join(" ") ||
                                    "Vehículo"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    [
                                        vehicle.anio,
                                        vehicle.color
                                    ]
                                        .filter(Boolean)
                                        .join(" · ") ||
                                    "Sin información adicional"
                                )}
                            </p>

                        </div>

                    </article>
                `
            )
            .join("");

    initIcons();
}

function getReceiptDate(
    receipt
) {
    if (
        receipt.fechaKey
    ) {
        const parts =
            String(
                receipt.fechaKey
            )
                .split("-")
                .map(Number);

        if (
            parts.length === 3
        ) {
            return new Date(
                parts[0],
                parts[1] - 1,
                parts[2]
            );
        }
    }

    return (
        getDateFromValue(
            receipt.emitidoEn
        ) ||
        getDateFromValue(
            receipt.fecha
        ) ||
        getDateFromValue(
            receipt.creadoEn
        )
    );
}

function getReceiptUrl(
    receipt
) {
    return safeExternalUrl(
        receipt.pdfUrl ||
        receipt.archivoUrl ||
        receipt.reciboUrl ||
        receipt.imagenUrl ||
        receipt.url
    );
}

function renderReceipts() {
    receiptsList.innerHTML =
        "";

    if (!receipts.length) {
        receiptsList.hidden =
            true;

        receiptsEmpty.hidden =
            false;

        return;
    }

    receiptsList.hidden =
        false;

    receiptsEmpty.hidden =
        true;

    receiptsList.innerHTML =
        receipts
            .map(
                (receipt) => {
                    const date =
                        getReceiptDate(
                            receipt
                        );

                    const amount =
                        receipt.total ??
                        receipt.monto ??
                        receipt.importe;

                    const url =
                        getReceiptUrl(
                            receipt
                        );

                    const folio =
                        receipt.folio ||
                        receipt.numero ||
                        receipt.id;

                    return `
                        <article class="account-list-item">

                            <div class="account-list-item__main">

                                <span class="account-list-item__eyebrow">
                                    Recibo ${escapeHTML(
                                        folio
                                    )}
                                </span>

                                <h3>
                                    ${escapeHTML(
                                        receipt.servicioNombre ||
                                        receipt.concepto ||
                                        "Servicio PMC"
                                    )}
                                </h3>

                                <p>
    ${
        date
            ? escapeHTML(
                capitalize(
                    formatDate(
                        date
                    )
                )
            )
            : "Fecha no disponible"
    }
</p>

                            </div>

                            <div class="account-list-item__side">

                                <strong class="account-list-item__amount">
                                    ${
                                        amount != null
                                            ? escapeHTML(
                                                formatCurrency(
                                                    amount
                                                )
                                            )
                                            : "Consultar"
                                    }
                                </strong>

                                ${
                                    url
                                        ? `
                                            <a
                                                href="${escapeHTML(
                                                    url
                                                )}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="account-list-item__action"
                                                aria-label="Ver recibo"
                                            >
                                                <i data-lucide="external-link"></i>
                                            </a>
                                          `
                                        : ""
                                }

                            </div>

                        </article>
                    `;
                }
            )
            .join("");

    initIcons();
}

function renderAll() {
    renderProfileHeader();
    renderProfileForm();
    renderStats();
    renderNextAppointment();
    renderRecentActivity();
    renderAppointments();
    renderVehicles();
    renderReceipts();
}

function showView(
    viewName,
    updateUrl = true
) {
    const validViews = [
        "inicio",
        "citas",
        "vehiculos",
        "recibos",
        "perfil"
    ];

    const view =
        validViews.includes(
            viewName
        )
            ? viewName
            : "inicio";

    accountViews.forEach(
        (section) => {
            const active =
                section.dataset.accountView ===
                view;

            section.hidden =
                !active;

            section.classList.toggle(
                "is-active",
                active
            );
        }
    );

    navigationItems.forEach(
        (button) => {
            button.classList.toggle(
                "is-active",
                button.dataset
                    .accountSection ===
                    view
            );
        }
    );

    if (updateUrl) {
        const url =
            new URL(
                window.location.href
            );

        url.hash =
            view === "inicio"
                ? ""
                : view;

        window.history.replaceState(
            {},
            "",
            `${url.pathname}${url.search}${url.hash}`
        );
    }

    window.scrollTo({
        top:
            document.querySelector(
                ".account-section"
            )?.offsetTop -
            60,
        behavior: "smooth"
    });
}

function getInitialView() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    if (
        params.get("cita")
    ) {
        return "citas";
    }

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();

    if (
        [
            "citas",
            "vehiculos",
            "recibos",
            "perfil"
        ].includes(hash)
    ) {
        return hash;
    }

    return "inicio";
}

function focusRequestedAppointment() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const appointmentId =
        params.get("cita");

    if (!appointmentId) {
        return;
    }

    appointmentFilter =
        "todas";

    updateAppointmentFilterButtons();
    renderAppointments();

    window.setTimeout(
        () => {
            const element =
                appointmentsList
                    ?.querySelector(
                        `[data-appointment-id="${CSS.escape(
                            appointmentId
                        )}"]`
                    );

            element?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        },
        300
    );
}

function updateAppointmentFilterButtons() {
    appointmentFilters
        ?.querySelectorAll(
            "[data-appointment-filter]"
        )
        .forEach(
            (button) => {
                button.classList.toggle(
                    "is-active",
                    button.dataset
                        .appointmentFilter ===
                        appointmentFilter
                );
            }
        );
}

function openVehicleModal(
    vehicle = null
) {
    if (!vehicleModal) {
        return;
    }

    vehicleForm.reset();

    vehicleEditId.value =
        vehicle?.id || "";

    accountVehicleType.value =
        vehicle?.tipo || "";

    accountVehicleBrand.value =
        vehicle?.marca || "";

    accountVehicleModel.value =
        vehicle?.modelo || "";

    accountVehicleYear.value =
        vehicle?.anio || "";

    accountVehicleColor.value =
        vehicle?.color || "";

    vehicleModalTitle.textContent =
        vehicle
            ? "Editar vehículo"
            : "Agregar vehículo";

    vehicleModal.classList.add(
        "is-open"
    );

    vehicleModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    window.setTimeout(
        () => {
            accountVehicleType?.focus();
        },
        150
    );
}

function closeVehicleModal() {
    if (!vehicleModal) {
        return;
    }

    vehicleModal.classList.remove(
        "is-open"
    );

    vehicleModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    vehicleForm.reset();

    vehicleEditId.value =
        "";
}

function getVehicleFormData() {
    return {
        tipo:
            accountVehicleType
                .value,
        marca:
            accountVehicleBrand
                .value
                .trim(),
        modelo:
            accountVehicleModel
                .value
                .trim(),
        anio:
            Number(
                accountVehicleYear
                    .value
            ),
        color:
            accountVehicleColor
                .value
                .trim()
    };
}

function vehicleFormIsValid(
    vehicle
) {
    return Boolean(
        vehicle.tipo &&
        vehicle.marca &&
        vehicle.modelo &&
        Number.isInteger(
            vehicle.anio
        ) &&
        vehicle.anio >= 1950 &&
        vehicle.anio <= 2030
    );
}

async function handleVehicleSubmit(
    event
) {
    event.preventDefault();

    if (
        vehicleSaving ||
        !currentUser
    ) {
        return;
    }

    const vehicle =
        getVehicleFormData();

    if (
        !vehicleFormIsValid(
            vehicle
        )
    ) {
        showToast(
            "Completa correctamente los datos del vehículo.",
            "error"
        );

        return;
    }

    vehicleSaving = true;

    setButtonLoading(
        saveVehicleButton,
        true,
        "Guardando..."
    );

    try {
        const editId =
            vehicleEditId.value
                .trim();

        if (editId) {
            await setDoc(
                doc(
                    db,
                    "usuarios",
                    currentUser.uid,
                    "vehiculos",
                    editId
                ),
                {
                    ...vehicle,
                    actualizadoEn:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );

            showToast(
                "Vehículo actualizado correctamente."
            );
        } else {
            await addDoc(
                collection(
                    db,
                    "usuarios",
                    currentUser.uid,
                    "vehiculos"
                ),
                {
                    ...vehicle,
                    activo:
                        true,
                    creadoEn:
                        serverTimestamp(),
                    actualizadoEn:
                        serverTimestamp()
                }
            );

            showToast(
                "Vehículo agregado correctamente."
            );
        }

        closeVehicleModal();

        await loadVehicles();

        renderVehicles();
        renderStats();
    } catch (error) {
        console.error(
            "No se pudo guardar el vehículo:",
            error
        );

        showToast(
            "No se pudo guardar el vehículo.",
            "error"
        );
    } finally {
        vehicleSaving = false;

        setButtonLoading(
            saveVehicleButton,
            false
        );
    }
}

async function deleteVehicle(
    vehicleId
) {
    if (
        !currentUser ||
        !vehicleId
    ) {
        return;
    }

    const vehicle =
        vehicles.find(
            (item) =>
                item.id ===
                vehicleId
        );

    const name =
        [
            vehicle?.marca,
            vehicle?.modelo
        ]
            .filter(Boolean)
            .join(" ");

    const confirmed =
        window.confirm(
            name
                ? `¿Eliminar ${name} de tus vehículos?`
                : "¿Eliminar este vehículo?"
        );

    if (!confirmed) {
        return;
    }

    try {
        await deleteDoc(
            doc(
                db,
                "usuarios",
                currentUser.uid,
                "vehiculos",
                vehicleId
            )
        );

        vehicles =
            vehicles.filter(
                (item) =>
                    item.id !==
                    vehicleId
            );

        renderVehicles();
        renderStats();

        showToast(
            "Vehículo eliminado."
        );
    } catch (error) {
        console.error(
            "No se pudo eliminar el vehículo:",
            error
        );

        showToast(
            "No se pudo eliminar el vehículo.",
            "error"
        );
    }
}

async function handleProfileSubmit(
    event
) {
    event.preventDefault();

    if (
        profileSaving ||
        !currentUser
    ) {
        return;
    }

    const name =
        profileName.value
            .trim()
            .replace(
                /\s+/g,
                " "
            );

    const phone =
        sanitizePhone(
            profilePhone.value
        );

    if (
        name.length < 3
    ) {
        showToast(
            "Escribe un nombre válido.",
            "error"
        );

        return;
    }

    if (
        phone &&
        phone.length !== 10
    ) {
        showToast(
            "El celular debe contener 10 dígitos.",
            "error"
        );

        return;
    }

    profileSaving = true;

    setButtonLoading(
        saveProfileButton,
        true,
        "Guardando..."
    );

    try {
        if (
            currentUser.displayName !==
            name
        ) {
            await updateProfile(
                currentUser,
                {
                    displayName:
                        name
                }
            );
        }

        await setDoc(
            doc(
                db,
                "usuarios",
                currentUser.uid
            ),
            {
                nombre:
                    name,
                telefono:
                    phone,
                email:
                    currentUser.email ||
                    "",
                actualizadoEn:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );

        currentUserData = {
            ...currentUserData,
            nombre:
                name,
            telefono:
                phone,
            email:
                currentUser.email ||
                currentUserData.email ||
                ""
        };

        renderProfileHeader();
        renderProfileForm();

        showToast(
            "Perfil actualizado correctamente."
        );
    } catch (error) {
        console.error(
            "No se pudo actualizar el perfil:",
            error
        );

        showToast(
            "No se pudieron guardar los cambios.",
            "error"
        );
    } finally {
        profileSaving = false;

        setButtonLoading(
            saveProfileButton,
            false
        );
    }
}

async function handleLogout() {
    try {
        logoutButton.disabled =
            true;

        await signOut(
            auth
        );

        window.location.href =
            "index.html";
    } catch (error) {
        console.error(
            "No se pudo cerrar sesión:",
            error
        );

        logoutButton.disabled =
            false;

        showToast(
            "No se pudo cerrar la sesión.",
            "error"
        );
    }
}

function handleVehicleGridClick(
    event
) {
    const button =
        event.target.closest(
            "[data-vehicle-action]"
        );

    if (!button) {
        return;
    }

    const id =
        button.dataset.vehicleId;

    const action =
        button.dataset.vehicleAction;

    const vehicle =
        vehicles.find(
            (item) =>
                item.id === id
        );

    if (
        action === "edit" &&
        vehicle
    ) {
        openVehicleModal(
            vehicle
        );

        return;
    }

    if (
        action === "delete"
    ) {
        deleteVehicle(
            id
        );
    }
}

function bindNavigation() {
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

function bindAccountNavigation() {
    navigationItems.forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    showView(
                        button.dataset
                            .accountSection
                    );
                }
            );
        }
    );

    headerAccountButton?.addEventListener(
        "click",
        () => {
            showView(
                "perfil"
            );
        }
    );
}

function bindAppointmentFilters() {
    appointmentFilters?.addEventListener(
        "click",
        (event) => {
            const button =
                event.target.closest(
                    "[data-appointment-filter]"
                );

            if (!button) {
                return;
            }

            appointmentFilter =
                button.dataset
                    .appointmentFilter;

            updateAppointmentFilterButtons();
            renderAppointments();
        }
    );
}

function bindVehicleModal() {
    openVehicleModalButton
        ?.addEventListener(
            "click",
            () => {
                openVehicleModal();
            }
        );

    emptyAddVehicle
        ?.addEventListener(
            "click",
            () => {
                openVehicleModal();
            }
        );

    vehicleModalClose
        ?.addEventListener(
            "click",
            closeVehicleModal
        );

    cancelVehicleButton
        ?.addEventListener(
            "click",
            closeVehicleModal
        );

    vehicleModalBackdrop
        ?.addEventListener(
            "click",
            closeVehicleModal
        );

    vehicleForm
        ?.addEventListener(
            "submit",
            handleVehicleSubmit
        );

    vehiclesGrid
        ?.addEventListener(
            "click",
            handleVehicleGridClick
        );
}

function bindProfile() {
    profilePhone?.addEventListener(
        "input",
        () => {
            profilePhone.value =
                sanitizePhone(
                    profilePhone.value
                );
        }
    );

    profileForm?.addEventListener(
        "submit",
        handleProfileSubmit
    );
}

function bindLogout() {
    logoutButton?.addEventListener(
        "click",
        handleLogout
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
                vehicleModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeVehicleModal();

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

async function loadAccountData() {
    accountLoadingErrors = [];

    await Promise.all([
        loadUserData(),
        loadAppointments(),
        loadVehicles(),
        loadReceipts()
    ]);

    renderAll();

    if (
        accountLoadingErrors.length
    ) {
        showToast(
            "Parte de la información de tu cuenta no pudo cargarse.",
            "error"
        );
    }
}

async function init() {
    initIcons();
    setCurrentYear();

    bindNavigation();
    bindAccountNavigation();
    bindAppointmentFilters();
    bindVehicleModal();
    bindProfile();
    bindLogout();
    bindKeyboard();

    currentUser =
        await waitForUser();

    if (!currentUser) {
        redirectToLogin();
        return;
    }

    try {
        await ensureUserDocument();
    } catch (error) {
        console.error(
            "No se pudo preparar el perfil:",
            error
        );
    }

    await loadAccountData();

    const initialView =
        getInitialView();

    showView(
        initialView,
        false
    );

    focusRequestedAppointment();

    hideLoader();
}

document.addEventListener(
    "DOMContentLoaded",
    init
);

window.addEventListener(
    "load",
    () => {
        window.setTimeout(
            hideLoader,
            700
        );
    }
);

window.setTimeout(
    hideLoader,
    3500
);