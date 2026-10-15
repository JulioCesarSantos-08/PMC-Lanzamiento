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

const currentYear =
    document.getElementById(
        "currentYear"
    );

const serviceCategory =
    document.getElementById(
        "serviceCategory"
    );

const serviceTitle =
    document.getElementById(
        "serviceTitle"
    );

const serviceDescription =
    document.getElementById(
        "serviceDescription"
    );

const serviceHeroImage =
    document.getElementById(
        "serviceHeroImage"
    );

const serviceHeroPlaceholder =
    document.getElementById(
        "serviceHeroPlaceholder"
    );

const serviceDuration =
    document.getElementById(
        "serviceDuration"
    );

const serviceStartingPrice =
    document.getElementById(
        "serviceStartingPrice"
    );

const serviceWarranty =
    document.getElementById(
        "serviceWarranty"
    );

const serviceIncludes =
    document.getElementById(
        "serviceIncludes"
    );

const serviceCleaning =
    document.getElementById(
        "serviceCleaning"
    );

const serviceCleaningSection =
    document.getElementById(
        "serviceCleaningSection"
    );

const serviceProcesses =
    document.getElementById(
        "serviceProcesses"
    );

const serviceProcessesSection =
    document.getElementById(
        "serviceProcessesSection"
    );

const serviceProtection =
    document.getElementById(
        "serviceProtection"
    );

const serviceProtectionSection =
    document.getElementById(
        "serviceProtectionSection"
    );

const serviceOptions =
    document.getElementById(
        "serviceOptions"
    );

const serviceOptionsSection =
    document.getElementById(
        "serviceOptionsSection"
    );

const servicePrices =
    document.getElementById(
        "servicePrices"
    );

const serviceGallery =
    document.getElementById(
        "serviceGallery"
    );

const serviceGallerySection =
    document.getElementById(
        "serviceGallerySection"
    );

const relatedServices =
    document.getElementById(
        "relatedServices"
    );

const relatedServicesSection =
    document.getElementById(
        "relatedServicesSection"
    );

const serviceContent =
    document.getElementById(
        "serviceContent"
    );

const serviceError =
    document.getElementById(
        "serviceError"
    );

const bookingButtons =
    document.querySelectorAll(
        [
            "[data-book-service]",
            "#bookServiceButton",
            "#sidebarBookButton",
            "#bottomBookButton",
            "#serviceBookButton"
        ].join(",")
    );

const whatsappButtons =
    document.querySelectorAll(
        [
            "[data-whatsapp-service]",
            "#serviceWhatsAppButton",
            "#sidebarWhatsAppButton",
            "#whatsappServiceButton"
        ].join(",")
    );

const assistantButtons =
    document.querySelectorAll(
        [
            "[data-assistant-service]",
            "#serviceAssistantButton",
            "#askAssistantButton"
        ].join(",")
    );

