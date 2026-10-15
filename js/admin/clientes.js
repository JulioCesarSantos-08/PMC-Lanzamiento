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

const clientsTotalCount =
    document.getElementById("clientsTotalCount");

const clientsActiveCount =
    document.getElementById("clientsActiveCount");

const clientsVehiclesCount =
    document.getElementById("clientsVehiclesCount");

const clientsWithAppointmentsCount =
    document.getElementById("clientsWithAppointmentsCount");

const clientSearch =
    document.getElementById("clientSearch");

const clientStatusFilter =
    document.getElementById("clientStatusFilter");

const clientSort =
    document.getElementById("clientSort");

const clientsResultsCount =
    document.getElementById("clientsResultsCount");

const resetClientFilters =
    document.getElementById("resetClientFilters");

const clientsEmptyReset =
    document.getElementById("clientsEmptyReset");

const clientsList =
    document.getElementById("clientsList");

const clientsEmpty =
    document.getElementById("clientsEmpty");

const clientDetailsModal =
    document.getElementById("clientDetailsModal");

const clientDetailsBackdrop =
    document.getElementById("clientDetailsBackdrop");

const clientDetailsClose =
    document.getElementById("clientDetailsClose");

const clientDetailsCloseButton =
    document.getElementById("clientDetailsCloseButton");

const clientDetailsAvatar =
    document.getElementById("clientDetailsAvatar");

const clientDetailsName =
    document.getElementById("clientDetailsName");

const clientDetailsEmail =
    document.getElementById("clientDetailsEmail");

const clientDetailsStatus =
    document.getElementById("clientDetailsStatus");

const clientDetailsVehiclesCount =
    document.getElementById("clientDetailsVehiclesCount");

const clientDetailsAppointmentsCount =
    document.getElementById("clientDetailsAppointmentsCount");

const clientDetailsOrdersCount =
    document.getElementById("clientDetailsOrdersCount");

const clientDetailsReceiptsCount =
    document.getElementById("clientDetailsReceiptsCount");

const clientContactEmail =
    document.getElementById("clientContactEmail");

const clientContactPhone =
    document.getElementById("clientContactPhone");

const clientRegisteredDate =
    document.getElementById("clientRegisteredDate");

const clientVehiclesList =
    document.getElementById("clientVehiclesList");

const clientHistoryList =
    document.getElementById("clientHistoryList");

const clientWhatsAppButton =
    document.getElementById("clientWhatsAppButton");

const clientNewAppointmentButton =
    document.getElementById("clientNewAppointmentButton");

const adminToast =
    document.getElementById("adminToast");

let currentUser = null;
let currentUserData = null;

let clients = [];
let filteredClients = [];

let appointments = [];
let orders = [];
let receipts = [];

let searchTerm = "";
let statusFilter = "todos";
let sortMode = "nombre";

let selectedClient = null;
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
        return "C";
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

function isClient(data) {
    const permissions =
        getPermissions(data);

    return (
        data?.rol === "cliente" ||
        permissions.cliente === true
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

    if (
        typeof value === "object" &&
        typeof value.seconds ===
            "number"
    ) {
        return new Date(
            value.seconds * 1000
        );
    }

    return null;
}

function getComparableTimestamp(
    ...values
) {
    for (
        const value of values
    ) {
        const date =
            timestampToDate(value);

        if (date) {
            return date.getTime();
        }
    }

    return 0;
}

function formatDate(value) {
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
            year: "numeric"
        }
    ).format(date);
}

