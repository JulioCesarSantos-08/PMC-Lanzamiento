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
    serverTimestamp,
    updateDoc
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

const employeeOrdersActiveCount =
    document.getElementById("employeeOrdersActiveCount");

const employeeOrdersReceivedCount =
    document.getElementById("employeeOrdersReceivedCount");

const employeeOrdersProgressCount =
    document.getElementById("employeeOrdersProgressCount");

const employeeOrdersFinishedCount =
    document.getElementById("employeeOrdersFinishedCount");

const employeeOrdersDeliveredCount =
    document.getElementById("employeeOrdersDeliveredCount");

const employeeOrderSearch =
    document.getElementById("employeeOrderSearch");

const employeeOrderStatusFilter =
    document.getElementById("employeeOrderStatusFilter");

const employeeOrderSort =
    document.getElementById("employeeOrderSort");

const employeeOrdersResultsCount =
    document.getElementById("employeeOrdersResultsCount");

const employeeResetOrderFilters =
    document.getElementById("employeeResetOrderFilters");

const employeeOrdersEmptyReset =
    document.getElementById("employeeOrdersEmptyReset");

const employeeOrdersWorkList =
    document.getElementById("employeeOrdersWorkList");

const employeeOrdersWorkEmpty =
    document.getElementById("employeeOrdersWorkEmpty");

const employeeOrderModal =
    document.getElementById("employeeOrderModal");

const employeeOrderBackdrop =
    document.getElementById("employeeOrderBackdrop");

const employeeOrderClose =
    document.getElementById("employeeOrderClose");

const employeeOrderCloseButton =
    document.getElementById("employeeOrderCloseButton");

const employeeOrderTitle =
    document.getElementById("employeeOrderTitle");

const employeeOrderFolio =
    document.getElementById("employeeOrderFolio");

const employeeOrderStatus =
    document.getElementById("employeeOrderStatus");

const employeeOrderPaymentStatus =
    document.getElementById("employeeOrderPaymentStatus");

const employeeOrderProgressPercent =
    document.getElementById("employeeOrderProgressPercent");

const employeeOrderProgressBar =
    document.getElementById("employeeOrderProgressBar");

const employeeOrderClientName =
    document.getElementById("employeeOrderClientName");

const employeeOrderClientEmail =
    document.getElementById("employeeOrderClientEmail");

const employeeOrderClientPhone =
    document.getElementById("employeeOrderClientPhone");

const employeeOrderVehicleName =
    document.getElementById("employeeOrderVehicleName");

const employeeOrderVehicleType =
    document.getElementById("employeeOrderVehicleType");

const employeeOrderVehicleColor =
    document.getElementById("employeeOrderVehicleColor");

const employeeOrderServiceName =
    document.getElementById("employeeOrderServiceName");

const employeeOrderDuration =
    document.getElementById("employeeOrderDuration");

const employeeOrderEstimatedPrice =
    document.getElementById("employeeOrderEstimatedPrice");

const employeeOrderReceivedDate =
    document.getElementById("employeeOrderReceivedDate");

const employeeOrderAppointmentTime =
    document.getElementById("employeeOrderAppointmentTime");

const employeeOrderReceivedBy =
    document.getElementById("employeeOrderReceivedBy");

const employeeOrderNotes =
    document.getElementById("employeeOrderNotes");

const employeeOrderNotesState =
    document.getElementById("employeeOrderNotesState");

const employeeOrderSaveNotes =
    document.getElementById("employeeOrderSaveNotes");

const employeeOrderAppointmentReference =
    document.getElementById("employeeOrderAppointmentReference");

const employeeOrderAppointmentButton =
    document.getElementById("employeeOrderAppointmentButton");

const employeeOrderStartButton =
    document.getElementById("employeeOrderStartButton");

const employeeOrderFinishButton =
    document.getElementById("employeeOrderFinishButton");

const employeeOrderDeliverButton =
    document.getElementById("employeeOrderDeliverButton");

const employeeToast =
    document.getElementById("employeeToast");

const orderProgressSteps =
    Array.from(
        document.querySelectorAll(
            "[data-order-step]"
        )
    );

const orderAppointmentSection =
    employeeOrderAppointmentButton
        ?.closest(
            ".employee-order-appointment-link"
        ) ||
    null;

let currentUser = null;
let currentUserData = null;