const fallbackServices = [
    {
        id: "lavado-basico-chasis-componentes",
        slug: "lavado-basico-chasis-componentes",
        nombre: "Lavado básico de chasis y componentes",
        categoria: "Motor y chasis",
        descripcion:
            "Limpieza general con atención especial al motor, chasis y componentes.",
        duracionMinutos: 120,
        precioDesde: 650,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 650
            },
            {
                vehiculo: "Sedán",
                precio: 650
            },
            {
                vehiculo: "SUV",
                precio: 750
            },
            {
                vehiculo: "Pick-up",
                precio: "850 - 1,000"
            }
        ],
        incluye: [
            "Lavado de carrocería",
            "Limpieza de plásticos",
            "Aspirado interior",
            "Desengrase de motor y chasis",
            "Lavado básico de motor y chasis",
            "Lubricación"
        ],
        limpieza: [
            "Lavado general de carrocería",
            "Limpieza básica interior",
            "Limpieza de componentes"
        ],
        procesos: [
            "Desengrase de motor",
            "Desengrase de chasis",
            "Lavado de motor",
            "Lavado de chasis"
        ],
        proteccion: [
            "Lubricación de componentes"
        ],
        activo: true,
        estado: "publicado",
        orden: 1
    },
    {
        id: "lavado-basico",
        slug: "lavado-basico",
        nombre: "Lavado básico exterior e interior",
        categoria: "Lavado",
        descripcion:
            "Limpieza exterior e interior para mantener tu vehículo limpio, protegido y con excelente presentación.",
        duracionMinutos: 90,
        precioDesde: 180,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 180
            },
            {
                vehiculo: "Sedán",
                precio: 200
            },
            {
                vehiculo: "Camionetas / Pick-up",
                precio: "200 - 300"
            }
        ],
        limpieza: [
            "Limpieza básica de rines y tolvas",
            "Lavado de carrocería con shampoo y cera",
            "Limpieza de parrilla",
            "Aspirado de tapetes, alfombras y asientos",
            "Limpieza de tablero, puertas y consola",
            "Limpieza de vidrios interiores",
            "Limpieza de plásticos interiores"
        ],
        proteccion: [
            "Quick Detailer",
            "Brillo para llantas"
        ],
        activo: true,
        estado: "publicado",
        orden: 2
    },
    {
        id: "detallado-motor-vapor",
        slug: "detallado-motor-vapor",
        nombre: "Detallado de motor a base de vapor",
        categoria: "Motor y chasis",
        descripcion:
            "Limpieza especializada del compartimiento del motor utilizando vapor y protección de componentes.",
        duracionMinutos: 120,
        precioDesde: 500,
        precios: [
            {
                vehiculo: "Hatchback / Sedán",
                precio: "500 - 600"
            },
            {
                vehiculo: "SUV / Pick-up",
                precio: "700 - 800"
            }
        ],
        limpieza: [
            "Limpieza y desengrase del compartimiento del motor",
            "Limpieza de cofre y bisagras",
            "Limpieza de componentes",
            "Limpieza de plásticos y mangueras"
        ],
        procesos: [
            "Aplicación controlada de vapor",
            "Protección de conexiones eléctricas"
        ],
        proteccion: [
            "Hidratación de plásticos",
            "Abrillantado de componentes metálicos"
        ],
        activo: true,
        estado: "publicado",
        orden: 3
    },
    {
        id: "limpieza-motor-agua",
        slug: "limpieza-motor-agua",
        nombre: "Limpieza de motor a base de agua",
        categoria: "Motor y chasis",
        descripcion:
            "Limpieza y desengrase del motor mediante un proceso controlado a base de agua.",
        duracionMinutos: 120,
        precioDesde: 500,
        precios: [
            {
                vehiculo: "Hatchback / Sedán",
                precio: "500 - 600"
            },
            {
                vehiculo: "SUV / Pick-up",
                precio: "700 - 800"
            }
        ],
        limpieza: [
            "Eliminación de grasa, polvo y suciedad",
            "Limpieza de componentes del motor",
            "Limpieza de plásticos y mangueras"
        ],
        procesos: [
            "Protección de componentes delicados",
            "Lavado controlado a base de agua"
        ],
        proteccion: [
            "Hidratación de plásticos",
            "Abrillantado final"
        ],
        activo: true,
        estado: "publicado",
        orden: 4
    },
    {
        id: "pulido-basico",
        slug: "pulido-basico",
        nombre: "Pulido básico",
        categoria: "Pintura",
        descripcion:
            "Descontaminación, corrección superficial y recuperación del brillo de la pintura.",
        duracionMinutos: 300,
        precioDesde: 2200,
        precios: [
            {
                vehiculo: "Hatchback / Sedán",
                precio: "2,200 - 2,500"
            },
            {
                vehiculo: "SUV / Pick-up",
                precio: "3,000 - 3,400"
            }
        ],
        limpieza: [
            "Lavado",
            "Descontaminación mecánica de pintura"
        ],
        procesos: [
            "Descontaminación química y mecánica",
            "Encintado de zonas sensibles",
            "Corrección del barniz",
            "Abrillantado de pintura"
        ],
        proteccion: [
            "Cera premium",
            "Protección de hasta 6 meses",
            "Hidratación de neumáticos"
        ],
        activo: true,
        estado: "publicado",
        orden: 5
    },
    {
        id: "correccion-basica-pintura",
        slug: "correccion-basica-pintura",
        nombre: "Corrección básica de pintura",
        categoria: "Pintura",
        descripcion:
            "Proceso de corrección para reducir imperfecciones y recuperar profundidad, brillo y acabado.",
        duracionMinutos: 480,
        precioDesde: 3500,
        precios: [
            {
                vehiculo: "Hatchback / Sedán",
                precio: "3,500 - 4,000"
            },
            {
                vehiculo: "Camionetas cerradas",
                precio: "5,000 - 5,500"
            }
        ],
        limpieza: [
            "Lavado Luxury",
            "Descontaminación de pintura"
        ],
        procesos: [
            "Encintado de zonas sensibles",
            "Corrección del barniz hasta un 80%",
            "Abrillantado de pintura",
            "Descontaminación de vidrios"
        ],
        proteccion: [
            "Sellador o cera premium",
            "Hidratación de plásticos",
            "Hidratación de neumáticos"
        ],
        activo: true,
        estado: "publicado",
        orden: 6
    },
    {
        id: "pulido-faros",
        slug: "pulido-faros",
        nombre: "Pulido de faros",
        categoria: "Pintura",
        descripcion:
            "Restauración de transparencia, brillo y protección para faros deteriorados.",
        duracionMinutos: 120,
        precioDesde: 900,
        precios: [
            {
                vehiculo: "Servicio",
                precio: 900
            }
        ],
        limpieza: [
            "Lavado básico"
        ],
        procesos: [
            "Encintado alrededor del faro",
            "Corrección y nivelación",
            "Lijado cuando sea necesario",
            "Pulido de faros",
            "Restauración del brillo"
        ],
        proteccion: [
            "Aplicación de cerámico protector",
            "Garantía de 1 año"
        ],
        garantia: "1 año",
        activo: true,
        estado: "publicado",
        orden: 7
    },
    {
        id: "pulido-vidrios",
        slug: "pulido-vidrios",
        nombre: "Pulido de vidrios",
        categoria: "Protección",
        descripcion:
            "Descontaminación y corrección de vidrios para mejorar transparencia y acabado.",
        duracionMinutos: 180,
        precioDesde: 600,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 600
            },
            {
                vehiculo: "Sedán",
                precio: 800
            },
            {
                vehiculo: "Pick-up",
                precio: 1200
            }
        ],
        limpieza: [
            "Lavado básico",
            "Descontaminación mecánica y química"
        ],
        procesos: [
            "Eliminación de lluvia ácida",
            "Encintado de zonas sensibles",
            "Corrección y nivelación de vidrios",
            "Restauración de brillo"
        ],
        proteccion: [
            "Aplicación de cerámico para vidrios",
            "Garantía de 1 año"
        ],
        garantia: "1 año",
        activo: true,
        estado: "publicado",
        orden: 8
    },
    {
        id: "ceramic-silver",
        slug: "ceramic-silver",
        nombre: "Ceramic Silver",
        categoria: "Cerámicos",
        descripcion:
            "Corrección de pintura al 80% acompañada de protección cerámica profesional de 1 año.",
        duracionMinutos: 600,
        precioDesde: 6500,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 6500
            },
            {
                vehiculo: "Sedán",
                precio: 7000
            },
            {
                vehiculo: "SUV",
                precio: 8800
            },
            {
                vehiculo: "Pick-up",
                precio: 10000
            }
        ],
        limpieza: [
            "Lavado Luxury",
            "Lavado de motor con vapor",
            "Desmontado de rines",
            "Limpieza de rines por ambos lados",
            "Descontaminado de emblemas y contornos"
        ],
        procesos: [
            "Descontaminación química y mecánica de pintura",
            "Corrección de pintura al 80%",
            "Abrillantado de pintura"
        ],
        proteccion: [
            "Cerámico de 1 año en carrocería",
            "Protección en piel o tela",
            "Protección en plásticos rígidos",
            "Sellador en rines y vidrios"
        ],
        garantia: "1 año",
        activo: true,
        estado: "publicado",
        orden: 9
    },
    {
        id: "ceramic-gold",
        slug: "ceramic-gold",
        nombre: "Ceramic Gold",
        categoria: "Cerámicos",
        descripcion:
            "Corrección de pintura al 90% y protección cerámica profesional de 3 años.",
        duracionMinutos: 720,
        precioDesde: 7500,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 7500
            },
            {
                vehiculo: "Sedán",
                precio: 8000
            },
            {
                vehiculo: "SUV",
                precio: 10000
            },
            {
                vehiculo: "Pick-up",
                precio: 11200
            }
        ],
        limpieza: [
            "Lavado Luxury",
            "Lavado de motor con vapor",
            "Desmontado y limpieza de rines",
            "Descontaminación de emblemas y contornos"
        ],
        procesos: [
            "Descontaminación química y mecánica",
            "Corrección de pintura al 90%",
            "Abrillantado de pintura"
        ],
        proteccion: [
            "Cerámico de 3 años en carrocería",
            "Cerámico en rines y calipers",
            "Cerámico en plásticos rígidos",
            "Cerámico en vidrios",
            "Sellador en piel o tela"
        ],
        garantia: "3 años",
        activo: true,
        estado: "publicado",
        orden: 10
    },
    {
        id: "ceramic-diamond",
        slug: "ceramic-diamond",
        nombre: "Ceramic Diamond",
        categoria: "Cerámicos",
        descripcion:
            "Máximo nivel de corrección y protección cerámica profesional de 5 años.",
        duracionMinutos: 960,
        precioDesde: 13500,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 13500
            },
            {
                vehiculo: "Sedán",
                precio: 15500
            },
            {
                vehiculo: "SUV",
                precio: 20200
            },
            {
                vehiculo: "Pick-up",
                precio: 22000
            }
        ],
        limpieza: [
            "Lavado Luxury",
            "Lavado de motor con vapor",
            "Desmontado y limpieza de rines",
            "Descontaminación de emblemas y contornos"
        ],
        procesos: [
            "Descontaminación química y mecánica",
            "Corrección de pintura al 95%",
            "Abrillantado de pintura"
        ],
        proteccion: [
            "Cerámico de 5 años en carrocería",
            "Cerámico en rines y calipers",
            "Cerámico en plásticos",
            "Cerámico en vidrios",
            "Cerámico en piel o tela",
            "Protección de neumáticos"
        ],
        garantia: "5 años",
        activo: true,
        estado: "publicado",
        orden: 11
    },
    {
        id: "aplicacion-ppf",
        slug: "aplicacion-ppf",
        nombre: "Aplicación de PPF",
        categoria: "PPF",
        descripcion:
            "Película de protección para conservar la pintura frente a impactos, rayones y exposición diaria.",
        duracionMinutos: 960,
        precioDesde: 19200,
        precios: [
            {
                vehiculo: "Desde",
                precio: 19200
            }
        ],
        limpieza: [
            "Lavado Luxury"
        ],
        procesos: [
            "Descontaminación de pintura",
            "Pulido a un paso"
        ],
        opciones: [
            "Medio frente",
            "Full Front",
            "Full PPF"
        ],
        proteccion: [
            "Película de protección de pintura"
        ],
        activo: true,
        estado: "publicado",
        orden: 12
    },
    {
        id: "supreme-interior",
        slug: "supreme-interior",
        nombre: "Supreme Interior",
        categoria: "Interior",
        descripcion:
            "Limpieza profunda del habitáculo con atención especializada a superficies, asientos y alfombras.",
        duracionMinutos: 300,
        precioDesde: 1700,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 1700
            },
            {
                vehiculo: "Sedán",
                precio: 2200
            },
            {
                vehiculo: "SUV",
                precio: 2900
            },
            {
                vehiculo: "Pick-up",
                precio: 3200
            }
        ],
        limpieza: [
            "Lavado exterior",
            "Aspirado profundo",
            "Limpieza de cielo",
            "Desmontado de asientos",
            "Limpieza de alfombra por inyección y extracción",
            "Limpieza de tablero y rejillas",
            "Limpieza de consola y volante",
            "Limpieza de puertas y bisagras",
            "Limpieza de cajuela y llanta de refacción"
        ],
        proteccion: [
            "Sellador en piel o tela",
            "Protección de plásticos",
            "Hidratación de gomas"
        ],
        activo: true,
        estado: "publicado",
        orden: 13
    },
    {
        id: "ready-to-sell",
        slug: "ready-to-sell",
        nombre: "Ready to Sell",
        categoria: "Lavado",
        descripcion:
            "Preparación estética integral diseñada para mejorar la presentación del vehículo antes de venderlo.",
        duracionMinutos: 360,
        precioDesde: 2750,
        precios: [
            {
                vehiculo: "Hatchback",
                precio: 2750
            },
            {
                vehiculo: "Sedán",
                precio: 3000
            },
            {
                vehiculo: "SUV",
                precio: 3300
            },
            {
                vehiculo: "Pick-up",
                precio: 3500
            }
        ],
        limpieza: [
            "Lavado Luxury"
        ],
        procesos: [
            "Descontaminación de pintura",
            "Pulido básico",
            "Limpieza de motor"
        ],
        proteccion: [
            "Hidratación de plásticos",
            "Quick Detailer",
            "Hidratación de neumáticos",
            "Cera premium"
        ],
        activo: true,
        estado: "publicado",
        orden: 14
    }
];