function formatShortDate(value) {
    const date =
        timestampToDate(value);

    if (!date) {
        return "";
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

    const key =
        normalizeText(value);

    return (
        labels[key] ||
        value ||
        "Sin categoría"
    );
}

function getVehicleName(vehicle) {
    return [
        vehicle?.marca,
        vehicle?.modelo,
        (
            Number(vehicle?.anio) > 0
                ? vehicle.anio
                : ""
        )
    ]
        .filter(Boolean)
        .join(" ") ||
        "Vehículo";
}

function normalizeAppointmentStatus(value) {
    const status =
        normalizeText(value)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    const labels = {
        agendada: "Agendada",
        confirmada: "Confirmada",
        recibido: "Recibido",
        en_proceso: "En proceso",
        terminado: "Terminado",
        entregado: "Entregado",
        cancelada: "Cancelada"
    };

    return {
        key:
            labels[status]
                ? status
                : "agendada",
        label:
            labels[status] ||
            "Agendada"
    };
}

function normalizeOrderStatus(value) {
    const status =
        normalizeText(value)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    const labels = {
        recibido: "Recibido",
        en_proceso: "En proceso",
        terminado: "Terminado",
        entregado: "Entregado",
        cancelado: "Cancelado"
    };

    return {
        key:
            labels[status]
                ? status
                : "recibido",
        label:
            labels[status] ||
            "Recibido"
    };
}

function normalizeReceiptStatus(receipt) {
    const raw =
        receipt.estadoPago ||
        receipt.pagoEstado ||
        receipt.estado ||
        "";

    const status =
        normalizeText(raw)
            .replaceAll(" ", "_")
            .replaceAll("-", "_");

    if (
        [
            "pagado",
            "pagada",
            "confirmado",
            "confirmada"
        ].includes(status)
    ) {
        return "Pagado";
    }

    if (
        [
            "cancelado",
            "cancelada"
        ].includes(status)
    ) {
        return "Cancelado";
    }

    if (
        [
            "pendiente",
            "por_pagar"
        ].includes(status)
    ) {
        return "Pendiente";
    }

    return raw || "Recibo";
}

function formatCurrency(value) {
    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return "";
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

function normalizePhone(value) {
    return String(value || "")
        .replace(/\D/g, "");
}

function getWhatsAppNumber(value) {
    let digits =
        normalizePhone(value);

    if (!digits) {
        return "";
    }

    if (
        digits.length === 10
    ) {
        digits =
            `52${digits}`;
    }

    if (
        digits.length === 12 &&
        digits.startsWith("52")
    ) {
        return digits;
    }

    if (
        digits.length === 13 &&
        digits.startsWith("521")
    ) {
        return (
            "52" +
            digits.slice(3)
        );
    }

    return digits;
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
            "js/admin/clientes.html"
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

async function loadBaseCollections() {
    const [
        usersSnapshot,
        appointmentsSnapshot,
        ordersSnapshot,
        receiptsSnapshot
    ] =
        await Promise.all([
            getDocs(
                collection(
                    db,
                    "usuarios"
                )
            ),
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
            ),
            getDocs(
                collection(
                    db,
                    "recibos"
                )
            )
        ]);

    appointments =
        appointmentsSnapshot.docs.map(
            (
                documentSnapshot
            ) => ({
                id:
                    documentSnapshot.id,
                ...documentSnapshot.data()
            })
        );

    orders =
        ordersSnapshot.docs.map(
            (
                documentSnapshot
            ) => ({
                id:
                    documentSnapshot.id,
                ...documentSnapshot.data()
            })
        );

    receipts =
        receiptsSnapshot.docs.map(
            (
                documentSnapshot
            ) => ({
                id:
                    documentSnapshot.id,
                ...documentSnapshot.data()
            })
        );

    clients =
        usersSnapshot.docs
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
                (user) =>
                    isClient(user)
            );
}

async function loadClientVehicles(
    client
) {
    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios",
                    client.id,
                    "vehiculos"
                )
            );

        return snapshot.docs.map(
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
            `No se pudieron cargar los vehículos de ${client.id}:`,
            error
        );

        return [];
    }
}

function buildClientMetrics(
    client
) {
    const clientAppointments =
        appointments.filter(
            (appointment) =>
                appointment.clienteUid ===
                client.id
        );

    const clientOrders =
        orders.filter(
            (order) =>
                order.clienteUid ===
                client.id
        );

    const clientReceipts =
        receipts.filter(
            (receipt) =>
                receipt.clienteUid ===
                client.id
        );

    return {
        appointments:
            clientAppointments,
        orders:
            clientOrders,
        receipts:
            clientReceipts
    };
}