let orders = [];
let appointments = [];
let filteredOrders = [];

let usersById = new Map();

let selectedOrder = null;
let selectedOriginalNotes = "";

let searchTerm = "";
let statusFilter = "todos";
let sortMode = "recientes";

let processingAction = false;
let savingNotes = false;
let toastTimer = null;

const STATUS_DATA = {
    recibido: {
        label: "Recibido",
        className: "is-received",
        icon: "car-front"
    },
    en_proceso: {
        label: "En proceso",
        className: "is-progress",
        icon: "wrench"
    },
    terminado: {
        label: "Terminado",
        className: "is-finished",
        icon: "circle-check-big"
    },
    entregado: {
        label: "Entregado",
        className: "is-delivered",
        icon: "key-round"
    },
    cancelado: {
        label: "Cancelado",
        className: "is-cancelled",
        icon: "circle-x"
    },
    cancelada: {
        label: "Cancelada",
        className: "is-cancelled",
        icon: "circle-x"
    }
};

const PROGRESS_DATA = {
    recibido: {
        percent: 25,
        index: 0
    },
    en_proceso: {
        percent: 50,
        index: 1
    },
    terminado: {
        percent: 75,
        index: 2
    },
    entregado: {
        percent: 100,
        index: 3
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
        STATUS_DATA.recibido
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

function timestampToDate(value) {
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
        typeof value === "object" &&
        typeof value.seconds === "number"
    ) {
        return new Date(
            value.seconds * 1000
        );
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

function formatDateTime(value) {
    const date =
        timestampToDate(value);

    if (!date) {
        return "Sin fecha";
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}

function getComparableTime(order) {
    const candidates = [
        order.actualizadoEn,
        order.creadoEn,
        order.recibidoEn,
        order.iniciadoEn,
        order.terminadoEn,
        order.entregadoEn
    ];

    for (
        const candidate
        of candidates
    ) {
        const date =
            timestampToDate(
                candidate
            );

        if (date) {
            return date.getTime();
        }
    }

    if (order.fechaCita) {
        const date =
            new Date(
                `${order.fechaCita}T${order.horaInicioCita || "00:00"}:00`
            );

        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {
            return date.getTime();
        }
    }

    return 0;
}

function formatVehicleType(value) {
    const types = {
        hatchback: "Hatchback",
        sedan: "Sedán",
        suv: "SUV",
        pickup: "Pick-up",
        pick_up: "Pick-up",
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

function getVehicle(order) {
    if (
        order?.vehiculo &&
        typeof order.vehiculo === "object"
    ) {
        return order.vehiculo;
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

function getClientName(order) {
    return (
        order?.clienteNombre ||
        order?.nombreCliente ||
        order?.cliente?.nombre ||
        "Cliente PMC"
    );
}

function getClientEmail(order) {
    return (
        order?.clienteEmail ||
        order?.cliente?.email ||
        ""
    );
}

function getClientPhone(order) {
    return (
        order?.clienteTelefono ||
        order?.telefonoCliente ||
        order?.cliente?.telefono ||
        ""
    );
}

function getServiceName(order) {
    return (
        order?.servicioNombre ||
        order?.nombreServicio ||
        order?.servicio?.nombre ||
        "Servicio PMC"
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

function getEstimatedPrice(order) {
    const values = [
        order.precioEstimado,
        order.precio,
        order.totalEstimado,
        order.cotizacionTotal,
        order.total
    ];

    for (
        const value
        of values
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

function getInternalNotes(order) {
    return (
        order?.notasInternas ||
        order?.notasTrabajo ||
        ""
    );
}

function getPaymentStatus(order) {
    const raw =
        normalizeStatus(
            order.pagoEstado ||
            order.estadoPago ||
            order.pago?.estado ||
            "pendiente"
        );

    if (
        [
            "pagado",
            "pagada",
            "confirmado",
            "confirmada"
        ].includes(raw)
    ) {
        return {
            key: "pagado",
            label: "Pagado",
            className: "is-paid"
        };
    }

    if (
        [
            "cancelado",
            "cancelada"
        ].includes(raw)
    ) {
        return {
            key: "cancelado",
            label: "Cancelado",
            className: "is-cancelled"
        };
    }

    return {
        key: "pendiente",
        label: "Pendiente",
        className: ""
    };
}

function getOrderFolio(order) {
    return (
        order.folio ||
        `OT-${String(order.id || "")
            .slice(0, 8)
            .toUpperCase()}`
    );
}

function getReceivedByName(order) {
    const directName =
        order.recibidoPorNombre ||
        order.empleadoNombre ||
        "";

    if (directName) {
        return directName;
    }

    const userId =
        order.recibidoPor ||
        order.creadoPor ||
        "";

    if (
        userId &&
        usersById.has(userId)
    ) {
        const user =
            usersById.get(
                userId
            );

        return (
            user.nombre ||
            user.email ||
            "Personal PMC"
        );
    }

    return "Personal PMC";
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
            "empleado/orden.html"
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

async function loadUsersMap() {
    usersById =
        new Map();

    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        snapshot.docs.forEach(
            (documentSnapshot) => {
                usersById.set(
                    documentSnapshot.id,
                    {
                        id:
                            documentSnapshot.id,
                        ...documentSnapshot.data()
                    }
                );
            }
        );
    } catch (error) {
        console.error(
            "No se pudo cargar el directorio de usuarios:",
            error
        );

        if (
            currentUser &&
            currentUserData
        ) {
            usersById.set(
                currentUser.uid,
                currentUserData
            );
        }
    }
}

async function loadData() {
    if (employeeOrdersWorkList) {
        employeeOrdersWorkList.hidden =
            false;

        employeeOrdersWorkList.innerHTML = `
            <div class="employee-skeleton"></div>
            <div class="employee-skeleton"></div>
            <div class="employee-skeleton"></div>
        `;
    }

    if (employeeOrdersWorkEmpty) {
        employeeOrdersWorkEmpty.hidden =
            true;
    }

    try {
        const [
            ordersSnapshot,
            appointmentsSnapshot
        ] =
            await Promise.all([
                getDocs(
                    collection(
                        db,
                        "ordenes"
                    )
                ),
                getDocs(
                    collection(
                        db,
                        "citas"
                    )
                )
            ]);

        orders =
            ordersSnapshot.docs.map(
                (documentSnapshot) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );

        appointments =
            appointmentsSnapshot.docs.map(
                (documentSnapshot) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );

        await loadUsersMap();

        renderSummary();
        renderBadges();
        applyFilters();
        applyURLParameters();
    } catch (error) {
        console.error(
            "No se pudieron cargar las órdenes:",
            error
        );

        orders = [];
        appointments = [];
        filteredOrders = [];

        renderSummary();
        renderBadges();
        renderOrders();

        showToast(
            "No se pudieron cargar las órdenes de trabajo.",
            "error"
        );
    }
}

function renderSummary() {
    const received =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) === "recibido"
        );

    const progress =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) === "en_proceso"
        );

    const finished =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) === "terminado"
        );

    const delivered =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) === "entregado"
        );

    const active =
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
        );

    if (employeeOrdersActiveCount) {
        employeeOrdersActiveCount.textContent =
            String(
                active.length
            );
    }

    if (employeeOrdersReceivedCount) {
        employeeOrdersReceivedCount.textContent =
            String(
                received.length
            );
    }

    if (employeeOrdersProgressCount) {
        employeeOrdersProgressCount.textContent =
            String(
                progress.length
            );
    }

    if (employeeOrdersFinishedCount) {
        employeeOrdersFinishedCount.textContent =
            String(
                finished.length
            );
    }

    if (employeeOrdersDeliveredCount) {
        employeeOrdersDeliveredCount.textContent =
            String(
                delivered.length
            );
    }
}

function renderBadges() {
    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );

    const todayKey =
        `${year}-${month}-${day}`;

    const pendingAppointments =
        appointments.filter(
            (appointment) =>
                appointment.fechaKey ===
                    todayKey &&
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

function getOrderSearchText(order) {
    const vehicle =
        getVehicle(order);

    return normalizeText(
        [
            order.id,
            order.folio,
            order.citaId,
            getClientName(order),
            getClientEmail(order),
            getClientPhone(order),
            getServiceName(order),
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio,
            vehicle.color,
            vehicle.tipo,
            order.estado,
            order.pagoEstado,
            order.estadoPago
        ]
            .filter(Boolean)
            .join(" ")
    );
}

function matchesStatusFilter(order) {
    if (
        statusFilter === "todos"
    ) {
        return true;
    }

    const currentStatus =
        normalizeStatus(
            order.estado
        );

    if (
        statusFilter === "cancelado"
    ) {
        return [
            "cancelado",
            "cancelada"
        ].includes(
            currentStatus
        );
    }

    return (
        currentStatus ===
        statusFilter
    );
}

function sortOrders(items) {
    const sorted =
        [...items];

    if (
        sortMode === "antiguos"
    ) {
        return sorted.sort(
            (a, b) =>
                getComparableTime(a) -
                getComparableTime(b)
        );
    }

    if (
        sortMode === "estado"
    ) {
        const priority = {
            recibido: 1,
            en_proceso: 2,
            terminado: 3,
            entregado: 4,
            cancelado: 5,
            cancelada: 5
        };

        return sorted.sort(
            (a, b) => {
                const aStatus =
                    normalizeStatus(
                        a.estado
                    );

                const bStatus =
                    normalizeStatus(
                        b.estado
                    );

                const difference =
                    (
                        priority[aStatus] ||
                        9
                    ) -
                    (
                        priority[bStatus] ||
                        9
                    );

                if (difference) {
                    return difference;
                }

                return (
                    getComparableTime(b) -
                    getComparableTime(a)
                );
            }
        );
    }

    if (
        sortMode === "cliente"
    ) {
        return sorted.sort(
            (a, b) =>
                getClientName(a)
                    .localeCompare(
                        getClientName(b),
                        "es",
                        {
                            sensitivity:
                                "base"
                        }
                    )
        );
    }

    return sorted.sort(
        (a, b) =>
            getComparableTime(b) -
            getComparableTime(a)
    );
}

function applyFilters() {
    filteredOrders =
        orders.filter(
            (order) => {
                const matchesSearch =
                    !searchTerm ||
                    getOrderSearchText(
                        order
                    ).includes(
                        searchTerm
                    );

                return (
                    matchesSearch &&
                    matchesStatusFilter(
                        order
                    )
                );
            }
        );

    filteredOrders =
        sortOrders(
            filteredOrders
        );

    renderOrders();
}

function updateResultsCount() {
    if (!employeeOrdersResultsCount) {
        return;
    }

    const count =
        filteredOrders.length;

    employeeOrdersResultsCount.textContent =
        count === 1
            ? "1 orden"
            : `${count} órdenes`;
}

function createOrderCard(order) {
    const statusKey =
        normalizeStatus(
            order.estado
        );

    const status =
        getStatusData(
            order.estado
        );

    const vehicle =
        getVehicle(
            order
        );

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "employee-order-card";

    if (
        statusKey === "entregado"
    ) {
        article.classList.add(
            "is-delivered"
        );
    }

    if (
        [
            "cancelado",
            "cancelada"
        ].includes(statusKey)
    ) {
        article.classList.add(
            "is-cancelled"
        );
    }

    article.innerHTML = `
        <div class="employee-order-card__icon">

            <i data-lucide="${escapeHTML(
                status.icon
            )}"></i>

        </div>

        <div class="employee-order-card__main">

            <h3>
                ${escapeHTML(
                    getClientName(
                        order
                    )
                )}
            </h3>

            <span>
                ${escapeHTML(
                    getClientPhone(
                        order
                    ) ||
                    getClientEmail(
                        order
                    ) ||
                    "Sin contacto"
                )}
            </span>

            <div class="employee-order-card__vehicle">

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

        <div class="employee-order-card__service">

            <span>
                Servicio
            </span>

            <strong>
                ${escapeHTML(
                    getServiceName(
                        order
                    )
                )}
            </strong>

            <small>
                ${escapeHTML(
                    formatDuration(
                        order.duracionMinutos
                    )
                )}
            </small>

        </div>

        <div class="employee-order-card__folio">

            <span>
                Orden
            </span>

            <strong>
                ${escapeHTML(
                    getOrderFolio(
                        order
                    )
                )}
            </strong>

        </div>

        <div class="employee-order-card__end">

            <span class="employee-status ${status.className}">
                ${escapeHTML(
                    status.label
                )}
            </span>

            <button
                type="button"
                class="employee-order-card__open"
                data-order-id="${escapeHTML(
                    order.id
                )}"
                aria-label="Abrir orden"
                title="Abrir orden"
            >

                <i data-lucide="chevron-right"></i>

            </button>

        </div>
    `;

    return article;
}

function renderOrders() {
    if (!employeeOrdersWorkList) {
        return;
    }

    employeeOrdersWorkList.innerHTML =
        "";

    updateResultsCount();

    if (!filteredOrders.length) {
        employeeOrdersWorkList.hidden =
            true;

        if (employeeOrdersWorkEmpty) {
            employeeOrdersWorkEmpty.hidden =
                false;
        }

        return;
    }

    employeeOrdersWorkList.hidden =
        false;

    if (employeeOrdersWorkEmpty) {
        employeeOrdersWorkEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    filteredOrders.forEach(
        (order) => {
            fragment.appendChild(
                createOrderCard(
                    order
                )
            );
        }
    );

    employeeOrdersWorkList.appendChild(
        fragment
    );

    initIcons();
}

function resetFilters() {
    searchTerm = "";
    statusFilter = "todos";
    sortMode = "recientes";

    if (employeeOrderSearch) {
        employeeOrderSearch.value =
            "";
    }

    if (employeeOrderStatusFilter) {
        employeeOrderStatusFilter.value =
            "todos";
    }

    if (employeeOrderSort) {
        employeeOrderSort.value =
            "recientes";
    }

    applyFilters();
}

function renderProgress(order) {
    const statusKey =
        normalizeStatus(
            order.estado
        );

    const progress =
        PROGRESS_DATA[
            statusKey
        ];

    const cancelled =
        [
            "cancelado",
            "cancelada"
        ].includes(
            statusKey
        );

    const percent =
        cancelled
            ? 0
            : (
                progress?.percent ||
                25
            );

    const currentIndex =
        progress?.index ??
        0;

    if (employeeOrderProgressPercent) {
        employeeOrderProgressPercent.textContent =
            `${percent}%`;
    }

    if (employeeOrderProgressBar) {
        employeeOrderProgressBar.style.width =
            `${percent}%`;
    }

    orderProgressSteps.forEach(
        (
            element,
            index
        ) => {
            element.classList.remove(
                "is-active",
                "is-complete",
                "is-cancelled"
            );

            if (cancelled) {
                element.classList.add(
                    "is-cancelled"
                );

                return;
            }

            if (
                statusKey === "entregado"
            ) {
                element.classList.add(
                    "is-complete"
                );

                return;
            }

            if (
                index <
                currentIndex
            ) {
                element.classList.add(
                    "is-complete"
                );

                return;
            }

            if (
                index ===
                currentIndex
            ) {
                element.classList.add(
                    "is-active"
                );
            }
        }
    );
}

function renderActionButtons(order) {
    const status =
        normalizeStatus(
            order.estado
        );

    if (employeeOrderStartButton) {
        employeeOrderStartButton.hidden =
            status !==
            "recibido";
    }

    if (employeeOrderFinishButton) {
        employeeOrderFinishButton.hidden =
            status !==
            "en_proceso";
    }

    if (employeeOrderDeliverButton) {
        employeeOrderDeliverButton.hidden =
            status !==
            "terminado";
    }
}

function renderAppointmentReference(order) {
    const appointmentId =
        order.citaId ||
        "";

    if (!appointmentId) {
        if (orderAppointmentSection) {
            orderAppointmentSection.hidden =
                true;
        }

        return;
    }

    if (orderAppointmentSection) {
        orderAppointmentSection.hidden =
            false;
    }

    if (
        employeeOrderAppointmentReference
    ) {
        employeeOrderAppointmentReference.textContent =
            `Cita ${appointmentId}`;
    }

    if (
        employeeOrderAppointmentButton
    ) {
        employeeOrderAppointmentButton.href =
            `citas.html?id=${encodeURIComponent(
                appointmentId
            )}`;
    }
}

function renderOrderModal(order) {
    if (!order) {
        return;
    }

    const status =
        getStatusData(
            order.estado
        );

    const payment =
        getPaymentStatus(
            order
        );

    const vehicle =
        getVehicle(
            order
        );

    const internalNotes =
        getInternalNotes(
            order
        );

    if (employeeOrderTitle) {
        employeeOrderTitle.textContent =
            getServiceName(
                order
            );
    }

    if (employeeOrderFolio) {
        employeeOrderFolio.textContent =
            getOrderFolio(
                order
            );
    }

    if (employeeOrderStatus) {
        employeeOrderStatus.className =
            `employee-status ${status.className}`;

        employeeOrderStatus.textContent =
            status.label;
    }

    if (employeeOrderPaymentStatus) {
        employeeOrderPaymentStatus.className =
            `employee-payment-status ${payment.className}`;

        employeeOrderPaymentStatus.textContent =
            payment.label;
    }

    if (employeeOrderClientName) {
        employeeOrderClientName.textContent =
            getClientName(
                order
            );
    }

    if (employeeOrderClientEmail) {
        employeeOrderClientEmail.textContent =
            getClientEmail(
                order
            ) ||
            "Sin correo";
    }

    if (employeeOrderClientPhone) {
        employeeOrderClientPhone.textContent =
            getClientPhone(
                order
            ) ||
            "Sin teléfono";
    }

    if (employeeOrderVehicleName) {
        employeeOrderVehicleName.textContent =
            getVehicleName(
                vehicle
            );
    }

    if (employeeOrderVehicleType) {
        employeeOrderVehicleType.textContent =
            formatVehicleType(
                vehicle.tipo
            );
    }

    if (employeeOrderVehicleColor) {
        employeeOrderVehicleColor.textContent =
            vehicle.color ||
            "Sin color";
    }

    if (employeeOrderServiceName) {
        employeeOrderServiceName.textContent =
            getServiceName(
                order
            );
    }

    if (employeeOrderDuration) {
        employeeOrderDuration.textContent =
            formatDuration(
                order.duracionMinutos
            );
    }

    if (employeeOrderEstimatedPrice) {
        employeeOrderEstimatedPrice.textContent =
            formatCurrency(
                getEstimatedPrice(
                    order
                )
            );
    }

    if (employeeOrderReceivedDate) {
        employeeOrderReceivedDate.textContent =
            formatDateTime(
                order.recibidoEn ||
                order.creadoEn
            );
    }

    if (employeeOrderAppointmentTime) {
        const start =
            order.horaInicioCita ||
            "";

        const end =
            order.horaFinCita ||
            "";

        if (
            start &&
            end
        ) {
            employeeOrderAppointmentTime.textContent =
                `${start} – ${end}`;
        } else if (start) {
            employeeOrderAppointmentTime.textContent =
                start;
        } else {
            employeeOrderAppointmentTime.textContent =
                "Sin horario";
        }
    }

    if (employeeOrderReceivedBy) {
        employeeOrderReceivedBy.textContent =
            `Recibido por ${getReceivedByName(
                order
            )}`;
    }

    if (employeeOrderNotes) {
        employeeOrderNotes.value =
            internalNotes;
    }

    selectedOriginalNotes =
        internalNotes;

    updateNotesState();

    renderProgress(order);

    renderActionButtons(order);

    renderAppointmentReference(
        order
    );

    initIcons();
}

function openOrderModal(orderId) {
    const order =
        orders.find(
            (item) =>
                item.id ===
                orderId
        );

    if (
        !order ||
        !employeeOrderModal
    ) {
        return;
    }

    selectedOrder =
        order;

    renderOrderModal(
        order
    );

    employeeOrderModal.classList.add(
        "is-open"
    );

    employeeOrderModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "employee-modal-open"
    );
}

function closeOrderModal() {
    if (
        processingAction ||
        savingNotes
    ) {
        return;
    }

    employeeOrderModal
        ?.classList.remove(
            "is-open"
        );

    employeeOrderModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "employee-modal-open"
    );

    selectedOrder =
        null;

    selectedOriginalNotes =
        "";
}

function updateNotesState() {
    if (
        !employeeOrderNotesState ||
        !employeeOrderNotes
    ) {
        return;
    }

    const current =
        employeeOrderNotes.value;

    const dirty =
        current !==
        selectedOriginalNotes;

    employeeOrderNotesState.classList.remove(
        "is-dirty",
        "is-saved"
    );

    if (dirty) {
        employeeOrderNotesState.classList.add(
            "is-dirty"
        );

        employeeOrderNotesState.textContent =
            "Cambios sin guardar";
    } else {
        employeeOrderNotesState.textContent =
            "Sin cambios";
    }
}

function setNotesSavingState(state) {
    savingNotes =
        state;

    if (!employeeOrderSaveNotes) {
        return;
    }

    employeeOrderSaveNotes.disabled =
        state;

    employeeOrderSaveNotes.innerHTML =
        state
            ? `
                <i data-lucide="loader-circle"></i>
                Guardando...
            `
            : `
                <i data-lucide="save"></i>
                Guardar notas
            `;

    initIcons();
}

async function saveOrderNotes() {
    if (
        !selectedOrder ||
        !employeeOrderNotes ||
        savingNotes
    ) {
        return;
    }

    const notes =
        employeeOrderNotes.value
            .trim();

    if (
        notes ===
        selectedOriginalNotes
    ) {
        showToast(
            "No hay cambios en las notas."
        );

        return;
    }

    setNotesSavingState(
        true
    );

    try {
        await updateDoc(
            doc(
                db,
                "ordenes",
                selectedOrder.id
            ),
            {
                notasInternas:
                    notes,
                notasActualizadasPor:
                    currentUser.uid,
                notasActualizadasEn:
                    serverTimestamp(),
                actualizadoEn:
                    serverTimestamp()
            }
        );

        selectedOrder.notasInternas =
            notes;

        selectedOriginalNotes =
            notes;

        employeeOrderNotes.value =
            notes;

        if (employeeOrderNotesState) {
            employeeOrderNotesState.classList.remove(
                "is-dirty"
            );

            employeeOrderNotesState.classList.add(
                "is-saved"
            );

            employeeOrderNotesState.textContent =
                "Notas guardadas";
        }

        showToast(
            "Notas internas guardadas."
        );
    } catch (error) {
        console.error(
            "No se pudieron guardar las notas:",
            error
        );

        showToast(
            "No se pudieron guardar las notas.",
            "error"
        );
    } finally {
        setNotesSavingState(
            false
        );
    }
}

function getTransitionMetadata(nextStatus) {
    if (
        nextStatus === "en_proceso"
    ) {
        return {
            iniciadoEn:
                serverTimestamp(),
            iniciadoPor:
                currentUser.uid
        };
    }

    if (
        nextStatus === "terminado"
    ) {
        return {
            terminadoEn:
                serverTimestamp(),
            terminadoPor:
                currentUser.uid
        };
    }

    if (
        nextStatus === "entregado"
    ) {
        return {
            entregadoEn:
                serverTimestamp(),
            entregadoPor:
                currentUser.uid
        };
    }

    return {};
}

function setActionLoading(
    button,
    loading,
    normalText,
    normalIcon
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
                <i data-lucide="${normalIcon}"></i>
                ${escapeHTML(normalText)}
            `;

    initIcons();
}

async function transitionOrder(
    expectedStatus,
    nextStatus,
    button,
    normalText,
    normalIcon,
    successMessage
) {
    if (
        !selectedOrder ||
        processingAction
    ) {
        return;
    }

    if (
        normalizeStatus(
            selectedOrder.estado
        ) !== expectedStatus
    ) {
        showToast(
            "La orden ya cambió de estado.",
            "error"
        );

        return;
    }

    processingAction =
        true;

    setActionLoading(
        button,
        true,
        normalText,
        normalIcon
    );

    try {
        const orderReference =
            doc(
                db,
                "ordenes",
                selectedOrder.id
            );

        await runTransaction(
            db,
            async (transaction) => {
                const orderSnapshot =
                    await transaction.get(
                        orderReference
                    );

                if (
                    !orderSnapshot.exists()
                ) {
                    throw new Error(
                        "ORDER_NOT_FOUND"
                    );
                }

                const orderData =
                    orderSnapshot.data();

                const currentStatus =
                    normalizeStatus(
                        orderData.estado
                    );

                if (
                    currentStatus !==
                    expectedStatus
                ) {
                    throw new Error(
                        "ORDER_ALREADY_UPDATED"
                    );
                }

                let appointmentReference =
                    null;

                let appointmentSnapshot =
                    null;

                if (orderData.citaId) {
                    appointmentReference =
                        doc(
                            db,
                            "citas",
                            orderData.citaId
                        );

                    appointmentSnapshot =
                        await transaction.get(
                            appointmentReference
                        );
                }

                const metadata =
                    getTransitionMetadata(
                        nextStatus
                    );

                transaction.update(
                    orderReference,
                    {
                        estado:
                            nextStatus,
                        ...metadata,
                        actualizadoEn:
                            serverTimestamp()
                    }
                );

                if (
                    appointmentReference &&
                    appointmentSnapshot?.exists()
                ) {
                    transaction.update(
                        appointmentReference,
                        {
                            estado:
                                nextStatus,
                            ...metadata,
                            actualizadoEn:
                                serverTimestamp()
                        }
                    );
                }
            }
        );

        selectedOrder.estado =
            nextStatus;

        const linkedAppointment =
            appointments.find(
                (appointment) =>
                    appointment.id ===
                    selectedOrder.citaId
            );

        if (linkedAppointment) {
            linkedAppointment.estado =
                nextStatus;
        }

        renderSummary();
        renderBadges();
        applyFilters();

        renderOrderModal(
            selectedOrder
        );

        showToast(
            successMessage
        );
    } catch (error) {
        console.error(
            "No se pudo cambiar el estado de la orden:",
            error
        );

        if (
            error.message ===
            "ORDER_ALREADY_UPDATED"
        ) {
            showToast(
                "La orden fue modificada desde otro dispositivo. Recarga la información.",
                "error"
            );
        } else {
            showToast(
                "No se pudo actualizar la orden.",
                "error"
            );
        }
    } finally {
        processingAction =
            false;

        setActionLoading(
            button,
            false,
            normalText,
            normalIcon
        );
    }
}

function startOrder() {
    return transitionOrder(
        "recibido",
        "en_proceso",
        employeeOrderStartButton,
        "Iniciar trabajo",
        "play",
        "Trabajo iniciado correctamente."
    );
}

function finishOrder() {
    return transitionOrder(
        "en_proceso",
        "terminado",
        employeeOrderFinishButton,
        "Marcar terminado",
        "circle-check-big",
        "Trabajo marcado como terminado."
    );
}

function deliverOrder() {
    return transitionOrder(
        "terminado",
        "entregado",
        employeeOrderDeliverButton,
        "Entregar vehículo",
        "key-round",
        "Vehículo marcado como entregado."
    );
}

function applyURLParameters() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const requestedStatus =
        normalizeStatus(
            params.get("estado")
        );

    const orderId =
        params.get("id");

    if (
        requestedStatus &&
        [
            "recibido",
            "en_proceso",
            "terminado",
            "entregado",
            "cancelado"
        ].includes(
            requestedStatus
        )
    ) {
        statusFilter =
            requestedStatus;

        if (employeeOrderStatusFilter) {
            employeeOrderStatusFilter.value =
                requestedStatus;
        }

        applyFilters();
    }

    if (
        orderId &&
        orders.some(
            (order) =>
                order.id ===
                orderId
        )
    ) {
        openOrderModal(
            orderId
        );
    }
}

function bindFilters() {
    employeeOrderSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        employeeOrderSearch.value
                    );

                applyFilters();
            }
        );

    employeeOrderStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    employeeOrderStatusFilter.value;

                applyFilters();
            }
        );

    employeeOrderSort
        ?.addEventListener(
            "change",
            () => {
                sortMode =
                    employeeOrderSort.value;

                applyFilters();
            }
        );

    employeeResetOrderFilters
        ?.addEventListener(
            "click",
            resetFilters
        );

    employeeOrdersEmptyReset
        ?.addEventListener(
            "click",
            resetFilters
        );
}

function bindOrderList() {
    employeeOrdersWorkList
        ?.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-order-id]"
                    );

                if (!button) {
                    return;
                }

                openOrderModal(
                    button.dataset
                        .orderId
                );
            }
        );
}

function bindOrderModal() {
    employeeOrderBackdrop
        ?.addEventListener(
            "click",
            closeOrderModal
        );

    employeeOrderClose
        ?.addEventListener(
            "click",
            closeOrderModal
        );

    employeeOrderCloseButton
        ?.addEventListener(
            "click",
            closeOrderModal
        );

    employeeOrderNotes
        ?.addEventListener(
            "input",
            updateNotesState
        );

    employeeOrderSaveNotes
        ?.addEventListener(
            "click",
            saveOrderNotes
        );

    employeeOrderStartButton
        ?.addEventListener(
            "click",
            startOrder
        );

    employeeOrderFinishButton
        ?.addEventListener(
            "click",
            finishOrder
        );

    employeeOrderDeliverButton
        ?.addEventListener(
            "click",
            deliverOrder
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
                event.key !==
                "Escape"
            ) {
                return;
            }

            if (
                employeeOrderModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeOrderModal();

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
    bindOrderList();
    bindOrderModal();
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