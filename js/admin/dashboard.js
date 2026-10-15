import {
    auth,
    db
} from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pageLoader =
    document.getElementById(
        "pageLoader"
    );

const adminShell =
    document.getElementById(
        "adminShell"
    );

const adminAccessDenied =
    document.getElementById(
        "adminAccessDenied"
    );

const adminSidebar =
    document.getElementById(
        "adminSidebar"
    );

const adminSidebarBackdrop =
    document.getElementById(
        "adminSidebarBackdrop"
    );

const adminSidebarClose =
    document.getElementById(
        "adminSidebarClose"
    );

const adminMenuButton =
    document.getElementById(
        "adminMenuButton"
    );

const adminLogout =
    document.getElementById(
        "adminLogout"
    );

const adminName =
    document.getElementById(
        "adminName"
    );

const adminEmail =
    document.getElementById(
        "adminEmail"
    );

const adminFirstName =
    document.getElementById(
        "adminFirstName"
    );

const adminAvatar =
    document.getElementById(
        "adminAvatar"
    );

const adminInitials =
    document.getElementById(
        "adminInitials"
    );

const adminCurrentDate =
    document.getElementById(
        "adminCurrentDate"
    );

const currentYear =
    document.getElementById(
        "currentYear"
    );

const financeButton =
    document.querySelector(
        ".admin-sidebar__finance"
    );

const sidebarAppointmentsBadge =
    document.getElementById(
        "sidebarAppointmentsBadge"
    );

const statTodayAppointments =
    document.getElementById(
        "statTodayAppointments"
    );

const statUpcomingAppointments =
    document.getElementById(
        "statUpcomingAppointments"
    );

const statActiveOrders =
    document.getElementById(
        "statActiveOrders"
    );

const statClients =
    document.getElementById(
        "statClients"
    );

const statPublishedServices =
    document.getElementById(
        "statPublishedServices"
    );

const todayAppointments =
    document.getElementById(
        "todayAppointments"
    );

const todayAppointmentsEmpty =
    document.getElementById(
        "todayAppointmentsEmpty"
    );

const recentOrders =
    document.getElementById(
        "recentOrders"
    );

const recentOrdersEmpty =
    document.getElementById(
        "recentOrdersEmpty"
    );

const serviceStatusPublished =
    document.getElementById(
        "serviceStatusPublished"
    );

const serviceStatusDraft =
    document.getElementById(
        "serviceStatusDraft"
    );

const serviceStatusInactive =
    document.getElementById(
        "serviceStatusInactive"
    );

const adminToast =
    document.getElementById(
        "adminToast"
    );

const adminToastText =
    document.getElementById(
        "adminToastText"
    );

let currentUser = null;
let currentUserData = null;

let appointments = [];
let orders = [];
let users = [];
let services = [];

let toastTimer = null;

function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function hideLoader() {
    if (!pageLoader) {
        return;
    }

    window.setTimeout(
        () => {
            pageLoader.classList.add(
                "is-hidden"
            );
        },
        250
    );
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
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
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

    return first || "administrador";
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
        typeof value === "number" ||
        typeof value === "string"
    ) {
        const date =
            new Date(value);

        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {
            return date;
        }
    }

    return null;
}

function dateToKey(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
    if (!value) {
        return null;
    }

    const parts =
        String(value)
            .split("-")
            .map(Number);

    if (
        parts.length !== 3 ||
        parts.some(
            (part) =>
                !Number.isFinite(
                    part
                )
        )
    ) {
        return null;
    }

    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );
}

function getAppointmentDate(
    appointment
) {
    if (
        appointment?.fechaKey
    ) {
        return parseDateKey(
            appointment.fechaKey
        );
    }

    return (
        getDateFromValue(
            appointment?.fecha
        ) ||
        getDateFromValue(
            appointment?.creadoEn
        )
    );
}

