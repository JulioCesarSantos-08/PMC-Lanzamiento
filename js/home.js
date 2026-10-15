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
    document.getElementById("pageLoader");

const siteHeader =
    document.getElementById("siteHeader");

const menuButton =
    document.getElementById("menuButton");

const menuClose =
    document.getElementById("menuClose");

const mobileMenu =
    document.getElementById("mobileMenu");

const menuBackdrop =
    mobileMenu?.querySelector(
        ".mobile-menu__backdrop"
    );

const mobileLinks =
    mobileMenu?.querySelectorAll("a");

const featuredServices =
    document.getElementById(
        "featuredServices"
    );

const openAssistant =
    document.getElementById(
        "openAssistant"
    );

const floatingAssistant =
    document.getElementById(
        "floatingAssistant"
    );

const currentYear =
    document.getElementById(
        "currentYear"
    );

const fallbackServices = [
    {
        id: "ceramic-silver",
        nombre: "Ceramic Silver",
        categoria: "Cerámicos",
        descripcion:
            "Corrección de pintura y protección cerámica profesional para conservar brillo y acabado.",
        precioDesde: 6500,
        destacado: true,
        activo: true,
        estado: "publicado",
        orden: 1
    },
    {
        id: "ceramic-gold",
        nombre: "Ceramic Gold",
        categoria: "Cerámicos",
        descripcion:
            "Protección cerámica de alto desempeño con corrección avanzada de pintura.",
        precioDesde: 7500,
        destacado: true,
        activo: true,
        estado: "publicado",
        orden: 2
    },
    {
        id: "aplicacion-ppf",
        nombre: "Aplicación de PPF",
        categoria: "PPF",
        descripcion:
            "Película de protección para conservar la pintura en zonas de alto impacto.",
        precioDesde: 19200,
        destacado: true,
        activo: true,
        estado: "publicado",
        orden: 3
    }
];

let services = [];

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

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
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
        const values =
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

        if (values.length) {
            return Math.min(
                ...values
            );
        }
    }

    return null;
}

function getServiceImage(service) {
    if (
        service.imagenPrincipal
    ) {
        return service.imagenPrincipal;
    }

    if (
        service.portada
    ) {
        return service.portada;
    }

    if (
        Array.isArray(
            service.imagenes
        ) &&
        service.imagenes.length
    ) {
        const first =
            service.imagenes[0];

        if (
            typeof first ===
            "string"
        ) {
            return first;
        }

        if (
            first &&
            typeof first ===
            "object"
        ) {
            return (
                first.url ||
                first.secure_url ||
                ""
            );
        }
    }

    return "";
}

function serviceIsHighlighted(service) {
    return (
        service.destacado === true ||
        service.destacada === true ||
        service.featured === true
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

function createServiceCard(service) {
    const price =
        getServicePrice(
            service
        );

    const image =
        getServiceImage(
            service
        );

    const serviceId =
        service.slug ||
        service.id;

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "service-card";

    article.innerHTML = `
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
                            <i data-lucide="sparkles"></i>
                        </div>
                      `
            }

        </div>

        <div class="service-card__content">

            <span class="service-card__category">
                ${escapeHTML(
                    getServiceCategory(
                        service
                    )
                )}
            </span>

            <h3>
                ${escapeHTML(
                    service.nombre ||
                    "Servicio PMC"
                )}
            </h3>

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
                                <small>
                                    Desde
                                </small>

                                <strong>
                                    ${formatCurrency(
                                        price
                                    )}
                                </strong>
                              `
                            : `
                                <small>
                                    Precio
                                </small>

                                <strong>
                                    Cotizar
                                </strong>
                              `
                    }

                </div>

                <a
                    href="servicio.html?servicio=${encodeURIComponent(
                        serviceId
                    )}"
                    class="service-card__link"
                    aria-label="Ver ${escapeHTML(
                        service.nombre ||
                        "servicio"
                    )}"
                >
                    <i data-lucide="arrow-up-right"></i>
                </a>

            </div>

        </div>
    `;

    return article;
}

function renderFeaturedServices() {
    if (!featuredServices) {
        return;
    }

    featuredServices.innerHTML =
        "";

    let highlighted =
        services.filter(
            serviceIsHighlighted
        );

    if (
        highlighted.length <
        3
    ) {
        const alreadySelected =
            new Set(
                highlighted.map(
                    (service) =>
                        service.id
                )
            );

        const additional =
            services.filter(
                (service) =>
                    !alreadySelected.has(
                        service.id
                    )
            );

        highlighted = [
            ...highlighted,
            ...additional
        ];
    }

    highlighted =
        highlighted
            .sort(
                (a, b) =>
                    Number(
                        a.orden ?? 999
                    ) -
                    Number(
                        b.orden ?? 999
                    )
            )
            .slice(
                0,
                3
            );

    if (!highlighted.length) {
        highlighted =
            fallbackServices;
    }

    const fragment =
        document.createDocumentFragment();

    highlighted.forEach(
        (service) => {
            fragment.appendChild(
                createServiceCard(
                    service
                )
            );
        }
    );

    featuredServices.appendChild(
        fragment
    );

    initIcons();
}

async function loadFeaturedServices() {
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
                .filter(
                    (service) =>
                        normalizeText(
                            service.estado
                        ) ===
                            "publicado" &&
                        service.activo ===
                            true
                );

        services =
            firebaseServices.length
                ? firebaseServices
                : fallbackServices;
    } catch (error) {
        console.error(
            "No se pudieron cargar los servicios destacados:",
            error
        );

        services =
            fallbackServices;
    }

    renderFeaturedServices();
}

function openAssistantSection() {
    const assistantSection =
        document.getElementById(
            "asistente"
        );

    if (!assistantSection) {
        return;
    }

    assistantSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function bindAssistantButtons() {
    openAssistant?.addEventListener(
        "click",
        openAssistantSection
    );

    floatingAssistant?.addEventListener(
        "click",
        openAssistantSection
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

    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
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

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key ===
                    "Escape" &&
                mobileMenu?.classList.contains(
                    "is-open"
                )
            ) {
                closeMobileMenu();
            }
        }
    );
}

async function init() {
    initIcons();
    setCurrentYear();
    updateHeader();

    bindNavigation();
    bindAssistantButtons();

    await loadFeaturedServices();
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