async function enrichClients() {
    const enriched =
        await Promise.all(
            clients.map(
                async (
                    client
                ) => {
                    const vehicles =
                        await loadClientVehicles(
                            client
                        );

                    const metrics =
                        buildClientMetrics(
                            client
                        );

                    return {
                        ...client,
                        vehicles,
                        appointments:
                            metrics.appointments,
                        orders:
                            metrics.orders,
                        receipts:
                            metrics.receipts,
                        vehiclesCount:
                            vehicles.length,
                        appointmentsCount:
                            metrics
                                .appointments
                                .length,
                        ordersCount:
                            metrics
                                .orders
                                .length,
                        receiptsCount:
                            metrics
                                .receipts
                                .length
                    };
                }
            )
        );

    clients =
        enriched;
}

async function loadClients() {
    if (clientsList) {
        clientsList.hidden =
            false;

        clientsList.innerHTML = `
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
        `;
    }

    if (clientsEmpty) {
        clientsEmpty.hidden =
            true;
    }

    try {
        await loadBaseCollections();

        await enrichClients();

        renderSummary();
        applyFilters();
    } catch (error) {
        console.error(
            "No se pudieron cargar los clientes:",
            error
        );

        clients = [];
        filteredClients = [];

        renderSummary();
        renderClients();

        showToast(
            "No se pudieron cargar los clientes.",
            "error"
        );
    }
}

function renderSummary() {
    const total =
        clients.length;

    const active =
        clients.filter(
            (client) =>
                client.activo !==
                false
        ).length;

    const vehicles =
        clients.reduce(
            (
                totalCount,
                client
            ) =>
                totalCount +
                Number(
                    client.vehiclesCount ||
                    0
                ),
            0
        );

    const withAppointments =
        clients.filter(
            (client) =>
                client.appointmentsCount >
                0
        ).length;

    if (clientsTotalCount) {
        clientsTotalCount.textContent =
            String(total);
    }

    if (clientsActiveCount) {
        clientsActiveCount.textContent =
            String(active);
    }

    if (clientsVehiclesCount) {
        clientsVehiclesCount.textContent =
            String(vehicles);
    }

    if (
        clientsWithAppointmentsCount
    ) {
        clientsWithAppointmentsCount.textContent =
            String(withAppointments);
    }
}

function getClientSearchText(
    client
) {
    return normalizeText(
        [
            client.nombre,
            client.email,
            client.telefono,
            client.id,
            ...(
                Array.isArray(
                    client.vehicles
                )
                    ? client.vehicles
                        .flatMap(
                            (
                                vehicle
                            ) => [
                                vehicle.marca,
                                vehicle.modelo,
                                vehicle.anio,
                                vehicle.tipo,
                                vehicle.color
                            ]
                        )
                    : []
            )
        ]
            .filter(Boolean)
            .join(" ")
    );
}

function matchesClientStatus(
    client
) {
    if (
        statusFilter === "todos"
    ) {
        return true;
    }

    if (
        statusFilter === "activos"
    ) {
        return (
            client.activo !==
            false
        );
    }

    if (
        statusFilter ===
        "inactivos"
    ) {
        return (
            client.activo ===
            false
        );
    }

    return true;
}

function getClientCreatedTime(
    client
) {
    return getComparableTimestamp(
        client.creadoEn,
        client.fechaRegistro,
        client.createdAt,
        client.actualizadoEn
    );
}

