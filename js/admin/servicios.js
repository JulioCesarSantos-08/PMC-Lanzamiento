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
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc
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

const adminAvatar =
    document.getElementById(
        "adminAvatar"
    );

const adminInitials =
    document.getElementById(
        "adminInitials"
    );

const financeButton =
    document.getElementById(
        "financeButton"
    );

const currentYear =
    document.getElementById(
        "currentYear"
    );

const servicesTotalCount =
    document.getElementById(
        "servicesTotalCount"
    );

const servicesPublishedCount =
    document.getElementById(
        "servicesPublishedCount"
    );

const servicesDraftCount =
    document.getElementById(
        "servicesDraftCount"
    );

const servicesInactiveCount =
    document.getElementById(
        "servicesInactiveCount"
    );

const serviceSearch =
    document.getElementById(
        "serviceSearch"
    );

const serviceStatusFilter =
    document.getElementById(
        "serviceStatusFilter"
    );

const serviceCategoryFilter =
    document.getElementById(
        "serviceCategoryFilter"
    );

const serviceSort =
    document.getElementById(
        "serviceSort"
    );

const servicesResultsCount =
    document.getElementById(
        "servicesResultsCount"
    );

const resetServiceFilters =
    document.getElementById(
        "resetServiceFilters"
    );

const emptyResetServiceFilters =
    document.getElementById(
        "emptyResetServiceFilters"
    );

const servicesList =
    document.getElementById(
        "servicesList"
    );

const servicesEmpty =
    document.getElementById(
        "servicesEmpty"
    );

const deleteServiceModal =
    document.getElementById(
        "deleteServiceModal"
    );

const deleteServiceBackdrop =
    document.getElementById(
        "deleteServiceBackdrop"
    );

const deleteServiceClose =
    document.getElementById(
        "deleteServiceClose"
    );

const cancelDeleteService =
    document.getElementById(
        "cancelDeleteService"
    );

const confirmDeleteService =
    document.getElementById(
        "confirmDeleteService"
    );

