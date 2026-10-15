import {
    auth,
    db
} from "../firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    getDoc,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const importCatalogButton =
    document.getElementById("importCatalogButton");

const importCatalogModal =
    document.getElementById("importCatalogModal");

const importCatalogBackdrop =
    document.getElementById("importCatalogBackdrop");

const importCatalogClose =
    document.getElementById("importCatalogClose");

const cancelImportCatalog =
    document.getElementById("cancelImportCatalog");

const confirmImportCatalog =
    document.getElementById("confirmImportCatalog");

const adminToast =
    document.getElementById("adminToast");

let importing = false;
let toastTimer = null;

const catalogoInicial = [
    {
        id: "lavado-basico-chasis-componentes",
        nombre: "Lavado básico de chasis y componentes",
        categoria: "Motor y chasis",
        categoriaSlug: "motor-chasis",
        descripcionCorta: "Limpieza general del vehículo con atención especial al motor, chasis y componentes inferiores.",
        descripcion: "Servicio de lavado que combina limpieza exterior e interior con desengrase y lavado básico de motor y chasis.",
        precioDesde: 650,
        garantia: "",
        orden: 1,
        precios: {
            hatchback: {
                desde: 650,
                hasta: 650
            },
            sedan: {
                desde: 650,
                hasta: 650
            },
            suv: {
                desde: 750,
                hasta: 750
            },
            pickup: {
                desde: 850,
                hasta: 1000
            }
        },
        incluye: [
            "Lavado de carrocería",
            "Limpieza de plásticos",
            "Aspirado interior",
            "Desengrase de motor y chasis",
            "Lavado básico de motor y chasis",
            "Lubricación"
        ],
        limpieza: [
            "Carrocería",
            "Motor",
            "Chasis",
            "Componentes inferiores"
        ],
        procesos: [
            "Desengrase",
            "Lavado",
            "Lubricación"
        ],
        proteccion: [],
        opciones: [
            "Solo chasis Hatchback o Sedán: $400",
            "Solo chasis SUV: $450",
            "Solo chasis Pick-up o camioneta grande: $600"
        ]
    },
    {
        id: "lavado-basico-exterior-interior",
        nombre: "Lavado básico exterior e interior",
        categoria: "Lavado",
        categoriaSlug: "lavado",
        descripcionCorta: "Lavado exterior e interior con limpieza de rines, aspirado, cristales y acondicionamiento general.",
        descripcion: "Servicio de mantenimiento para conservar el vehículo limpio por dentro y por fuera con acabado de brillo rápido.",
        precioDesde: 180,
        garantia: "",
        orden: 2,
        precios: {
            hatchback: {
                desde: 180,
                hasta: 180
            },
            sedan: {
                desde: 200,
                hasta: 200
            },
            suv: {
                desde: 200,
                hasta: 300
            },
            pickup: {
                desde: 200,
                hasta: 300
            }
        },
        incluye: [
            "Limpieza de rines y tolvas",
            "Lavado de carrocería con shampoo",
            "Aspirado interior",
            "Limpieza de cristales",
            "Limpieza de plásticos interiores",
            "Quick Detailer",
            "Brillo de llantas"
        ],
        limpieza: [
            "Rines",
            "Tolvas",
            "Carrocería",
            "Interior",
            "Cristales"
        ],
        procesos: [],
        proteccion: [
            "Quick Detailer",
            "Brillo para llantas"
        ],
        opciones: [
            "El precio puede variar según el nivel de suciedad y tamaño del vehículo"
        ]
    },
    {
        id: "detallado-motor-vapor",
        nombre: "Detallado de motor a base de vapor",
        categoria: "Motor y chasis",
        categoriaSlug: "motor-chasis",
        descripcionCorta: "Limpieza detallada de motor con vapor y protección de componentes eléctricos y plásticos.",
        descripcion: "Proceso especializado para limpiar y detallar el compartimiento del motor mediante vapor y productos adecuados para sus componentes.",
        precioDesde: 500,
        garantia: "",
        orden: 3,
        precios: {
            hatchback: {
                desde: 500,
                hasta: 600
            },
            sedan: {
                desde: 500,
                hasta: 600
            },
            suv: {
                desde: 700,
                hasta: 800
            },
            pickup: {
                desde: 700,
                hasta: 800
            }
        },
        incluye: [
            "Limpieza y desengrase",
            "Limpieza de cofre y bisagras",
            "Limpieza de componentes",
            "Limpieza de plásticos y mangueras"
        ],
        limpieza: [
            "Compartimiento de motor",
            "Cofre",
            "Bisagras",
            "Plásticos",
            "Mangueras"
        ],
        procesos: [
            "Aplicación de vapor",
            "Desengrase"
        ],
        proteccion: [
            "Protección de componentes eléctricos",
            "Hidratación de plásticos",
            "Acabado en componentes metálicos"
        ],
        opciones: []
    },
    {
        id: "limpieza-motor-agua",
        nombre: "Limpieza de motor a base de agua",
        categoria: "Motor y chasis",
        categoriaSlug: "motor-chasis",
        descripcionCorta: "Limpieza del compartimiento del motor a base de agua con protección de componentes delicados.",
        descripcion: "Servicio especializado para eliminar suciedad y grasa del compartimiento del motor utilizando agua y protección previa de zonas delicadas.",
        precioDesde: 500,
        garantia: "",
        orden: 4,
        precios: {
            hatchback: {
                desde: 500,
                hasta: 600
            },
            sedan: {
                desde: 500,
                hasta: 600
            },
            suv: {
                desde: 700,
                hasta: 800
            },
            pickup: {
                desde: 700,
                hasta: 800
            }
        },
        incluye: [
            "Protección de componentes delicados",
            "Limpieza y desengrase",
            "Lavado con agua",
            "Limpieza de plásticos y mangueras"
        ],
        limpieza: [
            "Compartimiento de motor",
            "Plásticos",
            "Mangueras"
        ],
        procesos: [
            "Protección previa",
            "Desengrase",
            "Lavado a base de agua"
        ],
        proteccion: [
            "Acabado y brillo de componentes"
        ],
        opciones: []
    },
    {
        id: "pulido-basico",
        nombre: "Pulido básico",
        categoria: "Pintura",
        categoriaSlug: "pintura",
        descripcionCorta: "Descontaminación y pulido de pintura para recuperar brillo y mejorar el acabado exterior.",
        descripcion: "Proceso de corrección básica que combina lavado, descontaminación y pulido para mejorar notablemente el aspecto de la pintura.",
        precioDesde: 2200,
        garantia: "",
        orden: 5,
        precios: {
            hatchback: {
                desde: 2200,
                hasta: 2500
            },
            sedan: {
                desde: 2200,
                hasta: 2500
            },
            suv: {
                desde: 3000,
                hasta: 3400
            },
            pickup: {
                desde: 3000,
                hasta: 3400
            }
        },
        incluye: [
            "Lavado del vehículo",
            "Descontaminación química",
            "Descontaminación mecánica",
            "Enmascarado",
            "Corrección del barniz",
            "Abrillantado"
        ],
        limpieza: [
            "Lavado exterior",
            "Descontaminación de pintura"
        ],
        procesos: [
            "Descontaminación química",
            "Descontaminación mecánica",
            "Pulido",
            "Abrillantado"
        ],
        proteccion: [
            "Cera premium con duración de hasta 6 meses",
            "Hidratación de llantas"
        ],
        opciones: [
            "Los procesos de lijado se cotizan según las condiciones de la pintura"
        ]
    },
    {
        id: "correccion-basica-pintura",
        nombre: "Corrección básica de pintura",
        categoria: "Pintura",
        categoriaSlug: "pintura",
        descripcionCorta: "Corrección de pintura de hasta aproximadamente 80% con descontaminación y protección final.",
        descripcion: "Servicio enfocado en mejorar defectos visibles de la pintura mediante preparación, corrección y protección del acabado.",
        precioDesde: 3500,
        garantia: "",
        orden: 6,
        precios: {
            hatchback: {
                desde: 3500,
                hasta: 4000
            },
            sedan: {
                desde: 3500,
                hasta: 4000
            },
            suv: {
                desde: 5000,
                hasta: 5500
            }
        },
        incluye: [
            "Lavado Luxury",
            "Descontaminación de pintura",
            "Enmascarado",
            "Corrección de pintura",
            "Descontaminación de vidrios",
            "Sellado final"
        ],
        limpieza: [
            "Lavado exterior",
            "Descontaminación de pintura",
            "Descontaminación de vidrios"
        ],
        procesos: [
            "Enmascarado",
            "Corrección de pintura de hasta aproximadamente 80%",
            "Abrillantado"
        ],
        proteccion: [
            "Sellador o cera premium",
            "Acondicionamiento de plásticos",
            "Acondicionamiento de llantas"
        ],
        opciones: [
            "Los procesos de lijado se cotizan según las condiciones de la pintura"
        ]
    },
    {
        id: "pulido-faros",
        nombre: "Pulido de faros",
        categoria: "Protección",
        categoriaSlug: "proteccion",
        descripcionCorta: "Restauración estética de faros con corrección, pulido y protección cerámica.",
        descripcion: "Proceso de recuperación de claridad en faros mediante nivelación, pulido y protección final.",
        precioDesde: 900,
        garantia: "1 año",
        orden: 7,
        precios: {
            otro: {
                desde: 900,
                hasta: 900
            }
        },
        incluye: [
            "Lavado",
            "Enmascarado",
            "Corrección y nivelación",
            "Pulido",
            "Protección cerámica"
        ],
        limpieza: [
            "Limpieza de faros"
        ],
        procesos: [
            "Enmascarado",
            "Nivelación",
            "Lijado cuando sea necesario",
            "Pulido"
        ],
        proteccion: [
            "Recubrimiento cerámico premium"
        ],
        opciones: []
    },
    {
        id: "pulido-vidrios",
        nombre: "Pulido de vidrios",
        categoria: "Protección",
        categoriaSlug: "proteccion",
        descripcionCorta: "Descontaminación y pulido de vidrios para remover lluvia ácida y mejorar su acabado.",
        descripcion: "Servicio de restauración de cristales mediante descontaminación, corrección y protección cerámica.",
        precioDesde: 600,
        garantia: "1 año",
        orden: 8,
        precios: {
            hatchback: {
                desde: 600,
                hasta: 600
            },
            sedan: {
                desde: 800,
                hasta: 800
            },
            pickup: {
                desde: 1200,
                hasta: 1200
            }
        },
        incluye: [
            "Lavado",
            "Descontaminación mecánica de vidrios",
            "Descontaminación química",
            "Remoción de lluvia ácida",
            "Corrección y nivelación",
            "Protección cerámica"
        ],
        limpieza: [
            "Cristales"
        ],
        procesos: [
            "Descontaminación mecánica",
            "Descontaminación química",
            "Corrección",
            "Pulido"
        ],
        proteccion: [
            "Recubrimiento cerámico para vidrio"
        ],
        opciones: []
    },
    {
        id: "ceramic-silver",
        nombre: "Ceramic Silver",
        categoria: "Cerámicos",
        categoriaSlug: "ceramicos",
        descripcionCorta: "Paquete cerámico de 1 año con corrección de pintura, motor, rines, interior y protección integral.",
        descripcion: "Tratamiento integral que combina preparación profunda, corrección de pintura y recubrimientos protectores para diferentes superficies.",
        precioDesde: 6500,
        garantia: "1 año",
        orden: 9,
        precios: {
            hatchback: {
                desde: 6500,
                hasta: 6500
            },
            sedan: {
                desde: 7000,
                hasta: 7000
            },
            suv: {
                desde: 8800,
                hasta: 8800
            },
            pickup: {
                desde: 10000,
                hasta: 10000
            }
        },
        incluye: [
            "Lavado Luxury",
            "Detallado de motor a vapor",
            "Desmontaje y limpieza de rines",
            "Limpieza de emblemas y contornos",
            "Descontaminación química y mecánica de pintura",
            "Corrección de pintura de hasta aproximadamente 80%",
            "Abrillantado"
        ],
        limpieza: [
            "Carrocería",
            "Motor",
            "Rines",
            "Emblemas",
            "Contornos"
        ],
        procesos: [
            "Descontaminación química",
            "Descontaminación mecánica",
            "Corrección de pintura",
            "Abrillantado"
        ],
        proteccion: [
            "Cerámico de 1 año en carrocería",
            "Cerámico en piel o tela",
            "Cerámico en plásticos rígidos",
            "Sellador en rines",
            "Sellador en vidrios"
        ],
        opciones: []
    },
    {
        id: "ceramic-gold",
        nombre: "Ceramic Gold",
        categoria: "Cerámicos",
        categoriaSlug: "ceramicos",
        descripcionCorta: "Protección cerámica de 3 años con corrección avanzada y tratamiento de múltiples superficies.",
        descripcion: "Paquete de detallado y protección de alto nivel con preparación integral y recubrimiento cerámico de mayor duración.",
        precioDesde: 7500,
        garantia: "3 años",
        orden: 10,
        precios: {
            hatchback: {
                desde: 7500,
                hasta: 7500
            },
            sedan: {
                desde: 8000,
                hasta: 8000
            },
            suv: {
                desde: 10000,
                hasta: 10000
            },
            pickup: {
                desde: 11200,
                hasta: 11200
            }
        },
        incluye: [
            "Lavado Luxury",
            "Detallado de motor a vapor",
            "Desmontaje y limpieza de rines",
            "Limpieza de emblemas y contornos",
            "Corrección de pintura de hasta aproximadamente 90%",
            "Abrillantado"
        ],
        limpieza: [
            "Carrocería",
            "Motor",
            "Rines",
            "Emblemas",
            "Contornos"
        ],
        procesos: [
            "Preparación de superficies",
            "Corrección de pintura",
            "Abrillantado"
        ],
        proteccion: [
            "Cerámico de 3 años en carrocería",
            "Cerámico en rines",
            "Cerámico en calipers",
            "Cerámico en plásticos rígidos",
            "Cerámico en vidrios",
            "Sellador en piel o tela"
        ],
        opciones: []
    },
    {
        id: "ceramic-diamond",
        nombre: "Ceramic Diamond",
        categoria: "Cerámicos",
        categoriaSlug: "ceramicos",
        descripcionCorta: "Paquete premium con protección cerámica de 5 años y corrección de pintura de alto nivel.",
        descripcion: "El tratamiento cerámico más completo del catálogo, pensado para ofrecer corrección, acabado y protección de larga duración.",
        precioDesde: 13500,
        garantia: "5 años",
        orden: 11,
        precios: {
            hatchback: {
                desde: 13500,
                hasta: 13500
            },
            sedan: {
                desde: 15500,
                hasta: 15500
            },
            suv: {
                desde: 20200,
                hasta: 20200
            },
            pickup: {
                desde: 22000,
                hasta: 22000
            }
        },
        incluye: [
            "Lavado Luxury",
            "Detallado de motor a vapor",
            "Desmontaje y limpieza de rines",
            "Limpieza de emblemas y contornos",
            "Corrección de pintura de hasta aproximadamente 95%"
        ],
        limpieza: [
            "Carrocería",
            "Motor",
            "Rines",
            "Emblemas",
            "Contornos"
        ],
        procesos: [
            "Preparación profunda",
            "Corrección de pintura",
            "Acabado premium"
        ],
        proteccion: [
            "Cerámico de 5 años en carrocería",
            "Cerámico en rines",
            "Cerámico en calipers",
            "Cerámico en plásticos",
            "Cerámico en vidrios",
            "Cerámico en piel o tela",
            "Cerámico en llantas"
        ],
        opciones: []
    },
    {
        id: "aplicacion-ppf",
        nombre: "Aplicación de PPF",
        categoria: "PPF",
        categoriaSlug: "ppf",
        descripcionCorta: "Protección de pintura mediante película PPF con opciones parciales o cobertura completa.",
        descripcion: "Servicio de protección física para la pintura con preparación previa de la superficie y diferentes niveles de cobertura.",
        precioDesde: 19200,
        garantia: "",
        orden: 12,
        precios: {
            otro: {
                desde: 19200,
                hasta: 19200
            }
        },
        incluye: [
            "Lavado Luxury",
            "Descontaminación de pintura",
            "Pulido de un paso",
            "Preparación para instalación"
        ],
        limpieza: [
            "Carrocería",
            "Superficie de pintura"
        ],
        procesos: [
            "Descontaminación",
            "Pulido de un paso",
            "Instalación de película PPF"
        ],
        proteccion: [
            "Película de protección de pintura"
        ],
        opciones: [
            "Medio Frente: cofre, fascia y faros",
            "Full Front: cofre, fascia, faros, salpicaderas y espejos",
            "Full PPF: carrocería completa"
        ]
    },
    {
        id: "supreme-interior",
        nombre: "Supreme Interior",
        categoria: "Interior",
        categoriaSlug: "interior",
        descripcionCorta: "Detallado profundo del interior con desmontaje, extracción, limpieza y protección de superficies.",
        descripcion: "Servicio integral para recuperar limpieza, presentación y protección del habitáculo del vehículo.",
        precioDesde: 1700,
        garantia: "",
        orden: 13,
        precios: {
            hatchback: {
                desde: 1700,
                hasta: 1700
            },
            sedan: {
                desde: 2200,
                hasta: 2200
            },
            suv: {
                desde: 2900,
                hasta: 2900
            },
            pickup: {
                desde: 3200,
                hasta: 3200
            }
        },
        incluye: [
            "Lavado exterior",
            "Aspirado profundo",
            "Limpieza de cielo",
            "Desmontaje de asientos",
            "Inyección y extracción de alfombra",
            "Limpieza de tablero",
            "Limpieza de rejillas",
            "Limpieza de consola",
            "Limpieza de puertas",
            "Limpieza de cajuela"
        ],
        limpieza: [
            "Cielo",
            "Asientos",
            "Alfombra",
            "Tablero",
            "Rejillas",
            "Consola",
            "Volante",
            "Puertas",
            "Bisagras",
            "Gomas",
            "Cajuela",
            "Llanta de refacción"
        ],
        procesos: [
            "Aspirado profundo",
            "Inyección y extracción"
        ],
        proteccion: [
            "Sellador para piel o tela",
            "Sellador para plásticos",
            "Hidratación de gomas"
        ],
        opciones: []
    },
    {
        id: "ready-to-sell",
        nombre: "Ready To Sell",
        categoria: "Pintura",
        categoriaSlug: "pintura",
        descripcionCorta: "Preparación estética completa pensada para mejorar la presentación del vehículo antes de venderlo.",
        descripcion: "Paquete que combina limpieza, descontaminación, pulido y acondicionamiento general para mejorar la apariencia del vehículo.",
        precioDesde: 2750,
        garantia: "",
        orden: 14,
        precios: {
            hatchback: {
                desde: 2750,
                hasta: 2750
            },
            sedan: {
                desde: 3000,
                hasta: 3000
            },
            suv: {
                desde: 3300,
                hasta: 3300
            },
            pickup: {
                desde: 3500,
                hasta: 3500
            }
        },
        incluye: [
            "Lavado Luxury",
            "Descontaminación de pintura",
            "Pulido básico",
            "Limpieza de motor",
            "Hidratación de plásticos",
            "Quick Detailer",
            "Hidratación de llantas",
            "Cera premium"
        ],
        limpieza: [
            "Carrocería",
            "Motor",
            "Plásticos"
        ],
        procesos: [
            "Descontaminación",
            "Pulido básico"
        ],
        proteccion: [
            "Quick Detailer",
            "Cera premium",
            "Hidratación de plásticos",
            "Hidratación de llantas"
        ],
        opciones: []
    }
];

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