function sortClients(items) {
    const sorted =
        [...items];

    if (
        sortMode === "recientes"
    ) {
        sorted.sort(
            (a, b) =>
                getClientCreatedTime(b) -
                getClientCreatedTime(a)
        );

        return sorted;
    }

    if (
        sortMode === "citas"
    ) {
        sorted.sort(
            (a, b) => {
                const difference =
                    Number(
                        b.appointmentsCount ||
                        0
                    ) -
                    Number(
                        a.appointmentsCount ||
                        0
                    );

                if (difference) {
                    return difference;
                }

                return String(
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
                );
            }
        );

        return sorted;
    }

    if (
        sortMode === "vehiculos"
    ) {
        sorted.sort(
            (a, b) => {
                const difference =
                    Number(
                        b.vehiclesCount ||
                        0
                    ) -
                    Number(
                        a.vehiclesCount ||
                        0
                    );

                if (difference) {
                    return difference;
                }

                return String(
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
                );
            }
        );

        return sorted;
    }

    sorted.sort(
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

    return sorted;
}

function applyFilters() {
    filteredClients =
        clients.filter(
            (client) => {
                const searchMatches =
                    !searchTerm ||
                    getClientSearchText(
                        client
                    ).includes(
                        searchTerm
                    );

                return (
                    searchMatches &&
                    matchesClientStatus(
                        client
                    )
                );
            }
        );

    filteredClients =
        sortClients(
            filteredClients
        );

    renderClients();
}

function updateResultsCount() {
    if (!clientsResultsCount) {
        return;
    }

    const count =
        filteredClients.length;

    clientsResultsCount.textContent =
        count === 1
            ? "1 cliente"
            : `${count} clientes`;
}

function buildAvatarHTML(
    client
) {
    const photo =
        client.fotoURL ||
        client.foto ||
        client.photoURL ||
        "";

    const initials =
        getInitials(
            client.nombre ||
            client.email ||
            "Cliente"
        );

    if (!photo) {
        return escapeHTML(
            initials
        );
    }

    return `
        <img
            src="${escapeHTML(photo)}"
            alt="${escapeHTML(
                client.nombre ||
                "Cliente"
            )}"
        >
    `;
}

function createClientCard(
    client
) {
    const active =
        client.activo !==
        false;

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "admin-client-card";

    if (!active) {
        article.classList.add(
            "is-inactive"
        );
    }

    article.innerHTML = `
        <div class="admin-client-card__avatar">
            ${buildAvatarHTML(
                client
            )}
        </div>

        <div class="admin-client-card__main">

            <h3>
                ${escapeHTML(
                    client.nombre ||
                    "Cliente PMC"
                )}
            </h3>

            <span>
                ${escapeHTML(
                    client.email ||
                    "Sin correo"
                )}
            </span>

            <div class="admin-client-card__contact">

                <i data-lucide="phone"></i>

                <span>
                    ${escapeHTML(
                        client.telefono ||
                        "Sin teléfono"
                    )}
                </span>

            </div>

        </div>

        <div class="admin-client-card__metric">

            <i data-lucide="car-front"></i>

            <div>

                <strong>
                    ${client.vehiclesCount}
                </strong>

                <span>
                    Vehículos
                </span>

            </div>

        </div>

        <div class="admin-client-card__metric">

            <i data-lucide="calendar-days"></i>

            <div>

                <strong>
                    ${client.appointmentsCount}
                </strong>

                <span>
                    Citas
                </span>

            </div>

        </div>

        <div class="admin-client-card__metric">

            <i data-lucide="clipboard-list"></i>

            <div>

                <strong>
                    ${client.ordersCount}
                </strong>

                <span>
                    Órdenes
                </span>

            </div>

        </div>

        <div class="admin-client-card__end">

            <span class="admin-client-status ${
                active
                    ? ""
                    : "is-inactive"
            }">

                ${
                    active
                        ? "Activo"
                        : "Inactivo"
                }

            </span>

            <button
                type="button"
                class="admin-client-card__open"
                data-client-id="${escapeHTML(
                    client.id
                )}"
                aria-label="Ver cliente"
                title="Ver detalle"
            >

                <i data-lucide="chevron-right"></i>

            </button>

        </div>
    `;

    article
        .querySelectorAll("img")
        .forEach(
            (image) => {
                image.addEventListener(
                    "error",
                    () => {
                        const avatar =
                            image.closest(
                                ".admin-client-card__avatar"
                            );

                        if (avatar) {
                            avatar.innerHTML =
                                escapeHTML(
                                    getInitials(
                                        client.nombre ||
                                        client.email ||
                                        "Cliente"
                                    )
                                );
                        }
                    }
                );
            }
        );

    return article;
}

function renderClients() {
    if (!clientsList) {
        return;
    }

    clientsList.innerHTML =
        "";

    updateResultsCount();

    if (
        !filteredClients.length
    ) {
        clientsList.hidden =
            true;

        if (clientsEmpty) {
            clientsEmpty.hidden =
                false;
        }

        return;
    }

    clientsList.hidden =
        false;

    if (clientsEmpty) {
        clientsEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    filteredClients.forEach(
        (client) => {
            fragment.appendChild(
                createClientCard(
                    client
                )
            );
        }
    );

    clientsList.appendChild(
        fragment
    );

    initIcons();
}

function resetFilters() {
    searchTerm = "";
    statusFilter = "todos";
    sortMode = "nombre";

    if (clientSearch) {
        clientSearch.value =
            "";
    }

    if (clientStatusFilter) {
        clientStatusFilter.value =
            "todos";
    }

    if (clientSort) {
        clientSort.value =
            "nombre";
    }

    applyFilters();
}

function renderModalAvatar(
    client
) {
    if (!clientDetailsAvatar) {
        return;
    }

    const photo =
        client.fotoURL ||
        client.foto ||
        client.photoURL ||
        "";

    clientDetailsAvatar.innerHTML =
        "";

    if (!photo) {
        clientDetailsAvatar.textContent =
            getInitials(
                client.nombre ||
                client.email ||
                "Cliente"
            );

        return;
    }

    const image =
        document.createElement(
            "img"
        );

    image.src =
        photo;

    image.alt =
        client.nombre ||
        "Cliente";

    image.addEventListener(
        "error",
        () => {
            clientDetailsAvatar.innerHTML =
                "";

            clientDetailsAvatar.textContent =
                getInitials(
                    client.nombre ||
                    client.email ||
                    "Cliente"
                );
        }
    );

    clientDetailsAvatar.appendChild(
        image
    );
}

function renderClientVehicles(
    client
) {
    if (!clientVehiclesList) {
        return;
    }

    const vehicles =
        Array.isArray(
            client.vehicles
        )
            ? client.vehicles
            : [];

    if (!vehicles.length) {
        clientVehiclesList.innerHTML = `
            <div class="admin-client-section__empty">

                <i data-lucide="car-front"></i>

                <span>
                    Sin vehículos registrados
                </span>

            </div>
        `;

        initIcons();

        return;
    }

    clientVehiclesList.innerHTML =
        vehicles
            .map(
                (vehicle) => {
                    const active =
                        vehicle.activo !==
                        false;

                    const details = [
                        formatVehicleType(
                            vehicle.tipo
                        ),
                        vehicle.color
                    ]
                        .filter(Boolean)
                        .join(" · ");

                    return `
                        <article class="admin-client-vehicle">

                            <div class="admin-client-vehicle__icon">

                                <i data-lucide="car-front"></i>

                            </div>

                            <div class="admin-client-vehicle__content">

                                <strong>
                                    ${escapeHTML(
                                        getVehicleName(
                                            vehicle
                                        )
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        details ||
                                        "Sin detalles adicionales"
                                    )}
                                </span>

                            </div>

                            <span class="admin-client-vehicle__status ${
                                active
                                    ? ""
                                    : "is-inactive"
                            }">

                                ${
                                    active
                                        ? "Activo"
                                        : "Inactivo"
                                }

                            </span>

                        </article>
                    `;
                }
            )
            .join("");

    initIcons();
}

function getAppointmentHistoryItems(
    client
) {
    return (
        client.appointments ||
        []
    ).map(
        (appointment) => {
            const status =
                normalizeAppointmentStatus(
                    appointment.estado
                );

            const date =
                getComparableTimestamp(
                    appointment.actualizadoEn,
                    appointment.creadoEn
                );

            return {
                type:
                    "appointment",
                icon:
                    "calendar-days",
                title:
                    appointment.servicioNombre ||
                    "Cita PMC",
                description:
                    `Cita · ${status.label}`,
                date,
                dateLabel:
                    formatShortDate(
                        appointment.actualizadoEn ||
                        appointment.creadoEn
                    )
            };
        }
    );
}

function getOrderHistoryItems(
    client
) {
    return (
        client.orders ||
        []
    ).map(
        (order) => {
            const status =
                normalizeOrderStatus(
                    order.estado
                );

            const date =
                getComparableTimestamp(
                    order.actualizadoEn,
                    order.creadoEn,
                    order.recibidoEn
                );

            return {
                type:
                    "order",
                icon:
                    "clipboard-list",
                title:
                    order.servicioNombre ||
                    "Orden de trabajo",
                description:
                    `Orden · ${status.label}`,
                date,
                dateLabel:
                    formatShortDate(
                        order.actualizadoEn ||
                        order.creadoEn ||
                        order.recibidoEn
                    )
            };
        }
    );
}

function getReceiptHistoryItems(
    client
) {
    return (
        client.receipts ||
        []
    ).map(
        (receipt) => {
            const amount =
                Number(
                    receipt.total ??
                    receipt.montoTotal ??
                    receipt.monto ??
                    receipt.totalPagado
                );

            const date =
                getComparableTimestamp(
                    receipt.actualizadoEn,
                    receipt.creadoEn,
                    receipt.fechaPago
                );

            const amountText =
                Number.isFinite(amount)
                    ? ` · ${formatCurrency(
                        amount
                    )}`
                    : "";

            return {
                type:
                    "receipt",
                icon:
                    "receipt-text",
                title:
                    receipt.folio
                        ? `Recibo ${receipt.folio}`
                        : "Recibo PMC",
                description:
                    `${normalizeReceiptStatus(
                        receipt
                    )}${amountText}`,
                date,
                dateLabel:
                    formatShortDate(
                        receipt.actualizadoEn ||
                        receipt.creadoEn ||
                        receipt.fechaPago
                    )
            };
        }
    );
}

function renderClientHistory(
    client
) {
    if (!clientHistoryList) {
        return;
    }

    const items = [
        ...getAppointmentHistoryItems(
            client
        ),
        ...getOrderHistoryItems(
            client
        ),
        ...getReceiptHistoryItems(
            client
        )
    ]
        .sort(
            (a, b) =>
                b.date -
                a.date
        )
        .slice(
            0,
            12
        );

    if (!items.length) {
        clientHistoryList.innerHTML = `
            <div class="admin-client-section__empty">

                <i data-lucide="history"></i>

                <span>
                    Sin actividad registrada
                </span>

            </div>
        `;

        initIcons();

        return;
    }

    clientHistoryList.innerHTML =
        items
            .map(
                (item) => `
                    <article class="admin-client-history-item">

                        <div class="admin-client-history-item__icon">

                            <i data-lucide="${escapeHTML(
                                item.icon
                            )}"></i>

                        </div>

                        <div class="admin-client-history-item__content">

                            <strong>
                                ${escapeHTML(
                                    item.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.description
                                )}
                            </span>

                        </div>

                        <span class="admin-client-history-item__date">
                            ${escapeHTML(
                                item.dateLabel ||
                                "Sin fecha"
                            )}
                        </span>

                    </article>
                `
            )
            .join("");

    initIcons();
}

function updateClientWhatsApp(
    client
) {
    if (!clientWhatsAppButton) {
        return;
    }

    const number =
        getWhatsAppNumber(
            client.telefono
        );

    clientWhatsAppButton.hidden =
        !number;

    clientWhatsAppButton.dataset.number =
        number;
}

function updateClientNewAppointmentLink(
    client
) {
    if (!clientNewAppointmentButton) {
        return;
    }

    clientNewAppointmentButton.href =
        `citas.html?cliente=${encodeURIComponent(
            client.id
        )}`;
}

function openClientDetails(
    clientId
) {
    const client =
        clients.find(
            (item) =>
                item.id ===
                clientId
        );

    if (
        !client ||
        !clientDetailsModal
    ) {
        return;
    }

    selectedClient =
        client;

    renderModalAvatar(
        client
    );

    if (clientDetailsName) {
        clientDetailsName.textContent =
            client.nombre ||
            "Cliente PMC";
    }

    if (clientDetailsEmail) {
        clientDetailsEmail.textContent =
            client.email ||
            "Sin correo";
    }

    if (clientContactEmail) {
        clientContactEmail.textContent =
            client.email ||
            "Sin correo";
    }

    if (clientContactPhone) {
        clientContactPhone.textContent =
            client.telefono ||
            "No disponible";
    }

    if (clientRegisteredDate) {
        clientRegisteredDate.textContent =
            formatDate(
                client.creadoEn ||
                client.fechaRegistro ||
                client.createdAt
            );
    }

    const active =
        client.activo !==
        false;

    if (clientDetailsStatus) {
        clientDetailsStatus.className =
            `admin-client-status ${
                active
                    ? ""
                    : "is-inactive"
            }`;

        clientDetailsStatus.textContent =
            active
                ? "Activo"
                : "Inactivo";
    }

    if (
        clientDetailsVehiclesCount
    ) {
        clientDetailsVehiclesCount.textContent =
            String(
                client.vehiclesCount ||
                0
            );
    }

    if (
        clientDetailsAppointmentsCount
    ) {
        clientDetailsAppointmentsCount.textContent =
            String(
                client.appointmentsCount ||
                0
            );
    }

    if (
        clientDetailsOrdersCount
    ) {
        clientDetailsOrdersCount.textContent =
            String(
                client.ordersCount ||
                0
            );
    }

    if (
        clientDetailsReceiptsCount
    ) {
        clientDetailsReceiptsCount.textContent =
            String(
                client.receiptsCount ||
                0
            );
    }

    renderClientVehicles(
        client
    );

    renderClientHistory(
        client
    );

    updateClientWhatsApp(
        client
    );

    updateClientNewAppointmentLink(
        client
    );

    clientDetailsModal.classList.add(
        "is-open"
    );

    clientDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );

    initIcons();
}

function closeClientDetails() {
    clientDetailsModal
        ?.classList.remove(
            "is-open"
        );

    clientDetailsModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );

    selectedClient =
        null;
}

