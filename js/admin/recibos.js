import { auth, db } from "../firebase.js";

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

const $ = (id) => document.getElementById(id);

const pageLoader = $("pageLoader");
const adminShell = $("adminShell");
const adminAccessDenied = $("adminAccessDenied");
const adminSidebar = $("adminSidebar");
const adminSidebarBackdrop = $("adminSidebarBackdrop");
const adminSidebarClose = $("adminSidebarClose");
const adminMenuButton = $("adminMenuButton");
const adminLogout = $("adminLogout");
const adminFinanceButton = $("adminFinanceButton");
const adminCurrentDate = $("adminCurrentDate");
const currentYear = $("currentYear");
const adminNewReceiptButton = $("adminNewReceiptButton");
const adminCreateReceiptButton = $("adminCreateReceiptButton");
const adminReceiptsTotalCount = $("adminReceiptsTotalCount");
const adminReceiptsPendingCount = $("adminReceiptsPendingCount");
const adminReceiptsPaidCount = $("adminReceiptsPaidCount");
const adminReceiptsTodayIncome = $("adminReceiptsTodayIncome");
const adminReceiptSearch = $("adminReceiptSearch");
const adminReceiptStatusFilter = $("adminReceiptStatusFilter");
const adminReceiptPaymentFilter = $("adminReceiptPaymentFilter");
const adminReceiptSort = $("adminReceiptSort");
const adminReceiptsResultsCount = $("adminReceiptsResultsCount");
const adminResetReceiptFilters = $("adminResetReceiptFilters");
const adminReceiptsEmptyCreate = $("adminReceiptsEmptyCreate");
const adminReceiptsList = $("adminReceiptsList");
const adminReceiptsEmpty = $("adminReceiptsEmpty");
const adminReceiptCreateModal = $("adminReceiptCreateModal");
const adminReceiptCreateBackdrop = $("adminReceiptCreateBackdrop");
const adminReceiptCreateClose = $("adminReceiptCreateClose");
const adminReceiptCreateCancel = $("adminReceiptCreateCancel");
const adminReceiptForm = $("adminReceiptForm");
const adminReceiptOrder = $("adminReceiptOrder");
const adminReceiptOrderPreview = $("adminReceiptOrderPreview");
const adminReceiptPreviewClient = $("adminReceiptPreviewClient");
const adminReceiptPreviewVehicle = $("adminReceiptPreviewVehicle");
const adminReceiptPreviewService = $("adminReceiptPreviewService");
const adminReceiptPreviewOrder = $("adminReceiptPreviewOrder");
const adminReceiptAmount = $("adminReceiptAmount");
const adminReceiptPaymentMethod = $("adminReceiptPaymentMethod");
const adminReceiptConcept = $("adminReceiptConcept");
const adminReceiptNotes = $("adminReceiptNotes");
const adminReceiptSubmit = $("adminReceiptSubmit");
const adminReceiptDetailModal = $("adminReceiptDetailModal");
const adminReceiptDetailBackdrop = $("adminReceiptDetailBackdrop");
const adminReceiptDetailClose = $("adminReceiptDetailClose");
const adminReceiptDetailCloseButton = $("adminReceiptDetailCloseButton");
const adminReceiptDetailTitle = $("adminReceiptDetailTitle");
const adminReceiptDetailFolio = $("adminReceiptDetailFolio");
const adminReceiptDetailStatus = $("adminReceiptDetailStatus");
const adminReceiptDetailAmount = $("adminReceiptDetailAmount");
const adminReceiptDetailClient = $("adminReceiptDetailClient");
const adminReceiptDetailClientEmail = $("adminReceiptDetailClientEmail");
const adminReceiptDetailClientPhone = $("adminReceiptDetailClientPhone");
const adminReceiptDetailVehicle = $("adminReceiptDetailVehicle");
const adminReceiptDetailVehicleType = $("adminReceiptDetailVehicleType");
const adminReceiptDetailVehicleColor = $("adminReceiptDetailVehicleColor");
const adminReceiptDetailService = $("adminReceiptDetailService");
const adminReceiptDetailConcept = $("adminReceiptDetailConcept");
const adminReceiptDetailOrder = $("adminReceiptDetailOrder");
const adminReceiptDetailCreated = $("adminReceiptDetailCreated");
const adminReceiptPaymentBox = $("adminReceiptPaymentBox");
const adminReceiptPaymentTitle = $("adminReceiptPaymentTitle");
const adminReceiptDetailPaymentMethod = $("adminReceiptDetailPaymentMethod");
const adminReceiptDetailPaidDate = $("adminReceiptDetailPaidDate");
const adminReceiptDetailPaidBy = $("adminReceiptDetailPaidBy");
const adminReceiptDetailFinanceState = $("adminReceiptDetailFinanceState");
const adminReceiptDetailNotesSection = $("adminReceiptDetailNotesSection");
const adminReceiptDetailNotes = $("adminReceiptDetailNotes");
const adminReceiptOrderButton = $("adminReceiptOrderButton");
const adminReceiptConfirmPaymentButton = $("adminReceiptConfirmPaymentButton");
const adminReceiptCustomerButton = $("adminReceiptCustomerButton");
const adminCustomerReceiptModal = $("adminCustomerReceiptModal");
const adminCustomerReceiptBackdrop = $("adminCustomerReceiptBackdrop");
const adminCustomerReceiptClose = $("adminCustomerReceiptClose");
const adminCustomerReceiptCloseButton = $("adminCustomerReceiptCloseButton");
const adminCustomerReceiptLoading = $("adminCustomerReceiptLoading");
const adminCustomerReceiptImage = $("adminCustomerReceiptImage");
const adminCustomerReceiptDownload = $("adminCustomerReceiptDownload");
const adminCustomerReceiptPrint = $("adminCustomerReceiptPrint");
const adminCustomerReceiptWhatsApp = $("adminCustomerReceiptWhatsApp");
const adminPaymentModal = $("adminPaymentModal");
const adminPaymentBackdrop = $("adminPaymentBackdrop");
const adminPaymentClose = $("adminPaymentClose");
const adminPaymentCancel = $("adminPaymentCancel");
const adminPaymentForm = $("adminPaymentForm");
const adminPaymentReceiptReference = $("adminPaymentReceiptReference");
const adminPaymentAmount = $("adminPaymentAmount");
const adminPaymentMethod = $("adminPaymentMethod");
const adminPaymentReferenceField = $("adminPaymentReferenceField");
const adminPaymentReference = $("adminPaymentReference");
const adminPaymentNotes = $("adminPaymentNotes");
const adminPaymentSubmit = $("adminPaymentSubmit");
const adminToast = $("adminToast");

let currentUser = null;
let currentUserData = null;
let receipts = [];
let orders = [];
let usersById = new Map();
let filteredReceipts = [];
let selectedReceipt = null;
let selectedCreateOrder = null;
let searchTerm = "";
let statusFilter = "todos";
let paymentFilter = "todos";
let sortMode = "recientes";
let creatingReceipt = false;
let confirmingPayment = false;
let generatingCustomerReceipt = false;
let customerReceiptAsset = null;
let toastTimer = null;

