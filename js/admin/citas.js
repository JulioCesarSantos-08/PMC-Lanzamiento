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
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pageLoader =
    document.getElementById("pageLoader");

const adminShell =
    document.getElementById("adminShell");

const adminAccessDenied =
    document.getElementById("adminAccessDenied");

const adminSidebar =
    document.getElementById("adminSidebar");

const adminSidebarBackdrop =
    document.getElementById("adminSidebarBackdrop");

const adminSidebarClose =
    document.getElementById("adminSidebarClose");

const adminMenuButton =
    document.getElementById("adminMenuButton");

const adminLogout =
    document.getElementById("adminLogout");

const adminName =
    document.getElementById("adminName");

const adminEmail =
    document.getElementById("adminEmail");

const adminAvatar =
    document.getElementById("adminAvatar");

const adminInitials =
    document.getElementById("adminInitials");

const financeButton =
    document.getElementById("financeButton");

const currentYear =
    document.getElementById("currentYear");

const adminCurrentDate =
    document.getElementById("adminCurrentDate");

const sidebarAppointmentsBadge =
    document.getElementById("sidebarAppointmentsBadge");

const appointmentsTodayCount =
    document.getElementById("appointmentsTodayCount");

const appointmentsScheduledCount =
    document.getElementById("appointmentsScheduledCount");

const appointmentsConfirmedCount =
    document.getElementById("appointmentsConfirmedCount");

const appointmentsProgressCount =
    document.getElementById("appointmentsProgressCount");

const appointmentsCancelledCount =
    document.getElementById("appointmentsCancelledCount");

const appointmentSearch =
    document.getElementById("appointmentSearch");

const appointmentStatusFilter =
    document.getElementById("appointmentStatusFilter");

const appointmentDateFilter =
    document.getElementById("appointmentDateFilter");

const appointmentSpecificDate =
    document.getElementById("appointmentSpecificDate");

const appointmentsResultsCount =
    document.getElementById("appointmentsResultsCount");

const resetAppointmentFilters =
    document.getElementById("resetAppointmentFilters");

const appointmentsEmptyReset =
    document.getElementById("appointmentsEmptyReset");

const appointmentsList =
    document.getElementById("appointmentsList");

const appointmentsEmpty =
    document.getElementById("appointmentsEmpty");

const todayAppointmentsButton =
    document.getElementById("todayAppointmentsButton");

const newAppointmentButton =
    document.getElementById("newAppointmentButton");

const newAppointmentButtonHero =
    document.getElementById("newAppointmentButtonHero");

const appointmentDetailsModal =
    document.getElementById("appointmentDetailsModal");

const appointmentDetailsBackdrop =
    document.getElementById("appointmentDetailsBackdrop");

const appointmentDetailsClose =
    document.getElementById("appointmentDetailsClose");

const appointmentCloseButton =
    document.getElementById("appointmentCloseButton");

const appointmentDetailsTitle =
    document.getElementById("appointmentDetailsTitle");

const appointmentDetailsFolio =
    document.getElementById("appointmentDetailsFolio");

const appointmentDetailsStatus =
    document.getElementById("appointmentDetailsStatus");

const appointmentClientName =
    document.getElementById("appointmentClientName");

const appointmentClientEmail =
    document.getElementById("appointmentClientEmail");

const appointmentClientPhone =
    document.getElementById("appointmentClientPhone");

const appointmentVehicleName =
    document.getElementById("appointmentVehicleName");

const appointmentVehicleType =
    document.getElementById("appointmentVehicleType");

const appointmentVehicleColor =
    document.getElementById("appointmentVehicleColor");

const appointmentServiceName =
    document.getElementById("appointmentServiceName");

const appointmentServiceDuration =
    document.getElementById("appointmentServiceDuration");

const appointmentEstimatedPrice =
    document.getElementById("appointmentEstimatedPrice");

const appointmentDate =
    document.getElementById("appointmentDate");

const appointmentTime =
    document.getElementById("appointmentTime");

const appointmentReservedDuration =
    document.getElementById("appointmentReservedDuration");

const appointmentNotesSection =
    document.getElementById("appointmentNotesSection");

const appointmentNotes =
    document.getElementById("appointmentNotes");

const appointmentConfirmButton =
    document.getElementById("appointmentConfirmButton");

const appointmentReceiveButton =
    document.getElementById("appointmentReceiveButton");

const appointmentStartButton =
    document.getElementById("appointmentStartButton");

const appointmentFinishButton =
    document.getElementById("appointmentFinishButton");

const appointmentCancelButton =
    document.getElementById("appointmentCancelButton");

const cancelAppointmentModal =
    document.getElementById("cancelAppointmentModal");

const cancelAppointmentBackdrop =
    document.getElementById("cancelAppointmentBackdrop");

const cancelAppointmentClose =
    document.getElementById("cancelAppointmentClose");

const cancelAppointmentAbort =
    document.getElementById("cancelAppointmentAbort");

const cancelAppointmentConfirm =
    document.getElementById("cancelAppointmentConfirm");

const cancelAppointmentReason =
    document.getElementById("cancelAppointmentReason");

const newAppointmentModal =
    document.getElementById("newAppointmentModal");

const newAppointmentBackdrop =
    document.getElementById("newAppointmentBackdrop");

const newAppointmentClose =
    document.getElementById("newAppointmentClose");

const newAppointmentCancel =
    document.getElementById("newAppointmentCancel");

const newAppointmentForm =
    document.getElementById("newAppointmentForm");

const newAppointmentClient =
    document.getElementById("newAppointmentClient");

const newAppointmentService =
    document.getElementById("newAppointmentService");

const newAppointmentVehicleBrand =
    document.getElementById("newAppointmentVehicleBrand");

const newAppointmentVehicleModel =
    document.getElementById("newAppointmentVehicleModel");

const newAppointmentVehicleYear =
    document.getElementById("newAppointmentVehicleYear");

const newAppointmentVehicleType =
    document.getElementById("newAppointmentVehicleType");

const newAppointmentDate =
    document.getElementById("newAppointmentDate");

const newAppointmentTime =
    document.getElementById("newAppointmentTime");

const newAppointmentNotes =
    document.getElementById("newAppointmentNotes");

const newAppointmentSubmit =
    document.getElementById("newAppointmentSubmit");

const adminToast =
    document.getElementById("adminToast");

let currentUser = null;
let currentUserData = null;

let appointments = [];
let filteredAppointments = [];

let clients = [];
let services = [];

let clientsMap = new Map();
let servicesMap = new Map();

let agendaConfig = {};

let selectedAppointment = null;

let searchTerm = "";
let statusFilter = "todos";
let dateFilter = "todas";
let specificDateFilter = "";

let changingStatus = false;
let cancellingAppointment = false;
let creatingAppointment = false;
let receivingVehicle = false;

let availableManualTimes = [];
let toastTimer = null;

const DEFAULT_AGENDA = {
    intervaloMinutos: 30,
    anticipacionMinutos: 120,
    horarios: {
        lunes: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        martes: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        miercoles: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        jueves: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        viernes: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        sabado: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        domingo: {
            activo: false,
            apertura: "09:00",
            cierre: "18:00"
        }
    }
};

const STATUS_DATA = {
    agendada: {
        label: "Agendada",
        className: ""
    },
    confirmada: {
        label: "Confirmada",
        className: "is-confirmed"
    },
    recibido: {
        label: "Recibido",
        className: "is-received"
    },
    en_proceso: {
        label: "En proceso",
        className: "is-progress"
    },
    terminado: {
        label: "Terminado",
        className: "is-finished"
    },
    entregado: {
        label: "Entregado",
        className: "is-delivered"
    },
    cancelada: {
        label: "Cancelada",
        className: "is-cancelled"
    }
};

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
    return (
        getPermissions(data)
            .finanzas === true
    );
}

function numberOrNull(value) {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function formatCurrency(value) {
    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return "Por confirmar";
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

function pad(value) {
    return String(value)
        .padStart(2, "0");
}

function getLocalDateKey(date = new Date()) {
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join("-");
}

function parseDateKey(dateKey) {
    const parts =
        String(dateKey || "")
            .split("-")
            .map(Number);

    if (
        parts.length !== 3 ||
        parts.some(
            (value) =>
                !Number.isFinite(value)
        )
    ) {
        return null;
    }

    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2],
        12,
        0,
        0,
        0
    );
}

function addDaysToDateKey(
    dateKey,
    amount
) {
    const date =
        parseDateKey(dateKey);

    if (!date) {
        return "";
    }

    date.setDate(
        date.getDate() + amount
    );

    return getLocalDateKey(date);
}

