import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pageLoader =
    document.getElementById(
        "pageLoader"
    );

const siteHeader =
    document.getElementById(
        "siteHeader"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const menuClose =
    document.getElementById(
        "menuClose"
    );

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const menuBackdrop =
    mobileMenu?.querySelector(
        ".mobile-menu__backdrop"
    );

const mobileLinks =
    mobileMenu?.querySelectorAll(
        "a"
    );

const serviceSearch =
    document.getElementById(
        "serviceSearch"
    );

const clearSearch =
    document.getElementById(
        "clearSearch"
    );

const serviceFilters =
    document.getElementById(
        "serviceFilters"
    );

const servicesCount =
    document.getElementById(
        "servicesCount"
    );

const resetFilters =
    document.getElementById(
        "resetFilters"
    );

const servicesList =
    document.getElementById(
        "servicesList"
    );

const servicesEmpty =
    document.getElementById(
        "servicesEmpty"
    );

const emptyReset =
    document.getElementById(
        "emptyReset"
    );

const currentYear =
    document.getElementById(
        "currentYear"
    );

const fallbackServices = [
    {
        id: "lavado-basico-chasis-componentes",
        slug: "lavado-basico-chasis-componentes",
        nombre: "Lavado básico de chasis y componentes",
        categoria: "Motor y chasis",
        categoriaSlug: "motor-chasis",
        descripcion:
            "Limpieza general con atención especial al motor, chasis y componentes.",
        precioDesde: 650,
        activo: true,
        estado: "publicado",
        orden: 1
    },
    {
        id: "lavado-basico",
        slug: "lavado-basico",
        nombre: "Lavado básico exterior e interior",
        categoria: "Lavado",
        categoriaSlug: "lavado",
        descripcion:
            "Limpieza exterior e interior para mantener el vehículo limpio y cuidado.",
        precioDesde: 180,
        activo: true,
        estado: "publicado",
        orden: 2
    },
    {
        id: "detallado-motor-vapor",
        slug: "detallado-motor-vapor",
        nombre: "Detallado de motor a base de vapor",
        categoria: "Motor y chasis",
        categoriaSlug: "motor-chasis",
        descripcion:
            "Limpieza especializada del compartimiento del motor utilizando vapor.",
        precioDesde: 500,
        activo: true,
        estado: "publicado",
        orden: 3
    },
    {
        id: "limpieza-motor-agua",
        slug: "limpieza-motor-agua",
        nombre: "Limpieza de motor a base de agua",
        categoria: "Motor y chasis",
        categoriaSlug: "motor-chasis",
        descripcion:
            "Limpieza y desengrase del motor protegiendo sus componentes delicados.",
        precioDesde: 500,
        activo: true,
        estado: "publicado",
        orden: 4
    },
    {
        id: "pulido-basico",
        slug: "pulido-basico",
        nombre: "Pulido básico",
        categoria: "Pintura",
        categoriaSlug: "pintura",
        descripcion:
            "Descontaminación, corrección superficial y recuperación del brillo de la pintura.",
        precioDesde: 2200,
        activo: true,
        estado: "publicado",
        orden: 5
    },
    {
        id: "correccion-basica-pintura",
        slug: "correccion-basica-pintura",
        nombre: "Corrección básica de pintura",
        categoria: "Pintura",
        categoriaSlug: "pintura",
        descripcion:
            "Corrección y nivelación del barniz para recuperar profundidad, brillo y acabado.",
        precioDesde: 3500,
        activo: true,
        estado: "publicado",
        orden: 6
    },
    {
        id: "pulido-faros",
        slug: "pulido-faros",
        nombre: "Pulido de faros",
        categoria: "Pintura",
        categoriaSlug: "pintura",
        descripcion:
            "Restauración de transparencia y brillo con protección cerámica.",
        precioDesde: 900,
        activo: true,
        estado: "publicado",
        orden: 7
    },
    {
        id: "pulido-vidrios",
        slug: "pulido-vidrios",
        nombre: "Pulido de vidrios",
        categoria: "Protección",
        categoriaSlug: "proteccion",
        descripcion:
            "Descontaminación, corrección de vidrio y aplicación de protección.",
        precioDesde: 600,
        activo: true,
        estado: "publicado",
        orden: 8
    },
    {
        id: "ceramic-silver",
        slug: "ceramic-silver",
        nombre: "Ceramic Silver",
        categoria: "Cerámicos",
        categoriaSlug: "ceramicos",
        descripcion:
            "Corrección de pintura y protección cerámica profesional de 1 año.",
        precioDesde: 6500,
        activo: true,
        estado: "publicado",
        orden: 9
    },
    {
        id: "ceramic-gold",
        slug: "ceramic-gold",
        nombre: "Ceramic Gold",
        categoria: "Cerámicos",
        categoriaSlug: "ceramicos",
        descripcion:
            "Corrección avanzada y protección cerámica profesional de 3 años.",
        precioDesde: 7500,
        activo: true,
        estado: "publicado",
        orden: 10
    },
    {
        id: "ceramic-diamond",
        slug: "ceramic-diamond",
        nombre: "Ceramic Diamond",
        categoria: "Cerámicos",
        categoriaSlug: "ceramicos",
        descripcion:
            "Máximo nivel de corrección y protección cerámica profesional de 5 años.",
        precioDesde: 13500,
        activo: true,
        estado: "publicado",
        orden: 11
    },
    {
        id: "aplicacion-ppf",
        slug: "aplicacion-ppf",
        nombre: "Aplicación de PPF",
        categoria: "PPF",
        categoriaSlug: "ppf",
        descripcion:
            "Película de protección para conservar la pintura en zonas expuestas a impactos.",
        precioDesde: 19200,
        activo: true,
        estado: "publicado",
        orden: 12
    },
    {
        id: "supreme-interior",
        slug: "supreme-interior",
        nombre: "Supreme Interior",
        categoria: "Interior",
        categoriaSlug: "interior",
        descripcion:
            "Limpieza profunda y detallado completo del habitáculo del vehículo.",
        precioDesde: 1700,
        activo: true,
        estado: "publicado",
        orden: 13
    },
    {
        id: "ready-to-sell",
        slug: "ready-to-sell",
        nombre: "Ready to Sell",
        categoria: "Lavado",
        categoriaSlug: "lavado",
        descripcion:
            "Preparación estética integral del vehículo antes de ponerlo en venta.",
        precioDesde: 2750,
        activo: true,
        estado: "publicado",
        orden: 14
    }
];

let services = [];
let filteredServices = [];
let selectedCategory = "todos";
let searchTerm = "";

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
        280
    );
}