const RECEIPT_STATUS = {
    pendiente: {
        label: "Pendiente",
        className: ""
    },
    pagado: {
        label: "Pagado",
        className: "is-paid"
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

function getPermissions(data) {
    return (
        data?.permisos &&
        typeof data.permisos === "object"
    )
        ? data.permisos
        : {};
}

function userIsAdmin(data) {
    return (
        data?.rol === "admin" ||
        getPermissions(data).admin === true
    );
}

function userHasFinance(data) {
    return (
        getPermissions(data).finanzas === true
    );
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

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
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

function formatGeneratedDate(date) {
    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}

function formatGeneratedTime(date) {
    return new Intl.DateTimeFormat(
        "es-MX",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    ).format(date);
}

function formatCurrency(value) {
    const amount =
        Number(value);

    return new Intl.NumberFormat(
        "es-MX",
        {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number.isFinite(amount)
            ? amount
            : 0
    );
}

function getAmount(item) {
    const values = [
        item?.monto,
        item?.importe,
        item?.total
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

    return 0;
}

function getOrderEstimatedPrice(order) {
    const values = [
        order?.precioFinal,
        order?.total,
        order?.precioEstimado,
        order?.cotizacionTotal,
        order?.precio
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

    return 0;
}

function getComparableTime(item) {
    const values = [
        item?.pagadoEn,
        item?.actualizadoEn,
        item?.creadoEn
    ];

    for (
        const value
        of values
    ) {
        const date =
            timestampToDate(value);

        if (date) {
            return date.getTime();
        }
    }

    return 0;
}

function getVehicle(item) {
    return (
        item?.vehiculo &&
        typeof item.vehiculo ===
            "object"
    )
        ? item.vehiculo
        : {};
}

function getVehicleName(vehicle) {
    return [
        vehicle?.marca,
        vehicle?.modelo,
        Number(
            vehicle?.anio
        ) > 0
            ? vehicle.anio
            : ""
    ]
        .filter(Boolean)
        .join(" ") ||
        "Vehículo";
}

function formatVehicleType(value) {
    const values = {
        hatchback:
            "Hatchback",
        sedan:
            "Sedán",
        suv:
            "SUV",
        pickup:
            "Pick-up",
        pick_up:
            "Pick-up",
        camioneta:
            "Camioneta",
        moto:
            "Moto",
        otro:
            "Otro"
    };

    return (
        values[
            normalizeStatus(value)
        ] ||
        value ||
        "Sin categoría"
    );
}

function getClientName(item) {
    const directName =
        item?.clienteNombre ||
        item?.nombreCliente ||
        item?.cliente?.nombre ||
        "";

    const clientUid =
        item?.clienteUid ||
        item?.uidCliente ||
        item?.cliente?.uid ||
        "";

    if (
        clientUid &&
        usersById.has(
            clientUid
        )
    ) {
        const user =
            usersById.get(
                clientUid
            );

        const realName =
            String(
                user?.nombre ||
                ""
            ).trim();

        if (realName) {
            return realName;
        }
    }

    if (
        directName &&
        !String(
            directName
        ).includes("@")
    ) {
        return directName;
    }

    const email =
        getClientEmail(
            item
        );

    if (
        email &&
        usersById.size
    ) {
        const normalizedEmail =
            String(
                email
            )
                .trim()
                .toLowerCase();

        for (
            const user
            of usersById.values()
        ) {
            if (
                String(
                    user?.email ||
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                normalizedEmail
            ) {
                const realName =
                    String(
                        user?.nombre ||
                        ""
                    ).trim();

                if (realName) {
                    return realName;
                }
            }
        }
    }

    return (
        directName ||
        email ||
        "Cliente PMC"
    );
}

function getClientEmail(item) {
    return (
        item?.clienteEmail ||
        item?.cliente?.email ||
        ""
    );
}

function getClientPhone(item) {
    return (
        item?.clienteTelefono ||
        item?.telefonoCliente ||
        item?.cliente?.telefono ||
        ""
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

function getReceiptFolio(receipt) {
    return (
        receipt?.folio ||
        `REC-${String(
            receipt?.id ||
            ""
        )
            .slice(
                0,
                8
            )
            .toUpperCase()}`
    );
}

function getOrderFolio(order) {
    return (
        order?.folio ||
        `OT-${String(
            order?.id ||
            ""
        )
            .slice(
                0,
                8
            )
            .toUpperCase()}`
    );
}

function formatPaymentMethod(value) {
    const values = {
        efectivo:
            "Efectivo",
        transferencia:
            "Transferencia",
        tarjeta:
            "Tarjeta",
        otro:
            "Otro"
    };

    return (
        values[
            normalizeStatus(value)
        ] ||
        "Por definir"
    );
}

function getReceiptStatus(receipt) {
    const value =
        normalizeStatus(
            receipt?.estado ||
            receipt?.pagoEstado ||
            "pendiente"
        );

    if (
        [
            "pagado",
            "pagada"
        ].includes(value)
    ) {
        return "pagado";
    }

    if (
        [
            "cancelado",
            "cancelada"
        ].includes(value)
    ) {
        return "cancelado";
    }

    return "pendiente";
}

function getReceiptStatusData(receipt) {
    return (
        RECEIPT_STATUS[
            getReceiptStatus(
                receipt
            )
        ] ||
        RECEIPT_STATUS.pendiente
    );
}

function isToday(value) {
    const date =
        timestampToDate(value);

    if (!date) {
        return false;
    }

    const now =
        new Date();

    return (
        date.getFullYear() ===
            now.getFullYear() &&
        date.getMonth() ===
            now.getMonth() &&
        date.getDate() ===
            now.getDate()
    );
}

function getUserName(userId) {
    const user =
        usersById.get(
            userId
        );

    return (
        user?.nombre ||
        user?.email ||
        "Personal PMC"
    );
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

    adminToast.classList.toggle(
        "is-error",
        type === "error"
    );

    adminToast.innerHTML = `
        <i data-lucide="${
            type === "error"
                ? "circle-alert"
                : "circle-check"
        }"></i>

        <span>
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
            3600
        );
}

function setCurrentDate() {
    if (currentYear) {
        currentYear.textContent =
            new Date()
                .getFullYear();
    }

    if (adminCurrentDate) {
        const text =
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
            ).format(
                new Date()
            );

        adminCurrentDate.textContent =
            text
                .charAt(0)
                .toUpperCase() +
            text.slice(1);
    }
}

function openSidebar() {
    adminSidebar
        ?.classList.add(
            "is-open"
        );

    document.body
        .classList.add(
            "admin-sidebar-open"
        );
}

function closeSidebar() {
    adminSidebar
        ?.classList.remove(
            "is-open"
        );

    document.body
        .classList.remove(
            "admin-sidebar-open"
        );
}

function openModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.add(
        "is-open"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body
        .classList.add(
            "admin-modal-open"
        );
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.remove(
        "is-open"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".admin-modal.is-open"
        )
    ) {
        document.body
            .classList.remove(
                "admin-modal-open"
            );
    }
}

function getCurrentUser() {
    return new Promise(
        (resolve) => {
            let unsubscribe =
                () => {};

            unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {
                        unsubscribe();

                        resolve(
                            user ||
                            null
                        );
                    },
                    () => {
                        unsubscribe();

                        resolve(
                            null
                        );
                    }
                );
        }
    );
}

async function validateAdminAccess() {
    currentUser =
        await getCurrentUser();

    if (!currentUser) {
        window.location.href =
            `../../login.html?return=${encodeURIComponent(
                "js/admin/recibos.html"
            )}`;

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
            throw new Error(
                "USER_NOT_FOUND"
            );
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
            await signOut(
                auth
            );

            throw new Error(
                "USER_INACTIVE"
            );
        }

        if (
            !userIsAdmin(
                currentUserData
            )
        ) {
            throw new Error(
                "ACCESS_DENIED"
            );
        }

        if (
            adminFinanceButton
        ) {
            adminFinanceButton.hidden =
                !userHasFinance(
                    currentUserData
                );
        }

        if (
            adminAccessDenied
        ) {
            adminAccessDenied.hidden =
                true;
        }

        if (adminShell) {
            adminShell.hidden =
                false;
        }

        initIcons();

        return true;
    } catch (error) {
        console.error(
            "No se pudo validar el acceso:",
            error
        );

        if (adminShell) {
            adminShell.hidden =
                true;
        }

        if (
            adminAccessDenied
        ) {
            adminAccessDenied.hidden =
                false;
        }

        hideLoader();
        initIcons();

        return false;
    }
}

async function loadUsers() {
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

        snapshot.docs
            .forEach(
                (item) => {
                    usersById.set(
                        item.id,
                        {
                            id:
                                item.id,
                            ...item.data()
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
    if (
        adminReceiptsList
    ) {
        adminReceiptsList.hidden =
            false;

        adminReceiptsList.innerHTML = `
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
        `;
    }

    if (
        adminReceiptsEmpty
    ) {
        adminReceiptsEmpty.hidden =
            true;
    }

    try {
        const [
            receiptsSnapshot,
            ordersSnapshot
        ] =
            await Promise.all([
                getDocs(
                    collection(
                        db,
                        "recibos"
                    )
                ),
                getDocs(
                    collection(
                        db,
                        "ordenes"
                    )
                )
            ]);

        receipts =
            receiptsSnapshot.docs
                .map(
                    (item) => ({
                        id:
                            item.id,
                        ...item.data()
                    })
                );

        orders =
            ordersSnapshot.docs
                .map(
                    (item) => ({
                        id:
                            item.id,
                        ...item.data()
                    })
                );

        await loadUsers();

        renderSummary();
        populateOrderSelect();
        applyFilters();
        applyURLParameters();
    } catch (error) {
        console.error(
            "No se pudieron cargar los recibos:",
            error
        );

        receipts = [];
        orders = [];
        filteredReceipts = [];

        renderSummary();
        renderReceipts();

        showToast(
            "No se pudieron cargar los recibos.",
            "error"
        );
    }
}

function renderSummary() {
    const pending =
        receipts.filter(
            (item) =>
                getReceiptStatus(
                    item
                ) ===
                "pendiente"
        );

    const paid =
        receipts.filter(
            (item) =>
                getReceiptStatus(
                    item
                ) ===
                "pagado"
        );

    const todayIncome =
        paid
            .filter(
                (item) =>
                    isToday(
                        item.pagadoEn
                    )
            )
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    getAmount(
                        item
                    ),
                0
            );

    if (
        adminReceiptsTotalCount
    ) {
        adminReceiptsTotalCount.textContent =
            String(
                receipts.length
            );
    }

    if (
        adminReceiptsPendingCount
    ) {
        adminReceiptsPendingCount.textContent =
            String(
                pending.length
            );
    }

    if (
        adminReceiptsPaidCount
    ) {
        adminReceiptsPaidCount.textContent =
            String(
                paid.length
            );
    }

    if (
        adminReceiptsTodayIncome
    ) {
        adminReceiptsTodayIncome.textContent =
            formatCurrency(
                todayIncome
            );
    }
}

function hasReceiptForOrder(
    orderId
) {
    return receipts.some(
        (item) =>
            item.ordenId ===
                orderId ||
            item.id ===
                orderId
    );
}

function orderIsEligible(
    order
) {
    const status =
        normalizeStatus(
            order.estado
        );

    return (
        ![
            "cancelado",
            "cancelada"
        ].includes(status) &&
        !hasReceiptForOrder(
            order.id
        )
    );
}

function populateOrderSelect() {
    if (
        !adminReceiptOrder
    ) {
        return;
    }

    const previous =
        adminReceiptOrder.value;

    const eligible =
        orders
            .filter(
                orderIsEligible
            )
            .sort(
                (a, b) =>
                    getComparableTime(
                        b
                    ) -
                    getComparableTime(
                        a
                    )
            );

    adminReceiptOrder.innerHTML = `
        <option value="">
            Selecciona una orden
        </option>
    `;

    eligible.forEach(
        (order) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                order.id;

            option.textContent =
                `${getOrderFolio(
                    order
                )} · ${getClientName(
                    order
                )} · ${getServiceName(
                    order
                )}`;

            adminReceiptOrder
                .appendChild(
                    option
                );
        }
    );

    if (
        eligible.some(
            (order) =>
                order.id ===
                previous
        )
    ) {
        adminReceiptOrder.value =
            previous;
    }
}

function getReceiptSearchText(
    receipt
) {
    const vehicle =
        getVehicle(
            receipt
        );

    return normalizeText(
        [
            receipt.id,
            receipt.folio,
            receipt.ordenId,
            receipt.citaId,
            getClientName(
                receipt
            ),
            getClientEmail(
                receipt
            ),
            getClientPhone(
                receipt
            ),
            getServiceName(
                receipt
            ),
            receipt.concepto,
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio,
            vehicle.color,
            receipt.metodoPago,
            receipt.estado
        ]
            .filter(Boolean)
            .join(" ")
    );
}

function applyFilters() {
    filteredReceipts =
        receipts.filter(
            (item) => {
                const matchesSearch =
                    !searchTerm ||
                    getReceiptSearchText(
                        item
                    ).includes(
                        searchTerm
                    );

                const matchesStatus =
                    statusFilter ===
                        "todos" ||
                    getReceiptStatus(
                        item
                    ) ===
                        statusFilter;

                const matchesPayment =
                    paymentFilter ===
                        "todos" ||
                    normalizeStatus(
                        item.metodoPago
                    ) ===
                        paymentFilter;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPayment
                );
            }
        );

    if (
        sortMode ===
        "antiguos"
    ) {
        filteredReceipts.sort(
            (a, b) =>
                getComparableTime(
                    a
                ) -
                getComparableTime(
                    b
                )
        );
    } else if (
        sortMode ===
        "monto_mayor"
    ) {
        filteredReceipts.sort(
            (a, b) =>
                getAmount(
                    b
                ) -
                getAmount(
                    a
                )
        );
    } else if (
        sortMode ===
        "monto_menor"
    ) {
        filteredReceipts.sort(
            (a, b) =>
                getAmount(
                    a
                ) -
                getAmount(
                    b
                )
        );
    } else {
        filteredReceipts.sort(
            (a, b) =>
                getComparableTime(
                    b
                ) -
                getComparableTime(
                    a
                )
        );
    }

    renderReceipts();
}

function createReceiptCard(
    receipt
) {
    const statusKey =
        getReceiptStatus(
            receipt
        );

    const status =
        getReceiptStatusData(
            receipt
        );

    const vehicle =
        getVehicle(
            receipt
        );

    const article =
        document.createElement(
            "article"
        );

    article.className =
        `admin-receipt-card${
            statusKey ===
                "pagado"
                ? " is-paid"
                : ""
        }${
            statusKey ===
                "cancelado"
                ? " is-cancelled"
                : ""
        }`;

    article.innerHTML = `
        <div class="admin-receipt-card__icon">

            <i data-lucide="${
                statusKey === "pagado"
                    ? "circle-check-big"
                    : "receipt-text"
            }"></i>

        </div>

        <div class="admin-receipt-card__main">

            <h3>
                ${escapeHTML(
                    getClientName(
                        receipt
                    )
                )}
            </h3>

            <span>
                ${escapeHTML(
                    getClientPhone(
                        receipt
                    ) ||
                    getClientEmail(
                        receipt
                    ) ||
                    "Sin contacto"
                )}
            </span>

            <div class="admin-receipt-card__vehicle">

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

        <div class="admin-receipt-card__service">

            <span>
                Servicio
            </span>

            <strong>
                ${escapeHTML(
                    getServiceName(
                        receipt
                    )
                )}
            </strong>

            <small>
                ${escapeHTML(
                    receipt.concepto ||
                    "Servicio realizado"
                )}
            </small>

        </div>

        <div class="admin-receipt-card__folio">

            <span>
                Recibo
            </span>

            <strong>
                ${escapeHTML(
                    getReceiptFolio(
                        receipt
                    )
                )}
            </strong>

        </div>

        <div class="admin-receipt-card__amount">

            <span>
                Importe
            </span>

            <strong>
                ${escapeHTML(
                    formatCurrency(
                        getAmount(
                            receipt
                        )
                    )
                )}
            </strong>

        </div>

        <div class="admin-receipt-card__method">

            <span>
                Método
            </span>

            <strong>
                ${escapeHTML(
                    formatPaymentMethod(
                        receipt.metodoPago
                    )
                )}
            </strong>

        </div>

        <div class="admin-receipt-card__end">

            <span class="admin-receipt-status ${status.className}">
                ${escapeHTML(
                    status.label
                )}
            </span>

            <button
                type="button"
                class="admin-receipt-card__open"
                data-receipt-id="${escapeHTML(
                    receipt.id
                )}"
                aria-label="Abrir recibo"
            >

                <i data-lucide="chevron-right"></i>

            </button>

        </div>
    `;

    return article;
}

function renderReceipts() {
    if (
        !adminReceiptsList
    ) {
        return;
    }

    adminReceiptsList.innerHTML =
        "";

    if (
        adminReceiptsResultsCount
    ) {
        adminReceiptsResultsCount.textContent =
            filteredReceipts.length ===
                1
                ? "1 recibo"
                : `${filteredReceipts.length} recibos`;
    }

    if (
        !filteredReceipts.length
    ) {
        adminReceiptsList.hidden =
            true;

        if (
            adminReceiptsEmpty
        ) {
            adminReceiptsEmpty.hidden =
                false;
        }

        return;
    }

    adminReceiptsList.hidden =
        false;

    if (
        adminReceiptsEmpty
    ) {
        adminReceiptsEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    filteredReceipts.forEach(
        (item) => {
            fragment.appendChild(
                createReceiptCard(
                    item
                )
            );
        }
    );

    adminReceiptsList
        .appendChild(
            fragment
        );

    initIcons();
}

function resetFilters() {
    searchTerm = "";
    statusFilter = "todos";
    paymentFilter = "todos";
    sortMode = "recientes";

    if (
        adminReceiptSearch
    ) {
        adminReceiptSearch.value =
            "";
    }

    if (
        adminReceiptStatusFilter
    ) {
        adminReceiptStatusFilter.value =
            "todos";
    }

    if (
        adminReceiptPaymentFilter
    ) {
        adminReceiptPaymentFilter.value =
            "todos";
    }

    if (
        adminReceiptSort
    ) {
        adminReceiptSort.value =
            "recientes";
    }

    applyFilters();
}

function resetCreateForm() {
    selectedCreateOrder =
        null;

    adminReceiptForm
        ?.reset();

    if (
        adminReceiptOrderPreview
    ) {
        adminReceiptOrderPreview.hidden =
            true;
    }
}

function openCreateReceiptModal(
    orderId = ""
) {
    populateOrderSelect();
    resetCreateForm();

    if (
        orderId &&
        adminReceiptOrder &&
        Array.from(
            adminReceiptOrder.options
        ).some(
            (option) =>
                option.value ===
                orderId
        )
    ) {
        adminReceiptOrder.value =
            orderId;

        handleOrderSelection();
    }

    openModal(
        adminReceiptCreateModal
    );
}

function closeCreateReceiptModal() {
    if (
        creatingReceipt
    ) {
        return;
    }

    closeModal(
        adminReceiptCreateModal
    );

    resetCreateForm();
}

function handleOrderSelection() {
    const orderId =
        adminReceiptOrder
            ?.value ||
        "";

    selectedCreateOrder =
        orders.find(
            (order) =>
                order.id ===
                orderId
        ) ||
        null;

    if (
        !selectedCreateOrder
    ) {
        if (
            adminReceiptOrderPreview
        ) {
            adminReceiptOrderPreview.hidden =
                true;
        }

        return;
    }

    const vehicle =
        getVehicle(
            selectedCreateOrder
        );

    if (
        adminReceiptPreviewClient
    ) {
        adminReceiptPreviewClient.textContent =
            getClientName(
                selectedCreateOrder
            );
    }

    if (
        adminReceiptPreviewVehicle
    ) {
        adminReceiptPreviewVehicle.textContent =
            getVehicleName(
                vehicle
            );
    }

    if (
        adminReceiptPreviewService
    ) {
        adminReceiptPreviewService.textContent =
            getServiceName(
                selectedCreateOrder
            );
    }

    if (
        adminReceiptPreviewOrder
    ) {
        adminReceiptPreviewOrder.textContent =
            getOrderFolio(
                selectedCreateOrder
            );
    }

    if (
        adminReceiptAmount
    ) {
        const amount =
            getOrderEstimatedPrice(
                selectedCreateOrder
            );

        adminReceiptAmount.value =
            amount > 0
                ? String(
                    amount
                )
                : "";
    }

    if (
        adminReceiptConcept
    ) {
        adminReceiptConcept.value =
            getServiceName(
                selectedCreateOrder
            );
    }

    if (
        adminReceiptOrderPreview
    ) {
        adminReceiptOrderPreview.hidden =
            false;
    }
}

function setCreateLoading(
    loading
) {
    creatingReceipt =
        loading;

    if (
        !adminReceiptSubmit
    ) {
        return;
    }

    adminReceiptSubmit.disabled =
        loading;

    adminReceiptSubmit.innerHTML =
        loading
            ? `
                <i data-lucide="loader-circle"></i>
                Creando...
            `
            : `
                <i data-lucide="receipt-text"></i>
                Crear recibo
            `;

    initIcons();
}

function buildReceiptData(
    order,
    amount,
    concept,
    notes,
    paymentMethod
) {
    return {
        ordenId:
            order.id,
        citaId:
            order.citaId ||
            null,
        clienteUid:
            order.clienteUid ||
            null,
        clienteNombre:
            getClientName(
                order
            ),
        clienteEmail:
            getClientEmail(
                order
            ) ||
            null,
        clienteTelefono:
            getClientPhone(
                order
            ) ||
            null,
        vehiculo: {
            ...getVehicle(
                order
            )
        },
        servicioId:
            order.servicioId ||
            null,
        servicioNombre:
            getServiceName(
                order
            ),
        concepto:
            concept,
        monto:
            amount,
        importe:
            amount,
        metodoPago:
            paymentMethod ||
            null,
        notas:
            notes ||
            "",
        estado:
            "pendiente",
        pagoEstado:
            "pendiente",
        origen:
            "orden",
        finanzasRegistrado:
            false,
        movimientoFinanzasId:
            null,
        creadoPor:
            currentUser.uid,
        creadoEn:
            serverTimestamp(),
        actualizadoEn:
            serverTimestamp()
    };
}

async function createReceipt(
    event
) {
    event.preventDefault();

    if (
        creatingReceipt ||
        !selectedCreateOrder
    ) {
        return;
    }

    const amount =
        Number(
            adminReceiptAmount
                ?.value
        );

    const concept =
        String(
            adminReceiptConcept
                ?.value ||
            ""
        ).trim();

    const notes =
        String(
            adminReceiptNotes
                ?.value ||
            ""
        ).trim();

    const paymentMethod =
        normalizeStatus(
            adminReceiptPaymentMethod
                ?.value
        );

    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {
        showToast(
            "Ingresa un importe válido.",
            "error"
        );

        adminReceiptAmount
            ?.focus();

        return;
    }

    if (
        !concept
    ) {
        showToast(
            "Escribe el concepto del recibo.",
            "error"
        );

        adminReceiptConcept
            ?.focus();

        return;
    }

    setCreateLoading(
        true
    );

    try {
        const orderId =
            selectedCreateOrder.id;

        const orderReference =
            doc(
                db,
                "ordenes",
                orderId
            );

        const receiptReference =
            doc(
                db,
                "recibos",
                orderId
            );

        await runTransaction(
            db,
            async (
                transaction
            ) => {
                const orderSnapshot =
                    await transaction.get(
                        orderReference
                    );

                const receiptSnapshot =
                    await transaction.get(
                        receiptReference
                    );

                if (
                    !orderSnapshot.exists()
                ) {
                    throw new Error(
                        "ORDER_NOT_FOUND"
                    );
                }

                if (
                    receiptSnapshot.exists()
                ) {
                    throw new Error(
                        "RECEIPT_ALREADY_EXISTS"
                    );
                }

                const orderData = {
                    id:
                        orderSnapshot.id,
                    ...orderSnapshot.data()
                };

                if (
                    [
                        "cancelado",
                        "cancelada"
                    ].includes(
                        normalizeStatus(
                            orderData.estado
                        )
                    )
                ) {
                    throw new Error(
                        "ORDER_CANCELLED"
                    );
                }

                if (
                    orderData.reciboId
                ) {
                    throw new Error(
                        "RECEIPT_ALREADY_EXISTS"
                    );
                }

                const receiptData =
                    buildReceiptData(
                        orderData,
                        amount,
                        concept,
                        notes,
                        paymentMethod
                    );

                receiptData.folio =
                    `REC-${orderId
                        .slice(
                            0,
                            8
                        )
                        .toUpperCase()}`;

                transaction.set(
                    receiptReference,
                    receiptData
                );

                transaction.update(
                    orderReference,
                    {
                        reciboId:
                            receiptReference.id,
                        pagoEstado:
                            orderData.pagoEstado ||
                            "pendiente",
                        actualizadoEn:
                            serverTimestamp()
                    }
                );
            }
        );

        showToast(
            "Recibo creado correctamente."
        );

        closeCreateReceiptModal();

        await loadData();

        openReceiptDetail(
            orderId
        );
    } catch (error) {
        console.error(
            "No se pudo crear el recibo:",
            error
        );

        if (
            error.message ===
            "RECEIPT_ALREADY_EXISTS"
        ) {
            showToast(
                "Esta orden ya tiene un recibo.",
                "error"
            );
        } else if (
            error.message ===
            "ORDER_CANCELLED"
        ) {
            showToast(
                "No se puede crear un recibo para una orden cancelada.",
                "error"
            );
        } else {
            showToast(
                "No se pudo crear el recibo.",
                "error"
            );
        }
    } finally {
        setCreateLoading(
            false
        );
    }
}

function renderReceiptDetail(
    receipt
) {
    if (!receipt) {
        return;
    }

    const statusKey =
        getReceiptStatus(
            receipt
        );

    const status =
        getReceiptStatusData(
            receipt
        );

    const vehicle =
        getVehicle(
            receipt
        );

    const linkedOrder =
        orders.find(
            (order) =>
                order.id ===
                receipt.ordenId
        );

    if (
        adminReceiptDetailTitle
    ) {
        adminReceiptDetailTitle.textContent =
            getServiceName(
                receipt
            );
    }

    if (
        adminReceiptDetailFolio
    ) {
        adminReceiptDetailFolio.textContent =
            getReceiptFolio(
                receipt
            );
    }

    if (
        adminReceiptDetailStatus
    ) {
        adminReceiptDetailStatus.className =
            `admin-receipt-status ${status.className}`;

        adminReceiptDetailStatus.textContent =
            status.label;
    }

    if (
        adminReceiptDetailAmount
    ) {
        adminReceiptDetailAmount.textContent =
            formatCurrency(
                getAmount(
                    receipt
                )
            );
    }

    if (
        adminReceiptDetailClient
    ) {
        adminReceiptDetailClient.textContent =
            getClientName(
                receipt
            );
    }

    if (
        adminReceiptDetailClientEmail
    ) {
        adminReceiptDetailClientEmail.textContent =
            getClientEmail(
                receipt
            ) ||
            "Sin correo";
    }

    if (
        adminReceiptDetailClientPhone
    ) {
        adminReceiptDetailClientPhone.textContent =
            getClientPhone(
                receipt
            ) ||
            "Sin teléfono";
    }

    if (
        adminReceiptDetailVehicle
    ) {
        adminReceiptDetailVehicle.textContent =
            getVehicleName(
                vehicle
            );
    }

    if (
        adminReceiptDetailVehicleType
    ) {
        adminReceiptDetailVehicleType.textContent =
            formatVehicleType(
                vehicle.tipo
            );
    }

    if (
        adminReceiptDetailVehicleColor
    ) {
        adminReceiptDetailVehicleColor.textContent =
            vehicle.color ||
            "Sin color";
    }

    if (
        adminReceiptDetailService
    ) {
        adminReceiptDetailService.textContent =
            getServiceName(
                receipt
            );
    }

    if (
        adminReceiptDetailConcept
    ) {
        adminReceiptDetailConcept.textContent =
            receipt.concepto ||
            "Servicio realizado";
    }

    if (
        adminReceiptDetailOrder
    ) {
        adminReceiptDetailOrder.textContent =
            linkedOrder
                ? getOrderFolio(
                    linkedOrder
                )
                : (
                    receipt.ordenId ||
                    "Sin orden"
                );
    }

    if (
        adminReceiptDetailCreated
    ) {
        adminReceiptDetailCreated.textContent =
            formatDateTime(
                receipt.creadoEn
            );
    }

    if (
        adminReceiptDetailPaymentMethod
    ) {
        adminReceiptDetailPaymentMethod.textContent =
            formatPaymentMethod(
                receipt.metodoPago
            );
    }

    if (
        adminReceiptDetailPaidDate
    ) {
        adminReceiptDetailPaidDate.textContent =
            statusKey ===
                "pagado"
                ? formatDateTime(
                    receipt.pagadoEn
                )
                : "Pendiente";
    }

    if (
        adminReceiptDetailPaidBy
    ) {
        adminReceiptDetailPaidBy.textContent =
            statusKey ===
                "pagado"
                ? getUserName(
                    receipt.pagadoPor
                )
                : "Pendiente";
    }

    if (
        adminReceiptPaymentBox
    ) {
        adminReceiptPaymentBox
            .classList.toggle(
                "is-paid",
                statusKey ===
                    "pagado"
            );
    }

    if (
        adminReceiptPaymentTitle
    ) {
        adminReceiptPaymentTitle.textContent =
            statusKey ===
                "pagado"
                ? "Pago confirmado"
                : statusKey ===
                    "cancelado"
                    ? "Recibo cancelado"
                    : "Pago pendiente";
    }

    if (
        adminReceiptDetailFinanceState
    ) {
        adminReceiptDetailFinanceState.textContent =
            (
                receipt.finanzasRegistrado ===
                    true ||
                receipt.movimientoFinanzasId
            )
                ? "Registrado"
                : statusKey ===
                    "pagado"
                    ? "Pendiente de sincronizar"
                    : "Sin registrar";
    }

    if (
        adminReceiptDetailNotesSection
    ) {
        adminReceiptDetailNotesSection.hidden =
            !receipt.notas;
    }

    if (
        adminReceiptDetailNotes
    ) {
        adminReceiptDetailNotes.textContent =
            receipt.notas ||
            "Sin notas.";
    }

    if (
        adminReceiptOrderButton
    ) {
        adminReceiptOrderButton.href =
            receipt.ordenId
                ? `ordenes.html?id=${encodeURIComponent(
                    receipt.ordenId
                )}`
                : "ordenes.html";
    }

    if (
        adminReceiptConfirmPaymentButton
    ) {
        adminReceiptConfirmPaymentButton.hidden =
            !(
                statusKey ===
                    "pendiente" &&
                userHasFinance(
                    currentUserData
                )
            );
    }

    if (
        adminReceiptCustomerButton
    ) {
        adminReceiptCustomerButton.hidden =
            statusKey !==
            "pagado";
    }

    initIcons();
}

function openReceiptDetail(
    receiptId
) {
    const receipt =
        receipts.find(
            (item) =>
                item.id ===
                receiptId
        );

    if (!receipt) {
        return;
    }

    selectedReceipt =
        receipt;

    renderReceiptDetail(
        receipt
    );

    openModal(
        adminReceiptDetailModal
    );
}

function closeReceiptDetail() {
    if (
        confirmingPayment ||
        generatingCustomerReceipt
    ) {
        return;
    }

    closeModal(
        adminReceiptDetailModal
    );

    selectedReceipt =
        null;
}

function openPaymentModal() {
    if (
        !selectedReceipt ||
        getReceiptStatus(
            selectedReceipt
        ) !==
            "pendiente"
    ) {
        return;
    }

    if (
        !userHasFinance(
            currentUserData
        )
    ) {
        showToast(
            "Tu cuenta no tiene permiso para registrar movimientos en Finanzas.",
            "error"
        );

        return;
    }

    adminPaymentForm
        ?.reset();

    if (
        adminPaymentReceiptReference
    ) {
        adminPaymentReceiptReference.textContent =
            getReceiptFolio(
                selectedReceipt
            );
    }

    if (
        adminPaymentAmount
    ) {
        adminPaymentAmount.textContent =
            formatCurrency(
                getAmount(
                    selectedReceipt
                )
            );
    }

    if (
        adminPaymentMethod &&
        selectedReceipt.metodoPago
    ) {
        adminPaymentMethod.value =
            normalizeStatus(
                selectedReceipt.metodoPago
            );
    }

    updatePaymentReferenceVisibility();

    openModal(
        adminPaymentModal
    );
}

function closePaymentModal() {
    if (
        confirmingPayment
    ) {
        return;
    }

    closeModal(
        adminPaymentModal
    );

    adminPaymentForm
        ?.reset();

    if (
        adminPaymentReferenceField
    ) {
        adminPaymentReferenceField.hidden =
            true;
    }
}

function updatePaymentReferenceVisibility() {
    const method =
        normalizeStatus(
            adminPaymentMethod
                ?.value
        );

    const visible =
        [
            "transferencia",
            "tarjeta",
            "otro"
        ].includes(
            method
        );

    if (
        adminPaymentReferenceField
    ) {
        adminPaymentReferenceField.hidden =
            !visible;
    }

    if (
        !visible &&
        adminPaymentReference
    ) {
        adminPaymentReference.value =
            "";
    }
}

function setPaymentLoading(
    loading
) {
    confirmingPayment =
        loading;

    if (
        !adminPaymentSubmit
    ) {
        return;
    }

    adminPaymentSubmit.disabled =
        loading;

    adminPaymentSubmit.innerHTML =
        loading
            ? `
                <i data-lucide="loader-circle"></i>
                Confirmando...
            `
            : `
                <i data-lucide="circle-dollar-sign"></i>
                Confirmar pago
            `;

    initIcons();
}

function buildFinanceMovement({
    receipt,
    order,
    method,
    reference,
    paymentNotes,
    movementId
}) {
    const amount =
        getAmount(
            receipt
        );

    return {
        tipo:
            "ingreso",
        monto:
            amount,
        importe:
            amount,
        concepto:
            `Venta - ${getServiceName(
                receipt
            )}`,
        descripcion:
            receipt.concepto ||
            getServiceName(
                receipt
            ),
        categoria:
            "Ventas",
        origen:
            "venta",
        estado:
            "activo",
        reciboId:
            receipt.id,
        ordenId:
            receipt.ordenId ||
            order?.id ||
            null,
        citaId:
            receipt.citaId ||
            order?.citaId ||
            null,
        clienteUid:
            receipt.clienteUid ||
            null,
        clienteNombre:
            getClientName(
                receipt
            ),
        servicioId:
            receipt.servicioId ||
            order?.servicioId ||
            null,
        servicioNombre:
            getServiceName(
                receipt
            ),
        metodoPago:
            method,
        referenciaPago:
            reference ||
            null,
        notaPago:
            paymentNotes ||
            "",
        movimientoId:
            movementId,
        fecha:
            serverTimestamp(),
        fechaMovimiento:
            serverTimestamp(),
        creadoPor:
            currentUser.uid,
        creadoEn:
            serverTimestamp(),
        actualizadoEn:
            serverTimestamp()
    };
}

async function confirmPayment(
    event
) {
    event.preventDefault();

    if (
        !selectedReceipt ||
        confirmingPayment
    ) {
        return;
    }

    if (
        !userHasFinance(
            currentUserData
        )
    ) {
        showToast(
            "Tu cuenta no tiene permiso de Finanzas.",
            "error"
        );

        return;
    }

    const method =
        normalizeStatus(
            adminPaymentMethod
                ?.value
        );

    const reference =
        String(
            adminPaymentReference
                ?.value ||
            ""
        ).trim();

    const paymentNotes =
        String(
            adminPaymentNotes
                ?.value ||
            ""
        ).trim();

    if (
        ![
            "efectivo",
            "transferencia",
            "tarjeta",
            "otro"
        ].includes(
            method
        )
    ) {
        showToast(
            "Selecciona el método de pago.",
            "error"
        );

        adminPaymentMethod
            ?.focus();

        return;
    }

    const receiptId =
        selectedReceipt.id;

    const movementId =
        `venta_${receiptId}`;

    setPaymentLoading(
        true
    );

    let alreadyRegistered =
        false;

    try {
        const receiptReference =
            doc(
                db,
                "recibos",
                receiptId
            );

        const movementReference =
            doc(
                db,
                "finanzas",
                "movimientos",
                "registros",
                movementId
            );

        await runTransaction(
            db,
            async (
                transaction
            ) => {
                const receiptSnapshot =
                    await transaction.get(
                        receiptReference
                    );

                if (
                    !receiptSnapshot.exists()
                ) {
                    throw new Error(
                        "RECEIPT_NOT_FOUND"
                    );
                }

                const receiptData = {
                    id:
                        receiptSnapshot.id,
                    ...receiptSnapshot.data()
                };

                const orderReference =
                    receiptData.ordenId
                        ? doc(
                            db,
                            "ordenes",
                            receiptData.ordenId
                        )
                        : null;

                const appointmentReference =
                    receiptData.citaId
                        ? doc(
                            db,
                            "citas",
                            receiptData.citaId
                        )
                        : null;

                const movementSnapshot =
                    await transaction.get(
                        movementReference
                    );

                const orderSnapshot =
                    orderReference
                        ? await transaction.get(
                            orderReference
                        )
                        : null;

                const appointmentSnapshot =
                    appointmentReference
                        ? await transaction.get(
                            appointmentReference
                        )
                        : null;

                if (
                    movementSnapshot.exists()
                ) {
                    if (
                        movementSnapshot
                            .data()
                            .reciboId !==
                        receiptId
                    ) {
                        throw new Error(
                            "MOVEMENT_ID_CONFLICT"
                        );
                    }

                    alreadyRegistered =
                        true;
                }

                const amount =
                    getAmount(
                        receiptData
                    );

                if (
                    !Number.isFinite(
                        amount
                    ) ||
                    amount <= 0
                ) {
                    throw new Error(
                        "INVALID_AMOUNT"
                    );
                }

                if (
                    getReceiptStatus(
                        receiptData
                    ) ===
                    "cancelado"
                ) {
                    throw new Error(
                        "RECEIPT_CANCELLED"
                    );
                }

                const orderData =
                    orderSnapshot
                        ?.exists()
                        ? {
                            id:
                                orderSnapshot.id,
                            ...orderSnapshot.data()
                        }
                        : null;

                if (
                    !movementSnapshot.exists()
                ) {
                    transaction.set(
                        movementReference,
                        buildFinanceMovement({
                            receipt:
                                receiptData,
                            order:
                                orderData,
                            method,
                            reference,
                            paymentNotes,
                            movementId
                        })
                    );
                }

                transaction.update(
                    receiptReference,
                    {
                        estado:
                            "pagado",
                        pagoEstado:
                            "pagado",
                        metodoPago:
                            method,
                        referenciaPago:
                            reference ||
                            null,
                        notaPago:
                            paymentNotes ||
                            "",
                        pagadoPor:
                            currentUser.uid,
                        pagadoEn:
                            receiptData.pagadoEn ||
                            serverTimestamp(),
                        finanzasRegistrado:
                            true,
                        movimientoFinanzasId:
                            movementId,
                        actualizadoEn:
                            serverTimestamp()
                    }
                );

                if (
                    orderReference &&
                    orderSnapshot
                        ?.exists()
                ) {
                    transaction.update(
                        orderReference,
                        {
                            pagoEstado:
                                "pagado",
                            reciboId:
                                receiptId,
                            movimientoFinanzasId:
                                movementId,
                            pagoConfirmadoEn:
                                serverTimestamp(),
                            actualizadoEn:
                                serverTimestamp()
                        }
                    );
                }

                if (
                    appointmentReference &&
                    appointmentSnapshot
                        ?.exists()
                ) {
                    transaction.update(
                        appointmentReference,
                        {
                            pagoEstado:
                                "pagado",
                            reciboId:
                                receiptId,
                            actualizadoEn:
                                serverTimestamp()
                        }
                    );
                }
            }
        );

        closePaymentModal();

        showToast(
            alreadyRegistered
                ? "El pago ya estaba registrado en Finanzas."
                : "Pago confirmado e ingreso registrado en Finanzas."
        );

        await loadData();

        openReceiptDetail(
            receiptId
        );
    } catch (error) {
        console.error(
            "No se pudo confirmar el pago:",
            error
        );

        if (
            error.message ===
            "INVALID_AMOUNT"
        ) {
            showToast(
                "El recibo no tiene un importe válido.",
                "error"
            );
        } else if (
            error.message ===
            "RECEIPT_CANCELLED"
        ) {
            showToast(
                "No se puede pagar un recibo cancelado.",
                "error"
            );
        } else if (
            error.message ===
            "MOVEMENT_ID_CONFLICT"
        ) {
            showToast(
                "Existe un conflicto con el movimiento de Finanzas. No se generó otro ingreso.",
                "error"
            );
        } else {
            showToast(
                "No se pudo confirmar el pago. Verifica tus permisos de Finanzas.",
                "error"
            );
        }
    } finally {
        setPaymentLoading(
            false
        );
    }
}

function normalizeWhatsAppNumber(
    value
) {
    let digits =
        String(
            value ||
            ""
        ).replace(
            /\D/g,
            ""
        );

    if (!digits) {
        return "";
    }

    if (
        digits.length ===
        10
    ) {
        digits =
            `52${digits}`;
    }

    if (
        digits.startsWith(
            "521"
        ) &&
        digits.length ===
            13
    ) {
        digits =
            `52${digits.slice(
                3
            )}`;
    }

    return digits;
}

function getSafeReceiptFilename(
    receipt
) {
    const folio =
        getReceiptFolio(
            receipt
        ).replace(
            /[^a-zA-Z0-9_-]/g,
            "-"
        );

    return `PMC-${folio}.png`;
}

function drawRoundedRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {
    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    context.beginPath();
    context.moveTo(
        x + r,
        y
    );
    context.lineTo(
        x +
        width -
        r,
        y
    );
    context.quadraticCurveTo(
        x +
        width,
        y,
        x +
        width,
        y +
        r
    );
    context.lineTo(
        x +
        width,
        y +
        height -
        r
    );
    context.quadraticCurveTo(
        x +
        width,
        y +
        height,
        x +
        width -
        r,
        y +
        height
    );
    context.lineTo(
        x +
        r,
        y +
        height
    );
    context.quadraticCurveTo(
        x,
        y +
        height,
        x,
        y +
        height -
        r
    );
    context.lineTo(
        x,
        y +
        r
    );
    context.quadraticCurveTo(
        x,
        y,
        x +
        r,
        y
    );
    context.closePath();
}

function drawWrappedText(
    context,
    text,
    x,
    y,
    maxWidth,
    lineHeight,
    maxLines = 2
) {
    const words =
        String(
            text ||
            ""
        )
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );

    const lines = [];

    let line = "";

    words.forEach(
        (word) => {
            const test =
                line
                    ? `${line} ${word}`
                    : word;

            if (
                context.measureText(
                    test
                ).width >
                    maxWidth &&
                line
            ) {
                lines.push(
                    line
                );

                line =
                    word;
            } else {
                line =
                    test;
            }
        }
    );

    if (line) {
        lines.push(
            line
        );
    }

    const visible =
        lines.slice(
            0,
            maxLines
        );

    if (
        lines.length >
            maxLines &&
        visible.length
    ) {
        let last =
            visible[
                visible.length -
                1
            ];

        while (
            context.measureText(
                `${last}…`
            ).width >
                maxWidth &&
            last.length >
                1
        ) {
            last =
                last.slice(
                    0,
                    -1
                );
        }

        visible[
            visible.length -
            1
        ] =
            `${last}…`;
    }

    visible.forEach(
        (
            item,
            index
        ) => {
            context.fillText(
                item,
                x,
                y +
                index *
                lineHeight
            );
        }
    );
}

function loadReceiptLogo() {
    return new Promise(
        (resolve) => {
            const image =
                new Image();

            image.onload =
                () => {
                    resolve(
                        image
                    );
                };

            image.onerror =
                () => {
                    resolve(
                        null
                    );
                };

            image.src =
                "../../imagenes/logo.png";
        }
    );
}

async function createCustomerReceiptAsset(
    receipt
) {
    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        1080;

    canvas.height =
        1500;

    const context =
        canvas.getContext(
            "2d"
        );

    if (!context) {
        throw new Error(
            "CANVAS_UNAVAILABLE"
        );
    }

    const vehicle =
        getVehicle(
            receipt
        );

    const clientName =
        getClientName(
            receipt
        );

    const clientPhone =
        getClientPhone(
            receipt
        );

    const clientEmail =
        getClientEmail(
            receipt
        );

    const vehicleName =
        getVehicleName(
            vehicle
        );

    const serviceName =
        getServiceName(
            receipt
        );

    const concept =
        receipt.concepto ||
        serviceName;

    const amount =
        formatCurrency(
            getAmount(
                receipt
            )
        );

    const folio =
        getReceiptFolio(
            receipt
        );

    const paymentMethod =
        formatPaymentMethod(
            receipt.metodoPago
        );

    const generatedAt =
        new Date();

    const generatedDate =
        formatGeneratedDate(
            generatedAt
        );

    const generatedTime =
        formatGeneratedTime(
            generatedAt
        );

    const paidDate =
        receipt.pagadoEn
            ? formatDateTime(
                receipt.pagadoEn
            )
            : "Pendiente";

    const linkedOrder =
        orders.find(
            (order) =>
                order.id ===
                receipt.ordenId
        );

    const orderFolio =
        linkedOrder
            ? getOrderFolio(
                linkedOrder
            )
            : (
                receipt.ordenId ||
                "Sin orden"
            );

    const logo =
        await loadReceiptLogo();

    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";

    const background =
        context.createLinearGradient(
            0,
            0,
            1080,
            1500
        );

    background.addColorStop(
        0,
        "#02070b"
    );

    background.addColorStop(
        0.5,
        "#07131a"
    );

    background.addColorStop(
        1,
        "#030609"
    );

    context.fillStyle =
        background;

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const glow =
        context.createRadialGradient(
            830,
            120,
            0,
            830,
            120,
            620
        );

    glow.addColorStop(
        0,
        "rgba(0, 196, 255, 0.20)"
    );

    glow.addColorStop(
        1,
        "rgba(0, 196, 255, 0)"
    );

    context.fillStyle =
        glow;

    context.fillRect(
        0,
        0,
        1080,
        650
    );

    context.strokeStyle =
        "rgba(75, 210, 255, 0.28)";

    context.lineWidth =
        2;

    drawRoundedRect(
        context,
        44,
        44,
        992,
        1412,
        38
    );

    context.stroke();

    context.fillStyle =
        "rgba(255,255,255,0.025)";

    drawRoundedRect(
        context,
        68,
        68,
        944,
        250,
        28
    );

    context.fill();

    context.strokeStyle =
        "rgba(255,255,255,0.06)";

    context.stroke();

    if (logo) {
        const ratio =
            Math.min(
                270 /
                    logo.width,
                150 /
                    logo.height
            );

        context.drawImage(
            logo,
            95,
            100,
            logo.width *
                ratio,
            logo.height *
                ratio
        );
    } else {
        context.fillStyle =
            "#ffffff";

        context.font =
            "900 48px Montserrat, Arial, sans-serif";

        context.fillText(
            "PMC",
            100,
            160
        );

        context.fillStyle =
            "#52d8ff";

        context.font =
            "700 22px Inter, Arial, sans-serif";

        context.fillText(
            "AUTO DETAILING",
            100,
            198
        );
    }

    context.textAlign =
        "right";

    context.fillStyle =
        "#55dcff";

    context.font =
        "800 18px Inter, Arial, sans-serif";

    context.fillText(
        "RECIBO DE SERVICIO",
        970,
        112
    );

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 34px Montserrat, Arial, sans-serif";

    context.fillText(
        folio,
        970,
        158
    );

    context.fillStyle =
        "rgba(52,220,138,0.14)";

    drawRoundedRect(
        context,
        760,
        184,
        210,
        58,
        29
    );

    context.fill();

    context.strokeStyle =
        "rgba(70,231,155,0.38)";

    context.stroke();

    context.fillStyle =
        "#64f0aa";

    context.font =
        "800 23px Inter, Arial, sans-serif";

    context.fillText(
        "PAGADO",
        930,
        222
    );

    context.textAlign =
        "left";

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 43px Montserrat, Arial, sans-serif";

    context.fillText(
        "Gracias por visitarnos",
        90,
        380
    );

    context.fillStyle =
        "#90a6b1";

    context.font =
        "500 23px Inter, Arial, sans-serif";

    context.fillText(
        "Este es tu recibo del día de hoy en PMC Auto Detailing.",
        90,
        420
    );

    context.fillStyle =
        "#5fdcff";

    context.font =
        "800 18px Inter, Arial, sans-serif";

    context.fillText(
        "FECHA Y HORA DE GENERACIÓN",
        90,
        472
    );

    context.fillStyle =
        "#f1f7f9";

    context.font =
        "700 25px Inter, Arial, sans-serif";

    context.fillText(
        `${generatedDate} · ${generatedTime}`,
        90,
        508
    );

    const boxX =
        90;

    const boxWidth =
        900;

    let y =
        550;

    const drawCard = (
        label,
        value,
        secondary = "",
        height = 114
    ) => {
        context.fillStyle =
            "rgba(255,255,255,0.028)";

        drawRoundedRect(
            context,
            boxX,
            y,
            boxWidth,
            height,
            22
        );

        context.fill();

        context.strokeStyle =
            "rgba(255,255,255,0.075)";

        context.stroke();

        context.fillStyle =
            "#5edcff";

        context.font =
            "800 17px Inter, Arial, sans-serif";

        context.fillText(
            label.toUpperCase(),
            boxX + 28,
            y + 30
        );

        context.fillStyle =
            "#f0f7f9";

        context.font =
            "800 27px Inter, Arial, sans-serif";

        drawWrappedText(
            context,
            value,
            boxX + 28,
            y + 68,
            boxWidth - 56,
            32,
            2
        );

        if (secondary) {
            context.fillStyle =
                "#78909b";

            context.font =
                "500 18px Inter, Arial, sans-serif";

            context.fillText(
                secondary,
                boxX + 28,
                y +
                height -
                20
            );
        }

        y +=
            height +
            14;
    };

    drawCard(
        "Cliente",
        clientName,
        clientPhone ||
        clientEmail ||
        "Cliente PMC"
    );

    drawCard(
        "Vehículo",
        vehicleName,
        [
            formatVehicleType(
                vehicle.tipo
            ),
            vehicle.color
        ]
            .filter(Boolean)
            .join(" · ")
    );

    drawCard(
        "Servicio realizado",
        concept,
        serviceName !==
            concept
            ? serviceName
            : "PMC Auto Detailing",
        128
    );

    context.fillStyle =
        "rgba(0,190,255,0.055)";

    drawRoundedRect(
        context,
        boxX,
        y,
        boxWidth,
        220,
        26
    );

    context.fill();

    context.strokeStyle =
        "rgba(69,211,255,0.23)";

    context.stroke();

    context.fillStyle =
        "#5edcff";

    context.font =
        "800 18px Inter, Arial, sans-serif";

    context.fillText(
        "DETALLE DEL PAGO",
        boxX + 28,
        y + 34
    );

    context.fillStyle =
        "#dce9ed";

    context.font =
        "600 21px Inter, Arial, sans-serif";

    context.fillText(
        `Método: ${paymentMethod}`,
        boxX + 28,
        y + 78
    );

    context.fillText(
        `Orden: ${orderFolio}`,
        boxX + 28,
        y + 112
    );

    context.fillText(
        `Pago confirmado: ${paidDate}`,
        boxX + 28,
        y + 146
    );

    if (
        receipt.referenciaPago
    ) {
        context.fillText(
            `Referencia: ${receipt.referenciaPago}`,
            boxX + 28,
            y + 180
        );
    }

    context.textAlign =
        "right";

    context.fillStyle =
        "#88e8ff";

    context.font =
        "800 17px Inter, Arial, sans-serif";

    context.fillText(
        "TOTAL",
        boxX +
        boxWidth -
        28,
        y + 48
    );

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 52px Montserrat, Arial, sans-serif";

    context.fillText(
        amount,
        boxX +
        boxWidth -
        28,
        y + 108
    );

    context.textAlign =
        "left";

    y +=
        260;

    context.strokeStyle =
        "rgba(255,255,255,0.09)";

    context.beginPath();

    context.moveTo(
        90,
        y
    );

    context.lineTo(
        990,
        y
    );

    context.stroke();

    y +=
        48;

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 31px Montserrat, Arial, sans-serif";

    context.fillText(
        "¡Gracias por confiar en nosotros!",
        90,
        y
    );

    y +=
        42;

    context.fillStyle =
        "#91a7b2";

    context.font =
        "500 20px Inter, Arial, sans-serif";

    context.fillText(
        "Fue un gusto atender tu vehículo. Esperamos verte nuevamente muy pronto.",
        90,
        y
    );

    y +=
        50;

    context.fillStyle =
        "#5edcff";

    context.font =
        "800 18px Inter, Arial, sans-serif";

    context.fillText(
        "PMC AUTO DETAILING",
        90,
        y
    );

    y +=
        34;

    context.fillStyle =
        "#cbd9de";

    context.font =
        "600 19px Inter, Arial, sans-serif";

    context.fillText(
        "WhatsApp 954 203 8099",
        90,
        y
    );

    y +=
        30;

    context.fillText(
        "Instagram @pmcautodetailing",
        90,
        y
    );

    y +=
        30;

    context.fillText(
        "PMC.Auto.Detailing@outlook.com",
        90,
        y
    );

    context.textAlign =
        "right";

    context.fillStyle =
        "#3f5660";

    context.font =
        "600 16px Inter, Arial, sans-serif";

    context.fillText(
        "Comprobante digital generado por PMC Auto Detailing",
        990,
        1415
    );

    const dataUrl =
        canvas.toDataURL(
            "image/png",
            1
        );

    const blob =
        await new Promise(
            (
                resolve,
                reject
            ) => {
                canvas.toBlob(
                    (result) => {
                        if (
                            result
                        ) {
                            resolve(
                                result
                            );
                        } else {
                            reject(
                                new Error(
                                    "IMAGE_GENERATION_FAILED"
                                )
                            );
                        }
                    },
                    "image/png",
                    1
                );
            }
        );

    return {
        dataUrl,
        blob,
        filename:
            getSafeReceiptFilename(
                receipt
            ),
        generatedAt
    };
}

async function openCustomerReceiptModal() {
    if (
        !selectedReceipt ||
        getReceiptStatus(
            selectedReceipt
        ) !==
            "pagado" ||
        generatingCustomerReceipt
    ) {
        return;
    }

    generatingCustomerReceipt =
        true;

    customerReceiptAsset =
        null;

    if (
        adminCustomerReceiptImage
    ) {
        adminCustomerReceiptImage.hidden =
            true;

        adminCustomerReceiptImage
            .removeAttribute(
                "src"
            );
    }

    if (
        adminCustomerReceiptLoading
    ) {
        adminCustomerReceiptLoading.hidden =
            false;
    }

    if (
        adminCustomerReceiptDownload
    ) {
        adminCustomerReceiptDownload.disabled =
            true;
    }

    if (
        adminCustomerReceiptPrint
    ) {
        adminCustomerReceiptPrint.disabled =
            true;
    }

    if (
        adminCustomerReceiptWhatsApp
    ) {
        adminCustomerReceiptWhatsApp.disabled =
            true;
    }

    openModal(
        adminCustomerReceiptModal
    );

    initIcons();

    try {
        customerReceiptAsset =
            await createCustomerReceiptAsset(
                selectedReceipt
            );

        if (
            adminCustomerReceiptImage
        ) {
            adminCustomerReceiptImage.src =
                customerReceiptAsset.dataUrl;

            adminCustomerReceiptImage.hidden =
                false;
        }

        if (
            adminCustomerReceiptDownload
        ) {
            adminCustomerReceiptDownload.disabled =
                false;
        }

        if (
            adminCustomerReceiptPrint
        ) {
            adminCustomerReceiptPrint.disabled =
                false;
        }

        if (
            adminCustomerReceiptWhatsApp
        ) {
            adminCustomerReceiptWhatsApp.disabled =
                false;
        }
    } catch (error) {
        console.error(
            "No se pudo generar el recibo para el cliente:",
            error
        );

        showToast(
            "No se pudo generar la imagen del recibo.",
            "error"
        );
    } finally {
        generatingCustomerReceipt =
            false;

        if (
            adminCustomerReceiptLoading
        ) {
            adminCustomerReceiptLoading.hidden =
                true;
        }
    }
}

function closeCustomerReceiptModal() {
    if (
        generatingCustomerReceipt
    ) {
        return;
    }

    closeModal(
        adminCustomerReceiptModal
    );
}

function downloadCustomerReceipt() {
    if (
        !customerReceiptAsset
    ) {
        return;
    }

    const link =
        document.createElement(
            "a"
        );

    link.href =
        customerReceiptAsset.dataUrl;

    link.download =
        customerReceiptAsset.filename;

    document.body
        .appendChild(
            link
        );

    link.click();

    link.remove();
}

function printCustomerReceipt() {
    if (
        !customerReceiptAsset ||
        !selectedReceipt
    ) {
        return;
    }

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1100"
        );

    if (
        !printWindow
    ) {
        showToast(
            "El navegador bloqueó la ventana de impresión.",
            "error"
        );

        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <title>
                ${escapeHTML(
                    getReceiptFolio(
                        selectedReceipt
                    )
                )}
            </title>

            <style>
                html,
                body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                }

                body {
                    display: flex;
                    justify-content: center;
                }

                img {
                    display: block;
                    width: 100%;
                    max-width: 820px;
                    height: auto;
                }

                @page {
                    size: auto;
                    margin: 8mm;
                }
            </style>

        </head>

        <body>

            <img
                src="${customerReceiptAsset.dataUrl}"
                alt="Recibo PMC"
            >

        </body>

        </html>
    `);

    printWindow.document.close();

    printWindow.addEventListener(
        "load",
        () => {
            printWindow.focus();

            printWindow.print();
        }
    );
}

async function shareCustomerReceipt() {
    if (
        !selectedReceipt ||
        !customerReceiptAsset
    ) {
        return;
    }

    const file =
        new File(
            [
                customerReceiptAsset.blob
            ],
            customerReceiptAsset.filename,
            {
                type:
                    "image/png"
            }
        );

    const shareText =
        `Hola ${getClientName(
            selectedReceipt
        )}, gracias por visitar PMC Auto Detailing. Te compartimos tu recibo ${getReceiptFolio(
            selectedReceipt
        )} por el servicio realizado a tu vehículo. ¡Gracias por tu preferencia!`;

    if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
            files: [
                file
            ]
        })
    ) {
        try {
            await navigator.share({
                title:
                    getReceiptFolio(
                        selectedReceipt
                    ),
                text:
                    shareText,
                files: [
                    file
                ]
            });

            return;
        } catch (error) {
            if (
                error?.name ===
                "AbortError"
            ) {
                return;
            }
        }
    }

    downloadCustomerReceipt();

    const phone =
        normalizeWhatsAppNumber(
            getClientPhone(
                selectedReceipt
            )
        );

    const message =
        `${shareText}\n\nLa imagen del recibo se descargó para que puedas adjuntarla en este chat.`;

    const url =
        phone
            ? `https://wa.me/${phone}?text=${encodeURIComponent(
                message
            )}`
            : `https://wa.me/?text=${encodeURIComponent(
                message
            )}`;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}

function applyURLParameters() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const receiptId =
        params.get(
            "id"
        );

    const orderId =
        params.get(
            "orden"
        );

    const status =
        normalizeStatus(
            params.get(
                "estado"
            )
        );

    if (
        [
            "pendiente",
            "pagado",
            "cancelado"
        ].includes(
            status
        )
    ) {
        statusFilter =
            status;

        if (
            adminReceiptStatusFilter
        ) {
            adminReceiptStatusFilter.value =
                status;
        }

        applyFilters();
    }

    if (
        receiptId &&
        receipts.some(
            (item) =>
                item.id ===
                receiptId
        )
    ) {
        openReceiptDetail(
            receiptId
        );

        return;
    }

    if (
        orderId
    ) {
        const existing =
            receipts.find(
                (item) =>
                    item.ordenId ===
                        orderId ||
                    item.id ===
                        orderId
            );

        if (
            existing
        ) {
            openReceiptDetail(
                existing.id
            );

            return;
        }

        if (
            orders.some(
                (order) =>
                    order.id ===
                        orderId &&
                    orderIsEligible(
                        order
                    )
            )
        ) {
            openCreateReceiptModal(
                orderId
            );
        }
    }
}

function bindEvents() {
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

    adminLogout
        ?.addEventListener(
            "click",
            async () => {
                adminLogout.disabled =
                    true;

                try {
                    await signOut(
                        auth
                    );

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
        );

    adminReceiptSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        adminReceiptSearch.value
                    );

                applyFilters();
            }
        );

    adminReceiptStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    adminReceiptStatusFilter.value;

                applyFilters();
            }
        );

    adminReceiptPaymentFilter
        ?.addEventListener(
            "change",
            () => {
                paymentFilter =
                    adminReceiptPaymentFilter.value;

                applyFilters();
            }
        );

    adminReceiptSort
        ?.addEventListener(
            "change",
            () => {
                sortMode =
                    adminReceiptSort.value;

                applyFilters();
            }
        );

    adminResetReceiptFilters
        ?.addEventListener(
            "click",
            resetFilters
        );

    adminReceiptsList
        ?.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-receipt-id]"
                    );

                if (
                    button
                ) {
                    openReceiptDetail(
                        button.dataset
                            .receiptId
                    );
                }
            }
        );

    [
        adminNewReceiptButton,
        adminCreateReceiptButton,
        adminReceiptsEmptyCreate
    ].forEach(
        (button) => {
            button
                ?.addEventListener(
                    "click",
                    () => {
                        openCreateReceiptModal();
                    }
                );
        }
    );

    adminReceiptCreateBackdrop
        ?.addEventListener(
            "click",
            closeCreateReceiptModal
        );

    adminReceiptCreateClose
        ?.addEventListener(
            "click",
            closeCreateReceiptModal
        );

    adminReceiptCreateCancel
        ?.addEventListener(
            "click",
            closeCreateReceiptModal
        );

    adminReceiptOrder
        ?.addEventListener(
            "change",
            handleOrderSelection
        );

    adminReceiptForm
        ?.addEventListener(
            "submit",
            createReceipt
        );

    adminReceiptDetailBackdrop
        ?.addEventListener(
            "click",
            closeReceiptDetail
        );

    adminReceiptDetailClose
        ?.addEventListener(
            "click",
            closeReceiptDetail
        );

    adminReceiptDetailCloseButton
        ?.addEventListener(
            "click",
            closeReceiptDetail
        );

    adminReceiptConfirmPaymentButton
        ?.addEventListener(
            "click",
            openPaymentModal
        );

    adminPaymentBackdrop
        ?.addEventListener(
            "click",
            closePaymentModal
        );

    adminPaymentClose
        ?.addEventListener(
            "click",
            closePaymentModal
        );

    adminPaymentCancel
        ?.addEventListener(
            "click",
            closePaymentModal
        );

    adminPaymentMethod
        ?.addEventListener(
            "change",
            updatePaymentReferenceVisibility
        );

    adminPaymentForm
        ?.addEventListener(
            "submit",
            confirmPayment
        );

    adminReceiptCustomerButton
        ?.addEventListener(
            "click",
            openCustomerReceiptModal
        );

    adminCustomerReceiptBackdrop
        ?.addEventListener(
            "click",
            closeCustomerReceiptModal
        );

    adminCustomerReceiptClose
        ?.addEventListener(
            "click",
            closeCustomerReceiptModal
        );

    adminCustomerReceiptCloseButton
        ?.addEventListener(
            "click",
            closeCustomerReceiptModal
        );

    adminCustomerReceiptDownload
        ?.addEventListener(
            "click",
            downloadCustomerReceipt
        );

    adminCustomerReceiptPrint
        ?.addEventListener(
            "click",
            printCustomerReceipt
        );

    adminCustomerReceiptWhatsApp
        ?.addEventListener(
            "click",
            shareCustomerReceipt
        );

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
                adminPaymentModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closePaymentModal();

                return;
            }

            if (
                adminCustomerReceiptModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeCustomerReceiptModal();

                return;
            }

            if (
                adminReceiptDetailModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeReceiptDetail();

                return;
            }

            if (
                adminReceiptCreateModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeCreateReceiptModal();

                return;
            }

            closeSidebar();
        }
    );
}

async function init() {
    initIcons();
    setCurrentDate();
    bindEvents();

    const allowed =
        await validateAdminAccess();

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