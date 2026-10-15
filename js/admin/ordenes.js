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
    runTransaction,
    serverTimestamp
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

const ordersActiveCount =
    document.getElementById("ordersActiveCount");

const ordersReceivedCount =
    document.getElementById("ordersReceivedCount");

const ordersProgressCount =
    document.getElementById("ordersProgressCount");

const ordersFinishedCount =
    document.getElementById("ordersFinishedCount");

const ordersDeliveredCount =
    document.getElementById("ordersDeliveredCount");

const orderSearch =
    document.getElementById("orderSearch");

const orderStatusFilter =
    document.getElementById("orderStatusFilter");

const orderSort =
    document.getElementById("orderSort");

const ordersResultsCount =
    document.getElementById("ordersResultsCount");

const resetOrderFilters =
    document.getElementById("resetOrderFilters");

const ordersList =
    document.getElementById("ordersList");

const ordersEmpty =
    document.getElementById("ordersEmpty");

const orderDetailsModal =
    document.getElementById("orderDetailsModal");

const orderDetailsBackdrop =
    document.getElementById("orderDetailsBackdrop");

const orderDetailsClose =
    document.getElementById("orderDetailsClose");

const orderCloseButton =
    document.getElementById("orderCloseButton");

const orderDetailsTitle =
    document.getElementById("orderDetailsTitle");

const orderDetailsFolio =
    document.getElementById("orderDetailsFolio");

const orderDetailsStatus =
    document.getElementById("orderDetailsStatus");

const orderClientName =
    document.getElementById("orderClientName");

const orderClientEmail =
    document.getElementById("orderClientEmail");

const orderClientPhone =
    document.getElementById("orderClientPhone");

const orderVehicleName =
    document.getElementById("orderVehicleName");

const orderVehicleType =
    document.getElementById("orderVehicleType");

const orderVehicleColor =
    document.getElementById("orderVehicleColor");

const orderServiceName =
    document.getElementById("orderServiceName");

const orderServiceDuration =
    document.getElementById("orderServiceDuration");

const orderEstimatedPrice =
    document.getElementById("orderEstimatedPrice");

const orderReceivedDate =
    document.getElementById("orderReceivedDate");

const orderReceivedTime =
    document.getElementById("orderReceivedTime");

const orderReservedDuration =
    document.getElementById("orderReservedDuration");

const orderProgressLabel =
    document.getElementById("orderProgressLabel");

const orderProgressPercent =
    document.getElementById("orderProgressPercent");

const orderProgressBar =
    document.getElementById("orderProgressBar");

const orderNotesSection =
    document.getElementById("orderNotesSection");

const orderNotes =
    document.getElementById("orderNotes");

const orderStartButton =
    document.getElementById("orderStartButton");

const orderFinishButton =
    document.getElementById("orderFinishButton");

const orderDeliverButton =
    document.getElementById("orderDeliverButton");

const orderActions =
    document.querySelector(
        ".admin-order-modal__actions"
    );

const orderReceiptButton =
    document.createElement("a");

orderReceiptButton.className =
    "admin-order-action";

orderReceiptButton.hidden =
    true;

orderReceiptButton.href =
    "recibos.html";

orderReceiptButton.innerHTML = `
    <i data-lucide="receipt-text"></i>
    Generar recibo
`;

if (orderActions) {
    orderActions.appendChild(
        orderReceiptButton
    );
}

const adminToast =
    document.getElementById("adminToast");

let currentUser = null;
let currentUserData = null;

let orders = [];
let filteredOrders = [];

let searchTerm = "";
let statusFilter = "todos";
let sortMode = "recientes";

let selectedOrder = null;
let changingStatus = false;
let toastTimer = null;