let services = [];
let currentService = null;

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
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatCurrency(value) {
    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return String(value ?? "");
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

function getServiceRequest() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("servicio") ||
        params.get("id") ||
        ""
    ).trim();
}

function getServiceId(service) {
    return (
        service.slug ||
        service.id
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
        return "Por confirmar";
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

function getMinimumPrice(service) {
    const candidates = [
        service?.precioDesde,
        service?.precio,
        service?.precioMinimo
    ];

    for (
        const candidate of
        candidates
    ) {
        const amount =
            Number(candidate);

        if (
            Number.isFinite(amount) &&
            amount > 0
        ) {
            return amount;
        }
    }

    const prices =
        service?.precios;

    if (
        prices &&
        typeof prices === "object"
    ) {
        const collection =
            Array.isArray(prices)
                ? prices
                : Object.values(prices);

        const numbers = [];

        collection.forEach(
            (item) => {
                if (
                    typeof item ===
                    "number"
                ) {
                    numbers.push(item);
                    return;
                }

                if (
                    typeof item ===
                    "string"
                ) {
                    const match =
                        item
                            .replaceAll(
                                ",",
                                ""
                            )
                            .match(/\d+/);

                    if (match) {
                        numbers.push(
                            Number(
                                match[0]
                            )
                        );
                    }

                    return;
                }

                if (
                    item &&
                    typeof item ===
                    "object"
                ) {
                    const value =
                        item.precio ??
                        item.desde ??
                        item.min ??
                        item.valor;

                    if (
                        typeof value ===
                        "number"
                    ) {
                        numbers.push(
                            value
                        );

                        return;
                    }

                    const match =
                        String(
                            value ?? ""
                        )
                            .replaceAll(
                                ",",
                                ""
                            )
                            .match(/\d+/);

                    if (match) {
                        numbers.push(
                            Number(
                                match[0]
                            )
                        );
                    }
                }
            }
        );

        const valid =
            numbers.filter(
                (number) =>
                    Number.isFinite(
                        number
                    ) &&
                    number > 0
            );

        if (valid.length) {
            return Math.min(
                ...valid
            );
        }
    }

    return null;
}

function getServiceImage(service) {
    const possible = [
        service?.imagenPrincipal,
        service?.imagenPortada,
        service?.portada,
        service?.imagen,
        service?.cover
    ];

    for (
        const item of possible
    ) {
        if (
            typeof item ===
                "string" &&
            item.trim()
        ) {
            return item.trim();
        }

        if (
            item &&
            typeof item ===
                "object"
        ) {
            const url =
                item.url ||
                item.secure_url;

            if (url) {
                return url;
            }
        }
    }

    const images =
        getGalleryImages(
            service
        );

    return (
        images[0]?.url ||
        ""
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
            "imagenes/"
        ) ||
        text.startsWith(
            "./imagenes/"
        ) ||
        text.startsWith(
            "../imagenes/"
        )
    ) {
        return text;
    }

    try {
        const url =
            new URL(
                text,
                window.location.href
            );

        if (
            url.protocol ===
                "https:" ||
            url.protocol ===
                "http:"
        ) {
            return url.href;
        }

        return "";
    } catch {
        return "";
    }
}

function getGalleryImages(service) {
    const results = [];

    const collections = [
        service?.imagenes,
        service?.galeria,
        service?.multimedia,
        service?.resultados
    ];

    collections.forEach(
        (items) => {
            if (
                !Array.isArray(items)
            ) {
                return;
            }

            items.forEach(
                (item) => {
                    if (
                        typeof item ===
                        "string"
                    ) {
                        const url =
                            safeImageUrl(
                                item
                            );

                        if (url) {
                            results.push({
                                url,
                                texto: ""
                            });
                        }

                        return;
                    }

                    if (
                        !item ||
                        typeof item !==
                            "object"
                    ) {
                        return;
                    }

                    const type =
                        normalizeText(
                            item.tipo ||
                            item.type ||
                            "imagen"
                        );

                    if (
                        type.includes(
                            "video"
                        )
                    ) {
                        return;
                    }

                    const url =
                        safeImageUrl(
                            item.url ||
                            item.secure_url ||
                            item.src
                        );

                    if (!url) {
                        return;
                    }

                    results.push({
                        url,
                        texto:
                            item.titulo ||
                            item.descripcion ||
                            item.alt ||
                            ""
                    });
                }
            );
        }
    );

    return results.filter(
        (
            image,
            index,
            array
        ) =>
            array.findIndex(
                (item) =>
                    item.url ===
                    image.url
            ) === index
    );
}

function getArray(
    service,
    keys
) {
    for (
        const key of keys
    ) {
        const value =
            service?.[key];

        if (
            Array.isArray(value)
        ) {
            return value
                .map(
                    (item) => {
                        if (
                            typeof item ===
                            "string"
                        ) {
                            return item.trim();
                        }

                        if (
                            item &&
                            typeof item ===
                            "object"
                        ) {
                            return String(
                                item.nombre ||
                                item.texto ||
                                item.descripcion ||
                                item.label ||
                                ""
                            ).trim();
                        }

                        return "";
                    }
                )
                .filter(Boolean);
        }

        if (
            typeof value ===
                "string" &&
            value.trim()
        ) {
            return value
                .split(/\n|•/)
                .map(
                    (item) =>
                        item.trim()
                )
                .filter(Boolean);
        }
    }

    return [];
}

function canUseDevelopmentFallback() {
    const hostname =
        window.location.hostname
            .toLowerCase();

    return (
        hostname ===
            "localhost" ||
        hostname ===
            "127.0.0.1" ||
        hostname.endsWith(
            ".vercel.app"
        ) ||
        hostname === ""
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

async function loadPublicServices() {
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

        const loaded =
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
                        service.activo ===
                            true &&
                        normalizeText(
                            service.estado
                        ) ===
                            "publicado"
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

        if (loaded.length) {
            services =
                loaded;

            return;
        }

        if (
            canUseDevelopmentFallback()
        ) {
            services = [
                ...fallbackServices
            ];

            return;
        }

        services = [];
    } catch (error) {
        console.error(
            "No se pudieron cargar los servicios públicos:",
            error
        );

        if (
            error?.code ===
            "permission-denied"
        ) {
            services = [];
            return;
        }

        if (
            canUseDevelopmentFallback()
        ) {
            services = [
                ...fallbackServices
            ];

            return;
        }

        services = [];
    }
}

function findRequestedService() {
    const requested =
        normalizeText(
            getServiceRequest()
        );

    if (!requested) {
        return null;
    }

    return (
        services.find(
            (service) =>
                normalizeText(
                    service.id
                ) ===
                    requested ||
                normalizeText(
                    service.slug
                ) ===
                    requested
        ) ||
        null
    );
}

function renderHero(service) {
    const category =
        getServiceCategory(
            service
        );

    const description =
        getServiceDescription(
            service
        );

    const duration =
        getServiceDuration(
            service
        );

    const price =
        getMinimumPrice(
            service
        );

    const image =
        safeImageUrl(
            getServiceImage(
                service
            )
        );

    if (serviceCategory) {
        serviceCategory.textContent =
            category;
    }

    if (serviceTitle) {
        serviceTitle.textContent =
            service.nombre ||
            "Servicio PMC";
    }

    if (serviceDescription) {
        serviceDescription.textContent =
            description;
    }

    if (serviceDuration) {
        serviceDuration.textContent =
            formatDuration(
                duration
            );
    }

    if (
        serviceStartingPrice
    ) {
        serviceStartingPrice.textContent =
            price
                ? `Desde ${formatCurrency(
                    price
                )}`
                : "Cotizar";
    }

    if (serviceWarranty) {
        const warranty =
            service.garantia ||
            service.garantiaTexto ||
            "";

        if (warranty) {
            serviceWarranty.textContent =
                warranty;

            serviceWarranty
                .closest(
                    "[data-service-meta]"
                )
                ?.removeAttribute(
                    "hidden"
                );
        } else {
            serviceWarranty
                .closest(
                    "[data-service-meta]"
                )
                ?.setAttribute(
                    "hidden",
                    ""
                );
        }
    }

    if (
        serviceHeroImage &&
        image
    ) {
        serviceHeroImage.src =
            image;

        serviceHeroImage.alt =
            service.nombre ||
            "Servicio PMC";

        serviceHeroImage.hidden =
            false;

        if (
            serviceHeroPlaceholder
        ) {
            serviceHeroPlaceholder.hidden =
                true;
        }

        serviceHeroImage.onerror =
            () => {
                serviceHeroImage.hidden =
                    true;

                if (
                    serviceHeroPlaceholder
                ) {
                    serviceHeroPlaceholder.hidden =
                        false;
                }
            };
    } else {
        if (serviceHeroImage) {
            serviceHeroImage.hidden =
                true;
        }

        if (
            serviceHeroPlaceholder
        ) {
            serviceHeroPlaceholder.hidden =
                false;
        }
    }

    document.title =
        `${service.nombre || "Servicio"} | PMC Auto Detailing`;
}

function renderSimpleList(
    container,
    section,
    items
) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!items.length) {
        if (section) {
            section.hidden =
                true;
        }

        return;
    }

    if (section) {
        section.hidden =
            false;
    }

    container.innerHTML =
        items
            .map(
                (item) => `
                    <li>
                        <span>
                            <i data-lucide="check"></i>
                        </span>

                        <p>
                            ${escapeHTML(
                                item
                            )}
                        </p>
                    </li>
                `
            )
            .join("");
}

