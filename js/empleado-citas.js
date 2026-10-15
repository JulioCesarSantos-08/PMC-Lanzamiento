import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pageLoader =
    document.getElementById("pageLoader");

const employeeShell =
    document.getElementById("employeeShell");

const employeeAccessDenied =
    document.getElementById("employeeAccessDenied");

const employeeSidebar =
    document.getElementById("employeeSidebar");

const employeeSidebarBackdrop =
    document.getElementById("employeeSidebarBackdrop");

const employeeSidebarClose =
    document.getElementById("employeeSidebarClose");

const employeeMenuButton =
    document.getElementById("employeeMenuButton");

const employeeLogout =
    document.getElementById("employeeLogout");

const employeeAvatar =
    document.getElementById("employeeAvatar");

const employeeInitials =
    document.getElementById("employeeInitials");

const employeeName =
    document.getElementById("employeeName");

const employeeEmail =
    document.getElementById("employeeEmail");

const employeeFinanceButton =
    document.getElementById("employeeFinanceButton");

const employeeCurrentDate =
    document.getElementById("employeeCurrentDate");

const currentYear =
    document.getElementById("currentYear");

const employeeAppointmentsBadge =
    document.getElementById("employeeAppointmentsBadge");

const employeeOrdersBadge =
    document.getElementById("employeeOrdersBadge");

const employeeShowTodayButton =
    document.getElementById("employeeShowTodayButton");

const employeeTodayButton =
    document.getElementById("employeeTodayButton");

const employeeAppointmentsTodayCount =
    document.getElementById("employeeAppointmentsTodayCount");

const employeeAppointmentsScheduledCount =
    document.getElementById("employeeAppointmentsScheduledCount");

const employeeAppointmentsConfirmedCount =
    document.getElementById("employeeAppointmentsConfirmedCount");

const employeeAppointmentsReceivedCount =
    document.getElementById("employeeAppointmentsReceivedCount");

const employeeAppointmentSearch =
    document.getElementById("employeeAppointmentSearch");

const employeeAppointmentStatusFilter =
    document.getElementById("employeeAppointmentStatusFilter");

const employeeAppointmentDateFilter =
    document.getElementById("employeeAppointmentDateFilter");

const employeeAppointmentSpecificDate =
    document.getElementById("employeeAppointmentSpecificDate");

const employeeAppointmentsResultsCount =
    document.getElementById("employeeAppointmentsResultsCount");

const employeeResetAppointmentFilters =
    document.getElementById("employeeResetAppointmentFilters");

const employeeAppointmentsEmptyReset =
    document.getElementById("employeeAppointmentsEmptyReset");

const employeeAppointmentsList =
    document.getElementById("employeeAppointmentsList");

const employeeAppointmentsEmpty =
    document.getElementById("employeeAppointmentsEmpty");

const employeeAppointmentModal =
    document.getElementById("employeeAppointmentModal");

const employeeAppointmentBackdrop =
    document.getElementById("employeeAppointmentBackdrop");

const employeeAppointmentClose =
    document.getElementById("employeeAppointmentClose");

const employeeAppointmentCloseButton =
    document.getElementById("employeeAppointmentCloseButton");

const employeeAppointmentTitle =
    document.getElementById("employeeAppointmentTitle");

const employeeAppointmentFolio =
    document.getElementById("employeeAppointmentFolio");

const employeeAppointmentStatus =
    document.getElementById("employeeAppointmentStatus");

const employeeAppointmentClientName =
    document.getElementById("employeeAppointmentClientName");

const employeeAppointmentClientEmail =
    document.getElementById("employeeAppointmentClientEmail");

const employeeAppointmentClientPhone =
    document.getElementById("employeeAppointmentClientPhone");

const employeeAppointmentVehicleName =
    document.getElementById("employeeAppointmentVehicleName");

const employeeAppointmentVehicleType =
    document.getElementById("employeeAppointmentVehicleType");

const employeeAppointmentVehicleColor =
    document.getElementById("employeeAppointmentVehicleColor");

const employeeAppointmentServiceName =
    document.getElementById("employeeAppointmentServiceName");

const employeeAppointmentServiceDuration =
    document.getElementById("employeeAppointmentServiceDuration");

const employeeAppointmentEstimatedPrice =
    document.getElementById("employeeAppointmentEstimatedPrice");

const employeeAppointmentDate =
    document.getElementById("employeeAppointmentDate");

const employeeAppointmentTime =
    document.getElementById("employeeAppointmentTime");

const employeeAppointmentReservedDuration =
    document.getElementById("employeeAppointmentReservedDuration");

const employeeAppointmentNotesSection =
    document.getElementById("employeeAppointmentNotesSection");

const employeeAppointmentNotes =
    document.getElementById("employeeAppointmentNotes");

const employeeAppointmentConfirmButton =
    document.getElementById("employeeAppointmentConfirmButton");

const employeeAppointmentReceiveButton =
    document.getElementById("employeeAppointmentReceiveButton");

const employeeAppointmentOrderButton =
    document.getElementById("employeeAppointmentOrderButton");

const employeeToast =
    document.getElementById("employeeToast");

let currentUser = null;
let currentUserData = null;