function dateKeyToComparable(
    dateKey,
    time = "00:00"
) {
    const date =
        parseDateKey(dateKey);

    if (!date) {
        return 0;
    }

    const [
        hours,
        minutes
    ] = String(time || "00:00")
        .split(":")
        .map(Number);

    date.setHours(
        Number.isFinite(hours)
            ? hours
            : 0,
        Number.isFinite(minutes)
            ? minutes
            : 0,
        0,
        0
    );

    return date.getTime();
}

function formatDateLong(dateKey) {
    const date =
        parseDateKey(dateKey);

    if (!date) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}

function formatDateShortParts(
    dateKey
) {
    const date =
        parseDateKey(dateKey);

    if (!date) {
        return {
            day: "--",
            month: "---"
        };
    }

    return {
        day:
            String(
                date.getDate()
            ),
        month:
            new Intl.DateTimeFormat(
                "es-MX",
                {
                    month: "short"
                }
            )
                .format(date)
                .replace(".", "")
    };
}

function formatDuration(value) {
    const minutes =
        Number(value);

    if (
        !Number.isFinite(minutes) ||
        minutes <= 0
    ) {
        return "Sin duración";
    }

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    const rest =
        minutes % 60;

    if (!rest) {
        return (
            hours === 1
                ? "1 hora"
                : `${hours} horas`
        );
    }

    return `${hours} h ${rest} min`;
}

function timeToMinutes(value) {
    const [
        hours,
        minutes
    ] = String(value || "")
        .split(":")
        .map(Number);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return null;
    }

    return (
        hours * 60 +
        minutes
    );
}

function minutesToTime(value) {
    const total =
        Number(value);

    if (!Number.isFinite(total)) {
        return "";
    }

    const hours =
        Math.floor(total / 60);

    const minutes =
        total % 60;

    return `${pad(hours)}:${pad(minutes)}`;
}

function normalizeStatus(value) {
    const status =
        normalizeText(value)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    if (
        STATUS_DATA[status]
    ) {
        return status;
    }

    return "agendada";
}

function normalizeOrderStatus(value) {
    const status =
        normalizeText(value)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    if (
        [
            "recibido",
            "en_proceso",
            "terminado",
            "entregado"
        ].includes(status)
    ) {
        return status;
    }

    if (
        status === "cancelado"
    ) {
        return "cancelada";
    }

    return "recibido";
}

function getStatusData(value) {
    return (
        STATUS_DATA[
            normalizeStatus(value)
        ] ||
        STATUS_DATA.agendada
    );
}

function getClientForAppointment(
    appointment
) {
    const client =
        clientsMap.get(
            appointment.clienteUid
        );

    return {
        uid:
            appointment.clienteUid ||
            client?.id ||
            "",
        nombre:
            appointment.clienteNombre ||
            client?.nombre ||
            client?.displayName ||
            appointment.clienteEmail ||
            "Cliente",
        email:
            appointment.clienteEmail ||
            client?.email ||
            "",
        telefono:
            appointment.clienteTelefono ||
            client?.telefono ||
            ""
    };
}

function getServiceForAppointment(
    appointment
) {
    return (
        servicesMap.get(
            appointment.servicioId
        ) ||
        {
            id:
                appointment.servicioId,
            nombre:
                appointment.servicioNombre ||
                "Servicio PMC",
            categoria:
                appointment.categoria ||
                "",
            duracionMinutos:
                appointment.duracionMinutos,
            precioDesde:
                appointment.precioEstimado
        }
    );
}

function getVehicleLabel(vehicle) {
    if (
        !vehicle ||
        typeof vehicle !== "object"
    ) {
        return "Vehículo";
    }

    return [
        vehicle.marca,
        vehicle.modelo,
        (
            Number(vehicle.anio) > 0
                ? vehicle.anio
                : ""
        )
    ]
        .filter(Boolean)
        .join(" ") ||
        "Vehículo";
}

function getVehicleTypeLabel(value) {
    const normalized =
        normalizeText(value);

    const labels = {
        hatchback:
            "Hatchback",
        sedan:
            "Sedán",
        suv:
            "SUV",
        pickup:
            "Pick-up",
        camioneta:
            "Camioneta",
        otro:
            "Otro"
    };

    return (
        labels[normalized] ||
        value ||
        "Sin categoría"
    );
}