function setCurrentYear() {
    if (!currentYear) {
        return;
    }

    currentYear.textContent =
        new Date().getFullYear();
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

function slugify(value) {
    return normalizeText(value)
        .replace(/&/g, "y")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
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
            "Servicio PMC"
        );
    }

    return "Servicio PMC";
}

function getCategorySlug(service) {
    if (
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
        "Servicio profesional PMC Auto Detailing."
    );
}

function getServicePrice(service) {
    const candidates = [
        service.precioDesde,
        service.precio,
        service.precioMinimo
    ];

    for (
        const candidate of
        candidates
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

    if (
        service.precios &&
        typeof service.precios ===
            "object" &&
        !Array.isArray(
            service.precios
        )
    ) {
        const prices =
            Object.values(
                service.precios
            )
                .map(
                    (item) => {
                        if (
                            typeof item ===
                            "number"
                        ) {
                            return item;
                        }

                        if (
                            item &&
                            typeof item ===
                            "object"
                        ) {
                            return Number(
                                item.desde ??
                                item.min ??
                                item.precio
                            );
                        }

                        return Number(
                            item
                        );
                    }
                )
                .filter(
                    (value) =>
                        Number.isFinite(
                            value
                        ) &&
                        value > 0
                );

        if (prices.length) {
            return Math.min(
                ...prices
            );
        }
    }

    if (
        Array.isArray(
            service.precios
        )
    ) {
        const prices =
            service.precios
                .map(
                    (item) => {
                        const value =
                            item?.precio ??
                            item?.desde ??
                            item?.min ??
                            item?.valor;

                        if (
                            typeof value ===
                            "number"
                        ) {
                            return value;
                        }

                        const match =
                            String(
                                value ?? ""
                            )
                                .replaceAll(
                                    ",",
                                    ""
                                )
                                .match(
                                    /\d+/
                                );

                        return match
                            ? Number(
                                match[0]
                            )
                            : null;
                    }
                )
                .filter(
                    (value) =>
                        Number.isFinite(
                            value
                        ) &&
                        value > 0
                );

        if (prices.length) {
            return Math.min(
                ...prices
            );
        }
    }

    return null;
}

function getServiceImage(service) {
    const directCandidates = [
        service.imagenPortada,
        service.imagenPrincipal,
        service.portada,
        service.imagen,
        service.cover
    ];

    for (
        const candidate of
        directCandidates
    ) {
        if (
            typeof candidate ===
                "string" &&
            candidate.trim()
        ) {
            return candidate.trim();
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
                return url;
            }
        }
    }

    if (
        Array.isArray(
            service.imagenes
        )
    ) {
        for (
            const image of
            service.imagenes
        ) {
            if (
                typeof image ===
                    "string" &&
                image.trim()
            ) {
                return image.trim();
            }

            if (
                image &&
                typeof image ===
                    "object"
            ) {
                const url =
                    image.url ||
                    image.secure_url;

                if (url) {
                    return url;
                }
            }
        }
    }

    if (
        Array.isArray(
            service.multimedia
        )
    ) {
        const image =
            service.multimedia.find(
                (item) =>
                    item.tipo ===
                        "imagen" ||
                    item.type ===
                        "image"
            );

        if (image) {
            return (
                image.url ||
                image.secure_url ||
                ""
            );
        }
    }

    return "";
}