function formatTime(value) {
    if (!value) {
        return "--";
    }

    const parts =
        String(value)
            .split(":")
            .map(Number);

    if (
        parts.length < 2 ||
        parts.some(
            (part) =>
                !Number.isFinite(
                    part
                )
        )
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

function formatDate(
    date
) {
    if (!date) {
        return "Sin fecha";
    }

    return capitalize(
        new Intl.DateTimeFormat(
            "es-MX",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        ).format(date)
    );
}

function setCurrentDate() {
    const now =
        new Date();

    if (adminCurrentDate) {
        adminCurrentDate.textContent =
            capitalize(
                new Intl.DateTimeFormat(
                    "es-MX",
                    {
                        weekday:
                            "long",
                        day:
                            "numeric",
                        month:
                            "long"
                    }
                ).format(now)
            );
    }

    if (currentYear) {
        currentYear.textContent =
            now.getFullYear();
    }
}

function getPermissions(data) {
    if (
        data?.permisos &&
        typeof data.permisos ===
            "object"
    ) {
        return data.permisos;
    }

    return {};
}

function userIsAdmin(data) {
    const permissions =
        getPermissions(data);

    return (
        data?.rol === "admin" ||
        permissions.admin === true
    );
}

function userHasFinance(data) {
    const permissions =
        getPermissions(data);

    return (
        permissions.finanzas ===
        true
    );
}

function getUserRole(user) {
    if (
        user?.rol
    ) {
        return user.rol;
    }

    if (
        user?.permisos?.cliente ===
        true
    ) {
        return "cliente";
    }

    return "";
}

function showAccessDenied() {
    if (adminShell) {
        adminShell.hidden =
            true;
    }

    if (adminAccessDenied) {
        adminAccessDenied.hidden =
            false;
    }

    hideLoader();
    initIcons();
}

function showAdmin() {
    if (adminAccessDenied) {
        adminAccessDenied.hidden =
            true;
    }

    if (adminShell) {
        adminShell.hidden =
            false;
    }

    initIcons();
}

function redirectToLogin() {
    const returnUrl =
        "admin.html";

    window.location.href =
        `login.html?return=${encodeURIComponent(
            returnUrl
        )}`;
}

function showToast(
    message,
    type = "success"
) {
    if (
        !adminToast ||
        !adminToastText
    ) {
        return;
    }

    if (toastTimer) {
        window.clearTimeout(
            toastTimer
        );
    }

    adminToast.hidden =
        false;

    adminToast.classList.remove(
        "is-error"
    );

    if (
        type === "error"
    ) {
        adminToast.classList.add(
            "is-error"
        );
    }

    adminToast.innerHTML = `
        <i
            data-lucide="${
                type === "error"
                    ? "circle-alert"
                    : "circle-check"
            }"
        ></i>

        <span id="adminToastText">
            ${escapeHTML(
                message
            )}
        </span>
    `;

    adminToast.classList.add(
        "is-visible"
    );

    initIcons();

    toastTimer =
        window.setTimeout(
            () => {
                adminToast.classList.remove(
                    "is-visible"
                );

                window.setTimeout(
                    () => {
                        adminToast.hidden =
                            true;
                    },
                    220
                );
            },
            3400
        );
}

function openSidebar() {
    if (!adminSidebar) {
        return;
    }

    adminSidebar.classList.add(
        "is-open"
    );

    document.body.classList.add(
        "admin-sidebar-open"
    );
}

function closeSidebar() {
    if (!adminSidebar) {
        return;
    }

    adminSidebar.classList.remove(
        "is-open"
    );

    document.body.classList.remove(
        "admin-sidebar-open"
    );
}

function renderAdminProfile() {
    const name =
        currentUserData?.nombre ||
        currentUser?.displayName ||
        "Administrador";

    const email =
        currentUserData?.email ||
        currentUser?.email ||
        "";

    const photo =
        currentUserData?.fotoURL ||
        currentUserData?.foto ||
        currentUser?.photoURL ||
        "";

    if (adminName) {
        adminName.textContent =
            name;
    }

    if (adminEmail) {
        adminEmail.textContent =
            email;
    }

    if (adminFirstName) {
        adminFirstName.textContent =
            getFirstName(
                name
            );
    }

    if (adminInitials) {
        adminInitials.textContent =
            getInitials(
                name
            );
    }

    if (
        adminAvatar &&
        photo
    ) {
        adminAvatar.src =
            photo;

        adminAvatar.alt =
            name;

        adminAvatar.hidden =
            false;

        if (adminInitials) {
            adminInitials.hidden =
                true;
        }

        adminAvatar.onerror =
            () => {
                adminAvatar.hidden =
                    true;

                if (
                    adminInitials
                ) {
                    adminInitials.hidden =
                        false;
                }
            };
    } else {
        if (adminAvatar) {
            adminAvatar.hidden =
                true;
        }

        if (adminInitials) {
            adminInitials.hidden =
                false;
        }
    }

    if (financeButton) {
        financeButton.hidden =
            !userHasFinance(
                currentUserData
            );
    }
}

async function getCurrentUser() {
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

async function validateAdminAccess() {
    currentUser =
        await getCurrentUser();

    if (!currentUser) {
        redirectToLogin();
        return false;
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

        if (
            !snapshot.exists()
        ) {
            showAccessDenied();
            return false;
        }

        currentUserData = {
            id:
                snapshot.id,
            ...snapshot.data()
        };

        if (
            currentUserData.activo ===
            false
        ) {
            await signOut(auth);

            showAccessDenied();
            return false;
        }

        if (
            !userIsAdmin(
                currentUserData
            )
        ) {
            showAccessDenied();
            return false;
        }

        renderAdminProfile();
        showAdmin();

        return true;
    } catch (error) {
        console.error(
            "No se pudo validar el acceso administrativo:",
            error
        );

        showAccessDenied();

        return false;
    }
}

async function loadAppointments() {
    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "citas"
                )
            );

        appointments =
            snapshot.docs.map(
                (
                    documentSnapshot
                ) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );
    } catch (error) {
        console.error(
            "No se pudieron cargar las citas:",
            error
        );

        appointments = [];
    }
}