let appointments = [];
let orders = [];
let filteredAppointments = [];

let selectedAppointment = null;

let searchTerm = "";
let statusFilter = "todos";
let dateFilter = "todas";
let specificDate = "";

let processingAction = false;
let toastTimer = null;

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
    },
    cancelado: {
        label: "Cancelado",
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

function normalizeStatus(value) {
    return normalizeText(value)
        .replaceAll(" ", "_")
        .replaceAll("-", "_");
}

function getStatusData(value) {
    const status =
        normalizeStatus(value);

    return (
        STATUS_DATA[status] ||
        STATUS_DATA.agendada
    );
}

function getPermissions(data) {
    if (
        data?.permisos &&
        typeof data.permisos === "object"
    ) {
        return data.permisos;
    }

    return {};
}

function userIsAdmin(data) {
    return (
        data?.rol === "admin" ||
        getPermissions(data).admin === true
    );
}

function userCanOperate(data) {
    return (
        userIsAdmin(data) ||
        data?.rol === "empleado" ||
        getPermissions(data).operacion === true
    );
}

function userHasFinance(data) {
    return (
        getPermissions(data).finanzas === true
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
        parts[parts.length - 1][0]
    ).toUpperCase();
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

function shiftDateKey(days) {
    const date =
        new Date();

    date.setHours(
        12,
        0,
        0,
        0
    );

    date.setDate(
        date.getDate() + days
    );

    return getLocalDateKey(date);
}

function parseDateKey(value) {
    const match =
        String(value || "")
            .match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );

    if (!match) {
        return null;
    }

    const date =
        new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3]),
            12,
            0,
            0,
            0
        );

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}

function formatDate(value) {
    const date =
        parseDateKey(value);

    if (!date) {
        return "Sin fecha";
    }

    const text =
        new Intl.DateTimeFormat(
            "es-MX",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);

    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );
}

function formatShortDate(value) {
    const date =
        parseDateKey(value);

    if (!date) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    )
        .format(date)
        .replace(".", "");
}

function timeToMinutes(value) {
    const [
        hours,
        minutes
    ] =
        String(value || "")
            .split(":")
            .map(Number);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return 0;
    }

    return (
        hours * 60 +
        minutes
    );
}

function getComparableDate(appointment) {
    const date =
        parseDateKey(
            appointment.fechaKey
        );

    if (!date) {
        return 0;
    }

    const minutes =
        timeToMinutes(
            appointment.horaInicio
        );

    date.setHours(
        Math.floor(
            minutes / 60
        ),
        minutes % 60,
        0,
        0
    );

    return date.getTime();
}

function getClientName(appointment) {
    return (
        appointment?.clienteNombre ||
        appointment?.nombreCliente ||
        appointment?.cliente?.nombre ||
        "Cliente PMC"
    );
}

function getClientEmail(appointment) {
    return (
        appointment?.clienteEmail ||
        appointment?.cliente?.email ||
        ""
    );
}

function getClientPhone(appointment) {
    return (
        appointment?.clienteTelefono ||
        appointment?.telefonoCliente ||
        appointment?.cliente?.telefono ||
        ""
    );
}

function getServiceName(appointment) {
    return (
        appointment?.servicioNombre ||
        appointment?.nombreServicio ||
        appointment?.servicio?.nombre ||
        "Servicio PMC"
    );
}

function getVehicle(appointment) {
    if (
        appointment?.vehiculo &&
        typeof appointment.vehiculo === "object"
    ) {
        return appointment.vehiculo;
    }

    return {};
}

function getVehicleName(vehicle) {
    return [
        vehicle?.marca,
        vehicle?.modelo,
        Number(vehicle?.anio) > 0
            ? vehicle.anio
            : ""
    ]
        .filter(Boolean)
        .join(" ") ||
        "Vehículo";
}

function formatVehicleType(value) {
    const types = {
        hatchback: "Hatchback",
        sedan: "Sedán",
        suv: "SUV",
        pickup: "Pick-up",
        "pick_up": "Pick-up",
        camioneta: "Camioneta",
        moto: "Moto",
        otro: "Otro"
    };

    const key =
        normalizeStatus(value);

    return (
        types[key] ||
        value ||
        "Sin categoría"
    );
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

    const hours =
        Math.floor(
            minutes / 60
        );

    const remaining =
        minutes % 60;

    if (
        hours > 0 &&
        remaining > 0
    ) {
        return `${hours} h ${remaining} min`;
    }

    if (hours > 0) {
        return `${hours} h`;
    }

    return `${remaining} min`;
}