function showToast(message, type = "success") {
    if (!adminToast) {
        return;
    }

    if (toastTimer) {
        window.clearTimeout(toastTimer);
    }

    adminToast.hidden = false;
    adminToast.classList.remove("is-error");

    if (type === "error") {
        adminToast.classList.add("is-error");
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

    adminToast.classList.add("is-visible");

    initIcons();

    toastTimer =
        window.setTimeout(
            () => {
                adminToast.classList.remove("is-visible");

                window.setTimeout(
                    () => {
                        adminToast.hidden = true;
                    },
                    220
                );
            },
            3500
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
                        resolve(user || null);
                    },
                    () => {
                        unsubscribe();
                        resolve(null);
                    }
                );
        }
    );
}

async function validateAdmin(user) {
    if (!user) {
        return false;
    }

    try {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "usuarios",
                    user.uid
                )
            );

        if (!snapshot.exists()) {
            return false;
        }

        const data =
            snapshot.data();

        const permissions =
            data.permisos &&
            typeof data.permisos === "object"
                ? data.permisos
                : {};

        return (
            data.activo !== false &&
            (
                data.rol === "admin" ||
                permissions.admin === true
            )
        );
    } catch (error) {
        console.error(
            "No se pudo validar el administrador:",
            error
        );

        return false;
    }
}