function showToast(
    message,
    type = "success"
) {
    if (!adminToast) {
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

    if (type === "error") {
        adminToast.classList.add(
            "is-error"
        );
    }

    adminToast.innerHTML = `
        <i data-lucide="${
            type === "error"
                ? "circle-alert"
                : "circle-check"
        }"></i>

        <span>
            ${escapeHTML(message)}
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
            3500
        );
}

function openSidebar() {
    adminSidebar?.classList.add(
        "is-open"
    );

    document.body.classList.add(
        "admin-sidebar-open"
    );
}

function closeSidebar() {
    adminSidebar?.classList.remove(
        "is-open"
    );

    document.body.classList.remove(
        "admin-sidebar-open"
    );
}

function getCurrentUser() {
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
    window.location.href =
        `../../login.html?return=${encodeURIComponent(
            "js/admin/citas.html"
        )}`;
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

    if (adminInitials) {
        adminInitials.textContent =
            getInitials(name);
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

                if (adminInitials) {
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

        if (!snapshot.exists()) {
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

function setCurrentDateText() {
    if (!adminCurrentDate) {
        return;
    }

    const text =
        new Intl.DateTimeFormat(
            "es-MX",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        ).format(
            new Date()
        );

    adminCurrentDate.textContent =
        text.charAt(0)
            .toUpperCase() +
        text.slice(1);
}

async function loadAgendaConfig() {
    try {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "configuracion",
                    "agenda"
                )
            );

        agendaConfig =
            snapshot.exists()
                ? snapshot.data()
                : {};
    } catch (error) {
        console.error(
            "No se pudo cargar la configuración de agenda:",
            error
        );

        agendaConfig = {};
    }
}

async function loadClients() {
    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        clients =
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
                .filter(
                    (client) => {
                        const permissions =
                            getPermissions(
                                client
                            );

                        return (
                            client.activo !== false &&
                            (
                                client.rol ===
                                    "cliente" ||
                                permissions.cliente ===
                                    true
                            )
                        );
                    }
                );

        clients.sort(
            (a, b) =>
                String(
                    a.nombre ||
                    a.email ||
                    ""
                ).localeCompare(
                    String(
                        b.nombre ||
                        b.email ||
                        ""
                    ),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                )
        );

        clientsMap =
            new Map(
                clients.map(
                    (client) => [
                        client.id,
                        client
                    ]
                )
            );

        renderClientOptions();
    } catch (error) {
        console.error(
            "No se pudieron cargar los clientes:",
            error
        );

        clients = [];
        clientsMap =
            new Map();

        renderClientOptions();
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

        servicesMap =
            new Map(
                services.map(
                    (service) => [
                        service.id,
                        service
                    ]
                )
            );

        renderServiceOptions();
    } catch (error) {
        console.error(
            "No se pudieron cargar los servicios:",
            error
        );

        services = [];
        servicesMap =
            new Map();

        renderServiceOptions();
    }
}

async function loadAppointments() {
    if (appointmentsList) {
        appointmentsList.hidden =
            false;

        appointmentsList.innerHTML = `
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
        `;
    }

    if (appointmentsEmpty) {
        appointmentsEmpty.hidden =
            true;
    }

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

        renderSummary();
        applyFilters();
    } catch (error) {
        console.error(
            "No se pudieron cargar las citas:",
            error
        );

        appointments = [];
        filteredAppointments = [];

        renderSummary();
        renderAppointments();

        showToast(
            "No se pudieron cargar las citas.",
            "error"
        );
    }
}

function renderClientOptions() {
    if (!newAppointmentClient) {
        return;
    }

    newAppointmentClient.innerHTML = `
        <option value="">
            Selecciona un cliente
        </option>
    `;

    if (!clients.length) {
        const option =
            document.createElement(
                "option"
            );

        option.value = "";
        option.disabled =
            true;

        option.textContent =
            "No hay clientes registrados";

        newAppointmentClient.appendChild(
            option
        );

        return;
    }

    clients.forEach(
        (client) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                client.id;

            option.textContent =
                client.nombre
                    ? `${client.nombre}${client.email ? ` · ${client.email}` : ""}`
                    : (
                        client.email ||
                        "Cliente"
                    );

            newAppointmentClient.appendChild(
                option
            );
        }
    );
}

function renderServiceOptions() {
    if (!newAppointmentService) {
        return;
    }

    newAppointmentService.innerHTML = `
        <option value="">
            Selecciona un servicio
        </option>
    `;

    const availableServices =
        services
            .filter(
                (service) =>
                    service.activo !==
                        false &&
                    Number(
                        service.duracionMinutos
                    ) > 0
            )
            .sort(
                (a, b) => {
                    const orderA =
                        Number(
                            a.orden ??
                            9999
                        );

                    const orderB =
                        Number(
                            b.orden ??
                            9999
                        );

                    if (
                        orderA !==
                        orderB
                    ) {
                        return (
                            orderA -
                            orderB
                        );
                    }

                    return String(
                        a.nombre || ""
                    ).localeCompare(
                        String(
                            b.nombre || ""
                        ),
                        "es"
                    );
                }
            );

    if (!availableServices.length) {
        const option =
            document.createElement(
                "option"
            );

        option.disabled =
            true;

        option.value = "";

        option.textContent =
            "Configura la duración de un servicio primero";

        newAppointmentService.appendChild(
            option
        );

        return;
    }

    availableServices.forEach(
        (service) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                service.id;

            const status =
                normalizeText(
                    service.estado
                ) === "publicado"
                    ? ""
                    : " · Borrador";

            option.textContent =
                `${service.nombre || "Servicio"} · ${formatDuration(
                    service.duracionMinutos
                )}${status}`;

            newAppointmentService.appendChild(
                option
            );
        }
    );
}

function renderSummary() {
    const today =
        getLocalDateKey();

    const activeToday =
        appointments.filter(
            (appointment) =>
                appointment.fechaKey ===
                    today &&
                normalizeStatus(
                    appointment.estado
                ) !== "cancelada"
        ).length;

    const scheduled =
        appointments.filter(
            (appointment) =>
                normalizeStatus(
                    appointment.estado
                ) === "agendada"
        ).length;

    const confirmed =
        appointments.filter(
            (appointment) =>
                normalizeStatus(
                    appointment.estado
                ) === "confirmada"
        ).length;

    const progress =
        appointments.filter(
            (appointment) =>
                [
                    "recibido",
                    "en_proceso"
                ].includes(
                    normalizeStatus(
                        appointment.estado
                    )
                )
        ).length;

    const cancelled =
        appointments.filter(
            (appointment) =>
                normalizeStatus(
                    appointment.estado
                ) === "cancelada"
        ).length;

    if (appointmentsTodayCount) {
        appointmentsTodayCount.textContent =
            String(activeToday);
    }

    if (
        appointmentsScheduledCount
    ) {
        appointmentsScheduledCount.textContent =
            String(scheduled);
    }

    if (
        appointmentsConfirmedCount
    ) {
        appointmentsConfirmedCount.textContent =
            String(confirmed);
    }

    if (
        appointmentsProgressCount
    ) {
        appointmentsProgressCount.textContent =
            String(progress);
    }

    if (
        appointmentsCancelledCount
    ) {
        appointmentsCancelledCount.textContent =
            String(cancelled);
    }

    if (
        sidebarAppointmentsBadge
    ) {
        sidebarAppointmentsBadge.textContent =
            String(scheduled);

        sidebarAppointmentsBadge.hidden =
            scheduled <= 0;
    }
}

function getAppointmentSearchText(
    appointment
) {
    const client =
        getClientForAppointment(
            appointment
        );

    const service =
        getServiceForAppointment(
            appointment
        );

    const vehicle =
        appointment.vehiculo ||
        {};

    return normalizeText(
        [
            appointment.id,
            appointment.ordenId,
            client.nombre,
            client.email,
            client.telefono,
            service.nombre,
            service.categoria,
            vehicle.tipo,
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio,
            vehicle.color,
            appointment.fechaKey,
            appointment.horaInicio
        ]
            .filter(Boolean)
            .join(" ")
    );
}

function matchesStatus(
    appointment
) {
    if (
        statusFilter === "todos"
    ) {
        return true;
    }

    return (
        normalizeStatus(
            appointment.estado
        ) ===
        statusFilter
    );
}

function matchesDate(
    appointment
) {
    const appointmentDateKey =
        appointment.fechaKey ||
        "";

    if (specificDateFilter) {
        return (
            appointmentDateKey ===
            specificDateFilter
        );
    }

    if (
        dateFilter === "todas"
    ) {
        return true;
    }

    const today =
        getLocalDateKey();

    if (
        dateFilter === "hoy"
    ) {
        return (
            appointmentDateKey ===
            today
        );
    }

    if (
        dateFilter === "manana"
    ) {
        return (
            appointmentDateKey ===
            addDaysToDateKey(
                today,
                1
            )
        );
    }

    if (
        dateFilter === "proximos7"
    ) {
        const start =
            dateKeyToComparable(
                today
            );

        const end =
            dateKeyToComparable(
                addDaysToDateKey(
                    today,
                    7
                )
            );

        const current =
            dateKeyToComparable(
                appointmentDateKey
            );

        return (
            current >= start &&
            current <= end
        );
    }

    if (
        dateFilter === "pasadas"
    ) {
        return (
            appointmentDateKey <
            today
        );
    }

    return true;
}

function sortAppointments(items) {
    const now =
        Date.now();

    return [...items].sort(
        (a, b) => {
            const timeA =
                dateKeyToComparable(
                    a.fechaKey,
                    a.horaInicio
                );

            const timeB =
                dateKeyToComparable(
                    b.fechaKey,
                    b.horaInicio
                );

            const aFuture =
                timeA >= now;

            const bFuture =
                timeB >= now;

            if (
                aFuture &&
                !bFuture
            ) {
                return -1;
            }

            if (
                !aFuture &&
                bFuture
            ) {
                return 1;
            }

            if (
                aFuture &&
                bFuture
            ) {
                return (
                    timeA -
                    timeB
                );
            }

            return (
                timeB -
                timeA
            );
        }
    );
}

function applyFilters() {
    filteredAppointments =
        appointments.filter(
            (appointment) => {
                const searchMatches =
                    !searchTerm ||
                    getAppointmentSearchText(
                        appointment
                    ).includes(
                        searchTerm
                    );

                return (
                    searchMatches &&
                    matchesStatus(
                        appointment
                    ) &&
                    matchesDate(
                        appointment
                    )
                );
            }
        );

    filteredAppointments =
        sortAppointments(
            filteredAppointments
        );

    renderAppointments();
}

function updateResultsCount() {
    if (!appointmentsResultsCount) {
        return;
    }

    const count =
        filteredAppointments.length;

    appointmentsResultsCount.textContent =
        count === 1
            ? "1 cita"
            : `${count} citas`;
}

function createAppointmentCard(
    appointment
) {
    const client =
        getClientForAppointment(
            appointment
        );

    const service =
        getServiceForAppointment(
            appointment
        );

    const vehicle =
        appointment.vehiculo ||
        {};

    const status =
        getStatusData(
            appointment.estado
        );

    const dateParts =
        formatDateShortParts(
            appointment.fechaKey
        );

    const isPast =
        dateKeyToComparable(
            appointment.fechaKey,
            appointment.horaInicio
        ) < Date.now();

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "admin-appointment-card";

    if (isPast) {
        article.classList.add(
            "is-past"
        );
    }

    if (
        normalizeStatus(
            appointment.estado
        ) === "cancelada"
    ) {
        article.classList.add(
            "is-cancelled"
        );
    }

    article.innerHTML = `
        <div class="admin-appointment-card__date">

            <strong>
                ${escapeHTML(
                    dateParts.day
                )}
            </strong>

            <span>
                ${escapeHTML(
                    dateParts.month
                )}
            </span>

            <small>
                ${escapeHTML(
                    appointment.horaInicio ||
                    "--:--"
                )}
            </small>

        </div>

        <div class="admin-appointment-card__main">

            <h3>
                ${escapeHTML(
                    client.nombre
                )}
            </h3>

            <span>
                ${escapeHTML(
                    client.email ||
                    client.telefono ||
                    "Sin información de contacto"
                )}
            </span>

            <div class="admin-appointment-card__client">

                <i data-lucide="calendar-clock"></i>

                <span>
                    ${escapeHTML(
                        appointment.horaInicio ||
                        "--:--"
                    )}
                    ${
                        appointment.horaFin
                            ? ` – ${escapeHTML(
                                appointment.horaFin
                            )}`
                            : ""
                    }
                </span>

            </div>

        </div>

        <div class="admin-appointment-card__service">

            <i data-lucide="sparkles"></i>

            <div>

                <strong>
                    ${escapeHTML(
                        service.nombre ||
                        appointment.servicioNombre ||
                        "Servicio PMC"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        formatDuration(
                            appointment.duracionMinutos ||
                            service.duracionMinutos
                        )
                    )}
                </span>

            </div>

        </div>

        <div class="admin-appointment-card__vehicle">

            <i data-lucide="car-front"></i>

            <div>

                <strong>
                    ${escapeHTML(
                        getVehicleLabel(
                            vehicle
                        )
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        getVehicleTypeLabel(
                            vehicle.tipo
                        )
                    )}
                </span>

            </div>

        </div>

        <div class="admin-appointment-card__end">

            <span class="admin-status ${status.className}">
                ${escapeHTML(
                    status.label
                )}
            </span>

            <button
                type="button"
                class="admin-appointment-card__open"
                data-appointment-id="${escapeHTML(
                    appointment.id
                )}"
                aria-label="Ver cita"
                title="Ver detalle"
            >

                <i data-lucide="chevron-right"></i>

            </button>

        </div>
    `;

    return article;
}

function renderAppointments() {
    if (!appointmentsList) {
        return;
    }

    appointmentsList.innerHTML =
        "";

    updateResultsCount();

    if (
        !filteredAppointments.length
    ) {
        appointmentsList.hidden =
            true;

        if (appointmentsEmpty) {
            appointmentsEmpty.hidden =
                false;
        }

        return;
    }

    appointmentsList.hidden =
        false;

    if (appointmentsEmpty) {
        appointmentsEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    filteredAppointments.forEach(
        (appointment) => {
            fragment.appendChild(
                createAppointmentCard(
                    appointment
                )
            );
        }
    );

    appointmentsList.appendChild(
        fragment
    );

    initIcons();
}

function resetFilters() {
    searchTerm = "";
    statusFilter = "todos";
    dateFilter = "todas";
    specificDateFilter = "";

    if (appointmentSearch) {
        appointmentSearch.value =
            "";
    }

    if (
        appointmentStatusFilter
    ) {
        appointmentStatusFilter.value =
            "todos";
    }

    if (
        appointmentDateFilter
    ) {
        appointmentDateFilter.value =
            "todas";
    }

    if (
        appointmentSpecificDate
    ) {
        appointmentSpecificDate.value =
            "";
    }

    applyFilters();
}

function showToday() {
    searchTerm = "";
    statusFilter = "todos";
    dateFilter = "hoy";
    specificDateFilter = "";

    if (appointmentSearch) {
        appointmentSearch.value =
            "";
    }

    if (
        appointmentStatusFilter
    ) {
        appointmentStatusFilter.value =
            "todos";
    }

    if (
        appointmentDateFilter
    ) {
        appointmentDateFilter.value =
            "hoy";
    }

    if (
        appointmentSpecificDate
    ) {
        appointmentSpecificDate.value =
            "";
    }

    applyFilters();
}

function setStatusElement(
    element,
    statusValue
) {
    if (!element) {
        return;
    }

    const status =
        getStatusData(
            statusValue
        );

    element.className =
        `admin-status ${status.className}`;

    element.textContent =
        status.label;
}

function updateDetailActionButtons(
    appointment
) {
    const status =
        normalizeStatus(
            appointment.estado
        );

    [
        appointmentConfirmButton,
        appointmentReceiveButton,
        appointmentStartButton,
        appointmentFinishButton,
        appointmentCancelButton
    ].forEach(
        (button) => {
            if (button) {
                button.hidden =
                    true;
            }
        }
    );

    if (
        status === "agendada"
    ) {
        appointmentConfirmButton.hidden =
            false;

        appointmentCancelButton.hidden =
            false;

        return;
    }

    if (
        status === "confirmada"
    ) {
        appointmentReceiveButton.hidden =
            false;

        appointmentCancelButton.hidden =
            false;

        return;
    }

    if (
        status === "recibido"
    ) {
        appointmentStartButton.hidden =
            false;

        return;
    }

    if (
        status === "en_proceso"
    ) {
        appointmentFinishButton.hidden =
            false;
    }
}

function openAppointmentDetails(
    appointmentId
) {
    const appointment =
        appointments.find(
            (item) =>
                item.id ===
                appointmentId
        );

    if (
        !appointment ||
        !appointmentDetailsModal
    ) {
        return;
    }

    selectedAppointment =
        appointment;

    const client =
        getClientForAppointment(
            appointment
        );

    const service =
        getServiceForAppointment(
            appointment
        );

    const vehicle =
        appointment.vehiculo ||
        {};

    if (appointmentDetailsTitle) {
        appointmentDetailsTitle.textContent =
            service.nombre ||
            appointment.servicioNombre ||
            "Cita PMC";
    }

    if (appointmentDetailsFolio) {
        appointmentDetailsFolio.textContent =
            appointment.ordenId
                ? `Cita ${appointment.id} · Orden ${appointment.ordenId}`
                : `ID ${appointment.id}`;
    }

    setStatusElement(
        appointmentDetailsStatus,
        appointment.estado
    );

    if (appointmentClientName) {
        appointmentClientName.textContent =
            client.nombre;
    }

    if (appointmentClientEmail) {
        appointmentClientEmail.textContent =
            client.email ||
            "Sin correo";
    }

    if (appointmentClientPhone) {
        appointmentClientPhone.textContent =
            client.telefono ||
            "No disponible";
    }

    if (appointmentVehicleName) {
        appointmentVehicleName.textContent =
            getVehicleLabel(
                vehicle
            );
    }

    if (appointmentVehicleType) {
        appointmentVehicleType.textContent =
            getVehicleTypeLabel(
                vehicle.tipo
            );
    }

    if (appointmentVehicleColor) {
        appointmentVehicleColor.textContent =
            vehicle.color ||
            "No especificado";
    }

    if (appointmentServiceName) {
        appointmentServiceName.textContent =
            service.nombre ||
            "Servicio PMC";
    }

    if (
        appointmentServiceDuration
    ) {
        appointmentServiceDuration.textContent =
            formatDuration(
                appointment.duracionMinutos ||
                service.duracionMinutos
            );
    }

    if (
        appointmentEstimatedPrice
    ) {
        appointmentEstimatedPrice.textContent =
            appointment.precioEstimado !=
            null
                ? formatCurrency(
                    appointment.precioEstimado
                )
                : "Por confirmar";
    }

    if (appointmentDate) {
        appointmentDate.textContent =
            formatDateLong(
                appointment.fechaKey
            );
    }

    if (appointmentTime) {
        appointmentTime.textContent =
            appointment.horaInicio
                ? (
                    appointment.horaFin
                        ? `${appointment.horaInicio} – ${appointment.horaFin}`
                        : appointment.horaInicio
                )
                : "Sin horario";
    }

    if (
        appointmentReservedDuration
    ) {
        appointmentReservedDuration.textContent =
            formatDuration(
                appointment.duracionMinutos
            );
    }

    const notes =
        appointment.notas ||
        vehicle.notas ||
        appointment.motivo ||
        "";

    if (appointmentNotes) {
        appointmentNotes.textContent =
            notes ||
            "Sin notas.";
    }

    if (
        appointmentNotesSection
    ) {
        appointmentNotesSection.hidden =
            !notes;
    }

    updateDetailActionButtons(
        appointment
    );

    appointmentDetailsModal.classList.add(
        "is-open"
    );

    appointmentDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );

    initIcons();
}

function closeAppointmentDetails(
    clearSelection = true
) {
    appointmentDetailsModal
        ?.classList.remove(
            "is-open"
        );

    appointmentDetailsModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );

    if (clearSelection) {
        selectedAppointment =
            null;
    }
}

function getTransitionTimestampField(
    status
) {
    const fields = {
        confirmada:
            "confirmadaEn",
        recibido:
            "recibidoEn",
        en_proceso:
            "iniciadoEn",
        terminado:
            "terminadoEn",
        entregado:
            "entregadoEn"
    };

    return (
        fields[status] ||
        ""
    );
}

function updateLocalAppointment(
    appointmentId,
    values
) {
    const appointment =
        appointments.find(
            (item) =>
                item.id ===
                appointmentId
        );

    if (appointment) {
        Object.assign(
            appointment,
            values
        );
    }

    if (
        selectedAppointment?.id ===
        appointmentId
    ) {
        Object.assign(
            selectedAppointment,
            values
        );
    }
}

async function changeAppointmentStatus(
    newStatus
) {
    if (
        !selectedAppointment ||
        changingStatus ||
        receivingVehicle
    ) {
        return;
    }

    const appointmentId =
        selectedAppointment.id;

    changingStatus =
        true;

    try {
        const result =
            await runTransaction(
                db,
                async (
                    transaction
                ) => {
                    const appointmentReference =
                        doc(
                            db,
                            "citas",
                            appointmentId
                        );

                    const appointmentSnapshot =
                        await transaction.get(
                            appointmentReference
                        );

                    if (
                        !appointmentSnapshot.exists()
                    ) {
                        throw new Error(
                            "CITA_NO_EXISTE"
                        );
                    }

                    const appointmentData =
                        appointmentSnapshot.data();

                    const currentStatus =
                        normalizeStatus(
                            appointmentData.estado
                        );

                    const allowedTransitions = {
                        agendada:
                            "confirmada",
                        recibido:
                            "en_proceso",
                        en_proceso:
                            "terminado"
                    };

                    if (
                        allowedTransitions[
                            currentStatus
                        ] !==
                        newStatus
                    ) {
                        throw new Error(
                            "TRANSICION_INVALIDA"
                        );
                    }

                    let orderReference =
                        null;

                    let orderSnapshot =
                        null;

                    if (
                        [
                            "en_proceso",
                            "terminado"
                        ].includes(
                            newStatus
                        )
                    ) {
                        if (
                            !appointmentData.ordenId
                        ) {
                            throw new Error(
                                "ORDEN_REQUERIDA"
                            );
                        }

                        orderReference =
                            doc(
                                db,
                                "ordenes",
                                appointmentData.ordenId
                            );

                        orderSnapshot =
                            await transaction.get(
                                orderReference
                            );

                        if (
                            !orderSnapshot.exists()
                        ) {
                            throw new Error(
                                "ORDEN_NO_EXISTE"
                            );
                        }
                    }

                    const timestampField =
                        getTransitionTimestampField(
                            newStatus
                        );

                    const appointmentPayload = {
                        estado:
                            newStatus,
                        actualizadoEn:
                            serverTimestamp(),
                        actualizadoPor:
                            currentUser.uid
                    };

                    if (timestampField) {
                        appointmentPayload[
                            timestampField
                        ] =
                            serverTimestamp();
                    }

                    transaction.update(
                        appointmentReference,
                        appointmentPayload
                    );

                    if (
                        orderReference &&
                        orderSnapshot
                    ) {
                        const orderData =
                            orderSnapshot.data();

                        const orderCurrentStatus =
                            normalizeOrderStatus(
                                orderData.estado
                            );

                        const expectedOrderStatus =
                            newStatus ===
                            "en_proceso"
                                ? "recibido"
                                : "en_proceso";

                        if (
                            orderCurrentStatus !==
                            expectedOrderStatus
                        ) {
                            throw new Error(
                                "ORDEN_ESTADO_INVALIDO"
                            );
                        }

                        const orderPayload = {
                            estado:
                                newStatus,
                            actualizadoEn:
                                serverTimestamp(),
                            actualizadoPor:
                                currentUser.uid
                        };

                        if (timestampField) {
                            orderPayload[
                                timestampField
                            ] =
                                serverTimestamp();
                        }

                        transaction.update(
                            orderReference,
                            orderPayload
                        );
                    }

                    return {
                        ordenId:
                            appointmentData.ordenId ||
                            ""
                    };
                }
            );

        updateLocalAppointment(
            appointmentId,
            {
                estado:
                    newStatus,
                ordenId:
                    result.ordenId ||
                    selectedAppointment
                        ?.ordenId ||
                    ""
            }
        );

        renderSummary();
        applyFilters();

        setStatusElement(
            appointmentDetailsStatus,
            newStatus
        );

        updateDetailActionButtons(
            selectedAppointment
        );

        const messages = {
            confirmada:
                "Cita confirmada correctamente.",
            en_proceso:
                "Trabajo iniciado correctamente.",
            terminado:
                "Trabajo marcado como terminado."
        };

        showToast(
            messages[newStatus] ||
            "Cita actualizada correctamente."
        );
    } catch (error) {
        console.error(
            "No se pudo actualizar el estado de la cita:",
            error
        );

        if (
            error.message ===
            "TRANSICION_INVALIDA"
        ) {
            showToast(
                "El estado de la cita cambió. Recarga la información.",
                "error"
            );
        } else if (
            error.message ===
                "ORDEN_REQUERIDA" ||
            error.message ===
                "ORDEN_NO_EXISTE"
        ) {
            showToast(
                "Esta cita no tiene una orden de trabajo válida.",
                "error"
            );
        } else if (
            error.message ===
            "ORDEN_ESTADO_INVALIDO"
        ) {
            showToast(
                "La orden y la cita tienen estados diferentes. Recarga la página.",
                "error"
            );
        } else {
            showToast(
                "No se pudo actualizar la cita.",
                "error"
            );
        }
    } finally {
        changingStatus =
            false;
    }
}

function buildVehicleSnapshot(
    appointmentData
) {
    const vehicle =
        appointmentData.vehiculo &&
        typeof appointmentData
            .vehiculo ===
            "object"
            ? appointmentData.vehiculo
            : {};

    return {
        tipo:
            vehicle.tipo ||
            "",
        marca:
            vehicle.marca ||
            "",
        modelo:
            vehicle.modelo ||
            "",
        anio:
            numberOrNull(
                vehicle.anio
            ),
        color:
            vehicle.color ||
            "",
        notas:
            vehicle.notas ||
            ""
    };
}

async function receiveVehicleAndCreateOrder() {
    if (
        !selectedAppointment ||
        receivingVehicle ||
        changingStatus
    ) {
        return;
    }

    const appointmentId =
        selectedAppointment.id;

    receivingVehicle =
        true;

    if (appointmentReceiveButton) {
        appointmentReceiveButton.disabled =
            true;

        appointmentReceiveButton.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Recibiendo...
        `;

        initIcons();
    }

    try {
        const result =
            await runTransaction(
                db,
                async (
                    transaction
                ) => {
                    const appointmentReference =
                        doc(
                            db,
                            "citas",
                            appointmentId
                        );

                    const appointmentSnapshot =
                        await transaction.get(
                            appointmentReference
                        );

                    if (
                        !appointmentSnapshot.exists()
                    ) {
                        throw new Error(
                            "CITA_NO_EXISTE"
                        );
                    }

                    const appointmentData =
                        appointmentSnapshot.data();

                    const appointmentStatus =
                        normalizeStatus(
                            appointmentData.estado
                        );

                    const orderId =
                        appointmentData.ordenId ||
                        appointmentId;

                    const orderReference =
                        doc(
                            db,
                            "ordenes",
                            orderId
                        );

                    const orderSnapshot =
                        await transaction.get(
                            orderReference
                        );

                    if (
                        orderSnapshot.exists()
                    ) {
                        const existingOrder =
                            orderSnapshot.data();

                        const existingStatus =
                            normalizeOrderStatus(
                                existingOrder.estado
                            );

                        transaction.update(
                            appointmentReference,
                            {
                                ordenId:
                                    orderId,
                                estado:
                                    existingStatus,
                                actualizadoEn:
                                    serverTimestamp(),
                                actualizadoPor:
                                    currentUser.uid
                            }
                        );

                        return {
                            orderId,
                            status:
                                existingStatus,
                            created:
                                false
                        };
                    }

                    if (
                        appointmentStatus !==
                        "confirmada"
                    ) {
                        throw new Error(
                            "CITA_NO_CONFIRMADA"
                        );
                    }

                    const client =
                        getClientForAppointment(
                            {
                                id:
                                    appointmentId,
                                ...appointmentData
                            }
                        );

                    const service =
                        getServiceForAppointment(
                            {
                                id:
                                    appointmentId,
                                ...appointmentData
                            }
                        );

                    const vehicle =
                        buildVehicleSnapshot(
                            appointmentData
                        );

                    const notes =
                        appointmentData.notas ||
                        vehicle.notas ||
                        "";

                    const orderData = {
                        citaId:
                            appointmentId,
                        clienteUid:
                            appointmentData.clienteUid ||
                            client.uid ||
                            "",
                        clienteNombre:
                            appointmentData.clienteNombre ||
                            client.nombre ||
                            "",
                        clienteEmail:
                            appointmentData.clienteEmail ||
                            client.email ||
                            "",
                        clienteTelefono:
                            appointmentData.clienteTelefono ||
                            client.telefono ||
                            "",
                        servicioId:
                            appointmentData.servicioId ||
                            service.id ||
                            "",
                        servicioNombre:
                            appointmentData.servicioNombre ||
                            service.nombre ||
                            "Servicio PMC",
                        categoria:
                            appointmentData.categoria ||
                            service.categoria ||
                            "",
                        duracionMinutos:
                            Number(
                                appointmentData.duracionMinutos ||
                                service.duracionMinutos ||
                                0
                            ),
                        precioEstimado:
                            appointmentData.precioEstimado ??
                            service.precioDesde ??
                            null,
                        vehiculo:
                            vehicle,
                        fechaKey:
                            appointmentData.fechaKey ||
                            "",
                        horaInicio:
                            appointmentData.horaInicio ||
                            "",
                        horaFin:
                            appointmentData.horaFin ||
                            "",
                        slotsReservados:
                            Array.isArray(
                                appointmentData.slotsReservados
                            )
                                ? appointmentData.slotsReservados
                                : [],
                        notas:
                            notes,
                        estado:
                            "recibido",
                        pagoEstado:
                            appointmentData.pagoEstado ||
                            "pendiente",
                        origen:
                            "cita",
                        recibidoEn:
                            serverTimestamp(),
                        creadoEn:
                            serverTimestamp(),
                        actualizadoEn:
                            serverTimestamp(),
                        creadoPor:
                            currentUser.uid,
                        actualizadoPor:
                            currentUser.uid
                    };

                    transaction.set(
                        orderReference,
                        orderData
                    );

                    transaction.update(
                        appointmentReference,
                        {
                            estado:
                                "recibido",
                            ordenId:
                                orderId,
                            recibidoEn:
                                serverTimestamp(),
                            actualizadoEn:
                                serverTimestamp(),
                            actualizadoPor:
                                currentUser.uid
                        }
                    );

                    return {
                        orderId,
                        status:
                            "recibido",
                        created:
                            true
                    };
                }
            );

        updateLocalAppointment(
            appointmentId,
            {
                estado:
                    result.status,
                ordenId:
                    result.orderId
            }
        );

        renderSummary();
        applyFilters();

        setStatusElement(
            appointmentDetailsStatus,
            result.status
        );

        if (
            appointmentDetailsFolio
        ) {
            appointmentDetailsFolio.textContent =
                `Cita ${appointmentId} · Orden ${result.orderId}`;
        }

        updateDetailActionButtons(
            selectedAppointment
        );

        if (result.created) {
            showToast(
                "Vehículo recibido. Orden de trabajo creada."
            );
        } else {
            showToast(
                "La orden ya existía. Se sincronizó con la cita."
            );
        }
    } catch (error) {
        console.error(
            "No se pudo recibir el vehículo:",
            error
        );

        if (
            error.message ===
            "CITA_NO_CONFIRMADA"
        ) {
            showToast(
                "La cita debe estar confirmada antes de recibir el vehículo.",
                "error"
            );
        } else {
            showToast(
                "No se pudo recibir el vehículo ni crear la orden.",
                "error"
            );
        }
    } finally {
        receivingVehicle =
            false;

        if (appointmentReceiveButton) {
            appointmentReceiveButton.disabled =
                false;

            appointmentReceiveButton.innerHTML = `
                <i data-lucide="car-front"></i>
                Recibir vehículo
            `;

            initIcons();
        }
    }
}