function formatCurrency(value) {
    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return "Precio por confirmar";
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

function getEstimatedPrice(appointment) {
    const candidates = [
        appointment?.precioEstimado,
        appointment?.precio,
        appointment?.totalEstimado,
        appointment?.cotizacionTotal
    ];

    for (
        const value
        of candidates
    ) {
        const amount =
            Number(value);

        if (
            Number.isFinite(amount)
        ) {
            return amount;
        }
    }

    return null;
}

function getNotes(appointment) {
    return (
        appointment?.notas ||
        appointment?.observaciones ||
        appointment?.nota ||
        ""
    );
}

function showToast(
    message,
    type = "success"
) {
    if (!employeeToast) {
        return;
    }

    if (toastTimer) {
        window.clearTimeout(
            toastTimer
        );
    }

    employeeToast.hidden =
        false;

    employeeToast.classList.remove(
        "is-error"
    );

    if (type === "error") {
        employeeToast.classList.add(
            "is-error"
        );
    }

    employeeToast.innerHTML = `
        <i data-lucide="${
            type === "error"
                ? "circle-alert"
                : "circle-check"
        }"></i>

        <span>
            ${escapeHTML(message)}
        </span>
    `;

    employeeToast.classList.add(
        "is-visible"
    );

    initIcons();

    toastTimer =
        window.setTimeout(
            () => {
                employeeToast.classList.remove(
                    "is-visible"
                );

                window.setTimeout(
                    () => {
                        employeeToast.hidden =
                            true;
                    },
                    220
                );
            },
            3500
        );
}

function setCurrentYear() {
    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }
}

function setCurrentDateText() {
    if (!employeeCurrentDate) {
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

    employeeCurrentDate.textContent =
        text.charAt(0).toUpperCase() +
        text.slice(1);
}

function openSidebar() {
    employeeSidebar?.classList.add(
        "is-open"
    );

    document.body.classList.add(
        "employee-sidebar-open"
    );
}

function closeSidebar() {
    employeeSidebar?.classList.remove(
        "is-open"
    );

    document.body.classList.remove(
        "employee-sidebar-open"
    );
}

function getCurrentUser() {
    return new Promise(
        (resolve) => {
            let unsubscribe = () => {};

            unsubscribe =
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
        `../login.html?return=${encodeURIComponent(
            "empleado/citas.html"
        )}`;
}

function showAccessDenied() {
    if (employeeShell) {
        employeeShell.hidden =
            true;
    }

    if (employeeAccessDenied) {
        employeeAccessDenied.hidden =
            false;
    }

    hideLoader();
    initIcons();
}

function showEmployeePanel() {
    if (employeeAccessDenied) {
        employeeAccessDenied.hidden =
            true;
    }

    if (employeeShell) {
        employeeShell.hidden =
            false;
    }

    initIcons();
}

function renderEmployeeProfile() {
    const name =
        currentUserData?.nombre ||
        currentUser?.displayName ||
        "Empleado";

    const email =
        currentUserData?.email ||
        currentUser?.email ||
        "";

    const photo =
        currentUserData?.fotoURL ||
        currentUserData?.foto ||
        currentUser?.photoURL ||
        "";

    if (employeeName) {
        employeeName.textContent =
            name;
    }

    if (employeeEmail) {
        employeeEmail.textContent =
            email;
    }

    if (employeeInitials) {
        employeeInitials.textContent =
            getInitials(name);
    }

    if (
        employeeAvatar &&
        photo
    ) {
        employeeAvatar.src =
            photo;

        employeeAvatar.alt =
            name;

        employeeAvatar.hidden =
            false;

        if (employeeInitials) {
            employeeInitials.hidden =
                true;
        }

        employeeAvatar.onerror =
            () => {
                employeeAvatar.hidden =
                    true;

                if (employeeInitials) {
                    employeeInitials.hidden =
                        false;
                }
            };
    } else {
        if (employeeAvatar) {
            employeeAvatar.hidden =
                true;
        }

        if (employeeInitials) {
            employeeInitials.hidden =
                false;
        }
    }

    if (employeeFinanceButton) {
        employeeFinanceButton.hidden =
            !userHasFinance(
                currentUserData
            );
    }
}

async function validateEmployeeAccess() {
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
            !userCanOperate(
                currentUserData
            )
        ) {
            showAccessDenied();

            return false;
        }

        renderEmployeeProfile();
        showEmployeePanel();

        return true;
    } catch (error) {
        console.error(
            "No se pudo validar el acceso operativo:",
            error
        );

        showAccessDenied();

        return false;
    }
}

async function loadData() {
    if (employeeAppointmentsList) {
        employeeAppointmentsList.hidden =
            false;

        employeeAppointmentsList.innerHTML = `
            <div class="employee-skeleton"></div>
            <div class="employee-skeleton"></div>
            <div class="employee-skeleton"></div>
        `;
    }

    if (employeeAppointmentsEmpty) {
        employeeAppointmentsEmpty.hidden =
            true;
    }

    try {
        const [
            appointmentsSnapshot,
            ordersSnapshot
        ] =
            await Promise.all([
                getDocs(
                    collection(
                        db,
                        "citas"
                    )
                ),
                getDocs(
                    collection(
                        db,
                        "ordenes"
                    )
                )
            ]);

        appointments =
            appointmentsSnapshot.docs.map(
                (documentSnapshot) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );

        orders =
            ordersSnapshot.docs.map(
                (documentSnapshot) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );

        renderSummary();
        renderBadges();
        applyFilters();

        openAppointmentFromURL();
    } catch (error) {
        console.error(
            "No se pudieron cargar las citas:",
            error
        );

        appointments = [];
        orders = [];
        filteredAppointments = [];

        renderSummary();
        renderBadges();
        renderAppointments();

        showToast(
            "No se pudieron cargar las citas.",
            "error"
        );
    }
}

function renderSummary() {
    const today =
        getLocalDateKey();

    const todayAppointments =
        appointments.filter(
            (appointment) =>
                appointment.fechaKey ===
                    today &&
                ![
                    "cancelada",
                    "cancelado"
                ].includes(
                    normalizeStatus(
                        appointment.estado
                    )
                )
        );

    const scheduled =
        appointments.filter(
            (appointment) =>
                normalizeStatus(
                    appointment.estado
                ) === "agendada"
        );

    const confirmed =
        appointments.filter(
            (appointment) =>
                normalizeStatus(
                    appointment.estado
                ) === "confirmada"
        );

    const received =
        appointments.filter(
            (appointment) =>
                [
                    "recibido",
                    "en_proceso",
                    "terminado",
                    "entregado"
                ].includes(
                    normalizeStatus(
                        appointment.estado
                    )
                )
        );

    if (employeeAppointmentsTodayCount) {
        employeeAppointmentsTodayCount.textContent =
            String(
                todayAppointments.length
            );
    }

    if (employeeAppointmentsScheduledCount) {
        employeeAppointmentsScheduledCount.textContent =
            String(
                scheduled.length
            );
    }

    if (employeeAppointmentsConfirmedCount) {
        employeeAppointmentsConfirmedCount.textContent =
            String(
                confirmed.length
            );
    }

    if (employeeAppointmentsReceivedCount) {
        employeeAppointmentsReceivedCount.textContent =
            String(
                received.length
            );
    }
}

function renderBadges() {
    const today =
        getLocalDateKey();

    const pendingAppointments =
        appointments.filter(
            (appointment) =>
                appointment.fechaKey ===
                    today &&
                [
                    "agendada",
                    "confirmada"
                ].includes(
                    normalizeStatus(
                        appointment.estado
                    )
                )
        ).length;

    const activeOrders =
        orders.filter(
            (order) =>
                [
                    "recibido",
                    "en_proceso",
                    "terminado"
                ].includes(
                    normalizeStatus(
                        order.estado
                    )
                )
        ).length;

    if (employeeAppointmentsBadge) {
        employeeAppointmentsBadge.textContent =
            String(
                pendingAppointments
            );

        employeeAppointmentsBadge.hidden =
            pendingAppointments <= 0;
    }

    if (employeeOrdersBadge) {
        employeeOrdersBadge.textContent =
            String(
                activeOrders
            );

        employeeOrdersBadge.hidden =
            activeOrders <= 0;
    }
}

function getSearchText(appointment) {
    const vehicle =
        getVehicle(
            appointment
        );

    return normalizeText(
        [
            appointment.id,
            getClientName(
                appointment
            ),
            getClientEmail(
                appointment
            ),
            getClientPhone(
                appointment
            ),
            getServiceName(
                appointment
            ),
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio,
            vehicle.tipo,
            vehicle.color,
            appointment.fechaKey,
            appointment.horaInicio
        ]
            .filter(Boolean)
            .join(" ")
    );
}

function matchesStatusFilter(
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
        ) === statusFilter
    );
}