function renderServiceDetails(service) {
    const includes =
        getArray(
            service,
            [
                "incluye",
                "incluidos",
                "beneficios"
            ]
        );

    const cleaning =
        getArray(
            service,
            [
                "limpieza",
                "limpiezas",
                "externa",
                "interna"
            ]
        );

    const processes =
        getArray(
            service,
            [
                "procesos",
                "proceso",
                "procedimiento"
            ]
        );

    const protection =
        getArray(
            service,
            [
                "proteccion",
                "protecciones"
            ]
        );

    const options =
        getArray(
            service,
            [
                "opciones",
                "variantes",
                "paquetes"
            ]
        );

    renderSimpleList(
        serviceIncludes,
        serviceIncludes?.closest(
            "[data-service-section]"
        ),
        includes
    );

    renderSimpleList(
        serviceCleaning,
        serviceCleaningSection,
        cleaning
    );

    renderSimpleList(
        serviceProcesses,
        serviceProcessesSection,
        processes
    );

    renderSimpleList(
        serviceProtection,
        serviceProtectionSection,
        protection
    );

    renderSimpleList(
        serviceOptions,
        serviceOptionsSection,
        options
    );

    initIcons();
}

function normalizePrices(service) {
    const prices =
        service?.precios;

    if (!prices) {
        const price =
            getMinimumPrice(
                service
            );

        return price
            ? [
                {
                    nombre:
                        "Desde",
                    precio:
                        price
                }
            ]
            : [];
    }

    if (
        Array.isArray(prices)
    ) {
        return prices
            .map(
                (item) => {
                    if (
                        typeof item ===
                        "number"
                    ) {
                        return {
                            nombre:
                                "Servicio",
                            precio:
                                item
                        };
                    }

                    if (
                        typeof item ===
                        "string"
                    ) {
                        return {
                            nombre:
                                "Servicio",
                            precio:
                                item
                        };
                    }

                    if (
                        item &&
                        typeof item ===
                        "object"
                    ) {
                        return {
                            nombre:
                                item.vehiculo ||
                                item.tipo ||
                                item.nombre ||
                                item.label ||
                                "Servicio",
                            precio:
                                item.precio ??
                                item.valor ??
                                item.desde ??
                                item.rango ??
                                ""
                        };
                    }

                    return null;
                }
            )
            .filter(Boolean);
    }

    if (
        typeof prices ===
        "object"
    ) {
        return Object.entries(
            prices
        ).map(
            ([
                key,
                value
            ]) => {
                if (
                    value &&
                    typeof value ===
                    "object"
                ) {
                    const min =
                        value.desde ??
                        value.min ??
                        value.precio;

                    const max =
                        value.hasta ??
                        value.max;

                    return {
                        nombre:
                            value.nombre ||
                            key,
                        precio:
                            max &&
                            max !== min
                                ? `${min} - ${max}`
                                : min
                    };
                }

                return {
                    nombre:
                        key,
                    precio:
                        value
                };
            }
        );
    }

    return [];
}