async function loadOrders() {
    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "ordenes"
                )
            );

        orders =
            snapshot.docs.map(
                (
                    documentSnapshot
                ) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );
    } catch (error) {
        console.error(
            "No se pudieron cargar las órdenes:",
            error
        );

        orders = [];
    }
}

async function loadUsers() {
    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        users =
            snapshot.docs.map(
                (
                    documentSnapshot
                ) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );
    } catch (error) {
        console.error(
            "No se pudieron cargar los usuarios:",
            error
        );

        users = [];
    }
}

async function loadServices() {
    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "servicios"
                )
            );

        services =
            snapshot.docs.map(
                (
                    documentSnapshot
                ) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );
    } catch (error) {
        console.error(
            "No se pudieron cargar los servicios:",
            error
        );

        services = [];
    }
}

function getTodayAppointments() {
    const todayKey =
        dateToKey(
            new Date()
        );

    return appointments
        .filter(
            (appointment) =>
                appointment.fechaKey ===
                todayKey
        )
        .sort(
            (a, b) =>
                String(
                    a.horaInicio ||
                    ""
                ).localeCompare(
                    String(
                        b.horaInicio ||
                        ""
                    )
                )
        );
}

function isFinalAppointment(
    appointment
) {
    const status =
        normalizeText(
            appointment?.estado
        )
            .replaceAll(
                " ",
                "_"
            )
            .replaceAll(
                "-",
                "_"
            );

    return [
        "entregado",
        "cancelado",
        "cancelada"
    ].includes(
        status
    );
}

function getUpcomingAppointments() {
    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return appointments.filter(
        (appointment) => {
            if (
                isFinalAppointment(
                    appointment
                )
            ) {
                return false;
            }

            const date =
                getAppointmentDate(
                    appointment
                );

            if (!date) {
                return true;
            }

            date.setHours(
                0,
                0,
                0,
                0
            );

            return (
                date >= today
            );
        }
    );
}

function isActiveOrder(order) {
    const status =
        normalizeText(
            order?.estado
        )
            .replaceAll(
                " ",
                "_"
            )
            .replaceAll(
                "-",
                "_"
            );

    if (!status) {
        return true;
    }

    return ![
        "entregado",
        "cancelado",
        "cancelada",
        "cerrado",
        "cerrada"
    ].includes(
        status
    );
}

function getClients() {
    return users.filter(
        (user) =>
            getUserRole(
                user
            ) === "cliente"
    );
}

function getPublishedServices() {
    return services.filter(
        (service) =>
            service.estado ===
                "publicado" &&
            service.activo ===
                true
    );
}

function getDraftServices() {
    return services.filter(
        (service) =>
            normalizeText(
                service.estado
            ) === "borrador"
    );
}

function getInactiveServices() {
    return services.filter(
        (service) =>
            service.activo ===
            false
    );
}

function getClientByUid(uid) {
    if (!uid) {
        return null;
    }

    return (
        users.find(
            (user) =>
                user.id === uid ||
                user.uid === uid
        ) ||
        null
    );
}

function getAppointmentClientName(
    appointment
) {
    const client =
        getClientByUid(
            appointment.clienteUid
        );

    return (
        client?.nombre ||
        appointment.clienteNombre ||
        appointment.clienteEmail ||
        "Cliente PMC"
    );
}

function getVehicleText(
    appointment
) {
    const vehicle =
        appointment?.vehiculo ||
        {};

    const text =
        [
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio
        ]
            .filter(Boolean)
            .join(" ");

    return (
        text ||
        vehicle.tipo ||
        "Vehículo"
    );
}