function matchesDateFilter(
    appointment
) {
    if (specificDate) {
        return (
            appointment.fechaKey ===
            specificDate
        );
    }

    const appointmentDate =
        appointment.fechaKey ||
        "";

    const today =
        getLocalDateKey();

    if (
        dateFilter === "todas"
    ) {
        return true;
    }

    if (
        dateFilter === "hoy"
    ) {
        return (
            appointmentDate ===
            today
        );
    }

    if (
        dateFilter === "manana"
    ) {
        return (
            appointmentDate ===
            shiftDateKey(1)
        );
    }

    if (
        dateFilter ===
        "proximos7"
    ) {
        const end =
            shiftDateKey(7);

        return (
            appointmentDate >=
                today &&
            appointmentDate <=
                end
        );
    }

    if (
        dateFilter === "pasadas"
    ) {
        return (
            appointmentDate <
            today
        );
    }

    return true;
}

function applyFilters() {
    filteredAppointments =
        appointments
            .filter(
                (appointment) => {
                    const matchesSearch =
                        !searchTerm ||
                        getSearchText(
                            appointment
                        ).includes(
                            searchTerm
                        );

                    return (
                        matchesSearch &&
                        matchesStatusFilter(
                            appointment
                        ) &&
                        matchesDateFilter(
                            appointment
                        )
                    );
                }
            )
            .sort(
                (a, b) =>
                    getComparableDate(a) -
                    getComparableDate(b)
            );

    renderAppointments();
}

function updateResultsCount() {
    if (!employeeAppointmentsResultsCount) {
        return;
    }

    const count =
        filteredAppointments.length;

    employeeAppointmentsResultsCount.textContent =
        count === 1
            ? "1 cita"
            : `${count} citas`;
}