function openCancelAppointmentModal() {
    if (
        !selectedAppointment ||
        !cancelAppointmentModal
    ) {
        return;
    }

    closeAppointmentDetails(
        false
    );

    if (
        cancelAppointmentReason
    ) {
        cancelAppointmentReason.value =
            "";
    }

    cancelAppointmentModal.classList.add(
        "is-open"
    );

    cancelAppointmentModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );
}

function closeCancelAppointmentModal(
    reopenDetails = false
) {
    if (
        cancellingAppointment
    ) {
        return;
    }

    cancelAppointmentModal
        ?.classList.remove(
            "is-open"
        );

    cancelAppointmentModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );

    if (
        reopenDetails &&
        selectedAppointment
    ) {
        openAppointmentDetails(
            selectedAppointment.id
        );
    }
}

async function cancelSelectedAppointment() {
    if (
        !selectedAppointment ||
        cancellingAppointment
    ) {
        return;
    }

    if (
        selectedAppointment.ordenId
    ) {
        showToast(
            "La cita ya tiene una orden de trabajo y no puede cancelarse desde aquí.",
            "error"
        );

        return;
    }

    cancellingAppointment =
        true;

    if (cancelAppointmentConfirm) {
        cancelAppointmentConfirm.disabled =
            true;

        cancelAppointmentConfirm.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Cancelando...
        `;

        initIcons();
    }

    try {
        const appointmentId =
            selectedAppointment.id;

        const slotsSnapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "agendaSlots"
                    ),
                    where(
                        "citaId",
                        "==",
                        appointmentId
                    )
                )
            );

        const batch =
            writeBatch(db);

        batch.update(
            doc(
                db,
                "citas",
                appointmentId
            ),
            {
                estado:
                    "cancelada",
                motivoCancelacion:
                    cancelAppointmentReason
                        ?.value
                        .trim() ||
                    "",
                canceladaEn:
                    serverTimestamp(),
                canceladaPor:
                    currentUser.uid,
                actualizadoEn:
                    serverTimestamp(),
                actualizadoPor:
                    currentUser.uid
            }
        );

        slotsSnapshot.docs.forEach(
            (
                documentSnapshot
            ) => {
                batch.delete(
                    documentSnapshot.ref
                );
            }
        );

        await batch.commit();

        updateLocalAppointment(
            appointmentId,
            {
                estado:
                    "cancelada",
                motivoCancelacion:
                    cancelAppointmentReason
                        ?.value
                        .trim() ||
                    ""
            }
        );

        selectedAppointment =
            null;

        cancellingAppointment =
            false;

        cancelAppointmentConfirm.disabled =
            false;

        cancelAppointmentConfirm.innerHTML = `
            <i data-lucide="calendar-x"></i>
            Cancelar cita
        `;

        cancelAppointmentModal
            ?.classList.remove(
                "is-open"
            );

        cancelAppointmentModal
            ?.setAttribute(
                "aria-hidden",
                "true"
            );

        document.body.classList.remove(
            "admin-modal-open"
        );

        renderSummary();
        applyFilters();
        initIcons();

        showToast(
            "Cita cancelada y horario liberado."
        );
    } catch (error) {
        console.error(
            "No se pudo cancelar la cita:",
            error
        );

        cancellingAppointment =
            false;

        if (cancelAppointmentConfirm) {
            cancelAppointmentConfirm.disabled =
                false;

            cancelAppointmentConfirm.innerHTML = `
                <i data-lucide="calendar-x"></i>
                Cancelar cita
            `;
        }

        initIcons();

        showToast(
            "No se pudo cancelar la cita.",
            "error"
        );
    }
}

function getAgendaDayName(
    dateKey
) {
    const date =
        parseDateKey(dateKey);

    if (!date) {
        return "";
    }

    const days = [
        "domingo",
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado"
    ];

    return days[
        date.getDay()
    ];
}

function normalizeDayConfig(
    value,
    fallback
) {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return fallback;
    }

    return {
        activo:
            value.activo !== false &&
            value.cerrado !== true,
        apertura:
            value.apertura ||
            value.inicio ||
            value.desde ||
            value.horaInicio ||
            fallback.apertura,
        cierre:
            value.cierre ||
            value.fin ||
            value.hasta ||
            value.horaFin ||
            fallback.cierre
    };
}

function getDaySchedule(
    dateKey
) {
    const dayName =
        getAgendaDayName(
            dateKey
        );

    if (!dayName) {
        return null;
    }

    const fallback =
        DEFAULT_AGENDA.horarios[
            dayName
        ];

    const sources = [
        agendaConfig.horarios,
        agendaConfig.dias,
        agendaConfig.semana
    ];

    for (
        const source of sources
    ) {
        if (
            source &&
            typeof source ===
                "object" &&
            source[dayName]
        ) {
            return normalizeDayConfig(
                source[dayName],
                fallback
            );
        }
    }

    if (
        agendaConfig[dayName] &&
        typeof agendaConfig[
            dayName
        ] === "object"
    ) {
        return normalizeDayConfig(
            agendaConfig[dayName],
            fallback
        );
    }

    return fallback;
}

function getAgendaInterval() {
    const interval =
        Number(
            agendaConfig.intervaloMinutos
        );

    if (
        Number.isFinite(interval) &&
        interval >= 10
    ) {
        return interval;
    }

    return (
        DEFAULT_AGENDA
            .intervaloMinutos
    );
}

function getAdvanceMinutes() {
    const direct =
        Number(
            agendaConfig
                .anticipacionMinutos
        );

    if (
        Number.isFinite(direct) &&
        direct >= 0
    ) {
        return direct;
    }

    const hours =
        Number(
            agendaConfig
                .anticipacionHoras
        );

    if (
        Number.isFinite(hours) &&
        hours >= 0
    ) {
        return (
            hours * 60
        );
    }

    return (
        DEFAULT_AGENDA
            .anticipacionMinutos
    );
}

function dateIsBlocked(
    dateKey
) {
    const possibleLists = [
        agendaConfig.fechasBloqueadas,
        agendaConfig.diasBloqueados,
        agendaConfig.bloqueos
    ];

    return possibleLists.some(
        (value) => {
            if (
                Array.isArray(value)
            ) {
                return value.some(
                    (item) => {
                        if (
                            typeof item ===
                            "string"
                        ) {
                            return (
                                item ===
                                dateKey
                            );
                        }

                        return (
                            item?.fecha ===
                                dateKey ||
                            item?.fechaKey ===
                                dateKey
                        );
                    }
                );
            }

            if (
                value &&
                typeof value ===
                    "object"
            ) {
                return (
                    value[dateKey] ===
                        true ||
                    value[dateKey]
                        ?.activo ===
                        true
                );
            }

            return false;
        }
    );
}

function getRequiredSlots(
    startTime,
    durationMinutes
) {
    const interval =
        getAgendaInterval();

    const start =
        timeToMinutes(
            startTime
        );

    if (
        start == null ||
        !Number.isFinite(
            durationMinutes
        ) ||
        durationMinutes <= 0
    ) {
        return [];
    }

    const count =
        Math.ceil(
            durationMinutes /
            interval
        );

    return Array.from(
        {
            length:
                count
        },
        (
            _,
            index
        ) =>
            minutesToTime(
                start +
                index *
                    interval
            )
    );
}

function getEndTime(
    startTime,
    durationMinutes
) {
    const start =
        timeToMinutes(
            startTime
        );

    if (
        start == null
    ) {
        return "";
    }

    return minutesToTime(
        start +
        durationMinutes
    );
}

async function loadOccupiedSlots(
    dateKey
) {
    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    "agendaSlots"
                ),
                where(
                    "fechaKey",
                    "==",
                    dateKey
                )
            )
        );

    return new Set(
        snapshot.docs
            .map(
                (
                    documentSnapshot
                ) =>
                    documentSnapshot.data()
            )
            .filter(
                (data) =>
                    data.estado ===
                        "ocupado" &&
                    data.hora
            )
            .map(
                (data) =>
                    data.hora
            )
    );
}

function setTimeSelectMessage(
    message
) {
    if (!newAppointmentTime) {
        return;
    }

    newAppointmentTime.innerHTML =
        "";

    const option =
        document.createElement(
            "option"
        );

    option.value = "";
    option.textContent =
        message;

    newAppointmentTime.appendChild(
        option
    );
}

async function loadManualAvailability() {
    availableManualTimes =
        [];

    const serviceId =
        newAppointmentService
            ?.value ||
        "";

    const dateKey =
        newAppointmentDate
            ?.value ||
        "";

    if (
        !serviceId ||
        !dateKey
    ) {
        setTimeSelectMessage(
            "Selecciona servicio y fecha"
        );

        return;
    }

    const service =
        servicesMap.get(
            serviceId
        );

    const duration =
        Number(
            service?.duracionMinutos
        );

    if (
        !service ||
        !Number.isFinite(
            duration
        ) ||
        duration <= 0
    ) {
        setTimeSelectMessage(
            "El servicio no tiene duración configurada"
        );

        return;
    }

    if (
        dateIsBlocked(
            dateKey
        )
    ) {
        setTimeSelectMessage(
            "Fecha no disponible"
        );

        return;
    }

    const schedule =
        getDaySchedule(
            dateKey
        );

    if (
        !schedule ||
        schedule.activo === false
    ) {
        setTimeSelectMessage(
            "PMC no trabaja este día"
        );

        return;
    }

    const open =
        timeToMinutes(
            schedule.apertura
        );

    const close =
        timeToMinutes(
            schedule.cierre
        );

    if (
        open == null ||
        close == null ||
        close <= open
    ) {
        setTimeSelectMessage(
            "Horario no configurado"
        );

        return;
    }

    setTimeSelectMessage(
        "Consultando disponibilidad..."
    );

    try {
        const occupied =
            await loadOccupiedSlots(
                dateKey
            );

        const interval =
            getAgendaInterval();

        const requiredCount =
            Math.ceil(
                duration /
                interval
            );

        const lastStart =
            close -
            duration;

        const today =
            getLocalDateKey();

        const now =
            new Date();

        const minimumTime =
            now.getHours() *
                60 +
            now.getMinutes() +
            getAdvanceMinutes();

        for (
            let start = open;
            start <= lastStart;
            start += interval
        ) {
            if (
                dateKey === today &&
                start < minimumTime
            ) {
                continue;
            }

            const slots =
                Array.from(
                    {
                        length:
                            requiredCount
                    },
                    (
                        _,
                        index
                    ) =>
                        minutesToTime(
                            start +
                            index *
                                interval
                        )
                );

            const conflict =
                slots.some(
                    (slot) =>
                        occupied.has(
                            slot
                        )
                );

            if (conflict) {
                continue;
            }

            availableManualTimes.push(
                {
                    horaInicio:
                        minutesToTime(
                            start
                        ),
                    horaFin:
                        minutesToTime(
                            start +
                            duration
                        ),
                    slots
                }
            );
        }

        if (
            !availableManualTimes.length
        ) {
            setTimeSelectMessage(
                "No hay horarios disponibles"
            );

            return;
        }

        newAppointmentTime.innerHTML = `
            <option value="">
                Selecciona un horario
            </option>
        `;

        availableManualTimes.forEach(
            (item) => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    item.horaInicio;

                option.textContent =
                    `${item.horaInicio} – ${item.horaFin}`;

                newAppointmentTime.appendChild(
                    option
                );
            }
        );
    } catch (error) {
        console.error(
            "No se pudo consultar disponibilidad:",
            error
        );

        setTimeSelectMessage(
            "No se pudo consultar disponibilidad"
        );
    }
}

function getPriceForVehicle(
    service,
    vehicleType
) {
    if (!service) {
        return null;
    }

    const prices =
        service.precios;

    if (
        prices &&
        typeof prices ===
            "object" &&
        !Array.isArray(
            prices
        )
    ) {
        const entry =
            prices[
                vehicleType
            ];

        if (
            typeof entry ===
            "number"
        ) {
            return entry;
        }

        if (
            entry &&
            typeof entry ===
                "object"
        ) {
            const value =
                Number(
                    entry.desde ??
                    entry.precio ??
                    entry.valor
                );

            if (
                Number.isFinite(
                    value
                )
            ) {
                return value;
            }
        }
    }

    const direct =
        Number(
            service.precioDesde
        );

    return Number.isFinite(
        direct
    )
        ? direct
        : null;
}

function openNewAppointmentModal() {
    if (!newAppointmentModal) {
        return;
    }

    const today =
        getLocalDateKey();

    if (newAppointmentDate) {
        newAppointmentDate.min =
            today;

        if (
            !newAppointmentDate.value
        ) {
            newAppointmentDate.value =
                today;
        }
    }

    setTimeSelectMessage(
        "Selecciona un servicio"
    );

    newAppointmentModal.classList.add(
        "is-open"
    );

    newAppointmentModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );

    initIcons();

    if (
        newAppointmentService?.value
    ) {
        loadManualAvailability();
    }
}

function closeNewAppointmentModal() {
    if (creatingAppointment) {
        return;
    }

    newAppointmentModal
        ?.classList.remove(
            "is-open"
        );

    newAppointmentModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );
}

function resetNewAppointmentForm() {
    newAppointmentForm?.reset();

    if (newAppointmentDate) {
        newAppointmentDate.min =
            getLocalDateKey();
    }

    setTimeSelectMessage(
        "Selecciona primero una fecha"
    );

    availableManualTimes =
        [];
}

function setCreatingState(
    state
) {
    creatingAppointment =
        state;

    if (!newAppointmentSubmit) {
        return;
    }

    newAppointmentSubmit.disabled =
        state;

    if (state) {
        newAppointmentSubmit.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Creando cita...
        `;
    } else {
        newAppointmentSubmit.innerHTML = `
            <i data-lucide="calendar-check-2"></i>
            Crear cita
        `;
    }

    initIcons();
}