function formatPriceValue(value) {
    if (
        typeof value ===
        "number"
    ) {
        return formatCurrency(
            value
        );
    }

    const text =
        String(value ?? "")
            .trim();

    if (!text) {
        return "Cotizar";
    }

    if (
        /^\d+$/.test(
            text.replaceAll(
                ",",
                ""
            )
        )
    ) {
        return formatCurrency(
            Number(
                text.replaceAll(
                    ",",
                    ""
                )
            )
        );
    }

    const range =
        text.match(
            /^\$?\s*([\d,]+)\s*-\s*\$?\s*([\d,]+)$/
        );

    if (range) {
        return (
            `${formatCurrency(
                Number(
                    range[1]
                        .replaceAll(
                            ",",
                            ""
                        )
                )
            )} - ` +
            `${formatCurrency(
                Number(
                    range[2]
                        .replaceAll(
                            ",",
                            ""
                        )
                )
            )}`
        );
    }

    return text.includes("$")
        ? text
        : `$${text}`;
}

function renderPrices(service) {
    if (!servicePrices) {
        return;
    }

    const prices =
        normalizePrices(
            service
        );

    if (!prices.length) {
        servicePrices.innerHTML = `
            <div class="service-price-row">

                <span>
                    Precio
                </span>

                <strong>
                    Cotizar
                </strong>

            </div>
        `;

        return;
    }

    servicePrices.innerHTML =
        prices
            .map(
                (price) => `
                    <div class="service-price-row">

                        <span>
                            ${escapeHTML(
                                String(
                                    price.nombre
                                )
                            )}
                        </span>

                        <strong>
                            ${escapeHTML(
                                formatPriceValue(
                                    price.precio
                                )
                            )}
                        </strong>

                    </div>
                `
            )
            .join("");
}