const deleteServiceName =
    document.getElementById(
        "deleteServiceName"
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

let services = [];
let filteredServices = [];

let searchTerm = "";
let statusFilter = "todos";
let categoryFilter = "todas";
let sortMode = "orden";

let selectedDeleteService = null;
let deletingService = false;
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

function slugify(value) {
    return normalizeText(value)
        .replace(/&/g, "y")
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
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
    const permissions =
        getPermissions(data);

    return (
        permissions.finanzas ===
        true
    );
}

function getServiceCategory(service) {
    if (
        typeof service?.categoria ===
        "string"
    ) {
        return service.categoria;
    }

    if (
        service?.categoria &&
        typeof service.categoria ===
            "object"
    ) {
        return (
            service.categoria.nombre ||
            "Sin categoría"
        );
    }

    return "Sin categoría";
}

function getCategorySlug(service) {
    if (
        typeof service?.categoriaSlug ===
            "string" &&
        service.categoriaSlug
    ) {
        return service.categoriaSlug;
    }

    const category =
        normalizeText(
            getServiceCategory(
                service
            )
        );

    if (
        category.includes(
            "motor"
        ) ||
        category.includes(
            "chasis"
        )
    ) {
        return "motor-chasis";
    }

    if (
        category.includes(
            "ceram"
        )
    ) {
        return "ceramicos";
    }

    if (
        category.includes(
            "proteccion"
        ) ||
        category.includes(
            "vidrio"
        )
    ) {
        return "proteccion";
    }

    if (
        category.includes(
            "pintura"
        ) ||
        category.includes(
            "pulido"
        ) ||
        category.includes(
            "correccion"
        )
    ) {
        return "pintura";
    }

    if (
        category.includes(
            "interior"
        )
    ) {
        return "interior";
    }

    if (
        category.includes(
            "ppf"
        )
    ) {
        return "ppf";
    }

    if (
        category.includes(
            "lavado"
        )
    ) {
        return "lavado";
    }

    return slugify(
        getServiceCategory(
            service
        )
    );
}

function getServiceDescription(service) {
    return (
        service.descripcionCorta ||
        service.descripcion ||
        "Sin descripción."
    );
}

function getServiceDuration(service) {
    const value =
        Number(
            service?.duracionMinutos
        );

    if (
        Number.isFinite(value) &&
        value > 0
    ) {
        return value;
    }

    if (
        typeof service?.duracion ===
            "number" &&
        service.duracion > 0
    ) {
        return service.duracion;
    }

    return null;
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

    const remaining =
        minutes % 60;

    if (!remaining) {
        return `${hours} h`;
    }

    return (
        `${hours} h ` +
        `${remaining} min`
    );
}

function getServicePrice(service) {
    const directCandidates = [
        service?.precioDesde,
        service?.precio,
        service?.precioMinimo
    ];

    for (
        const candidate of
        directCandidates
    ) {
        const value =
            Number(candidate);

        if (
            Number.isFinite(value) &&
            value > 0
        ) {
            return value;
        }
    }

    const prices =
        service?.precios;

    if (!prices) {
        return null;
    }

    const values = [];

    const addValue =
        (value) => {
            if (
                typeof value ===
                "number"
            ) {
                if (
                    Number.isFinite(value) &&
                    value > 0
                ) {
                    values.push(value);
                }

                return;
            }

            if (
                typeof value ===
                "string"
            ) {
                const match =
                    value
                        .replaceAll(
                            ",",
                            ""
                        )
                        .match(/\d+/);

                if (match) {
                    const number =
                        Number(match[0]);

                    if (
                        Number.isFinite(number) &&
                        number > 0
                    ) {
                        values.push(
                            number
                        );
                    }
                }

                return;
            }

            if (
                value &&
                typeof value ===
                    "object"
            ) {
                addValue(
                    value.precio ??
                    value.desde ??
                    value.min ??
                    value.valor
                );
            }
        };

    if (
        Array.isArray(prices)
    ) {
        prices.forEach(
            addValue
        );
    } else if (
        typeof prices ===
        "object"
    ) {
        Object.values(
            prices
        ).forEach(
            addValue
        );
    }

    if (!values.length) {
        return null;
    }

    return Math.min(
        ...values
    );
}

function safeImageUrl(value) {
    if (!value) {
        return "";
    }

    const text =
        String(value).trim();

    if (
        text.startsWith(
            "../imagenes/"
        ) ||
        text.startsWith(
            "imagenes/"
        )
    ) {
        return text.startsWith(
            "../"
        )
            ? text
            : `../${text}`;
    }

    try {
        const url =
            new URL(
                text,
                window.location.href
            );

        if (
            url.protocol === "https:" ||
            url.protocol === "http:"
        ) {
            return url.href;
        }
    } catch {
        return "";
    }

    return "";
}

function getServiceImage(service) {
    const direct = [
        service?.imagenPrincipal,
        service?.imagenPortada,
        service?.portada,
        service?.imagen,
        service?.cover
    ];

    for (
        const candidate of
        direct
    ) {
        if (
            typeof candidate ===
                "string" &&
            candidate.trim()
        ) {
            return safeImageUrl(
                candidate
            );
        }

        if (
            candidate &&
            typeof candidate ===
                "object"
        ) {
            const url =
                candidate.url ||
                candidate.secure_url;

            if (url) {
                return safeImageUrl(
                    url
                );
            }
        }
    }

    if (
        Array.isArray(
            service?.imagenes
        )
    ) {
        for (
            const image of
            service.imagenes
        ) {
            if (
                typeof image ===
                    "string"
            ) {
                const url =
                    safeImageUrl(
                        image
                    );

                if (url) {
                    return url;
                }
            }

            if (
                image &&
                typeof image ===
                    "object"
            ) {
                const url =
                    safeImageUrl(
                        image.url ||
                        image.secure_url
                    );

                if (url) {
                    return url;
                }
            }
        }
    }

    return "";
}

function getServiceStatus(service) {
    if (
        service.activo === false
    ) {
        return {
            key:
                "inactivo",
            text:
                "Desactivado",
            className:
                "is-inactive"
        };
    }

    if (
        normalizeText(
            service.estado
        ) === "publicado"
    ) {
        return {
            key:
                "publicado",
            text:
                "Publicado",
            className:
                "is-published"
        };
    }

    return {
        key:
            "borrador",
        text:
            "Borrador",
        className:
            "is-draft"
    };
}

function serviceIsPublished(service) {
    return (
        normalizeText(
            service.estado
        ) === "publicado" &&
        service.activo === true
    );
}

function serviceIsDraft(service) {
    return (
        normalizeText(
            service.estado
        ) === "borrador"
    );
}

function serviceIsInactive(service) {
    return (
        service.activo === false
    );
}

function getSearchableText(service) {
    return normalizeText(
        [
            service.nombre,
            service.slug,
            getServiceCategory(
                service
            ),
            getServiceDescription(
                service
            )
        ]
            .filter(Boolean)
            .join(" ")
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
    const returnUrl =
        "admin/servicios.html";

    window.location.href =
        `../login.html?return=${encodeURIComponent(
            returnUrl
        )}`;
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
            await signOut(
                auth
            );

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

async function loadServices() {
    if (servicesList) {
        servicesList.innerHTML = `
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
        `;
    }

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

        applyFilters();
        renderSummary();
    } catch (error) {
        console.error(
            "No se pudieron cargar los servicios:",
            error
        );

        services = [];
        filteredServices = [];

        renderSummary();
        renderServices();

        showToast(
            "No se pudieron cargar los servicios.",
            "error"
        );
    }
}

function renderSummary() {
    const total =
        services.length;

    const published =
        services.filter(
            serviceIsPublished
        ).length;

    const drafts =
        services.filter(
            serviceIsDraft
        ).length;

    const inactive =
        services.filter(
            serviceIsInactive
        ).length;

    if (servicesTotalCount) {
        servicesTotalCount.textContent =
            String(total);
    }

    if (
        servicesPublishedCount
    ) {
        servicesPublishedCount.textContent =
            String(
                published
            );
    }

    if (
        servicesDraftCount
    ) {
        servicesDraftCount.textContent =
            String(
                drafts
            );
    }

    if (
        servicesInactiveCount
    ) {
        servicesInactiveCount.textContent =
            String(
                inactive
            );
    }
}

function matchesStatusFilter(service) {
    if (
        statusFilter === "todos"
    ) {
        return true;
    }

    if (
        statusFilter ===
        "publicado"
    ) {
        return serviceIsPublished(
            service
        );
    }

    if (
        statusFilter ===
        "borrador"
    ) {
        return (
            serviceIsDraft(
                service
            ) &&
            service.activo !== false
        );
    }

    if (
        statusFilter ===
        "inactivo"
    ) {
        return serviceIsInactive(
            service
        );
    }

    return true;
}

function matchesCategoryFilter(
    service
) {
    if (
        categoryFilter ===
        "todas"
    ) {
        return true;
    }

    return (
        getCategorySlug(
            service
        ) ===
        categoryFilter
    );
}

function sortServices(items) {
    const result =
        [...items];

    if (
        sortMode === "nombre-asc"
    ) {
        return result.sort(
            (a, b) =>
                String(
                    a.nombre || ""
                ).localeCompare(
                    String(
                        b.nombre || ""
                    ),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                )
        );
    }

    if (
        sortMode === "nombre-desc"
    ) {
        return result.sort(
            (a, b) =>
                String(
                    b.nombre || ""
                ).localeCompare(
                    String(
                        a.nombre || ""
                    ),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                )
        );
    }

    if (
        sortMode === "precio-asc"
    ) {
        return result.sort(
            (a, b) =>
                (
                    getServicePrice(
                        a
                    ) ??
                    Number.MAX_SAFE_INTEGER
                ) -
                (
                    getServicePrice(
                        b
                    ) ??
                    Number.MAX_SAFE_INTEGER
                )
        );
    }

    if (
        sortMode === "precio-desc"
    ) {
        return result.sort(
            (a, b) =>
                (
                    getServicePrice(
                        b
                    ) ??
                    -1
                ) -
                (
                    getServicePrice(
                        a
                    ) ??
                    -1
                )
        );
    }

    return result.sort(
        (a, b) => {
            const orderA =
                Number(
                    a.orden ?? 9999
                );

            const orderB =
                Number(
                    b.orden ?? 9999
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
}

function applyFilters() {
    filteredServices =
        services.filter(
            (service) => {
                const searchMatches =
                    !searchTerm ||
                    getSearchableText(
                        service
                    ).includes(
                        searchTerm
                    );

                return (
                    searchMatches &&
                    matchesStatusFilter(
                        service
                    ) &&
                    matchesCategoryFilter(
                        service
                    )
                );
            }
        );

    filteredServices =
        sortServices(
            filteredServices
        );

    renderServices();
}

function updateResultsCount() {
    if (!servicesResultsCount) {
        return;
    }

    const count =
        filteredServices.length;

    servicesResultsCount.textContent =
        count === 1
            ? "1 servicio"
            : `${count} servicios`;
}

function createServiceCard(service) {
    const status =
        getServiceStatus(
            service
        );

    const image =
        getServiceImage(
            service
        );

    const price =
        getServicePrice(
            service
        );

    const duration =
        getServiceDuration(
            service
        );

    const category =
        getServiceCategory(
            service
        );

    const publicId =
        service.slug ||
        service.id;

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "admin-service-card";

    article.dataset.serviceId =
        service.id;

    if (
        service.activo ===
        false
    ) {
        article.classList.add(
            "is-inactive"
        );
    }

    article.innerHTML = `
        <div class="admin-service-card__media">

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(
                                image
                            )}"
                            alt="${escapeHTML(
                                service.nombre ||
                                "Servicio PMC"
                            )}"
                            loading="lazy"
                        >
                      `
                    : `
                        <div class="admin-service-card__placeholder">
                            <i data-lucide="sparkles"></i>
                        </div>
                      `
            }

        </div>

        <div class="admin-service-card__main">

            <div class="admin-service-card__top">

                <span class="admin-service-card__category">
                    ${escapeHTML(
                        category
                    )}
                </span>

                <span class="admin-service-card__status ${status.className}">
                    ${escapeHTML(
                        status.text
                    )}
                </span>

                <span class="admin-service-card__order">
                    #${escapeHTML(
                        String(
                            service.orden ??
                            "-"
                        )
                    )}
                </span>

            </div>

            <h3>
                ${escapeHTML(
                    service.nombre ||
                    "Servicio sin nombre"
                )}
            </h3>

            <p class="admin-service-card__description">
                ${escapeHTML(
                    getServiceDescription(
                        service
                    )
                )}
            </p>

            <div class="admin-service-card__meta">

                <span class="admin-service-card__meta-item admin-service-card__price">
                    <i data-lucide="circle-dollar-sign"></i>

                    ${
                        price
                            ? `Desde ${escapeHTML(
                                formatCurrency(
                                    price
                                )
                            )}`
                            : "Sin precio"
                    }
                </span>

                <span class="admin-service-card__meta-item">
                    <i data-lucide="clock-3"></i>

                    ${escapeHTML(
                        formatDuration(
                            duration
                        )
                    )}
                </span>

                <span class="admin-service-card__meta-item">
                    <i data-lucide="link-2"></i>

                    ${escapeHTML(
                        service.slug ||
                        service.id
                    )}
                </span>

            </div>

        </div>

        <div class="admin-service-card__actions">

            <button
                type="button"
                class="admin-service-toggle ${
                    service.activo !== false
                        ? "is-active"
                        : ""
                }"
                data-action="toggle"
                data-service-id="${escapeHTML(
                    service.id
                )}"
                aria-label="${
                    service.activo !== false
                        ? "Desactivar servicio"
                        : "Activar servicio"
                }"
                title="${
                    service.activo !== false
                        ? "Desactivar"
                        : "Activar"
                }"
            ></button>

            ${
                serviceIsPublished(
                    service
                )
                    ? `
                        <a
                            href="../servicio.html?servicio=${encodeURIComponent(
                                publicId
                            )}"
                            class="admin-service-action"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ver servicio"
                            title="Ver en sitio"
                        >
                            <i data-lucide="eye"></i>
                        </a>
                      `
                    : ""
            }

            <a
                href="servicio-editor.html?id=${encodeURIComponent(
                    service.id
                )}"
                class="admin-service-action"
                aria-label="Editar servicio"
                title="Editar"
            >
                <i data-lucide="pencil"></i>
            </a>

            <button
                type="button"
                class="admin-service-action admin-service-action--danger"
                data-action="delete"
                data-service-id="${escapeHTML(
                    service.id
                )}"
                aria-label="Eliminar servicio"
                title="Eliminar"
            >
                <i data-lucide="trash-2"></i>
            </button>

        </div>
    `;

    const imageElement =
        article.querySelector(
            ".admin-service-card__media img"
        );

    imageElement?.addEventListener(
        "error",
        () => {
            imageElement
                .closest(
                    ".admin-service-card__media"
                )
                .innerHTML = `
                    <div class="admin-service-card__placeholder">
                        <i data-lucide="image-off"></i>
                    </div>
                `;

            initIcons();
        }
    );

    return article;
}

function renderServices() {
    if (!servicesList) {
        return;
    }

    servicesList.innerHTML =
        "";

    updateResultsCount();

    if (
        !filteredServices.length
    ) {
        servicesList.hidden =
            true;

        if (servicesEmpty) {
            servicesEmpty.hidden =
                false;
        }

        return;
    }

    servicesList.hidden =
        false;

    if (servicesEmpty) {
        servicesEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    filteredServices.forEach(
        (service) => {
            fragment.appendChild(
                createServiceCard(
                    service
                )
            );
        }
    );

    servicesList.appendChild(
        fragment
    );

    initIcons();
}

async function toggleService(
    serviceId
) {
    const service =
        services.find(
            (item) =>
                item.id ===
                serviceId
        );

    if (!service) {
        return;
    }

    const newStatus =
        service.activo === false;

    const button =
        servicesList
            ?.querySelector(
                `[data-action="toggle"][data-service-id="${CSS.escape(
                    serviceId
                )}"]`
            );

    if (button) {
        button.disabled =
            true;
    }

    try {
        await updateDoc(
            doc(
                db,
                "servicios",
                serviceId
            ),
            {
                activo:
                    newStatus,
                actualizadoEn:
                    serverTimestamp()
            }
        );

        service.activo =
            newStatus;

        renderSummary();
        applyFilters();

        showToast(
            newStatus
                ? "Servicio activado."
                : "Servicio desactivado."
        );
    } catch (error) {
        console.error(
            "No se pudo cambiar el estado del servicio:",
            error
        );

        if (button) {
            button.disabled =
                false;
        }

        showToast(
            "No se pudo actualizar el servicio.",
            "error"
        );
    }
}