function getServiceId(service) {
    return (
        service.slug ||
        service.id
    );
}

function getSearchableText(service) {
    const included =
        Array.isArray(
            service.incluye
        )
            ? service.incluye.join(
                " "
            )
            : "";

    return normalizeText(
        [
            service.nombre,
            getServiceCategory(
                service
            ),
            getServiceDescription(
                service
            ),
            included
        ]
            .filter(Boolean)
            .join(" ")
    );
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

function updateHeader() {
    if (!siteHeader) {
        return;
    }

    siteHeader.classList.toggle(
        "is-scrolled",
        window.scrollY > 20
    );
}

function updateClearSearchButton() {
    if (!clearSearch) {
        return;
    }

    clearSearch.hidden =
        !searchTerm;
}

function updateFilterButtons() {
    serviceFilters
        ?.querySelectorAll(
            "[data-category]"
        )
        .forEach(
            (button) => {
                button.classList.toggle(
                    "is-active",
                    button.dataset.category ===
                        selectedCategory
                );
            }
        );
}

function updateUrlCategory() {
    const url =
        new URL(
            window.location.href
        );

    if (
        selectedCategory ===
        "todos"
    ) {
        url.searchParams.delete(
            "categoria"
        );
    } else {
        url.searchParams.set(
            "categoria",
            selectedCategory
        );
    }

    window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`
    );
}

function readCategoryFromUrl() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        normalizeText(
            params.get(
                "categoria"
            ) ||
            ""
        );

    const allowed = [
        "todos",
        "lavado",
        "pintura",
        "proteccion",
        "ceramicos",
        "interior",
        "motor-chasis",
        "ppf"
    ];

    if (
        allowed.includes(
            category
        )
    ) {
        selectedCategory =
            category;

        return;
    }

    selectedCategory =
        "todos";
}

function applyFilters() {
    filteredServices =
        services.filter(
            (service) => {
                const categoryMatches =
                    selectedCategory ===
                        "todos" ||
                    getCategorySlug(
                        service
                    ) ===
                        selectedCategory;

                const searchMatches =
                    !searchTerm ||
                    getSearchableText(
                        service
                    ).includes(
                        searchTerm
                    );

                return (
                    categoryMatches &&
                    searchMatches
                );
            }
        );

    renderServices();
    updateFilterButtons();
    updateClearSearchButton();
}

function updateServicesCount() {
    if (!servicesCount) {
        return;
    }

    const count =
        filteredServices.length;

    if (count === 1) {
        servicesCount.textContent =
            "1 servicio";
    } else {
        servicesCount.textContent =
            `${count} servicios`;
    }
}

function createServiceCard(service) {
    const article =
        document.createElement(
            "article"
        );

    article.className =
        "service-card";

    const image =
        getServiceImage(
            service
        );

    const price =
        getServicePrice(
            service
        );

    const serviceId =
        getServiceId(
            service
        );

    const category =
        getServiceCategory(
            service
        );

    article.innerHTML = `
        <a
            href="servicio.html?id=${encodeURIComponent(
                serviceId
            )}"
            class="service-card__link"
        >

            <div class="service-card__media">

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
                            <div class="service-card__placeholder">
                                <i data-lucide="car-front"></i>
                            </div>
                          `
                }

                <span class="service-card__category">
                    ${escapeHTML(
                        category
                    )}
                </span>

                <span class="service-card__arrow">
                    <i data-lucide="arrow-up-right"></i>
                </span>

            </div>

            <div class="service-card__content">

                <h2>
                    ${escapeHTML(
                        service.nombre ||
                        "Servicio PMC"
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        getServiceDescription(
                            service
                        )
                    )}
                </p>

                <div class="service-card__bottom">

                    <div class="service-card__price">

                        ${
                            price
                                ? `
                                    <span>
                                        Desde
                                    </span>

                                    <strong>
                                        ${formatCurrency(
                                            price
                                        )}
                                    </strong>
                                  `
                                : `
                                    <span>
                                        Precio
                                    </span>

                                    <strong>
                                        Cotizar
                                    </strong>
                                  `
                        }

                    </div>

                    <span class="service-card__more">
                        Ver servicio

                        <i data-lucide="arrow-right"></i>
                    </span>

                </div>

            </div>

        </a>
    `;

    return article;
}