function renderGallery(service) {
    if (!serviceGallery) {
        return;
    }

    const images =
        getGalleryImages(
            service
        );

    serviceGallery.innerHTML =
        "";

    if (!images.length) {
        if (
            serviceGallerySection
        ) {
            serviceGallerySection.hidden =
                true;
        }

        return;
    }

    if (
        serviceGallerySection
    ) {
        serviceGallerySection.hidden =
            false;
    }

    serviceGallery.innerHTML =
        images
            .slice(
                0,
                8
            )
            .map(
                (image) => `
                    <figure class="service-gallery__item">

                        <img
                            src="${escapeHTML(
                                image.url
                            )}"
                            alt="${escapeHTML(
                                image.texto ||
                                service.nombre ||
                                "PMC Auto Detailing"
                            )}"
                            loading="lazy"
                        >

                        ${
                            image.texto
                                ? `
                                    <figcaption>
                                        ${escapeHTML(
                                            image.texto
                                        )}
                                    </figcaption>
                                  `
                                : ""
                        }

                    </figure>
                `
            )
            .join("");
}

function renderRelatedServices(service) {
    if (!relatedServices) {
        return;
    }

    const category =
        normalizeText(
            getServiceCategory(
                service
            )
        );

    let related =
        services.filter(
            (item) =>
                item.id !==
                    service.id &&
                normalizeText(
                    getServiceCategory(
                        item
                    )
                ) ===
                    category
        );

    if (
        related.length <
        3
    ) {
        const existing =
            new Set(
                related.map(
                    (item) =>
                        item.id
                )
            );

        const additional =
            services.filter(
                (item) =>
                    item.id !==
                        service.id &&
                    !existing.has(
                        item.id
                    )
            );

        related = [
            ...related,
            ...additional
        ];
    }

    related =
        related.slice(
            0,
            3
        );

    relatedServices.innerHTML =
        "";

    if (!related.length) {
        if (
            relatedServicesSection
        ) {
            relatedServicesSection.hidden =
                true;
        }

        return;
    }

    if (
        relatedServicesSection
    ) {
        relatedServicesSection.hidden =
            false;
    }

    relatedServices.innerHTML =
        related
            .map(
                (item) => {
                    const price =
                        getMinimumPrice(
                            item
                        );

                    const image =
                        safeImageUrl(
                            getServiceImage(
                                item
                            )
                        );

                    return `
                        <article class="related-service-card">

                            <a
                                href="servicio.html?servicio=${encodeURIComponent(
                                    getServiceId(
                                        item
                                    )
                                )}"
                            >

                                <div class="related-service-card__media">

                                    ${
                                        image
                                            ? `
                                                <img
                                                    src="${escapeHTML(
                                                        image
                                                    )}"
                                                    alt="${escapeHTML(
                                                        item.nombre ||
                                                        "Servicio PMC"
                                                    )}"
                                                    loading="lazy"
                                                >
                                              `
                                            : `
                                                <div class="related-service-card__placeholder">
                                                    <i data-lucide="sparkles"></i>
                                                </div>
                                              `
                                    }

                                    <span>
                                        ${escapeHTML(
                                            getServiceCategory(
                                                item
                                            )
                                        )}
                                    </span>

                                </div>

                                <div class="related-service-card__content">

                                    <h3>
                                        ${escapeHTML(
                                            item.nombre ||
                                            "Servicio PMC"
                                        )}
                                    </h3>

                                    <div>

                                        <span>
                                            ${
                                                price
                                                    ? `Desde ${escapeHTML(
                                                        formatCurrency(
                                                            price
                                                        )
                                                    )}`
                                                    : "Cotizar"
                                            }
                                        </span>

                                        <i data-lucide="arrow-up-right"></i>

                                    </div>

                                </div>

                            </a>

                        </article>
                    `;
                }
            )
            .join("");

    initIcons();
}