function openDeleteModal(
    serviceId
) {
    const service =
        services.find(
            (item) =>
                item.id ===
                serviceId
        );

    if (
        !service ||
        !deleteServiceModal
    ) {
        return;
    }

    selectedDeleteService =
        service;

    if (deleteServiceName) {
        deleteServiceName.textContent =
            service.nombre ||
            "este servicio";
    }

    deleteServiceModal.classList.add(
        "is-open"
    );

    deleteServiceModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );
}

function closeDeleteModal() {
    if (!deleteServiceModal) {
        return;
    }

    if (
        deletingService
    ) {
        return;
    }

    deleteServiceModal.classList.remove(
        "is-open"
    );

    deleteServiceModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "admin-modal-open"
    );

    selectedDeleteService =
        null;
}

async function confirmServiceDeletion() {
    if (
        !selectedDeleteService ||
        deletingService
    ) {
        return;
    }

    deletingService =
        true;

    if (confirmDeleteService) {
        confirmDeleteService.disabled =
            true;

        confirmDeleteService.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Eliminando...
        `;

        initIcons();
    }

    try {
        const serviceId =
            selectedDeleteService.id;

        await deleteDoc(
            doc(
                db,
                "servicios",
                serviceId
            )
        );

        services =
            services.filter(
                (service) =>
                    service.id !==
                    serviceId
            );

        selectedDeleteService =
            null;

        deletingService =
            false;

        if (confirmDeleteService) {
            confirmDeleteService.disabled =
                false;

            confirmDeleteService.innerHTML = `
                <i data-lucide="trash-2"></i>
                Eliminar servicio
            `;
        }

        closeDeleteModal();

        renderSummary();
        applyFilters();
        initIcons();

        showToast(
            "Servicio eliminado correctamente."
        );
    } catch (error) {
        console.error(
            "No se pudo eliminar el servicio:",
            error
        );

        deletingService =
            false;

        if (confirmDeleteService) {
            confirmDeleteService.disabled =
                false;

            confirmDeleteService.innerHTML = `
                <i data-lucide="trash-2"></i>
                Eliminar servicio
            `;
        }

        initIcons();

        showToast(
            "No se pudo eliminar el servicio.",
            "error"
        );
    }
}

function handleServicesClick(
    event
) {
    const target =
        event.target.closest(
            "[data-action]"
        );

    if (!target) {
        return;
    }

    const serviceId =
        target.dataset.serviceId;

    const action =
        target.dataset.action;

    if (
        action === "toggle"
    ) {
        toggleService(
            serviceId
        );

        return;
    }

    if (
        action === "delete"
    ) {
        openDeleteModal(
            serviceId
        );
    }
}

function resetFilters() {
    searchTerm =
        "";

    statusFilter =
        "todos";

    categoryFilter =
        "todas";

    sortMode =
        "orden";

    if (serviceSearch) {
        serviceSearch.value =
            "";
    }

    if (
        serviceStatusFilter
    ) {
        serviceStatusFilter.value =
            "todos";
    }

    if (
        serviceCategoryFilter
    ) {
        serviceCategoryFilter.value =
            "todas";
    }

    if (serviceSort) {
        serviceSort.value =
            "orden";
    }

    applyFilters();
}

function bindFilters() {
    serviceSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        serviceSearch.value
                    );

                applyFilters();
            }
        );

    serviceStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    serviceStatusFilter.value;

                applyFilters();
            }
        );

    serviceCategoryFilter
        ?.addEventListener(
            "change",
            () => {
                categoryFilter =
                    serviceCategoryFilter.value;

                applyFilters();
            }
        );

    serviceSort
        ?.addEventListener(
            "change",
            () => {
                sortMode =
                    serviceSort.value;

                applyFilters();
            }
        );

    resetServiceFilters
        ?.addEventListener(
            "click",
            resetFilters
        );

    emptyResetServiceFilters
        ?.addEventListener(
            "click",
            resetFilters
        );
}

function bindServiceActions() {
    servicesList
        ?.addEventListener(
            "click",
            handleServicesClick
        );
}

function bindDeleteModal() {
    deleteServiceBackdrop
        ?.addEventListener(
            "click",
            closeDeleteModal
        );

    deleteServiceClose
        ?.addEventListener(
            "click",
            closeDeleteModal
        );

    cancelDeleteService
        ?.addEventListener(
            "click",
            closeDeleteModal
        );

    confirmDeleteService
        ?.addEventListener(
            "click",
            confirmServiceDeletion
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
        await signOut(
            auth
        );

        window.location.href =
            "../login.html";
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
                deleteServiceModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeDeleteModal();
                return;
            }

            closeSidebar();
        }
    );
}

async function init() {
    initIcons();
    setCurrentYear();

    bindSidebar();
    bindLogout();
    bindFilters();
    bindServiceActions();
    bindDeleteModal();
    bindKeyboard();

    const allowed =
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    await loadServices();

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