function createAppointmentCard(
    appointment
) {
    const status =
        getStatusData(
            appointment.estado
        );

    const statusKey =
        normalizeStatus(
            appointment.estado
        );

    const vehicle =
        getVehicle(
            appointment
        );

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "employee-appointment-card";

    if (
        [
            "cancelada",
            "cancelado"
        ].includes(statusKey)
    ) {
        article.classList.add(
            "is-cancelled"
        );
    }

    article.innerHTML = `
        <div class="employee-appointment-card__time">

            <strong>
                ${escapeHTML(
                    appointment.horaInicio ||
                    "--:--"
                )}
            </strong>

            <span>
                ${escapeHTML(
                    appointment.horaFin ||
                    "PMC"
                )}
            </span>

        </div>

        <div class="employee-appointment-card__client">

            <h3>
                ${escapeHTML(
                    getClientName(
                        appointment
                    )
                )}
            </h3>

            <span>
                ${escapeHTML(
                    getClientPhone(
                        appointment
                    ) ||
                    getClientEmail(
                        appointment
                    ) ||
                    "Sin contacto"
                )}
            </span>

            <div class="employee-appointment-card__vehicle">

                <i data-lucide="car-front"></i>

                <span>
                    ${escapeHTML(
                        getVehicleName(
                            vehicle
                        )
                    )}
                </span>

            </div>

        </div>

        <div class="employee-appointment-card__service">

            <span>
                Servicio
            </span>

            <strong>
                ${escapeHTML(
                    getServiceName(
                        appointment
                    )
                )}
            </strong>

            <small>
                ${escapeHTML(
                    formatDuration(
                        appointment.duracionMinutos
                    )
                )}
            </small>

        </div>

        <div class="employee-appointment-card__date">

            <strong>
                ${escapeHTML(
                    formatShortDate(
                        appointment.fechaKey
                    )
                )}
            </strong>

            <span>
                ${escapeHTML(
                    formatVehicleType(
                        vehicle.tipo
                    )
                )}
            </span>

        </div>

        <div class="employee-appointment-card__end">

            <span class="employee-status ${status.className}">
                ${escapeHTML(
                    status.label
                )}
            </span>

            <button
                type="button"
                class="employee-appointment-card__open"
                data-appointment-id="${escapeHTML(
                    appointment.id
                )}"
                title="Abrir cita"
                aria-label="Abrir cita"
            >

                <i data-lucide="chevron-right"></i>

            </button>

        </div>
    `;

    return article;
}