function renderServices() {
    if (!servicesList) {
        return;
    }

    servicesList.innerHTML =
        "";

    updateServicesCount();

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

async function loadServices() {
    try {
        const servicesQuery =
            query(
                collection(
                    db,
                    "servicios"
                ),
                where(
                    "estado",
                    "==",
                    "publicado"
                ),
                where(
                    "activo",
                    "==",
                    true
                )
            );

        const snapshot =
            await getDocs(
                servicesQuery
            );

        const firebaseServices =
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
                    (a, b) =>
                        Number(
                            a.orden ?? 999
                        ) -
                        Number(
                            b.orden ?? 999
                        )
                );

        services =
            firebaseServices.length
                ? firebaseServices
                : fallbackServices;
    } catch (error) {
        console.error(
            "No se pudieron cargar los servicios:",
            error
        );

        services =
            fallbackServices;
    }

    applyFilters();
}

function handleSearchInput() {
    searchTerm =
        normalizeText(
            serviceSearch?.value ||
            ""
        );

    applyFilters();
}

function resetSearch() {
    if (serviceSearch) {
        serviceSearch.value =
            "";
    }

    searchTerm =
        "";

    applyFilters();

    serviceSearch?.focus();
}

function resetAllFilters() {
    selectedCategory =
        "todos";

    searchTerm =
        "";

    if (serviceSearch) {
        serviceSearch.value =
            "";
    }

    updateUrlCategory();
    applyFilters();
}

function selectCategory(
    category
) {
    selectedCategory =
        category ||
        "todos";

    updateUrlCategory();
    applyFilters();
}

function bindFilters() {
    serviceSearch?.addEventListener(
        "input",
        handleSearchInput
    );

    clearSearch?.addEventListener(
        "click",
        resetSearch
    );

    resetFilters?.addEventListener(
        "click",
        resetAllFilters
    );

    emptyReset?.addEventListener(
        "click",
        resetAllFilters
    );

    serviceFilters?.addEventListener(
        "click",
        (event) => {
            const button =
                event.target.closest(
                    "[data-category]"
                );

            if (!button) {
                return;
            }

            selectCategory(
                button.dataset.category
            );
        }
    );
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

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                mobileMenu?.classList.contains(
                    "is-open"
                )
            ) {
                closeMobileMenu();
            }
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

    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );
}

async function init() {
    initIcons();
    setCurrentYear();
    updateHeader();

    readCategoryFromUrl();

    bindNavigation();
    bindFilters();

    updateFilterButtons();
    updateClearSearchButton();

    await loadServices();
}

document.addEventListener(
    "DOMContentLoaded",
    init
);

window.addEventListener(
    "load",
    hideLoader
);

window.setTimeout(
    hideLoader,
    2600
);