const STATUS_DATA = {
    recibido: {
        label: "Recibido",
        className: "",
        progress: 25,
        progressLabel: "Vehículo recibido"
    },
    en_proceso: {
        label: "En proceso",
        className: "is-progress",
        progress: 50,
        progressLabel: "Trabajo en proceso"
    },
    terminado: {
        label: "Terminado",
        className: "is-finished",
        progress: 75,
        progressLabel: "Trabajo terminado"
    },
    entregado: {
        label: "Entregado",
        className: "is-delivered",
        progress: 100,
        progressLabel: "Vehículo entregado"
    },
    cancelado: {
        label: "Cancelado",
        className: "is-cancelled",
        progress: 0,
        progressLabel: "Orden cancelada"
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
        text.charAt(0).toUpperCase() +
        text.slice(1);
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

function normalizeStatus(value) {
    const normalized =
        normalizeText(value)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    if (STATUS_DATA[normalized]) {
        return normalized;
    }

    return "recibido";
}

function getStatusData(value) {
    return (
        STATUS_DATA[
            normalizeStatus(value)
        ] ||
        STATUS_DATA.recibido
    );
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

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}

function formatDateFromTimestamp(
    value
) {
    const date =
        timestampToDate(value);

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

function formatTimeFromTimestamp(
    value
) {
    const date =
        timestampToDate(value);

    if (!date) {
        return "Sin hora";
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function getComparableDate(order) {
    const candidates = [
        order.recibidoEn,
        order.creadoEn,
        order.actualizadoEn
    ];

    for (
        const candidate of candidates
    ) {
        const date =
            timestampToDate(
                candidate
            );

        if (date) {
            return date.getTime();
        }
    }

    return 0;
}

function getOrderFolio(order) {
    if (order.folio) {
        return String(
            order.folio
        );
    }

    const shortId =
        String(order.id || "")
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .slice(-8)
            .toUpperCase();

    return (
        shortId
            ? `PMC-${shortId}`
            : "PMC-ORDEN"
    );
}

function getClientData(order) {
    const client =
        order.cliente &&
        typeof order.cliente ===
            "object"
            ? order.cliente
            : {};

    return {
        uid:
            order.clienteUid ||
            client.uid ||
            "",
        nombre:
            order.clienteNombre ||
            client.nombre ||
            "Cliente",
        email:
            order.clienteEmail ||
            client.email ||
            "",
        telefono:
            order.clienteTelefono ||
            client.telefono ||
            ""
    };
}

function getVehicleData(order) {
    if (
        order.vehiculo &&
        typeof order.vehiculo ===
            "object"
    ) {
        return order.vehiculo;
    }

    return {};
}

function getServiceData(order) {
    const service =
        order.servicio &&
        typeof order.servicio ===
            "object"
            ? order.servicio
            : {};

    return {
        id:
            order.servicioId ||
            service.id ||
            "",
        nombre:
            order.servicioNombre ||
            service.nombre ||
            "Servicio PMC",
        categoria:
            order.categoria ||
            service.categoria ||
            "",
        duracionMinutos:
            order.duracionMinutos ??
            service.duracionMinutos ??
            null,
        precioEstimado:
            order.precioEstimado ??
            service.precioEstimado ??
            service.precioDesde ??
            null
    };
}

function getVehicleLabel(vehicle) {
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
    const labels = {
        hatchback: "Hatchback",
        sedan: "Sedán",
        suv: "SUV",
        pickup: "Pick-up",
        camioneta: "Camioneta",
        otro: "Otro"
    };

    const key =
        normalizeText(value);

    return (
        labels[key] ||
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
        `../../login.html?return=${encodeURIComponent(
            "js/admin/ordenes.html"
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

async function loadOrders() {
    if (ordersList) {
        ordersList.hidden =
            false;

        ordersList.innerHTML = `
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
        `;
    }

    if (ordersEmpty) {
        ordersEmpty.hidden =
            true;
    }

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

        renderSummary();
        applyFilters();
    } catch (error) {
        console.error(
            "No se pudieron cargar las órdenes:",
            error
        );

        orders = [];
        filteredOrders = [];

        renderSummary();
        renderOrders();

        showToast(
            "No se pudieron cargar las órdenes.",
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
        ).length;

    const progress =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) === "en_proceso"
        ).length;

    const finished =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) === "terminado"
        ).length;

    const delivered =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.estado
                ) === "entregado"
        ).length;

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
        ).length;

    if (ordersActiveCount) {
        ordersActiveCount.textContent =
            String(active);
    }

    if (ordersReceivedCount) {
        ordersReceivedCount.textContent =
            String(received);
    }

    if (ordersProgressCount) {
        ordersProgressCount.textContent =
            String(progress);
    }

    if (ordersFinishedCount) {
        ordersFinishedCount.textContent =
            String(finished);
    }

    if (ordersDeliveredCount) {
        ordersDeliveredCount.textContent =
            String(delivered);
    }
}

function getOrderSearchText(order) {
    const client =
        getClientData(order);

    const vehicle =
        getVehicleData(order);

    const service =
        getServiceData(order);

    return normalizeText(
        [
            order.id,
            getOrderFolio(order),
            order.citaId,
            client.nombre,
            client.email,
            client.telefono,
            vehicle.tipo,
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio,
            vehicle.color,
            service.nombre,
            service.categoria
        ]
            .filter(Boolean)
            .join(" ")
    );
}

function matchesStatus(order) {
    if (
        statusFilter === "todos"
    ) {
        return true;
    }

    return (
        normalizeStatus(
            order.estado
        ) ===
        statusFilter
    );
}

function sortOrders(items) {
    const sorted =
        [...items];

    if (
        sortMode === "cliente"
    ) {
        sorted.sort(
            (a, b) =>
                getClientData(a)
                    .nombre
                    .localeCompare(
                        getClientData(b)
                            .nombre,
                        "es",
                        {
                            sensitivity:
                                "base"
                        }
                    )
        );

        return sorted;
    }

    sorted.sort(
        (a, b) => {
            const valueA =
                getComparableDate(a);

            const valueB =
                getComparableDate(b);

            return (
                sortMode ===
                "antiguos"
                    ? valueA -
                        valueB
                    : valueB -
                        valueA
            );
        }
    );

    return sorted;
}

function applyFilters() {
    filteredOrders =
        orders.filter(
            (order) => {
                const searchMatches =
                    !searchTerm ||
                    getOrderSearchText(
                        order
                    ).includes(
                        searchTerm
                    );

                return (
                    searchMatches &&
                    matchesStatus(
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
    if (!ordersResultsCount) {
        return;
    }

    const count =
        filteredOrders.length;

    ordersResultsCount.textContent =
        count === 1
            ? "1 orden"
            : `${count} órdenes`;
}

function createOrderCard(order) {
    const client =
        getClientData(order);

    const vehicle =
        getVehicleData(order);

    const service =
        getServiceData(order);

    const status =
        getStatusData(
            order.estado
        );

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "admin-order-card";

    if (
        normalizeStatus(
            order.estado
        ) === "entregado"
    ) {
        article.classList.add(
            "is-delivered"
        );
    }

    if (
        normalizeStatus(
            order.estado
        ) === "cancelado"
    ) {
        article.classList.add(
            "is-cancelled"
        );
    }

    article.innerHTML = `
        <div class="admin-order-card__folio">

            <i data-lucide="clipboard-list"></i>

            <span>
                ${escapeHTML(
                    getOrderFolio(
                        order
                    )
                )}
            </span>

        </div>

        <div class="admin-order-card__main">

            <h3>
                ${escapeHTML(
                    client.nombre
                )}
            </h3>

            <span>
                ${escapeHTML(
                    client.email ||
                    client.telefono ||
                    "Sin contacto"
                )}
            </span>

            <div class="admin-order-card__meta">

                <i data-lucide="clock-3"></i>

                <span>
                    ${escapeHTML(
                        formatDateFromTimestamp(
                            order.recibidoEn ||
                            order.creadoEn
                        )
                    )}
                </span>

            </div>

        </div>

        <div class="admin-order-card__service">

            <i data-lucide="sparkles"></i>

            <div>

                <strong>
                    ${escapeHTML(
                        service.nombre
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        formatDuration(
                            service.duracionMinutos
                        )
                    )}
                </span>

            </div>

        </div>

        <div class="admin-order-card__vehicle">

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

        <div class="admin-order-card__progress">

            <div class="admin-order-card__progress-top">

                <span>
                    Progreso
                </span>

                <strong>
                    ${status.progress}%
                </strong>

            </div>

            <div class="admin-order-card__progress-track">

                <span
                    style="width: ${status.progress}%;"
                ></span>

            </div>

        </div>

        <div class="admin-order-card__end">

            <span class="admin-order-status ${status.className}">
                ${escapeHTML(
                    status.label
                )}
            </span>

            <button
                type="button"
                class="admin-order-card__open"
                data-order-id="${escapeHTML(
                    order.id
                )}"
                aria-label="Ver orden"
                title="Ver detalle"
            >

                <i data-lucide="chevron-right"></i>

            </button>

        </div>
    `;

    return article;
}

function renderOrders() {
    if (!ordersList) {
        return;
    }

    ordersList.innerHTML =
        "";

    updateResultsCount();

    if (!filteredOrders.length) {
        ordersList.hidden =
            true;

        if (ordersEmpty) {
            ordersEmpty.hidden =
                false;
        }

        return;
    }

    ordersList.hidden =
        false;

    if (ordersEmpty) {
        ordersEmpty.hidden =
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

    ordersList.appendChild(
        fragment
    );

    initIcons();
}

function resetFilters() {
    searchTerm = "";
    statusFilter = "todos";
    sortMode = "recientes";

    if (orderSearch) {
        orderSearch.value =
            "";
    }

    if (orderStatusFilter) {
        orderStatusFilter.value =
            "todos";
    }

    if (orderSort) {
        orderSort.value =
            "recientes";
    }

    applyFilters();
}

function setOrderStatusElement(
    statusValue
) {
    if (!orderDetailsStatus) {
        return;
    }

    const status =
        getStatusData(
            statusValue
        );

    orderDetailsStatus.className =
        `admin-order-status ${status.className}`;

    orderDetailsStatus.textContent =
        status.label;
}

function updateProgress(order) {
    const status =
        getStatusData(
            order.estado
        );

    if (orderProgressLabel) {
        orderProgressLabel.textContent =
            status.progressLabel;
    }

    if (orderProgressPercent) {
        orderProgressPercent.textContent =
            `${status.progress}%`;
    }

    if (orderProgressBar) {
        orderProgressBar.style.width =
            `${status.progress}%`;
    }

    const steps =
        document.querySelectorAll(
            ".admin-order-progress__steps span"
        );

    const orderStates = [
        "recibido",
        "en_proceso",
        "terminado",
        "entregado"
    ];

    const currentIndex =
        orderStates.indexOf(
            normalizeStatus(
                order.estado
            )
        );

    steps.forEach(
        (step, index) => {
            step.classList.remove(
                "is-active",
                "is-complete"
            );

            if (
                currentIndex < 0
            ) {
                return;
            }

            if (index < currentIndex) {
                step.classList.add(
                    "is-complete"
                );
            }

            if (
                index ===
                currentIndex
            ) {
                step.classList.add(
                    "is-active"
                );
            }
        }
    );
}

function updateOrderActions(order) {
    const status =
        normalizeStatus(
            order.estado
        );

    [
        orderStartButton,
        orderFinishButton,
        orderDeliverButton,
        orderReceiptButton
    ].forEach(
        (button) => {
            if (button) {
                button.hidden =
                    true;
            }
        }
    );

    if (
        status === "recibido"
    ) {
        if (orderStartButton) {
            orderStartButton.hidden =
                false;
        }

        return;
    }

    if (
        status === "en_proceso"
    ) {
        if (orderFinishButton) {
            orderFinishButton.hidden =
                false;
        }

        return;
    }

    if (
        status === "terminado"
    ) {
        if (orderDeliverButton) {
            orderDeliverButton.hidden =
                false;
        }

        configureReceiptButton(
            order
        );

        return;
    }

    if (
        status === "entregado"
    ) {
        configureReceiptButton(
            order
        );
    }
}

function configureReceiptButton(order) {
    if (
        !orderReceiptButton ||
        !order
    ) {
        return;
    }

    const receiptId =
        order.reciboId ||
        order.receiptId ||
        "";

    if (receiptId) {
        orderReceiptButton.href =
            `recibos.html?id=${encodeURIComponent(
                receiptId
            )}`;

        orderReceiptButton.innerHTML = `
            <i data-lucide="receipt-text"></i>
            Ver recibo
        `;
    } else {
        orderReceiptButton.href =
            `recibos.html?orden=${encodeURIComponent(
                order.id
            )}`;

        orderReceiptButton.innerHTML = `
            <i data-lucide="receipt-text"></i>
            Generar recibo
        `;
    }

    orderReceiptButton.hidden =
        false;

    initIcons();
}

function openOrderDetails(orderId) {
    const order =
        orders.find(
            (item) =>
                item.id ===
                orderId
        );

    if (
        !order ||
        !orderDetailsModal
    ) {
        return;
    }

    selectedOrder =
        order;

    const client =
        getClientData(order);

    const vehicle =
        getVehicleData(order);

    const service =
        getServiceData(order);

    if (orderDetailsTitle) {
        orderDetailsTitle.textContent =
            service.nombre ||
            "Orden PMC";
    }

    if (orderDetailsFolio) {
        orderDetailsFolio.textContent =
            getOrderFolio(
                order
            );
    }

    setOrderStatusElement(
        order.estado
    );

    if (orderClientName) {
        orderClientName.textContent =
            client.nombre;
    }

    if (orderClientEmail) {
        orderClientEmail.textContent =
            client.email ||
            "Sin correo";
    }

    if (orderClientPhone) {
        orderClientPhone.textContent =
            client.telefono ||
            "No disponible";
    }

    if (orderVehicleName) {
        orderVehicleName.textContent =
            getVehicleLabel(
                vehicle
            );
    }

    if (orderVehicleType) {
        orderVehicleType.textContent =
            getVehicleTypeLabel(
                vehicle.tipo
            );
    }

    if (orderVehicleColor) {
        orderVehicleColor.textContent =
            vehicle.color ||
            "No especificado";
    }

    if (orderServiceName) {
        orderServiceName.textContent =
            service.nombre;
    }

    if (orderServiceDuration) {
        orderServiceDuration.textContent =
            formatDuration(
                service.duracionMinutos
            );
    }

    if (orderEstimatedPrice) {
        orderEstimatedPrice.textContent =
            service.precioEstimado !=
            null
                ? formatCurrency(
                    service.precioEstimado
                )
                : "Por confirmar";
    }

    if (orderReceivedDate) {
        orderReceivedDate.textContent =
            formatDateFromTimestamp(
                order.recibidoEn ||
                order.creadoEn
            );
    }

    if (orderReceivedTime) {
        orderReceivedTime.textContent =
            formatTimeFromTimestamp(
                order.recibidoEn ||
                order.creadoEn
            );
    }

    if (orderReservedDuration) {
        orderReservedDuration.textContent =
            formatDuration(
                service.duracionMinutos
            );
    }

    const notes =
        order.notas ||
        vehicle.notas ||
        "";

    if (orderNotes) {
        orderNotes.textContent =
            notes ||
            "Sin notas.";
    }

    if (orderNotesSection) {
        orderNotesSection.hidden =
            !notes;
    }

    updateProgress(order);
    updateOrderActions(order);

    orderDetailsModal.classList.add(
        "is-open"
    );

    orderDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );

    initIcons();
}

function closeOrderDetails() {
    orderDetailsModal
        ?.classList.remove(
            "is-open"
        );

    orderDetailsModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );

    selectedOrder =
        null;
}

function getTimestampField(status) {
    const fields = {
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

async function changeOrderStatus(
    newStatus
) {
    if (
        !selectedOrder ||
        changingStatus
    ) {
        return;
    }

    const orderId =
        selectedOrder.id;

    const citaId =
        selectedOrder.citaId ||
        "";

    changingStatus =
        true;

    try {
        await runTransaction(
            db,
            async (
                transaction
            ) => {
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
                    !orderSnapshot.exists()
                ) {
                    throw new Error(
                        "ORDEN_NO_EXISTE"
                    );
                }

                const orderData =
                    orderSnapshot.data();

                const currentStatus =
                    normalizeStatus(
                        orderData.estado
                    );

                const allowedTransitions = {
                    recibido:
                        "en_proceso",
                    en_proceso:
                        "terminado",
                    terminado:
                        "entregado"
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

                const orderPayload = {
                    estado:
                        newStatus,
                    actualizadoEn:
                        serverTimestamp(),
                    actualizadoPor:
                        currentUser.uid
                };

                const timestampField =
                    getTimestampField(
                        newStatus
                    );

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

                const linkedCitaId =
                    orderData.citaId ||
                    citaId;

                if (linkedCitaId) {
                    const citaReference =
                        doc(
                            db,
                            "citas",
                            linkedCitaId
                        );

                    const citaSnapshot =
                        await transaction.get(
                            citaReference
                        );

                    if (
                        citaSnapshot.exists()
                    ) {
                        const citaPayload = {
                            estado:
                                newStatus,
                            ordenId:
                                orderId,
                            actualizadoEn:
                                serverTimestamp(),
                            actualizadoPor:
                                currentUser.uid
                        };

                        if (timestampField) {
                            citaPayload[
                                timestampField
                            ] =
                                serverTimestamp();
                        }

                        transaction.update(
                            citaReference,
                            citaPayload
                        );
                    }
                }
            }
        );

        const localOrder =
            orders.find(
                (order) =>
                    order.id ===
                    orderId
            );

        if (localOrder) {
            localOrder.estado =
                newStatus;
        }

        if (selectedOrder) {
            selectedOrder.estado =
                newStatus;
        }

        renderSummary();
        applyFilters();

        setOrderStatusElement(
            newStatus
        );

        updateProgress(
            selectedOrder
        );

        updateOrderActions(
            selectedOrder
        );

        const messageMap = {
            en_proceso:
                "Trabajo iniciado correctamente.",
            terminado:
                "Orden marcada como terminada.",
            entregado:
                "Vehículo marcado como entregado."
        };

        showToast(
            messageMap[
                newStatus
            ] ||
            "Orden actualizada."
        );
    } catch (error) {
        console.error(
            "No se pudo actualizar la orden:",
            error
        );

        if (
            error.message ===
            "TRANSICION_INVALIDA"
        ) {
            showToast(
                "El estado de la orden cambió. Recarga la información.",
                "error"
            );
        } else {
            showToast(
                "No se pudo actualizar la orden.",
                "error"
            );
        }
    } finally {
        changingStatus =
            false;
    }
}

function bindFilters() {
    orderSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        orderSearch.value
                    );

                applyFilters();
            }
        );

    orderStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    orderStatusFilter.value;

                applyFilters();
            }
        );

    orderSort
        ?.addEventListener(
            "change",
            () => {
                sortMode =
                    orderSort.value;

                applyFilters();
            }
        );

    resetOrderFilters
        ?.addEventListener(
            "click",
            resetFilters
        );
}

function bindOrderList() {
    ordersList
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

                openOrderDetails(
                    button.dataset
                        .orderId
                );
            }
        );
}

function bindOrderModal() {
    orderDetailsBackdrop
        ?.addEventListener(
            "click",
            closeOrderDetails
        );

    orderDetailsClose
        ?.addEventListener(
            "click",
            closeOrderDetails
        );

    orderCloseButton
        ?.addEventListener(
            "click",
            closeOrderDetails
        );

    orderStartButton
        ?.addEventListener(
            "click",
            () => {
                changeOrderStatus(
                    "en_proceso"
                );
            }
        );

    orderFinishButton
        ?.addEventListener(
            "click",
            () => {
                changeOrderStatus(
                    "terminado"
                );
            }
        );

    orderDeliverButton
        ?.addEventListener(
            "click",
            () => {
                changeOrderStatus(
                    "entregado"
                );
            }
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
                orderDetailsModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeOrderDetails();
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
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    await loadOrders();

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