function updateServiceActions(service) {
    const serviceId =
        getServiceId(
            service
        );

    const agendaUrl =
        `agenda.html?servicio=${encodeURIComponent(
            serviceId
        )}`;

    bookingButtons.forEach(
        (button) => {
            if (
                button.tagName === "A"
            ) {
                button.href =
                    agendaUrl;
            } else {
                button.addEventListener(
                    "click",
                    () => {
                        window.location.href =
                            agendaUrl;
                    }
                );
            }
        }
    );

    const whatsappText =
        `Hola PMC Auto Detailing, me interesa el servicio "${service.nombre}". ¿Me pueden dar más información?`;

    const whatsappUrl =
        `https://wa.me/529542038099?text=${encodeURIComponent(
            whatsappText
        )}`;

    whatsappButtons.forEach(
        (button) => {
            if (
                button.tagName === "A"
            ) {
                button.href =
                    whatsappUrl;

                button.target =
                    "_blank";

                button.rel =
                    "noopener noreferrer";
            } else {
                button.addEventListener(
                    "click",
                    () => {
                        window.open(
                            whatsappUrl,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    }
                );
            }
        }
    );

    assistantButtons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    sessionStorage.setItem(
                        "pmcAssistantService",
                        JSON.stringify({
                            id:
                                serviceId,
                            nombre:
                                service.nombre,
                            categoria:
                                getServiceCategory(
                                    service
                                )
                        })
                    );

                    window.location.href =
                        "index.html#asistente";
                }
            );
        }
    );
}