function getStatusLabel(status) {
    const normalized =
        normalizeText(
            status
        )
            .replaceAll(
                " ",
                "_"
            )
            .replaceAll(
                "-",
                "_"
            );

    const labels = {
        agendada:
            "Agendada",
        confirmada:
            "Confirmada",
        recibido:
            "Recibido",
        en_proceso:
            "En proceso",
        proceso:
            "En proceso",
        terminado:
            "Terminado",
        entregado:
            "Entregado",
        cancelado:
            "Cancelada",
        cancelada:
            "Cancelada",
        pendiente:
            "Pendiente"
    };

    return (
        labels[normalized] ||
        capitalize(
            String(
                status ||
                "Pendiente"
            )
        )
    );
}

function getStatusClass(status) {
    const normalized =
        normalizeText(
            status
        )
            .replaceAll(
                " ",
                "_"
            )
            .replaceAll(
                "-",
                "_"
            );

    if (
        [
            "confirmada",
            "terminado",
            "entregado"
        ].includes(
            normalized
        )
    ) {
        return "is-confirmed";
    }

    if (
        [
            "recibido",
            "en_proceso",
            "proceso"
        ].includes(
            normalized
        )
    ) {
        return "is-progress";
    }

    if (
        [
            "cancelado",
            "cancelada"
        ].includes(
            normalized
        )
    ) {
        return "is-cancelled";
    }

    return "";
}

function renderStats() {
    const today =
        getTodayAppointments();

    const upcoming =
        getUpcomingAppointments();

    const activeOrders =
        orders.filter(
            isActiveOrder
        );

    const clients =
        getClients();

    const published =
        getPublishedServices();

    if (
        statTodayAppointments
    ) {
        statTodayAppointments.textContent =
            String(
                today.length
            );
    }

    if (
        statUpcomingAppointments
    ) {
        statUpcomingAppointments.textContent =
            String(
                upcoming.length
            );
    }

    if (
        statActiveOrders
    ) {
        statActiveOrders.textContent =
            String(
                activeOrders.length
            );
    }

    if (statClients) {
        statClients.textContent =
            String(
                clients.length
            );
    }

    if (
        statPublishedServices
    ) {
        statPublishedServices.textContent =
            String(
                published.length
            );
    }

    if (
        sidebarAppointmentsBadge
    ) {
        if (
            upcoming.length
        ) {
            sidebarAppointmentsBadge.hidden =
                false;

            sidebarAppointmentsBadge.textContent =
                String(
                    upcoming.length
                );
        } else {
            sidebarAppointmentsBadge.hidden =
                true;
        }
    }
}

function renderServiceStatus() {
    const published =
        getPublishedServices();

    const drafts =
        getDraftServices();

    const inactive =
        getInactiveServices();

    if (
        serviceStatusPublished
    ) {
        serviceStatusPublished.textContent =
            String(
                published.length
            );
    }

    if (
        serviceStatusDraft
    ) {
        serviceStatusDraft.textContent =
            String(
                drafts.length
            );
    }

    if (
        serviceStatusInactive
    ) {
        serviceStatusInactive.textContent =
            String(
                inactive.length
            );
    }
}

function renderTodayAppointments() {
    if (
        !todayAppointments ||
        !todayAppointmentsEmpty
    ) {
        return;
    }

    const today =
        getTodayAppointments();

    todayAppointments.innerHTML =
        "";

    if (!today.length) {
        todayAppointments.hidden =
            true;

        todayAppointmentsEmpty.hidden =
            false;

        return;
    }

    todayAppointments.hidden =
        false;

    todayAppointmentsEmpty.hidden =
        true;

    todayAppointments.innerHTML =
        today
            .slice(
                0,
                6
            )
            .map(
                (appointment) => {
                    const clientName =
                        getAppointmentClientName(
                            appointment
                        );

                    const vehicle =
                        getVehicleText(
                            appointment
                        );

                    const statusClass =
                        getStatusClass(
                            appointment.estado
                        );

                    return `
                        <article class="admin-appointment">

                            <div class="admin-appointment__time">
                                ${escapeHTML(
                                    formatTime(
                                        appointment.horaInicio
                                    )
                                )}
                            </div>

                            <div class="admin-appointment__info">

                                <strong>
                                    ${escapeHTML(
                                        appointment.servicioNombre ||
                                        "Servicio PMC"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        clientName
                                    )}
                                </span>

                                <small>
                                    ${escapeHTML(
                                        vehicle
                                    )}
                                </small>

                            </div>

                            <span class="admin-status ${statusClass}">
                                ${escapeHTML(
                                    getStatusLabel(
                                        appointment.estado
                                    )
                                )}
                            </span>

                        </article>
                    `;
                }
            )
            .join("");

    initIcons();
}