async function verifyRequiredSlotsFree(
    dateKey,
    requiredSlots
) {
    const occupied =
        await loadOccupiedSlots(
            dateKey
        );

    return !requiredSlots.some(
        (slot) =>
            occupied.has(
                slot
            )
    );
}

async function createManualAppointment(
    event
) {
    event.preventDefault();

    if (creatingAppointment) {
        return;
    }

    const clientId =
        newAppointmentClient
            ?.value ||
        "";

    const serviceId =
        newAppointmentService
            ?.value ||
        "";

    const dateKey =
        newAppointmentDate
            ?.value ||
        "";

    const startTime =
        newAppointmentTime
            ?.value ||
        "";

    const brand =
        newAppointmentVehicleBrand
            ?.value
            .trim() ||
        "";

    const model =
        newAppointmentVehicleModel
            ?.value
            .trim() ||
        "";

    if (
        !clientId ||
        !serviceId ||
        !dateKey ||
        !startTime ||
        !brand ||
        !model
    ) {
        showToast(
            "Completa los campos obligatorios.",
            "error"
        );

        return;
    }

    const client =
        clientsMap.get(
            clientId
        );

    const service =
        servicesMap.get(
            serviceId
        );

    if (
        !client ||
        !service
    ) {
        showToast(
            "Cliente o servicio no válido.",
            "error"
        );

        return;
    }

    const duration =
        Number(
            service.duracionMinutos
        );

    if (
        !Number.isFinite(
            duration
        ) ||
        duration <= 0
    ) {
        showToast(
            "El servicio no tiene duración configurada.",
            "error"
        );

        return;
    }

    const availability =
        availableManualTimes.find(
            (item) =>
                item.horaInicio ===
                startTime
        );

    const requiredSlots =
        availability?.slots ||
        getRequiredSlots(
            startTime,
            duration
        );

    if (
        !requiredSlots.length
    ) {
        showToast(
            "No se pudo calcular el horario.",
            "error"
        );

        return;
    }

    setCreatingState(true);

    try {
        const stillFree =
            await verifyRequiredSlotsFree(
                dateKey,
                requiredSlots
            );

        if (!stillFree) {
            throw new Error(
                "HORARIO_OCUPADO"
            );
        }

        const appointmentReference =
            doc(
                collection(
                    db,
                    "citas"
                )
            );

        const vehicleType =
            newAppointmentVehicleType
                ?.value ||
            "otro";

        const year =
            numberOrNull(
                newAppointmentVehicleYear
                    ?.value
            );

        const notes =
            newAppointmentNotes
                ?.value
                .trim() ||
            "";

        const price =
            getPriceForVehicle(
                service,
                vehicleType
            );

        const endTime =
            getEndTime(
                startTime,
                duration
            );

        const batch =
            writeBatch(db);

        batch.set(
            appointmentReference,
            {
                clienteUid:
                    client.id,
                clienteNombre:
                    client.nombre ||
                    "",
                clienteEmail:
                    client.email ||
                    "",
                clienteTelefono:
                    client.telefono ||
                    "",
                servicioId:
                    service.id,
                servicioNombre:
                    service.nombre ||
                    "Servicio PMC",
                categoria:
                    service.categoria ||
                    "",
                vehiculo: {
                    tipo:
                        vehicleType,
                    marca:
                        brand,
                    modelo:
                        model,
                    anio:
                        year,
                    color:
                        "",
                    notas:
                        notes
                },
                fechaKey:
                    dateKey,
                horaInicio:
                    startTime,
                horaFin:
                    endTime,
                duracionMinutos:
                    duration,
                slotsReservados:
                    requiredSlots,
                precioEstimado:
                    price,
                estado:
                    "agendada",
                origen:
                    "admin",
                pagoEstado:
                    "pendiente",
                notas:
                    notes,
                creadoPor:
                    currentUser.uid,
                creadoEn:
                    serverTimestamp(),
                actualizadoEn:
                    serverTimestamp()
            }
        );

        requiredSlots.forEach(
            (slot) => {
                const slotReference =
                    doc(
                        collection(
                            db,
                            "agendaSlots"
                        )
                    );

                batch.set(
                    slotReference,
                    {
                        fechaKey:
                            dateKey,
                        hora:
                            slot,
                        citaId:
                            appointmentReference.id,
                        estado:
                            "ocupado",
                        creadoEn:
                            serverTimestamp(),
                        actualizadoEn:
                            serverTimestamp()
                    }
                );
            }
        );

        await batch.commit();

        setCreatingState(false);

        closeNewAppointmentModal();
        resetNewAppointmentForm();

        await loadAppointments();

        showToast(
            "Cita creada correctamente."
        );
    } catch (error) {
        console.error(
            "No se pudo crear la cita:",
            error
        );

        setCreatingState(false);

        if (
            error.message ===
            "HORARIO_OCUPADO"
        ) {
            showToast(
                "Ese horario acaba de ocuparse. Selecciona otro.",
                "error"
            );

            await loadManualAvailability();

            return;
        }

        showToast(
            "No se pudo crear la cita.",
            "error"
        );
    }
}

