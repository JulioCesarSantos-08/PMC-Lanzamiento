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
    getDocs
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

const employeeFirstName =
    document.getElementById("employeeFirstName");

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

const employeeTodayAppointments =
    document.getElementById("employeeTodayAppointments");

const employeePendingReception =
    document.getElementById("employeePendingReception");

const employeeOrdersProgress =
    document.getElementById("employeeOrdersProgress");

const employeeOrdersFinished =
    document.getElementById("employeeOrdersFinished");

const employeeTodayList =
    document.getElementById("employeeTodayList");

const employeeTodayEmpty =
    document.getElementById("employeeTodayEmpty");

const employeeOrdersList =
    document.getElementById("employeeOrdersList");

const employeeOrdersEmpty =
    document.getElementById("employeeOrdersEmpty");

const employeeToast =
    document.getElementById("employeeToast");

let currentUser = null;
let currentUserData = null;

let appointments = [];
let orders = [];

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
    const permissions =
        getPermissions(data);

    return (
        data?.rol === "admin" ||
        permissions.admin === true
    );
}

function userCanOperate(data) {
    const permissions =
        getPermissions(data);

    return (
        userIsAdmin(data) ||
        data?.rol === "empleado" ||
        permissions.operacion === true
    );
}

function userHasFinance(data) {
    return (
        getPermissions(data)
            .finanzas === true
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
    const value =
        String(name || "")
            .trim();

    if (!value) {
        return "equipo";
    }

    return (
        value.split(/\s+/)[0] ||
        "equipo"
    );
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
    ] =
        String(time || "00:00")
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

function formatTimeRange(item) {
    const start =
        item?.horaInicio ||
        "";

    const end =
        item?.horaFin ||
        "";

    if (
        start &&
        end
    ) {
        return `${start} – ${end}`;
    }

    if (start) {
        return start;
    }

    return "Sin horario";
}

function formatVehicleType(value) {
    const labels = {
        hatchback: "Hatchback",
        sedan: "Sedán",
        suv: "SUV",
        pickup: "Pick-up",
        camioneta: "Camioneta",
        moto: "Moto",
        otro: "Otro"
    };

    return (
        labels[
            normalizeText(value)
        ] ||
        value ||
        "Vehículo"
    );
}

function getVehicleName(vehicle) {
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

function getClientName(item) {
    return (
        item?.clienteNombre ||
        item?.nombreCliente ||
        item?.cliente?.nombre ||
        item?.clienteEmail ||
        "Cliente PMC"
    );
}

function getServiceName(item) {
    return (
        item?.servicioNombre ||
        item?.nombreServicio ||
        item?.servicio?.nombre ||
        "Servicio PMC"
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
        `../login.html?return=${encodeURIComponent(
            "empleado/empleados.html"
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

    if (employeeFirstName) {
        employeeFirstName.textContent =
            getFirstName(name);
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

        showToast(
            "No se pudieron cargar las citas.",
            "error"
        );
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

        showToast(
            "No se pudieron cargar las órdenes.",
            "error"
        );
    }
}

function getTodayAppointments() {
    const today =
        getLocalDateKey();

    return appointments
        .filter(
            (appointment) => {
                const status =
                    normalizeStatus(
                        appointment.estado
                    );

                return (
                    appointment.fechaKey ===
                        today &&
                    status !== "cancelada" &&
                    status !== "cancelado"
                );
            }
        )
        .sort(
            (a, b) =>
                dateKeyToComparable(
                    a.fechaKey,
                    a.horaInicio
                ) -
                dateKeyToComparable(
                    b.fechaKey,
                    b.horaInicio
                )
        );
}

function getPendingReceptionAppointments() {
    const today =
        getLocalDateKey();

    return appointments.filter(
        (appointment) =>
            appointment.fechaKey ===
                today &&
            normalizeStatus(
                appointment.estado
            ) === "confirmada"
    );
}

function getActiveOrders() {
    return orders
        .filter(
            (order) => {
                const status =
                    normalizeStatus(
                        order.estado
                    );

                return [
                    "recibido",
                    "en_proceso",
                    "terminado"
                ].includes(
                    status
                );
            }
        )
        .sort(
            (a, b) => {
                const priority = {
                    en_proceso: 1,
                    recibido: 2,
                    terminado: 3
                };

                const aStatus =
                    normalizeStatus(
                        a.estado
                    );

                const bStatus =
                    normalizeStatus(
                        b.estado
                    );

                const statusDifference =
                    (
                        priority[aStatus] ||
                        9
                    ) -
                    (
                        priority[bStatus] ||
                        9
                    );

                if (
                    statusDifference !== 0
                ) {
                    return statusDifference;
                }

                return (
                    dateKeyToComparable(
                        a.fechaKey,
                        a.horaInicio
                    ) -
                    dateKeyToComparable(
                        b.fechaKey,
                        b.horaInicio
                    )
                );
            }
        );
}

function renderCounters() {
    const todayAppointments =
        getTodayAppointments();

    const pendingReception =
        getPendingReceptionAppointments();

    const progressOrders =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) ===
                "en_proceso"
        );

    const finishedOrders =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) ===
                "terminado"
        );

    const activeOrders =
        getActiveOrders();

    if (employeeTodayAppointments) {
        employeeTodayAppointments.textContent =
            String(
                todayAppointments.length
            );
    }

    if (employeePendingReception) {
        employeePendingReception.textContent =
            String(
                pendingReception.length
            );
    }

    if (employeeOrdersProgress) {
        employeeOrdersProgress.textContent =
            String(
                progressOrders.length
            );
    }

    if (employeeOrdersFinished) {
        employeeOrdersFinished.textContent =
            String(
                finishedOrders.length
            );
    }

    if (employeeAppointmentsBadge) {
        const pending =
            todayAppointments.filter(
                (appointment) =>
                    [
                        "agendada",
                        "confirmada"
                    ].includes(
                        normalizeStatus(
                            appointment.estado
                        )
                    )
            ).length;

        employeeAppointmentsBadge.textContent =
            String(pending);

        employeeAppointmentsBadge.hidden =
            pending <= 0;
    }

    if (employeeOrdersBadge) {
        employeeOrdersBadge.textContent =
            String(
                activeOrders.length
            );

        employeeOrdersBadge.hidden =
            activeOrders.length <= 0;
    }
}

function createAppointmentItem(
    appointment
) {
    const status =
        getStatusData(
            appointment.estado
        );

    const clientName =
        getClientName(
            appointment
        );

    const vehicle =
        appointment.vehiculo ||
        {};

    const vehicleName =
        getVehicleName(
            vehicle
        );

    const serviceName =
        getServiceName(
            appointment
        );

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "employee-appointment-item";

    article.innerHTML = `
        <div class="employee-appointment-item__time">

            <strong>
                ${escapeHTML(
                    appointment.horaInicio ||
                    "--:--"
                )}
            </strong>

            <span>
                ${
                    appointment.horaFin
                        ? escapeHTML(
                            appointment.horaFin
                        )
                        : "PMC"
                }
            </span>

        </div>

        <div class="employee-appointment-item__main">

            <strong>
                ${escapeHTML(
                    clientName
                )}
            </strong>

            <span>
                ${escapeHTML(
                    vehicleName
                )}
                ·
                ${escapeHTML(
                    formatVehicleType(
                        vehicle.tipo
                    )
                )}
            </span>

        </div>

        <div class="employee-appointment-item__service">

            <strong>
                ${escapeHTML(
                    serviceName
                )}
            </strong>

            <span>
                ${escapeHTML(
                    formatTimeRange(
                        appointment
                    )
                )}
            </span>

        </div>

        <span class="employee-status ${status.className}">
            ${escapeHTML(
                status.label
            )}
        </span>
    `;

    article.addEventListener(
        "click",
        () => {
            window.location.href =
                `citas.html?id=${encodeURIComponent(
                    appointment.id
                )}`;
        }
    );

    article.style.cursor =
        "pointer";

    return article;
}

function renderTodayAppointments() {
    if (!employeeTodayList) {
        return;
    }

    const todayAppointments =
        getTodayAppointments();

    employeeTodayList.innerHTML =
        "";

    if (
        !todayAppointments.length
    ) {
        employeeTodayList.hidden =
            true;

        if (employeeTodayEmpty) {
            employeeTodayEmpty.hidden =
                false;
        }

        return;
    }

    employeeTodayList.hidden =
        false;

    if (employeeTodayEmpty) {
        employeeTodayEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    todayAppointments
        .slice(
            0,
            7
        )
        .forEach(
            (appointment) => {
                fragment.appendChild(
                    createAppointmentItem(
                        appointment
                    )
                );
            }
        );

    employeeTodayList.appendChild(
        fragment
    );

    initIcons();
}

function createOrderItem(
    order
) {
    const status =
        getStatusData(
            order.estado
        );

    const clientName =
        getClientName(
            order
        );

    const vehicle =
        order.vehiculo ||
        {};

    const vehicleName =
        getVehicleName(
            vehicle
        );

    const serviceName =
        getServiceName(
            order
        );

    const statusKey =
        normalizeStatus(
            order.estado
        );

    const icon =
        statusKey === "terminado"
            ? "circle-check-big"
            : (
                statusKey === "en_proceso"
                    ? "wrench"
                    : "car-front"
            );

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "employee-order-item";

    article.innerHTML = `
        <div class="employee-order-item__icon">

            <i data-lucide="${icon}"></i>

        </div>

        <div class="employee-order-item__content">

            <strong>
                ${escapeHTML(
                    serviceName
                )}
            </strong>

            <span>
                ${escapeHTML(
                    clientName
                )}
                ·
                ${escapeHTML(
                    vehicleName
                )}
            </span>

        </div>

        <span class="employee-status ${status.className}">
            ${escapeHTML(
                status.label
            )}
        </span>
    `;

    article.addEventListener(
        "click",
        () => {
            window.location.href =
                `orden.html?id=${encodeURIComponent(
                    order.id
                )}`;
        }
    );

    article.style.cursor =
        "pointer";

    return article;
}

function renderActiveOrders() {
    if (!employeeOrdersList) {
        return;
    }

    const activeOrders =
        getActiveOrders();

    employeeOrdersList.innerHTML =
        "";

    if (!activeOrders.length) {
        employeeOrdersList.hidden =
            true;

        if (employeeOrdersEmpty) {
            employeeOrdersEmpty.hidden =
                false;
        }

        return;
    }

    employeeOrdersList.hidden =
        false;

    if (employeeOrdersEmpty) {
        employeeOrdersEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    activeOrders
        .slice(
            0,
            6
        )
        .forEach(
            (order) => {
                fragment.appendChild(
                    createOrderItem(
                        order
                    )
                );
            }
        );

    employeeOrdersList.appendChild(
        fragment
    );

    initIcons();
}

function renderDashboard() {
    renderCounters();
    renderTodayAppointments();
    renderActiveOrders();
}

async function loadDashboard() {
    await Promise.all([
        loadAppointments(),
        loadOrders()
    ]);

    renderDashboard();
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
                event.key === "Escape"
            ) {
                closeSidebar();
            }
        }
    );
}

async function init() {
    initIcons();

    setCurrentYear();
    setCurrentDateText();

    bindSidebar();
    bindLogout();
    bindKeyboard();

    const allowed =
        await validateEmployeeAccess();

    if (!allowed) {
        return;
    }

    await loadDashboard();

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