function getOrderDate(order) {
    return (
        getDateFromValue(
            order.actualizadoEn
        ) ||
        getDateFromValue(
            order.creadoEn
        ) ||
        getDateFromValue(
            order.fecha
        )
    );
}

function getOrderClientName(
    order
) {
    const client =
        getClientByUid(
            order.clienteUid
        );

    return (
        client?.nombre ||
        order.clienteNombre ||
        order.cliente ||
        "Cliente PMC"
    );
}

function getOrderVehicle(order) {
    const vehicle =
        order.vehiculo ||
        {};

    return (
        [
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio
        ]
            .filter(Boolean)
            .join(" ") ||
        order.vehiculoNombre ||
        "Vehículo"
    );
}

function renderRecentOrders() {
    if (
        !recentOrders ||
        !recentOrdersEmpty
    ) {
        return;
    }

    const sorted =
        [...orders]
            .sort(
                (a, b) => {
                    const dateA =
                        getOrderDate(
                            a
                        )?.getTime() ||
                        0;

                    const dateB =
                        getOrderDate(
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
                5
            );

    recentOrders.innerHTML =
        "";

    if (!sorted.length) {
        recentOrders.hidden =
            true;

        recentOrdersEmpty.hidden =
            false;

        return;
    }

    recentOrders.hidden =
        false;

    recentOrdersEmpty.hidden =
        true;

    recentOrders.innerHTML =
        sorted
            .map(
                (order) => {
                    const client =
                        getOrderClientName(
                            order
                        );

                    const vehicle =
                        getOrderVehicle(
                            order
                        );

                    const date =
                        getOrderDate(
                            order
                        );

                    const status =
                        getStatusLabel(
                            order.estado
                        );

                    const statusClass =
                        getStatusClass(
                            order.estado
                        );

                    return `
                        <article class="admin-order">

                            <div class="admin-order__icon">
                                <i data-lucide="car-front"></i>
                            </div>

                            <div class="admin-order__info">

                                <strong>
                                    ${escapeHTML(
                                        order.servicioNombre ||
                                        order.titulo ||
                                        "Orden de trabajo"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        client
                                    )}
                                    ·
                                    ${escapeHTML(
                                        vehicle
                                    )}
                                </span>

                                ${
                                    date
                                        ? `
                                            <span>
                                                ${escapeHTML(
                                                    formatDate(
                                                        date
                                                    )
                                                )}
                                            </span>
                                          `
                                        : ""
                                }

                            </div>

                            <span class="admin-status ${statusClass}">
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                        </article>
                    `;
                }
            )
            .join("");

    initIcons();
}

function renderDashboard() {
    renderStats();
    renderServiceStatus();
    renderTodayAppointments();
    renderRecentOrders();
}

async function loadDashboardData() {
    await Promise.all([
        loadAppointments(),
        loadOrders(),
        loadUsers(),
        loadServices()
    ]);

    renderDashboard();
}

async function handleLogout() {
    if (!adminLogout) {
        return;
    }

    adminLogout.disabled =
        true;

    try {
        await signOut(
            auth
        );

        window.location.href =
            "login.html";
    } catch (error) {
        console.error(
            "No se pudo cerrar sesión:",
            error
        );

        adminLogout.disabled =
            false;

        showToast(
            "No se pudo cerrar la sesión.",
            "error"
        );
    }
}

function bindSidebar() {
    adminMenuButton
        ?.addEventListener(
            "click",
            openSidebar
        );

    adminSidebarClose
        ?.addEventListener(
            "click",
            closeSidebar
        );

    adminSidebarBackdrop
        ?.addEventListener(
            "click",
            closeSidebar
        );

    adminSidebar
        ?.querySelectorAll(
            "a"
        )
        .forEach(
            (link) => {
                link.addEventListener(
                    "click",
                    () => {
                        if (
                            window.innerWidth <=
                            900
                        ) {
                            closeSidebar();
                        }
                    }
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
                closeSidebar();
            }
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key ===
                "Escape"
            ) {
                closeSidebar();
            }
        }
    );
}

function bindLogout() {
    adminLogout
        ?.addEventListener(
            "click",
            handleLogout
        );
}

async function init() {
    initIcons();
    setCurrentDate();

    bindSidebar();
    bindLogout();

    const allowed =
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    try {
        await loadDashboardData();
    } catch (error) {
        console.error(
            "Error cargando el dashboard:",
            error
        );

        showToast(
            "Parte de la información no pudo cargarse.",
            "error"
        );
    }

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
            900
        );
    }
);

window.setTimeout(
    hideLoader,
    4000
);