function bindFilters() {
    appointmentSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        appointmentSearch.value
                    );

                applyFilters();
            }
        );

    appointmentStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    appointmentStatusFilter.value;

                applyFilters();
            }
        );

    appointmentDateFilter
        ?.addEventListener(
            "change",
            () => {
                dateFilter =
                    appointmentDateFilter.value;

                specificDateFilter =
                    "";

                if (
                    appointmentSpecificDate
                ) {
                    appointmentSpecificDate.value =
                        "";
                }

                applyFilters();
            }
        );

    appointmentSpecificDate
        ?.addEventListener(
            "change",
            () => {
                specificDateFilter =
                    appointmentSpecificDate.value;

                if (
                    specificDateFilter
                ) {
                    dateFilter =
                        "todas";

                    if (
                        appointmentDateFilter
                    ) {
                        appointmentDateFilter.value =
                            "todas";
                    }
                }

                applyFilters();
            }
        );

    resetAppointmentFilters
        ?.addEventListener(
            "click",
            resetFilters
        );

    appointmentsEmptyReset
        ?.addEventListener(
            "click",
            resetFilters
        );

    todayAppointmentsButton
        ?.addEventListener(
            "click",
            showToday
        );
}

function bindAppointmentList() {
    appointmentsList
        ?.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-appointment-id]"
                    );

                if (!button) {
                    return;
                }

                openAppointmentDetails(
                    button.dataset
                        .appointmentId
                );
            }
        );
}