function openClientWhatsApp() {
    if (!selectedClient) {
        return;
    }

    const number =
        clientWhatsAppButton
            ?.dataset
            .number ||
        "";

    if (!number) {
        showToast(
            "Este cliente no tiene teléfono registrado.",
            "error"
        );

        return;
    }

    const clientName =
        selectedClient.nombre ||
        "cliente";

    const message =
        `Hola ${clientName}, te contactamos de PMC Auto Detailing.`;

    window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(
            message
        )}`,
        "_blank",
        "noopener,noreferrer"
    );
}

function bindFilters() {
    clientSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        clientSearch.value
                    );

                applyFilters();
            }
        );

    clientStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    clientStatusFilter.value;

                applyFilters();
            }
        );

    clientSort
        ?.addEventListener(
            "change",
            () => {
                sortMode =
                    clientSort.value;

                applyFilters();
            }
        );

    resetClientFilters
        ?.addEventListener(
            "click",
            resetFilters
        );

    clientsEmptyReset
        ?.addEventListener(
            "click",
            resetFilters
        );
}

function bindClientList() {
    clientsList
        ?.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-client-id]"
                    );

                if (!button) {
                    return;
                }

                openClientDetails(
                    button.dataset
                        .clientId
                );
            }
        );
}

function bindClientModal() {
    clientDetailsBackdrop
        ?.addEventListener(
            "click",
            closeClientDetails
        );

    clientDetailsClose
        ?.addEventListener(
            "click",
            closeClientDetails
        );

    clientDetailsCloseButton
        ?.addEventListener(
            "click",
            closeClientDetails
        );

    clientWhatsAppButton
        ?.addEventListener(
            "click",
            openClientWhatsApp
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
                clientDetailsModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeClientDetails();

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
    bindClientList();
    bindClientModal();
    bindKeyboard();

    const allowed =
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    await loadClients();

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