function openImportModal() {
    if (!importCatalogModal) {
        return;
    }

    importCatalogModal.classList.add("is-open");

    importCatalogModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );
}

function closeImportModal() {
    if (
        importing ||
        !importCatalogModal
    ) {
        return;
    }

    importCatalogModal.classList.remove(
        "is-open"
    );

    importCatalogModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "admin-modal-open"
    );
}

function buildServiceDocument(
    service,
    userId
) {
    return {
        nombre: service.nombre,
        slug: service.id,
        categoria: service.categoria,
        categoriaSlug: service.categoriaSlug,
        descripcionCorta: service.descripcionCorta,
        descripcion: service.descripcion,
        duracionMinutos: null,
        orden: service.orden,
        garantia: service.garantia,
        precioDesde: service.precioDesde,
        precios: service.precios,
        incluye: service.incluye,
        limpieza: service.limpieza,
        procesos: service.procesos,
        proteccion: service.proteccion,
        opciones: service.opciones,
        imagenPrincipal: "",
        imagenes: [],
        destacado: false,
        activo: true,
        estado: "borrador",
        requiereRevision: true,
        origen: "catalogo-inicial-pmc",
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
        creadoPor: userId,
        actualizadoPor: userId
    };
}

function setImportingState(state) {
    importing = state;

    if (!confirmImportCatalog) {
        return;
    }

    confirmImportCatalog.disabled =
        state;

    if (state) {
        confirmImportCatalog.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Cargando...
        `;
    } else {
        confirmImportCatalog.innerHTML = `
            <i data-lucide="database-zap"></i>
            Cargar catálogo
        `;
    }

    initIcons();
}

async function importCatalog() {
    if (importing) {
        return;
    }

    setImportingState(true);

    try {
        const user =
            await getCurrentUser();

        const allowed =
            await validateAdmin(user);

        if (
            !allowed ||
            !user
        ) {
            throw new Error(
                "NO_ADMIN"
            );
        }

        const missingServices = [];

        for (
            const service of
            catalogoInicial
        ) {
            const reference =
                doc(
                    db,
                    "servicios",
                    service.id
                );

            const snapshot =
                await getDoc(
                    reference
                );

            if (!snapshot.exists()) {
                missingServices.push(
                    service
                );
            }
        }

        if (
            !missingServices.length
        ) {
            setImportingState(false);
            closeImportModal();

            showToast(
                "Los servicios base ya existen."
            );

            return;
        }

        const batch =
            writeBatch(db);

        missingServices.forEach(
            (service) => {
                const reference =
                    doc(
                        db,
                        "servicios",
                        service.id
                    );

                batch.set(
                    reference,
                    buildServiceDocument(
                        service,
                        user.uid
                    )
                );
            }
        );

        await batch.commit();

        importing = false;

        importCatalogModal
            ?.classList.remove(
                "is-open"
            );

        importCatalogModal
            ?.setAttribute(
                "aria-hidden",
                "true"
            );

        document.body.classList.remove(
            "admin-modal-open"
        );

        showToast(
            missingServices.length === 1
                ? "Se cargó 1 servicio base."
                : `Se cargaron ${missingServices.length} servicios base.`
        );

        window.setTimeout(
            () => {
                window.location.reload();
            },
            1200
        );
    } catch (error) {
        console.error(
            "No se pudo importar el catálogo:",
            error
        );

        setImportingState(false);

        if (
            error.message ===
            "NO_ADMIN"
        ) {
            showToast(
                "No tienes permisos para importar el catálogo.",
                "error"
            );
        } else {
            showToast(
                "No se pudo cargar el catálogo inicial.",
                "error"
            );
        }
    }
}

function bindEvents() {
    importCatalogButton
        ?.addEventListener(
            "click",
            openImportModal
        );

    importCatalogBackdrop
        ?.addEventListener(
            "click",
            closeImportModal
        );

    importCatalogClose
        ?.addEventListener(
            "click",
            closeImportModal
        );

    cancelImportCatalog
        ?.addEventListener(
            "click",
            closeImportModal
        );

    confirmImportCatalog
        ?.addEventListener(
            "click",
            importCatalog
        );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                importCatalogModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeImportModal();
            }
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        bindEvents();
        initIcons();
    }
);