function bindDetailsModal() {
    appointmentDetailsBackdrop
        ?.addEventListener(
            "click",
            () => {
                closeAppointmentDetails();
            }
        );

    appointmentDetailsClose
        ?.addEventListener(
            "click",
            () => {
                closeAppointmentDetails();
            }
        );

    appointmentCloseButton
        ?.addEventListener(
            "click",
            () => {
                closeAppointmentDetails();
            }
        );

    appointmentConfirmButton
        ?.addEventListener(
            "click",
            () => {
                changeAppointmentStatus(
                    "confirmada"
                );
            }
        );

    appointmentReceiveButton
        ?.addEventListener(
            "click",
            receiveVehicleAndCreateOrder
        );

    appointmentStartButton
        ?.addEventListener(
            "click",
            () => {
                changeAppointmentStatus(
                    "en_proceso"
                );
            }
        );

    appointmentFinishButton
        ?.addEventListener(
            "click",
            () => {
                changeAppointmentStatus(
                    "terminado"
                );
            }
        );

    appointmentCancelButton
        ?.addEventListener(
            "click",
            openCancelAppointmentModal
        );
}

function bindCancelModal() {
    cancelAppointmentBackdrop
        ?.addEventListener(
            "click",
            () => {
                closeCancelAppointmentModal(
                    true
                );
            }
        );

    cancelAppointmentClose
        ?.addEventListener(
            "click",
            () => {
                closeCancelAppointmentModal(
                    true
                );
            }
        );

    cancelAppointmentAbort
        ?.addEventListener(
            "click",
            () => {
                closeCancelAppointmentModal(
                    true
                );
            }
        );

    cancelAppointmentConfirm
        ?.addEventListener(
            "click",
            cancelSelectedAppointment
        );
}