function renderAppointments() {
    if (!employeeAppointmentsList) {
        return;
    }

    employeeAppointmentsList.innerHTML =
        "";

    updateResultsCount();

    if (
        !filteredAppointments.length
    ) {
        employeeAppointmentsList.hidden =
            true;

        if (employeeAppointmentsEmpty) {
            employeeAppointmentsEmpty.hidden =
                false;
        }

        return;
    }

    employeeAppointmentsList.hidden =
        false;

    if (employeeAppointmentsEmpty) {
        employeeAppointmentsEmpty.hidden =
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

    employeeAppointmentsList.appendChild(
        fragment
    );

    initIcons();
}

function setTodayFilter() {
    searchTerm = "";
    statusFilter = "todos";
    dateFilter = "hoy";
    specificDate = "";

    if (employeeAppointmentSearch) {
        employeeAppointmentSearch.value =
            "";
    }

    if (employeeAppointmentStatusFilter) {
        employeeAppointmentStatusFilter.value =
            "todos";
    }

    if (employeeAppointmentDateFilter) {
        employeeAppointmentDateFilter.value =
            "hoy";
    }

    if (employeeAppointmentSpecificDate) {
        employeeAppointmentSpecificDate.value =
            "";
    }

    applyFilters();
}

function resetFilters() {
    searchTerm = "";
    statusFilter = "todos";
    dateFilter = "todas";
    specificDate = "";

    if (employeeAppointmentSearch) {
        employeeAppointmentSearch.value =
            "";
    }

    if (employeeAppointmentStatusFilter) {
        employeeAppointmentStatusFilter.value =
            "todos";
    }

    if (employeeAppointmentDateFilter) {
        employeeAppointmentDateFilter.value =
            "todas";
    }

    if (employeeAppointmentSpecificDate) {
        employeeAppointmentSpecificDate.value =
            "";
    }

    applyFilters();
}

function getOrderForAppointment(
    appointment
) {
    if (!appointment) {
        return null;
    }

    if (appointment.ordenId) {
        const direct =
            orders.find(
                (order) =>
                    order.id ===
                    appointment.ordenId
            );

        if (direct) {
            return direct;
        }
    }

    return (
        orders.find(
            (order) =>
                order.citaId ===
                appointment.id
        ) ||
        null
    );
}

function renderAppointmentModal(
    appointment
) {
    if (!appointment) {
        return;
    }

    const status =
        getStatusData(
            appointment.estado
        );

    const statusKey =
        normalizeStatus(
            appointment.estado
        );

    const vehicle =
        getVehicle(
            appointment
        );

    const existingOrder =
        getOrderForAppointment(
            appointment
        );

    const notes =
        getNotes(
            appointment
        );

    if (employeeAppointmentTitle) {
        employeeAppointmentTitle.textContent =
            getServiceName(
                appointment
            );
    }

    if (employeeAppointmentFolio) {
        employeeAppointmentFolio.textContent =
            `Cita ${appointment.id}`;
    }

    if (employeeAppointmentStatus) {
        employeeAppointmentStatus.className =
            `employee-status ${status.className}`;

        employeeAppointmentStatus.textContent =
            status.label;
    }

    if (employeeAppointmentClientName) {
        employeeAppointmentClientName.textContent =
            getClientName(
                appointment
            );
    }

    if (employeeAppointmentClientEmail) {
        employeeAppointmentClientEmail.textContent =
            getClientEmail(
                appointment
            ) ||
            "Sin correo";
    }

    if (employeeAppointmentClientPhone) {
        employeeAppointmentClientPhone.textContent =
            getClientPhone(
                appointment
            ) ||
            "Sin teléfono";
    }

    if (employeeAppointmentVehicleName) {
        employeeAppointmentVehicleName.textContent =
            getVehicleName(
                vehicle
            );
    }

    if (employeeAppointmentVehicleType) {
        employeeAppointmentVehicleType.textContent =
            formatVehicleType(
                vehicle.tipo
            );
    }

    if (employeeAppointmentVehicleColor) {
        employeeAppointmentVehicleColor.textContent =
            vehicle.color ||
            "Sin color";
    }

    if (employeeAppointmentServiceName) {
        employeeAppointmentServiceName.textContent =
            getServiceName(
                appointment
            );
    }

    if (employeeAppointmentServiceDuration) {
        employeeAppointmentServiceDuration.textContent =
            formatDuration(
                appointment.duracionMinutos
            );
    }

    if (employeeAppointmentEstimatedPrice) {
        employeeAppointmentEstimatedPrice.textContent =
            formatCurrency(
                getEstimatedPrice(
                    appointment
                )
            );
    }

    if (employeeAppointmentDate) {
        employeeAppointmentDate.textContent =
            formatDate(
                appointment.fechaKey
            );
    }

    if (employeeAppointmentTime) {
        employeeAppointmentTime.textContent =
            appointment.horaInicio
                ? (
                    appointment.horaFin
                        ? `${appointment.horaInicio} – ${appointment.horaFin}`
                        : appointment.horaInicio
                )
                : "Sin horario";
    }

    if (employeeAppointmentReservedDuration) {
        employeeAppointmentReservedDuration.textContent =
            formatDuration(
                appointment.duracionMinutos
            );
    }

    if (employeeAppointmentNotesSection) {
        employeeAppointmentNotesSection.hidden =
            !notes;
    }

    if (employeeAppointmentNotes) {
        employeeAppointmentNotes.textContent =
            notes ||
            "Sin notas.";
    }

    if (employeeAppointmentConfirmButton) {
        employeeAppointmentConfirmButton.hidden =
            statusKey !==
            "agendada";
    }

    if (employeeAppointmentReceiveButton) {
        employeeAppointmentReceiveButton.hidden =
            statusKey !==
                "confirmada" ||
            Boolean(existingOrder);
    }

    if (employeeAppointmentOrderButton) {
        employeeAppointmentOrderButton.hidden =
            !existingOrder;

        if (existingOrder) {
            employeeAppointmentOrderButton.href =
                `orden.html?id=${encodeURIComponent(
                    existingOrder.id
                )}`;
        }
    }

    initIcons();
}

function openAppointmentModal(
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
        !employeeAppointmentModal
    ) {
        return;
    }

    selectedAppointment =
        appointment;

    renderAppointmentModal(
        appointment
    );

    employeeAppointmentModal.classList.add(
        "is-open"
    );

    employeeAppointmentModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "employee-modal-open"
    );
}

function closeAppointmentModal() {
    if (processingAction) {
        return;
    }

    employeeAppointmentModal
        ?.classList.remove(
            "is-open"
        );

    employeeAppointmentModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "employee-modal-open"
    );

    selectedAppointment =
        null;
}

function setActionLoading(
    button,
    loading,
    text,
    icon
) {
    if (!button) {
        return;
    }

    button.disabled =
        loading;

    button.innerHTML =
        loading
            ? `
                <i data-lucide="loader-circle"></i>
                Procesando...
            `
            : `
                <i data-lucide="${icon}"></i>
                ${escapeHTML(text)}
            `;

    initIcons();
}

async function confirmAppointment() {
    if (
        !selectedAppointment ||
        processingAction
    ) {
        return;
    }

    if (
        normalizeStatus(
            selectedAppointment.estado
        ) !== "agendada"
    ) {
        showToast(
            "Esta cita ya no está pendiente de confirmación.",
            "error"
        );

        return;
    }

    processingAction =
        true;

    setActionLoading(
        employeeAppointmentConfirmButton,
        true,
        "Confirmar cita",
        "badge-check"
    );

    try {
        const appointmentReference =
            doc(
                db,
                "citas",
                selectedAppointment.id
            );

        await runTransaction(
            db,
            async (transaction) => {
                const snapshot =
                    await transaction.get(
                        appointmentReference
                    );

                if (!snapshot.exists()) {
                    throw new Error(
                        "APPOINTMENT_NOT_FOUND"
                    );
                }

                const data =
                    snapshot.data();

                if (
                    normalizeStatus(
                        data.estado
                    ) !== "agendada"
                ) {
                    throw new Error(
                        "APPOINTMENT_ALREADY_UPDATED"
                    );
                }

                transaction.update(
                    appointmentReference,
                    {
                        estado:
                            "confirmada",
                        confirmadoEn:
                            serverTimestamp(),
                        confirmadoPor:
                            currentUser.uid,
                        actualizadoEn:
                            serverTimestamp()
                    }
                );
            }
        );

        selectedAppointment.estado =
            "confirmada";

        selectedAppointment.confirmadoPor =
            currentUser.uid;

        renderSummary();
        renderBadges();
        applyFilters();

        renderAppointmentModal(
            selectedAppointment
        );

        showToast(
            "Cita confirmada correctamente."
        );
    } catch (error) {
        console.error(
            "No se pudo confirmar la cita:",
            error
        );

        if (
            error.message ===
            "APPOINTMENT_ALREADY_UPDATED"
        ) {
            showToast(
                "La cita fue modificada desde otro dispositivo. Recarga la información.",
                "error"
            );
        } else {
            showToast(
                "No se pudo confirmar la cita.",
                "error"
            );
        }
    } finally {
        processingAction =
            false;

        setActionLoading(
            employeeAppointmentConfirmButton,
            false,
            "Confirmar cita",
            "badge-check"
        );
    }
}