function renderService(service) {
    currentService =
        service;

    if (serviceError) {
        serviceError.hidden =
            true;
    }

    if (serviceContent) {
        serviceContent.hidden =
            false;
    }

    renderHero(service);
    renderServiceDetails(service);
    renderPrices(service);
    renderGallery(service);
    renderRelatedServices(service);
    updateServiceActions(service);

    initIcons();
}

function renderNotFound() {
    currentService =
        null;

    document.title =
        "Servicio no disponible | PMC Auto Detailing";

    if (serviceContent) {
        serviceContent.hidden =
            true;
    }

    if (serviceError) {
        serviceError.hidden =
            false;

        initIcons();

        return;
    }

    if (serviceTitle) {
        serviceTitle.textContent =
            "Servicio no disponible";
    }

    if (serviceDescription) {
        serviceDescription.textContent =
            "Este servicio no se encuentra disponible en el catálogo público.";
    }

    if (serviceCategory) {
        serviceCategory.textContent =
            "PMC Auto Detailing";
    }

    bookingButtons.forEach(
        (button) => {
            button.setAttribute(
                "hidden",
                ""
            );
        }
    );

    whatsappButtons.forEach(
        (button) => {
            button.setAttribute(
                "hidden",
                ""
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
}

async function init() {
    initIcons();
    setCurrentYear();
    updateHeader();
    bindNavigation();

    const requested =
        getServiceRequest();

    if (!requested) {
        renderNotFound();
        return;
    }

    await loadPublicServices();

    const service =
        findRequestedService();

    if (!service) {
        renderNotFound();
        return;
    }

    renderService(
        service
    );
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