function bindNewAppointmentModal() {
    newAppointmentButton
        ?.addEventListener(
            "click",
            openNewAppointmentModal
        );

    newAppointmentButtonHero
        ?.addEventListener(
            "click",
            openNewAppointmentModal
        );

    newAppointmentBackdrop
        ?.addEventListener(
            "click",
            closeNewAppointmentModal
        );

    newAppointmentClose
        ?.addEventListener(
            "click",
            closeNewAppointmentModal
        );

    newAppointmentCancel
        ?.addEventListener(
            "click",
            closeNewAppointmentModal
        );

    newAppointmentService
        ?.addEventListener(
            "change",
            loadManualAvailability
        );

    newAppointmentDate
        ?.addEventListener(
            "change",
            loadManualAvailability
        );

    newAppointmentForm
        ?.addEventListener(
            "submit",
            createManualAppointment
        );
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
}

async function handleLogout() {
    if (!adminLogout) {
        return;
    }

    adminLogout.disabled =
        true;

    try {
        await signOut(auth);

        window.location.href =
            "../../login.html";
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

function bindLogout() {
    adminLogout
        ?.addEventListener(
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
                cancelAppointmentModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeCancelAppointmentModal(
                    true
                );

                return;
            }

            if (
                newAppointmentModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeNewAppointmentModal();

                return;
            }

            if (
                appointmentDetailsModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeAppointmentDetails();

                return;
            }

            closeSidebar();
        }
    );
}

async function init() {
    initIcons();
    setCurrentYear();
    setCurrentDateText();

    bindSidebar();
    bindLogout();
    bindFilters();
    bindAppointmentList();
    bindDetailsModal();
    bindCancelModal();
    bindNewAppointmentModal();
    bindKeyboard();

    if (newAppointmentDate) {
        newAppointmentDate.min =
            getLocalDateKey();
    }

    const allowed =
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    await Promise.all([
        loadAgendaConfig(),
        loadClients(),
        loadServices()
    ]);

    await loadAppointments();

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