function buildOrderData(
    appointment
) {
    const vehicle =
        getVehicle(
            appointment
        );

    const price =
        getEstimatedPrice(
            appointment
        );

    return {
        citaId:
            appointment.id,
        clienteUid:
            appointment.clienteUid ||
            null,
        clienteNombre:
            getClientName(
                appointment
            ),
        clienteEmail:
            getClientEmail(
                appointment
            ) ||
            null,
        clienteTelefono:
            getClientPhone(
                appointment
            ) ||
            null,
        vehiculo:
            {
                ...vehicle
            },
        servicioId:
            appointment.servicioId ||
            null,
        servicioNombre:
            getServiceName(
                appointment
            ),
        duracionMinutos:
            Number(
                appointment.duracionMinutos
            ) ||
            null,
        precioEstimado:
            Number.isFinite(price)
                ? price
                : null,
        fechaCita:
            appointment.fechaKey ||
            null,
        horaInicioCita:
            appointment.horaInicio ||
            null,
        horaFinCita:
            appointment.horaFin ||
            null,
        estado:
            "recibido",
        origen:
            "cita",
        pagoEstado:
            appointment.pagoEstado ||
            appointment.estadoPago ||
            "pendiente",
        notas:
            getNotes(
                appointment
            ) ||
            "",
        recibidoPor:
            currentUser.uid,
        recibidoEn:
            serverTimestamp(),
        creadoEn:
            serverTimestamp(),
        actualizadoEn:
            serverTimestamp()
    };
}

async function receiveVehicle() {
    if (
        !selectedAppointment ||
        processingAction
    ) {
        return;
    }

    processingAction =
        true;

    setActionLoading(
        employeeAppointmentReceiveButton,
        true,
        "Recibir vehículo",
        "car-front"
    );

    let createdOrderId =
        null;

    try {
        const appointmentReference =
            doc(
                db,
                "citas",
                selectedAppointment.id
            );

        await runTransaction(
            db,
            async (transaction) => {
                const appointmentSnapshot =
                    await transaction.get(
                        appointmentReference
                    );

                if (
                    !appointmentSnapshot.exists()
                ) {
                    throw new Error(
                        "APPOINTMENT_NOT_FOUND"
                    );
                }

                const appointmentData = {
                    id:
                        appointmentSnapshot.id,
                    ...appointmentSnapshot.data()
                };

                const existingStatus =
                    normalizeStatus(
                        appointmentData.estado
                    );

                const orderId =
                    appointmentData.ordenId ||
                    appointmentData.id;

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

                if (orderSnapshot.exists()) {
                    const orderData =
                        orderSnapshot.data();

                    if (
                        orderData.citaId &&
                        orderData.citaId !==
                            appointmentData.id
                    ) {
                        throw new Error(
                            "ORDER_ID_CONFLICT"
                        );
                    }

                    createdOrderId =
                        orderId;

                    if (
                        appointmentData.ordenId !==
                            orderId ||
                        ![
                            "recibido",
                            "en_proceso",
                            "terminado",
                            "entregado"
                        ].includes(
                            existingStatus
                        )
                    ) {
                        transaction.update(
                            appointmentReference,
                            {
                                estado:
                                    orderData.estado ||
                                    "recibido",
                                ordenId:
                                    orderId,
                                recibidoEn:
                                    appointmentData.recibidoEn ||
                                    serverTimestamp(),
                                recibidoPor:
                                    appointmentData.recibidoPor ||
                                    currentUser.uid,
                                actualizadoEn:
                                    serverTimestamp()
                            }
                        );
                    }

                    return;
                }

                if (
                    existingStatus !==
                    "confirmada"
                ) {
                    throw new Error(
                        "APPOINTMENT_NOT_CONFIRMED"
                    );
                }

                createdOrderId =
                    orderId;

                transaction.set(
                    orderReference,
                    buildOrderData(
                        appointmentData
                    )
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
                        recibidoPor:
                            currentUser.uid,
                        actualizadoEn:
                            serverTimestamp()
                    }
                );
            }
        );

        if (!createdOrderId) {
            throw new Error(
                "ORDER_ID_MISSING"
            );
        }

        const existingLocalOrder =
            orders.find(
                (order) =>
                    order.id ===
                    createdOrderId
            );

        if (!existingLocalOrder) {
            orders.push({
                id:
                    createdOrderId,
                ...buildOrderData(
                    selectedAppointment
                ),
                estado:
                    "recibido"
            });
        }

        selectedAppointment.estado =
            "recibido";

        selectedAppointment.ordenId =
            createdOrderId;

        renderSummary();
        renderBadges();
        applyFilters();

        renderAppointmentModal(
            selectedAppointment
        );

        showToast(
            existingLocalOrder
                ? "La orden de trabajo ya existía y quedó vinculada a la cita."
                : "Vehículo recibido y orden de trabajo creada."
        );
    } catch (error) {
        console.error(
            "No se pudo recibir el vehículo:",
            error
        );

        if (
            error.message ===
            "APPOINTMENT_NOT_CONFIRMED"
        ) {
            showToast(
                "Primero debes confirmar la cita antes de recibir el vehículo.",
                "error"
            );
        } else if (
            error.message ===
            "ORDER_ID_CONFLICT"
        ) {
            showToast(
                "Existe un conflicto con el identificador de la orden. Recarga la información antes de continuar.",
                "error"
            );
        } else {
            showToast(
                "No se pudo recibir el vehículo.",
                "error"
            );
        }
    } finally {
        processingAction =
            false;

        setActionLoading(
            employeeAppointmentReceiveButton,
            false,
            "Recibir vehículo",
            "car-front"
        );
    }
}

function openAppointmentFromURL() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const appointmentId =
        params.get("id");

    const requestedStatus =
        normalizeStatus(
            params.get("estado")
        );

    if (
        requestedStatus &&
        STATUS_DATA[
            requestedStatus
        ]
    ) {
        statusFilter =
            requestedStatus;

        if (employeeAppointmentStatusFilter) {
            employeeAppointmentStatusFilter.value =
                requestedStatus;
        }

        applyFilters();
    }

    if (
        appointmentId &&
        appointments.some(
            (appointment) =>
                appointment.id ===
                appointmentId
        )
    ) {
        openAppointmentModal(
            appointmentId
        );
    }
}

function bindFilters() {
    employeeAppointmentSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        employeeAppointmentSearch.value
                    );

                applyFilters();
            }
        );

    employeeAppointmentStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    employeeAppointmentStatusFilter.value;

                applyFilters();
            }
        );

    employeeAppointmentDateFilter
        ?.addEventListener(
            "change",
            () => {
                dateFilter =
                    employeeAppointmentDateFilter.value;

                specificDate =
                    "";

                if (employeeAppointmentSpecificDate) {
                    employeeAppointmentSpecificDate.value =
                        "";
                }

                applyFilters();
            }
        );

    employeeAppointmentSpecificDate
        ?.addEventListener(
            "change",
            () => {
                specificDate =
                    employeeAppointmentSpecificDate.value ||
                    "";

                applyFilters();
            }
        );

    employeeResetAppointmentFilters
        ?.addEventListener(
            "click",
            resetFilters
        );

    employeeAppointmentsEmptyReset
        ?.addEventListener(
            "click",
            resetFilters
        );

    employeeShowTodayButton
        ?.addEventListener(
            "click",
            setTodayFilter
        );

    employeeTodayButton
        ?.addEventListener(
            "click",
            setTodayFilter
        );
}

function bindAppointmentList() {
    employeeAppointmentsList
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

                openAppointmentModal(
                    button.dataset
                        .appointmentId
                );
            }
        );
}

function bindModal() {
    employeeAppointmentBackdrop
        ?.addEventListener(
            "click",
            closeAppointmentModal
        );

    employeeAppointmentClose
        ?.addEventListener(
            "click",
            closeAppointmentModal
        );

    employeeAppointmentCloseButton
        ?.addEventListener(
            "click",
            closeAppointmentModal
        );

    employeeAppointmentConfirmButton
        ?.addEventListener(
            "click",
            confirmAppointment
        );

    employeeAppointmentReceiveButton
        ?.addEventListener(
            "click",
            receiveVehicle
        );
}

function bindSidebar() {
    employeeMenuButton
        ?.addEventListener(
            "click",
            openSidebar
        );

    employeeSidebarClose
        ?.addEventListener(
            "click",
            closeSidebar
        );

    employeeSidebarBackdrop
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
    if (!employeeLogout) {
        return;
    }

    employeeLogout.disabled =
        true;

    try {
        await signOut(auth);

        window.location.href =
            "../login.html";
    } catch (error) {
        console.error(
            "No se pudo cerrar sesión:",
            error
        );

        employeeLogout.disabled =
            false;

        showToast(
            "No se pudo cerrar la sesión.",
            "error"
        );
    }
}

function bindLogout() {
    employeeLogout
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
                event.key !== "Escape"
            ) {
                return;
            }

            if (
                employeeAppointmentModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeAppointmentModal();

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
    bindModal();
    bindKeyboard();

    const allowed =
        await validateEmployeeAccess();

    if (!allowed) {
        return;
    }

    await loadData();

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