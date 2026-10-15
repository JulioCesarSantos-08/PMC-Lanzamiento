import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pmcAssistant =
    document.getElementById(
        "pmcAssistant"
    );

const pmcAssistantBackdrop =
    document.getElementById(
        "pmcAssistantBackdrop"
    );

const pmcAssistantClose =
    document.getElementById(
        "pmcAssistantClose"
    );

const pmcAssistantMessages =
    document.getElementById(
        "pmcAssistantMessages"
    );

const pmcAssistantQuickActions =
    document.getElementById(
        "pmcAssistantQuickActions"
    );

const pmcAssistantForm =
    document.getElementById(
        "pmcAssistantForm"
    );

const pmcAssistantInput =
    document.getElementById(
        "pmcAssistantInput"
    );

const pmcAssistantSend =
    document.getElementById(
        "pmcAssistantSend"
    );

const openAssistant =
    document.getElementById(
        "openAssistant"
    );

const floatingAssistant =
    document.getElementById(
        "floatingAssistant"
    );

const knowledgeFiles = {
    principal:
        "datos/decua.json",
    vehiculos:
        "datos/decua-vehiculos.json",
    conocimiento:
        "datos/decua-conocimiento.json",
    negocio:
        "datos/decua-negocio.json",
    ventas:
        "datos/decua-ventas.json",
    faq:
        "datos/decua-faq.json",
    lenguaje:
        "datos/decua-lenguaje.json",
    seguridad:
        "datos/decua-seguridad.json"
};

const knowledge = {
    principal: null,
    vehiculos: null,
    conocimiento: null,
    negocio: null,
    ventas: null,
    faq: null,
    lenguaje: null,
    seguridad: null
};

const userContext = {
    uid: "",
    name: "Usuario PMC",
    email: "",
    loggedIn: false
};

const assistantState = {
    vehicleText: "",
    vehicleType: "",
    year: "",
    brand: "",
    model: "",
    age: null,
    condition: "",
    objective: "",
    usage: "",
    parking: "",
    budget: "",
    paintIssue: "",
    scratchDepth: "",
    protectionGoal: "",
    lastIntent: "",
    lastRecommendations: [],
    lastServiceNames: [],
    lastUserMessage: "",
    currentTopic: "",
    pendingQuestion: null,
    history: [],
    repeatedMessages: {},
    objectionCount: 0,
    humanHandoffOffered: false
};

let services = [];
let catalogLoaded = false;
let catalogLoading = false;
let knowledgeLoaded = false;
let knowledgeLoading = false;
let userProfileLoaded = false;
let conversationStarted = false;
let typingElement = null;

const fallback = {
    mensajes: {
        malUso:
            "Estás haciendo un uso inadecuado del chat. Decua está diseñado para ayudarte con temas relacionados con PMC Auto Detailing. Por favor, verifica tu pregunta.",
        fueraDeTema:
            "Esa pregunta no parece estar relacionada con PMC Auto Detailing. Puedo ayudarte con servicios, precios, vehículos, citas, ubicación y cuidado automotriz.",
        sinEntender:
            "No estoy seguro de haber entendido tu pregunta. Cuéntame qué vehículo tienes y qué quieres mejorar.",
        sinCatalogo:
            "Por el momento no tengo servicios públicos disponibles para recomendarte.",
        sinPrecio:
            "Ese servicio no tiene un precio oficial publicado en este momento.",
        despedida:
            "Gracias por hablar con Decua. Cuando necesites cuidar tu vehículo, aquí estaré. 👋",
        error:
            "Tuve un problema al consultar la información de PMC. Intenta nuevamente."
    },
    negocio: {
        nombre:
            "PMC Auto Detailing",
        propietario:
            "Pedro Manuel Cruz",
        ubicacion:
            "Río Grande, Oaxaca",
        telefono:
            "+52 954 203 8099",
        whatsapp:
            "https://wa.me/529542038099",
        correo:
            "PMC.Auto.Detailing@outlook.com",
        maps:
            "https://maps.app.goo.gl/3gQFe95HU2uQ6BZU6"
    }
};

function initIcons() {
    if (
        window.lucide
    ) {
        window.lucide
            .createIcons();
    }
}

function normalizeText(
    value
) {
    return String(
        value ??
        ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9ñ\s-]/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

function escapeHTML(
    value
) {
    return String(
        value ??
        ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function escapeAttribute(
    value
) {
    return escapeHTML(
        value
    );
}

function isPlainObject(
    value
) {
    return Boolean(
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
    );
}

function getNested(
    object,
    path,
    fallbackValue = null
) {
    const parts =
        String(
            path
        ).split(
            "."
        );

    let current =
        object;

    for (
        const part
        of parts
    ) {
        if (
            current ===
                null ||
            current ===
                undefined
        ) {
            return fallbackValue;
        }

        current =
            current[
                part
            ];
    }

    return (
        current ??
        fallbackValue
    );
}

async function fetchJSON(
    url
) {
    try {
        const response =
            await fetch(
                url,
                {
                    cache:
                        "no-store"
                }
            );

        if (
            !response.ok
        ) {
            throw new Error(
                `HTTP_${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        console.warn(
            `No se pudo cargar ${url}`,
            error
        );

        return null;
    }
}

async function loadKnowledge() {
    if (
        knowledgeLoaded ||
        knowledgeLoading
    ) {
        return knowledge;
    }

    knowledgeLoading =
        true;

    try {
        const entries =
            Object.entries(
                knowledgeFiles
            );

        const results =
            await Promise.all(
                entries.map(
                    async (
                        [
                            key,
                            url
                        ]
                    ) => ({
                        key,
                        data:
                            await fetchJSON(
                                url
                            )
                    })
                )
            );

        results.forEach(
            ({
                key,
                data
            }) => {
                knowledge[
                    key
                ] =
                    data;
            }
        );

        knowledgeLoaded =
            true;
    } finally {
        knowledgeLoading =
            false;
    }

    return knowledge;
}

function getPrincipal() {
    return (
        knowledge.principal ||
        {}
    );
}

function getVehicles() {
    return (
        knowledge.vehiculos ||
        {}
    );
}

function getBusiness() {
    return (
        knowledge.negocio ||
        {}
    );
}

function getLanguage() {
    return (
        knowledge.lenguaje ||
        {}
    );
}

function getSecurity() {
    return (
        knowledge.seguridad ||
        {}
    );
}

function getMessage(
    key
) {
    return (
        getPrincipal()
            ?.mensajes
            ?.[key] ||
        getSecurity()
            ?.respuestasSeguras
            ?.[key] ||
        fallback
            .mensajes[
                key
            ] ||
        ""
    );
}

function getBusinessData() {
    const data =
        getBusiness();

    return {
        nombre:
            getNested(
                data,
                "identidadNegocio.nombre",
                fallback.negocio.nombre
            ),
        propietario:
            getNested(
                data,
                "identidadNegocio.propietario.nombreCompleto",
                fallback.negocio.propietario
            ),
        ubicacion:
            getNested(
                data,
                "ubicacion.ubicacionTexto",
                fallback.negocio.ubicacion
            ),
        telefono:
            getNested(
                data,
                "contacto.telefonoInternacional",
                fallback.negocio.telefono
            ),
        whatsapp:
            getNested(
                data,
                "contacto.whatsapp",
                fallback.negocio.whatsapp
            ),
        correo:
            getNested(
                data,
                "contacto.correo",
                fallback.negocio.correo
            ),
        maps:
            getNested(
                data,
                "ubicacion.googleMaps",
                fallback.negocio.maps
            )
    };
}

function getCurrentUserOnce() {
    return new Promise(
        (
            resolve
        ) => {
            let unsubscribe =
                () => {};

            unsubscribe =
                onAuthStateChanged(
                    auth,
                    (
                        user
                    ) => {
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

async function loadUserProfile() {
    if (
        userProfileLoaded
    ) {
        return userContext;
    }

    userProfileLoaded =
        true;

    try {
        const user =
            await getCurrentUserOnce();

        if (
            !user
        ) {
            return userContext;
        }

        userContext.uid =
            user.uid;

        userContext.email =
            user.email ||
            "";

        userContext.loggedIn =
            true;

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "usuarios",
                    user.uid
                )
            );

        if (
            snapshot.exists()
        ) {
            const data =
                snapshot.data();

            const name =
                String(
                    data?.nombre ||
                    data?.displayName ||
                    ""
                ).trim();

            if (
                name
            ) {
                userContext.name =
                    name;

                return userContext;
            }
        }

        if (
            user.displayName
        ) {
            userContext.name =
                user.displayName;
        }
    } catch (error) {
        console.error(
            "No se pudo cargar el perfil:",
            error
        );
    }

    return userContext;
}

function getServiceName(
    service
) {
    return (
        service?.nombre ||
        service?.titulo ||
        service?.name ||
        "Servicio PMC"
    );
}

function getServiceDescription(
    service
) {
    return (
        service?.descripcionCorta ||
        service?.descripcion ||
        service?.resumen ||
        ""
    );
}

function getServiceCategory(
    service
) {
    return normalizeText(
        service?.categoria ||
        service?.category ||
        service?.tipo ||
        ""
    );
}

function isServicePublic(
    service
) {
    const status =
        normalizeText(
            service?.estado ||
            service?.status ||
            ""
        );

    if (
        service?.activo ===
            false ||
        service?.publicado ===
            false
    ) {
        return false;
    }

    if (
        [
            "borrador",
            "draft",
            "inactivo",
            "inactive",
            "archivado",
            "archived",
            "pendiente"
        ].includes(
            status
        )
    ) {
        return false;
    }

    if (
        service?.publicado ===
        true
    ) {
        return true;
    }

    return [
        "publicado",
        "published",
        "activo",
        "active"
    ].includes(
        status
    );
}

function parsePriceValue(
    value
) {
    if (
        typeof value ===
        "number"
    ) {
        return Number.isFinite(
            value
        )
            ? value
            : null;
    }

    if (
        typeof value !==
        "string"
    ) {
        return null;
    }

    const match =
        value
            .replaceAll(
                ",",
                ""
            )
            .match(
                /-?\d+(?:\.\d+)?/
            );

    if (
        !match
    ) {
        return null;
    }

    const amount =
        Number(
            match[0]
        );

    return Number.isFinite(
        amount
    )
        ? amount
        : null;
}

function formatCurrency(
    value
) {
    const amount =
        Number(
            value
        );

    if (
        !Number.isFinite(
            amount
        )
    ) {
        return "";
    }

    return new Intl.NumberFormat(
        "es-MX",
        {
            style:
                "currency",
            currency:
                "MXN",
            minimumFractionDigits:
                0,
            maximumFractionDigits:
                2
        }
    ).format(
        amount
    );
}

function getServicePrices(
    service
) {
    const prices = [];

    const add = (
        label,
        value
    ) => {
        const amount =
            parsePriceValue(
                value
            );

        if (
            amount ===
                null ||
            amount <
                0
        ) {
            return;
        }

        if (
            prices.some(
                (
                    item
                ) =>
                    item.label ===
                        label &&
                    item.amount ===
                        amount
            )
        ) {
            return;
        }

        prices.push({
            label,
            amount
        });
    };

    if (
        Array.isArray(
            service?.precios
        )
    ) {
        service.precios
            .forEach(
                (
                    item,
                    index
                ) => {
                    if (
                        typeof item ===
                            "number" ||
                        typeof item ===
                            "string"
                    ) {
                        add(
                            `Precio ${index + 1}`,
                            item
                        );

                        return;
                    }

                    if (
                        isPlainObject(
                            item
                        )
                    ) {
                        add(
                            item.nombre ||
                            item.tipo ||
                            item.categoria ||
                            item.label ||
                            `Precio ${index + 1}`,
                            item.precio ??
                            item.monto ??
                            item.valor ??
                            item.amount
                        );
                    }
                }
            );
    }

    if (
        isPlainObject(
            service?.precios
        )
    ) {
        Object.entries(
            service.precios
        ).forEach(
            (
                [
                    key,
                    value
                ]
            ) => {
                if (
                    isPlainObject(
                        value
                    )
                ) {
                    add(
                        value.nombre ||
                        value.label ||
                        key,
                        value.precio ??
                        value.monto ??
                        value.valor ??
                        value.amount
                    );
                } else {
                    add(
                        key,
                        value
                    );
                }
            }
        );
    }

    [
        [
            "Precio",
            service?.precio
        ],
        [
            "Precio base",
            service?.precioBase
        ],
        [
            "Desde",
            service?.desde
        ],
        [
            "Hatchback",
            service?.precioHatchback
        ],
        [
            "Sedán",
            service?.precioSedan
        ],
        [
            "SUV",
            service?.precioSuv
        ],
        [
            "Camioneta",
            service?.precioCamioneta
        ],
        [
            "Pick-up",
            service?.precioPickup
        ],
        [
            "Moto",
            service?.precioMoto
        ]
    ].forEach(
        (
            [
                label,
                value
            ]
        ) => {
            add(
                label,
                value
            );
        }
    );

    return prices;
}

function getMinimumServicePrice(
    service
) {
    const prices =
        getServicePrices(
            service
        );

    if (
        !prices.length
    ) {
        return null;
    }

    return Math.min(
        ...prices.map(
            (
                item
            ) =>
                item.amount
        )
    );
}

function getRelevantPrice(
    service
) {
    const prices =
        getServicePrices(
            service
        );

    if (
        !prices.length
    ) {
        return "";
    }

    const type =
        normalizeText(
            assistantState
                .vehicleType
        );

    if (
        type
    ) {
        const match =
            prices.find(
                (
                    item
                ) => {
                    const label =
                        normalizeText(
                            item.label
                        );

                    return (
                        label.includes(
                            type
                        ) ||
                        (
                            type ===
                                "pickup" &&
                            label.includes(
                                "pick"
                            )
                        )
                    );
                }
            );

        if (
            match
        ) {
            return (
                `${match.label}: ${formatCurrency(
                    match.amount
                )}`
            );
        }
    }

    const amounts =
        prices
            .map(
                (
                    item
                ) =>
                    item.amount
            )
            .filter(
                Number.isFinite
            );

    if (
        amounts.length ===
        1
    ) {
        return formatCurrency(
            amounts[0]
        );
    }

    if (
        amounts.length
    ) {
        const min =
            Math.min(
                ...amounts
            );

        const max =
            Math.max(
                ...amounts
            );

        if (
            min ===
            max
        ) {
            return formatCurrency(
                min
            );
        }

        return (
            `Desde ${formatCurrency(
                min
            )} hasta ${formatCurrency(
                max
            )}`
        );
    }

    return "";
}

async function loadServices() {
    if (
        catalogLoaded ||
        catalogLoading
    ) {
        return services;
    }

    catalogLoading =
        true;

    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "servicios"
                )
            );

        services =
            snapshot.docs
                .map(
                    (
                        item
                    ) => ({
                        id:
                            item.id,
                        ...item.data()
                    })
                )
                .filter(
                    isServicePublic
                );

        catalogLoaded =
            true;
    } catch (error) {
        console.error(
            "No se pudo cargar el catálogo:",
            error
        );

        services = [];
    } finally {
        catalogLoading =
            false;
    }

    return services;
}

function getServiceSearchText(
    service
) {
    return normalizeText(
        [
            service?.nombre,
            service?.titulo,
            service?.descripcion,
            service?.descripcionCorta,
            service?.resumen,
            service?.categoria,
            service?.subcategoria,
            service?.tags,
            service?.etiquetas,
            service?.incluye,
            service?.beneficios
        ]
            .flat(
                4
            )
            .filter(
                Boolean
            )
            .join(
                " "
            )
    );
}

function getServiceUrl(
    service
) {
    if (
        !service?.id
    ) {
        return "servicios.html";
    }

    return (
        `servicio.html?id=${encodeURIComponent(
            service.id
        )}`
    );
}

function normalizeUserLanguage(
    text
) {
    let normalized =
        normalizeText(
            text
        );

    const abbreviations =
        getLanguage()
            ?.abreviaciones ||
        {};

    normalized =
        normalized
            .split(
                " "
            )
            .map(
                (
                    word
                ) =>
                    abbreviations[
                        word
                    ]
                        ? normalizeText(
                            abbreviations[
                                word
                            ]
                        )
                        : word
            )
            .join(
                " "
            );

    return normalized;
}

function arrayIncludesText(
    list,
    text
) {
    if (
        !Array.isArray(
            list
        )
    ) {
        return false;
    }

    const normalized =
        normalizeUserLanguage(
            text
        );

    return list.some(
        (
            item
        ) => {
            const candidate =
                normalizeText(
                    item
                );

            return (
                normalized ===
                    candidate ||
                normalized.includes(
                    candidate
                ) ||
                candidate.includes(
                    normalized
                )
            );
        }
    );
}

function containsBlockedLanguage(
    text
) {
    const blocked =
        getPrincipal()
            ?.palabrasBloqueadas ||
        [];

    const normalized =
        ` ${normalizeUserLanguage(
            text
        )} `;

    return blocked.some(
        (
            item
        ) =>
            normalized.includes(
                ` ${normalizeText(
                    item
                )} `
            )
    );
}

function detectSecurityThreat(
    text
) {
    const security =
        getSecurity();

    const normalized =
        normalizeUserLanguage(
            text
        );

    const groups = [
        security
            ?.promptInjection,
        {
            patrones:
                security
                    ?.mensajesSospechosos
                    ?.solicitudesCredenciales,
            respuesta:
                security
                    ?.mensajesSospechosos
                    ?.respuesta
        },
        security
            ?.intentosEscalarPrivilegios,
        security
            ?.suplantacion,
        security
            ?.danosIntencionales,
        security
            ?.fraude
    ];

    for (
        const group
        of groups
    ) {
        const patterns =
            group
                ?.patrones ||
            [];

        const found =
            patterns.some(
                (
                    pattern
                ) =>
                    normalized.includes(
                        normalizeText(
                            pattern
                        )
                    )
            );

        if (
            found
        ) {
            return (
                group
                    ?.respuesta ||
                getMessage(
                    "malUso"
                )
            );
        }
    }

    return "";
}

function detectMechanicalDanger(
    text
) {
    const patterns = [
        ...(
            getSecurity()
                ?.mecanica
                ?.frasesAlerta ||
            []
        ),
        ...(
            getSecurity()
                ?.seguridadVehicular
                ?.problemasCriticos ||
            []
        )
    ];

    const normalized =
        normalizeUserLanguage(
            text
        );

    return patterns.some(
        (
            item
        ) =>
            normalized.includes(
                normalizeText(
                    item
                )
            )
    );
}

function detectGreeting(
    text
) {
    return arrayIncludesText(
        [
            ...(
                getPrincipal()
                    ?.saludosPermitidos ||
                []
            ),
            ...(
                getLanguage()
                    ?.saludos
                    ?.terminos ||
                []
            )
        ],
        text
    );
}

function detectFarewell(
    text
) {
    return arrayIncludesText(
        [
            ...(
                getPrincipal()
                    ?.despedidasPermitidas ||
                []
            ),
            ...(
                getLanguage()
                    ?.despedidas
                    ?.terminos ||
                []
            )
        ],
        text
    );
}

function detectPriceIntent(
    text
) {
    return arrayIncludesText(
        [
            "precio",
            "precios",
            "cuanto cuesta",
            "cuanto sale",
            "cuanto vale",
            "costo",
            "costos",
            "cuanto cobran",
            ...(
                getLanguage()
                    ?.preguntasPrecio
                    ?.terminos ||
                []
            )
        ],
        text
    );
}

function detectAgendaIntent(
    text
) {
    return arrayIncludesText(
        [
            "agendar",
            "agenda",
            "cita",
            "reservar",
            "horario",
            "disponibilidad",
            ...(
                getLanguage()
                    ?.preguntasAgenda
                    ?.terminos ||
                []
            )
        ],
        text
    );
}

function detectContactIntent(
    text
) {
    return arrayIncludesText(
        [
            "telefono",
            "whatsapp",
            "correo",
            "ubicacion",
            "direccion",
            "donde estan",
            "instagram",
            ...(
                getLanguage()
                    ?.preguntasContacto
                    ?.terminos ||
                []
            ),
            ...(
                getLanguage()
                    ?.preguntasUbicacion
                    ?.terminos ||
                []
            )
        ],
        text
    );
}

function detectOwnerIntent(
    text
) {
    return arrayIncludesText(
        [
            "quien es el dueño",
            "quien es el propietario",
            "de quien es pmc",
            "quien fundo pmc",
            ...(
                getLanguage()
                    ?.preguntasDueno
                    ?.terminos ||
                []
            )
        ],
        text
    );
}

function detectHistoryIntent(
    text
) {
    return arrayIncludesText(
        [
            "cuando abrio pmc",
            "cuando inauguraron",
            "cuando se inauguro",
            "desde cuando existe pmc",
            "historia de pmc",
            "cuando comenzo pmc"
        ],
        text
    );
}

function detectCatalogIntent(
    text
) {
    return arrayIncludesText(
        [
            "que servicios tienen",
            "catalogo",
            "que ofrecen",
            "todos los servicios"
        ],
        text
    );
}

function detectWhoIsDecua(
    text
) {
    return arrayIncludesText(
        [
            "quien eres",
            "que es decua",
            "quien es decua",
            "que significa decua",
            "para que sirve decua"
        ],
        text
    );
}

function detectHumanRequest(
    text
) {
    return arrayIncludesText(
        [
            "persona real",
            "hablar con una persona",
            "quiero hablar con una persona",
            "quiero hablar con alguien",
            "hablar con alguien",
            "asesor real",
            "asesor humano",
            "atencion humana",
            "atención humana",
            "quiero hablar con pmc",
            "contactar a pmc",
            "comunicarme con alguien",
            "comunícame con alguien",
            "quiero que alguien me explique",
            "quiero hablar con el dueño",
            "quiero hablar con un asesor"
        ],
        text
    );
}

function detectPriceObjection(
    text
) {
    return arrayIncludesText(
        [
            "esta caro",
            "está caro",
            "muy caro",
            "se me hace caro",
            "sale caro",
            "no tengo tanto",
            "no tengo ese presupuesto",
            "quiero algo mas barato",
            "quiero algo más barato",
            "algo mas economico",
            "algo más económico",
            "lo mas barato",
            "lo más barato",
            "todavia es caro",
            "todavía es caro",
            "se sale de mi presupuesto"
        ],
        text
    );
}

function detectHesitation(
    text
) {
    return arrayIncludesText(
        [
            "lo voy a pensar",
            "dejame pensarlo",
            "déjame pensarlo",
            "solo estoy viendo",
            "solo estoy preguntando",
            "todavia no",
            "todavía no",
            "no estoy seguro"
        ],
        text
    );
}

function getVehicleTypes() {
    const result = {};

    const principal =
        getPrincipal()
            ?.vehiculos
            ?.tipos ||
        {};

    Object.entries(
        principal
    ).forEach(
        (
            [
                key,
                value
            ]
        ) => {
            result[
                key
            ] =
                value;
        }
    );

    Object.entries(
        getVehicles()
            ?.tiposVehiculo ||
        {}
    ).forEach(
        (
            [
                key,
                value
            ]
        ) => {
            result[
                key
            ] = [
                ...(
                    result[
                        key
                    ] ||
                    []
                ),
                ...(
                    value
                        ?.sinonimos ||
                    []
                ),
                value
                    ?.nombre
            ].filter(
                Boolean
            );
        }
    );

    return result;
}

function getKnownBrands() {
    const result = [];

    Object.entries(
        getVehicles()
            ?.marcas ||
        {}
    ).forEach(
        (
            [
                name,
                data
            ]
        ) => {
            result.push({
                name,
                aliases: [
                    name,
                    ...(
                        data
                            ?.aliases ||
                        []
                    )
                ]
            });
        }
    );

    return result;
}

function findKnownModel(
    brand,
    text
) {
    const models =
        getVehicles()
            ?.modelosConocidos ||
        {};

    if (
        !brand
    ) {
        return "";
    }

    const key =
        Object.keys(
            models
        ).find(
            (
                item
            ) =>
                normalizeText(
                    item
                ) ===
                normalizeText(
                    brand
                )
        );

    if (
        !key
    ) {
        return "";
    }

    const normalized =
        normalizeUserLanguage(
            text
        );

    return (
        (
            models[
                key
            ] ||
            []
        )
            .filter(
                (
                    model
                ) =>
                    normalized.includes(
                        normalizeText(
                            model
                        )
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        b
                    ).length -
                    String(
                        a
                    ).length
            )[0] ||
        ""
    );
}

function parseVehicle(
    text
) {
    const normalized =
        normalizeUserLanguage(
            text
        );

    let vehicleType =
        "";

    Object.entries(
        getVehicleTypes()
    ).some(
        (
            [
                type,
                terms
            ]
        ) => {
            const found =
                (
                    terms ||
                    []
                ).some(
                    (
                        term
                    ) =>
                        normalized.includes(
                            normalizeText(
                                term
                            )
                        )
                );

            if (
                found
            ) {
                vehicleType =
                    type;

                return true;
            }

            return false;
        }
    );

    let brand =
        "";

    for (
        const item
        of getKnownBrands()
    ) {
        if (
            item.aliases
                .some(
                    (
                        alias
                    ) =>
                        normalized.includes(
                            normalizeText(
                                alias
                            )
                        )
                )
        ) {
            brand =
                item.name;

            break;
        }
    }

    const model =
        findKnownModel(
            brand,
            text
        );

    const yearMatch =
        normalized.match(
            /\b(19[8-9]\d|20[0-3]\d)\b/
        );

    const year =
        yearMatch
            ? yearMatch[0]
            : "";

    if (
        vehicleType
    ) {
        assistantState.vehicleType =
            vehicleType;
    }

    if (
        brand
    ) {
        assistantState.brand =
            brand;
    }

    if (
        model
    ) {
        assistantState.model =
            model;
    }

    if (
        year
    ) {
        assistantState.year =
            year;

        assistantState.age =
            Math.max(
                0,
                new Date()
                    .getFullYear() -
                    Number(
                        year
                    )
            );
    }

    if (
        brand ||
        model ||
        year ||
        vehicleType
    ) {
        assistantState.vehicleText =
            text;
    }

    return {
        brand,
        model,
        year,
        vehicleType
    };
}

function getVehicleSummary() {
    const parts = [
        assistantState.brand,
        assistantState.model,
        assistantState.year
    ].filter(
        Boolean
    );

    if (
        parts.length
    ) {
        return parts.join(
            " "
        );
    }

    return (
        assistantState
            .vehicleType ||
        ""
    );
}

function getAgeClassification() {
    if (
        assistantState.age ===
            null
    ) {
        return null;
    }

    return (
        getVehicles()
            ?.clasificacionAntiguedad ||
        []
    ).find(
        (
            item
        ) =>
            assistantState.age >=
                Number(
                    item
                        ?.edadMinima ??
                    0
                ) &&
            assistantState.age <=
                Number(
                    item
                        ?.edadMaxima ??
                    999
                )
    ) || null;
}

function detectIntent(
    text
) {
    const normalized =
        normalizeUserLanguage(
            text
        );

    const intentions =
        getPrincipal()
            ?.intenciones ||
        {};

    let best = "";
    let bestScore = 0;

    Object.entries(
        intentions
    ).forEach(
        (
            [
                key,
                values
            ]
        ) => {
            const score =
                (
                    values ||
                    []
                ).reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        (
                            normalized.includes(
                                normalizeText(
                                    item
                                )
                            )
                                ? 1
                                : 0
                        ),
                    0
                );

            if (
                score >
                bestScore
            ) {
                best =
                    key;

                bestScore =
                    score;
            }
        }
    );

    return best;
}

function createMessageElement(
    role,
    html
) {
    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        role ===
            "user"
            ? "pmc-chat-message pmc-chat-message--user"
            : "pmc-chat-message pmc-chat-message--assistant";

    wrapper.innerHTML = `
        <div class="pmc-chat-message__label">
            ${
                role ===
                    "user"
                    ? "Tú"
                    : "Decua"
            }
        </div>

        <div class="pmc-chat-message__bubble">
            ${html}
        </div>
    `;

    return wrapper;
}

function addAssistantMessage(
    html
) {
    const element =
        createMessageElement(
            "assistant",
            html
        );

    pmcAssistantMessages
        ?.appendChild(
            element
        );

    initIcons();

    scrollMessagesToBottom();
}

function addUserMessage(
    text
) {
    const element =
        createMessageElement(
            "user",
            escapeHTML(
                text
            )
        );

    pmcAssistantMessages
        ?.appendChild(
            element
        );

    scrollMessagesToBottom();
}

function scrollMessagesToBottom() {
    requestAnimationFrame(
        () => {
            if (
                pmcAssistantMessages
            ) {
                pmcAssistantMessages
                    .scrollTop =
                    pmcAssistantMessages
                        .scrollHeight;
            }
        }
    );
}

function showTyping() {
    removeTyping();

    typingElement =
        document.createElement(
            "div"
        );

    typingElement.className =
        "pmc-chat-typing";

    typingElement.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    pmcAssistantMessages
        ?.appendChild(
            typingElement
        );

    scrollMessagesToBottom();
}

function removeTyping() {
    if (
        typingElement
    ) {
        typingElement.remove();

        typingElement =
            null;
    }
}

function delay(
    ms
) {
    return new Promise(
        (
            resolve
        ) =>
            setTimeout(
                resolve,
                ms
            )
    );
}

function createOptionsHTML(
    options
) {
    return `
        <div class="pmc-chat-options">
            ${options
                .map(
                    (
                        option
                    ) => `
                        <button
                            type="button"
                            class="pmc-chat-option"
                            data-option-id="${escapeAttribute(
                                option.id
                            )}"
                            data-option-label="${escapeAttribute(
                                option.label
                            )}"
                        >
                            ${escapeHTML(
                                option.label
                            )}
                        </button>
                    `
                )
                .join("")}
        </div>
    `;
}

function askQuestion(
    text,
    type,
    options,
    extra = {}
) {
    assistantState.pendingQuestion = {
        type,
        options,
        extra
    };

    return `
        ${text}

        ${createOptionsHTML(
            options
        )}
    `;
}

function clearPendingQuestion() {
    assistantState.pendingQuestion =
        null;
}

function createActionsHTML() {
    return `
        <div class="pmc-chat-actions">

            <a
                href="agenda.html"
                class="pmc-chat-action pmc-chat-action--primary"
            >
                <i data-lucide="calendar-days"></i>
                Agendar cita
            </a>

            <button
                type="button"
                class="pmc-chat-action"
                data-human-handoff="true"
            >
                <i data-lucide="headphones"></i>
                Hablar con PMC
            </button>

        </div>
    `;
}

function createNotice(
    text,
    icon = "info",
    warning = false
) {
    return `
        <div class="pmc-chat-notice ${
            warning
                ? "pmc-chat-notice--warning"
                : ""
        }">

            <i data-lucide="${escapeAttribute(
                icon
            )}"></i>

            <span>
                ${escapeHTML(
                    text
                )}
            </span>

        </div>
    `;
}

function createServiceCardHTML(
    service
) {
    const price =
        getRelevantPrice(
            service
        );

    return `
        <div class="pmc-chat-service">

            <div class="pmc-chat-service__info">

                <span>
                    Servicio PMC
                </span>

                <strong>
                    ${escapeHTML(
                        getServiceName(
                            service
                        )
                    )}
                </strong>

                ${
                    price
                        ? `
                            <small>
                                ${escapeHTML(
                                    price
                                )}
                            </small>
                        `
                        : getServiceDescription(
                            service
                        )
                            ? `
                                <small>
                                    ${escapeHTML(
                                        getServiceDescription(
                                            service
                                        )
                                    )}
                                </small>
                            `
                            : ""
                }

            </div>

            <a
                href="${escapeAttribute(
                    getServiceUrl(
                        service
                    )
                )}"
                class="pmc-chat-service__button"
            >
                <i data-lucide="arrow-up-right"></i>
            </a>

        </div>
    `;
}

function findServices(
    keywords,
    limit = 3
) {
    const terms =
        (
            Array.isArray(
                keywords
            )
                ? keywords
                : [
                    keywords
                ]
        )
            .map(
                normalizeText
            )
            .filter(
                Boolean
            );

    return services
        .map(
            (
                service
            ) => {
                const text =
                    getServiceSearchText(
                        service
                    );

                const name =
                    normalizeText(
                        getServiceName(
                            service
                        )
                    );

                let score = 0;

                terms.forEach(
                    (
                        term
                    ) => {
                        if (
                            name.includes(
                                term
                            )
                        ) {
                            score +=
                                10;
                        }

                        if (
                            text.includes(
                                term
                            )
                        ) {
                            score +=
                                3;
                        }
                    }
                );

                return {
                    service,
                    score
                };
            }
        )
        .filter(
            (
                item
            ) =>
                item.score >
                0
        )
        .sort(
            (
                a,
                b
            ) =>
                b.score -
                a.score
        )
        .slice(
            0,
            limit
        )
        .map(
            (
                item
            ) =>
                item.service
        );
}

function saveRecommendations(
    list
) {
    assistantState
        .lastRecommendations =
        list.map(
            (
                service
            ) =>
                service.id
        );

    assistantState
        .lastServiceNames =
        list.map(
            getServiceName
        );
}

function getLastRecommendations() {
    return assistantState
        .lastRecommendations
        .map(
            (
                id
            ) =>
                services.find(
                    (
                        service
                    ) =>
                        service.id ===
                        id
                )
        )
        .filter(
            Boolean
        );
}

function createRecommendations(
    list,
    intro
) {
    if (
        !list.length
    ) {
        return `
            ${intro}

            <br><br>

            No encontré una opción publicada suficientemente relacionada en este momento.

            <br><br>

            ${createHumanSuggestion()}
        `;
    }

    saveRecommendations(
        list
    );

    return `
        ${intro}

        ${list
            .map(
                createServiceCardHTML
            )
            .join("")}

        ${createNotice(
            "La recomendación es orientativa y puede cambiar después de revisar físicamente el vehículo.",
            "scan-search"
        )}

        ${createActionsHTML()}
    `;
}

function createPriceResponse() {
    let list =
        getLastRecommendations();

    if (
        !list.length
    ) {
        list =
            services
                .filter(
                    (
                        service
                    ) =>
                        getServicePrices(
                            service
                        ).length >
                        0
                )
                .slice(
                    0,
                    5
                );
    }

    if (
        !list.length
    ) {
        return `
            ${escapeHTML(
                getMessage(
                    "sinPrecio"
                )
            )}

            <br><br>

            ${createHumanSuggestion()}
        `;
    }

    return `
        ${
            list.length ===
                1
                ? "Este es el precio disponible para la opción que estábamos revisando:"
                : "Estos son algunos precios actualmente publicados:"
        }

        ${list
            .map(
                createServiceCardHTML
            )
            .join("")}

        ${createNotice(
            "El precio puede variar cuando PMC lo defina por tamaño, categoría o condición del vehículo."
        )}

        ${createActionsHTML()}
    `;
}

function getGreetingText() {
    const greetings =
        getPrincipal()
            ?.saludos ||
        {};

    if (
        userContext.loggedIn &&
        userContext.name !==
            "Usuario PMC"
    ) {
        return String(
            greetings
                ?.usuarioRegistrado ||
            "Hola {nombre} 👋 Soy Decua, Dedicado Al Cuidado Automotriz."
        ).replaceAll(
            "{nombre}",
            userContext.name
        );
    }

    return (
        greetings
            ?.usuarioInvitado ||
        "Hola Usuario PMC 👋 Soy Decua, Dedicado Al Cuidado Automotriz."
    );
}

function createGreetingResponse() {
    clearPendingQuestion();

    return `
        ${escapeHTML(
            getGreetingText()
        )}

        <br><br>

        Puedo ayudarte a encontrar una opción para tu vehículo utilizando información real de PMC.

        ${askQuestion(
            "¿Con qué te gustaría comenzar?",
            "inicio",
            [
                {
                    id:
                        "recomendacion",
                    label:
                        "Recomiéndame un servicio"
                },
                {
                    id:
                        "precios",
                    label:
                        "Consultar precios"
                },
                {
                    id:
                        "catalogo",
                    label:
                        "Ver servicios"
                },
                {
                    id:
                        "agenda",
                    label:
                        "Agendar cita"
                },
                {
                    id:
                        "persona",
                    label:
                        "Hablar con una persona"
                }
            ]
        )}
    `;
}

function createContactResponse() {
    const business =
        getBusinessData();

    clearPendingQuestion();

    return `
        Puedes comunicarte con
        <strong>
            ${escapeHTML(
                business.nombre
            )}
        </strong>:

        <br><br>

        <strong>
            WhatsApp:
        </strong>
        ${escapeHTML(
            business.telefono
        )}

        <br>

        <strong>
            Correo:
        </strong>
        ${escapeHTML(
            business.correo
        )}

        <br>

        <strong>
            Ubicación:
        </strong>
        ${escapeHTML(
            business.ubicacion
        )}

        <div class="pmc-chat-actions">

            <a
                href="${escapeAttribute(
                    business.whatsapp
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="pmc-chat-action pmc-chat-action--primary"
            >
                <i data-lucide="message-circle"></i>
                Abrir WhatsApp
            </a>

            <a
                href="${escapeAttribute(
                    business.maps
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="pmc-chat-action"
            >
                <i data-lucide="map-pin"></i>
                Ver ubicación
            </a>

        </div>
    `;
}

function getObjectiveLabel() {
    const map = {
        conservar:
            "Mantenerlo en buen estado",
        mejorarApariencia:
            "Mejorar apariencia",
        proteger:
            "Proteger el vehículo",
        vender:
            "Prepararlo para venta"
    };

    return (
        map[
            assistantState.objective
        ] ||
        ""
    );
}

function getUsageLabel() {
    const map = {
        diario:
            "Uso diario",
        ocasional:
            "Uso ocasional",
        carretera:
            "Viajes frecuentes en carretera",
        trabajo:
            "Vehículo de trabajo"
    };

    return (
        map[
            assistantState.usage
        ] ||
        ""
    );
}

function getParkingLabel() {
    const map = {
        techo:
            "Bajo techo",
        exterior:
            "A la intemperie",
        mixto:
            "Mitad bajo techo y mitad exterior"
    };

    return (
        map[
            assistantState.parking
        ] ||
        ""
    );
}

function getBudgetLabel() {
    const map = {
        sencillo:
            "Busca una opción sencilla",
        intermedio:
            "Busca una opción intermedia",
        proteccion:
            "Busca buena protección",
        completo:
            "Busca la opción más completa"
    };

    return (
        map[
            assistantState.budget
        ] ||
        ""
    );
}

function getPaintIssueLabel() {
    const map = {
        rayones:
            "Rayones",
        brillo:
            "Falta de brillo",
        ambos:
            "Rayones y falta de brillo",
        no_se:
            "No identifica con precisión el problema"
    };

    return (
        map[
            assistantState.paintIssue
        ] ||
        ""
    );
}

function getScratchDepthLabel() {
    const map = {
        ligeros:
            "Rayones ligeros",
        medios:
            "Algunos rayones se sienten con la uña",
        profundos:
            "Rayones aparentemente profundos",
        no_se:
            "Profundidad no identificada"
    };

    return (
        map[
            assistantState.scratchDepth
        ] ||
        ""
    );
}

function buildConversationSummary() {
    const lines = [];

    lines.push(
        "Hola PMC Auto Detailing 👋"
    );

    lines.push(
        ""
    );

    lines.push(
        "Vengo desde Decua y quisiera continuar mi atención con una persona."
    );

    lines.push(
        ""
    );

    lines.push(
        "Resumen de mi conversación con Decua:"
    );

    const clientName =
        userContext.loggedIn &&
        userContext.name &&
        userContext.name !==
            "Usuario PMC"
            ? userContext.name
            : "Usuario PMC";

    lines.push(
        `Cliente: ${clientName}`
    );

    if (
        getVehicleSummary()
    ) {
        lines.push(
            `Vehículo: ${getVehicleSummary()}`
        );
    }

    if (
        assistantState.vehicleType
    ) {
        lines.push(
            `Tipo de vehículo: ${assistantState.vehicleType}`
        );
    }

    if (
        getObjectiveLabel()
    ) {
        lines.push(
            `Objetivo: ${getObjectiveLabel()}`
        );
    }

    if (
        getUsageLabel()
    ) {
        lines.push(
            `Uso: ${getUsageLabel()}`
        );
    }

    if (
        getParkingLabel()
    ) {
        lines.push(
            `Estacionamiento: ${getParkingLabel()}`
        );
    }

    if (
        getPaintIssueLabel()
    ) {
        lines.push(
            `Pintura: ${getPaintIssueLabel()}`
        );
    }

    if (
        getScratchDepthLabel()
    ) {
        lines.push(
            `Rayones: ${getScratchDepthLabel()}`
        );
    }

    if (
        getBudgetLabel()
    ) {
        lines.push(
            `Presupuesto: ${getBudgetLabel()}`
        );
    }

    if (
        assistantState.lastServiceNames.length
    ) {
        lines.push(
            ""
        );

        lines.push(
            "Servicios revisados:"
        );

        assistantState
            .lastServiceNames
            .forEach(
                (
                    name
                ) => {
                    lines.push(
                        `- ${name}`
                    );
                }
            );
    }

    if (
        assistantState.lastUserMessage
    ) {
        lines.push(
            ""
        );

        lines.push(
            `Último mensaje del cliente: ${assistantState.lastUserMessage}`
        );
    }

    lines.push(
        ""
    );

    lines.push(
        "Me gustaría recibir más información y continuar mi atención."
    );

    return lines.join(
        "\n"
    );
}

function buildWhatsAppHandoffUrl() {
    const summary =
        buildConversationSummary();

    return (
        `https://wa.me/529542038099?text=${encodeURIComponent(
            summary
        )}`
    );
}

function createHumanHandoffResponse() {
    assistantState.humanHandoffOffered =
        true;

    const url =
        buildWhatsAppHandoffUrl();

    return `
        Claro. Para darte una atención más detallada y responder tu pregunta de forma más precisa, puedo enlazarte con una persona real de PMC Auto Detailing.

        <br><br>

        Preparé un pequeño resumen de lo que hemos hablado para que no tengas que explicar todo nuevamente.

        <div class="pmc-chat-actions">

            <a
                href="${escapeAttribute(
                    url
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="pmc-chat-action pmc-chat-action--primary"
            >
                <i data-lucide="message-circle"></i>
                Continuar con una persona
            </a>

            <button
                type="button"
                class="pmc-chat-action"
                data-continue-decua="true"
            >
                <i data-lucide="sparkles"></i>
                Seguir con Decua
            </button>

        </div>

        ${createNotice(
            "El mensaje de WhatsApp incluirá únicamente un resumen de esta conversación para agilizar tu atención."
        )}
    `;
}

function createHumanSuggestion() {
    const url =
        buildWhatsAppHandoffUrl();

    return `
        Para conocer tu caso con más detalle y responder de forma más precisa, también puedes continuar con una persona de PMC.

        <div class="pmc-chat-actions">

            <a
                href="${escapeAttribute(
                    url
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="pmc-chat-action pmc-chat-action--primary"
            >
                <i data-lucide="headphones"></i>
                Hablar con una persona
            </a>

            <a
                href="agenda.html"
                class="pmc-chat-action"
            >
                <i data-lucide="calendar-days"></i>
                Agendar cita
            </a>

        </div>
    `;
}

function findOptionFromText(
    text,
    pending
) {
    const normalized =
        normalizeUserLanguage(
            text
        );

    let best = null;
    let bestScore = 0;

    pending.options
        .forEach(
            (
                option
            ) => {
                const candidates = [
                    option.id,
                    option.label,
                    ...(
                        option.aliases ||
                        []
                    )
                ];

                candidates.forEach(
                    (
                        candidate
                    ) => {
                        const value =
                            normalizeText(
                                candidate
                            );

                        let score = 0;

                        if (
                            normalized ===
                            value
                        ) {
                            score =
                                100;
                        } else if (
                            normalized.includes(
                                value
                            )
                        ) {
                            score =
                                60;
                        } else if (
                            value.includes(
                                normalized
                            ) &&
                            normalized.length >=
                                3
                        ) {
                            score =
                                35;
                        }

                        if (
                            score >
                            bestScore
                        ) {
                            bestScore =
                                score;

                            best =
                                option;
                        }
                    }
                );
            }
        );

    return (
        bestScore >=
            30
            ? best
            : null
    );
}

function askVehicleGoal() {
    return askQuestion(
        "¿Qué quieres hacer principalmente con tu vehículo?",
        "vehicle_goal",
        [
            {
                id:
                    "mantener",
                label:
                    "Mantenerlo en buen estado",
                aliases: [
                    "mantenerlo",
                    "conservarlo",
                    "cuidarlo",
                    "que siga bien"
                ]
            },
            {
                id:
                    "pintura",
                label:
                    "Mejorar pintura o brillo",
                aliases: [
                    "pintura",
                    "brillo",
                    "rayones"
                ]
            },
            {
                id:
                    "proteccion",
                label:
                    "Protegerlo",
                aliases: [
                    "proteger",
                    "proteccion"
                ]
            },
            {
                id:
                    "venta",
                label:
                    "Prepararlo para vender",
                aliases: [
                    "venderlo",
                    "venta"
                ]
            },
            {
                id:
                    "no_se",
                label:
                    "No estoy seguro",
                aliases: [
                    "no se",
                    "recomiendame"
                ]
            }
        ]
    );
}

function askUsage() {
    return askQuestion(
        "¿Cómo utilizas normalmente el vehículo?",
        "vehicle_usage",
        [
            {
                id:
                    "diario",
                label:
                    "Lo uso diario",
                aliases: [
                    "diario",
                    "todos los dias"
                ]
            },
            {
                id:
                    "ocasional",
                label:
                    "Lo uso ocasionalmente",
                aliases: [
                    "ocasional",
                    "poco",
                    "fines de semana"
                ]
            },
            {
                id:
                    "carretera",
                label:
                    "Viajo mucho en carretera",
                aliases: [
                    "carretera",
                    "viajo mucho"
                ]
            },
            {
                id:
                    "trabajo",
                label:
                    "Es vehículo de trabajo",
                aliases: [
                    "trabajo",
                    "uso para trabajar"
                ]
            }
        ]
    );
}

function askParking() {
    return askQuestion(
        "¿Dónde permanece normalmente cuando no lo utilizas?",
        "vehicle_parking",
        [
            {
                id:
                    "techo",
                label:
                    "Bajo techo",
                aliases: [
                    "cochera",
                    "techado",
                    "bajo techo"
                ]
            },
            {
                id:
                    "exterior",
                label:
                    "A la intemperie",
                aliases: [
                    "afuera",
                    "calle",
                    "sol",
                    "intemperie"
                ]
            },
            {
                id:
                    "mixto",
                label:
                    "Mitad y mitad",
                aliases: [
                    "mixto",
                    "mitad"
                ]
            }
        ]
    );
}

function askPaintIssue() {
    return askQuestion(
        "¿Qué notas principalmente en la pintura?",
        "paint_issue",
        [
            {
                id:
                    "rayones",
                label:
                    "Rayones",
                aliases: [
                    "rayado",
                    "rayas"
                ]
            },
            {
                id:
                    "brillo",
                label:
                    "Falta de brillo",
                aliases: [
                    "opaco",
                    "no brilla"
                ]
            },
            {
                id:
                    "ambos",
                label:
                    "Rayones y falta de brillo",
                aliases: [
                    "ambos",
                    "los dos"
                ]
            },
            {
                id:
                    "no_se",
                label:
                    "No estoy seguro",
                aliases: [
                    "no se"
                ]
            }
        ]
    );
}

function askScratchDepth() {
    return askQuestion(
        "¿Cómo describirías los rayones?",
        "scratch_depth",
        [
            {
                id:
                    "ligeros",
                label:
                    "Solo se ven con la luz",
                aliases: [
                    "ligeros",
                    "superficiales",
                    "con la luz"
                ]
            },
            {
                id:
                    "medios",
                label:
                    "Algunos se sienten con la uña",
                aliases: [
                    "uña",
                    "se sienten"
                ]
            },
            {
                id:
                    "profundos",
                label:
                    "Se ven bastante profundos",
                aliases: [
                    "profundos"
                ]
            },
            {
                id:
                    "no_se",
                label:
                    "No sé identificarlo",
                aliases: [
                    "no se"
                ]
            }
        ]
    );
}

function askProtectionGoal() {
    return askQuestion(
        "¿Qué tipo de protección te interesa más?",
        "protection_goal",
        [
            {
                id:
                    "mantener",
                label:
                    "Mantenerlo en excelente estado",
                aliases: [
                    "mantenerlo",
                    "conservarlo"
                ]
            },
            {
                id:
                    "pintura",
                label:
                    "Proteger la pintura",
                aliases: [
                    "pintura"
                ]
            },
            {
                id:
                    "frente",
                label:
                    "Proteger zonas de impacto",
                aliases: [
                    "frente",
                    "impacto"
                ]
            },
            {
                id:
                    "completo",
                label:
                    "Quiero máxima protección",
                aliases: [
                    "completo",
                    "maxima"
                ]
            },
            {
                id:
                    "no_se",
                label:
                    "Quiero que me recomiendes",
                aliases: [
                    "recomiendame",
                    "no se"
                ]
            }
        ]
    );
}

function askBudget() {
    return askQuestion(
        "¿Qué nivel de inversión estás considerando?",
        "budget",
        [
            {
                id:
                    "sencillo",
                label:
                    "Algo sencillo",
                aliases: [
                    "economico",
                    "barato"
                ]
            },
            {
                id:
                    "intermedio",
                label:
                    "Algo intermedio",
                aliases: [
                    "medio",
                    "equilibrado"
                ]
            },
            {
                id:
                    "proteccion",
                label:
                    "Buena protección",
                aliases: [
                    "buena proteccion"
                ]
            },
            {
                id:
                    "completo",
                label:
                    "Quiero lo más completo",
                aliases: [
                    "lo mejor",
                    "completo"
                ]
            },
            {
                id:
                    "persona",
                label:
                    "Prefiero hablar con PMC"
            }
        ]
    );
}

function handlePendingOption(
    option,
    pending
) {
    const type =
        pending.type;

    clearPendingQuestion();

    if (
        option.id ===
        "persona"
    ) {
        return createHumanHandoffResponse();
    }

    if (
        type ===
        "inicio"
    ) {
        if (
            option.id ===
            "recomendacion"
        ) {
            return askQuestion(
                "Perfecto. Primero dime qué vehículo tienes.",
                "vehicle_missing",
                [
                    {
                        id:
                            "escribir",
                        label:
                            "Escribir mi vehículo"
                    },
                    {
                        id:
                            "persona",
                        label:
                            "Hablar con una persona"
                    }
                ]
            );
        }

        if (
            option.id ===
            "precios"
        ) {
            return createPriceResponse();
        }

        if (
            option.id ===
            "catalogo"
        ) {
            return createCatalogResponse();
        }

        if (
            option.id ===
            "agenda"
        ) {
            return createAgendaResponse();
        }
    }

    if (
        type ===
        "vehicle_goal"
    ) {
        if (
            option.id ===
            "mantener"
        ) {
            assistantState.objective =
                "conservar";

            return `
                Perfecto. Entonces el objetivo será conservar
                <strong>
                    ${escapeHTML(
                        getVehicleSummary() ||
                        "tu vehículo"
                    )}
                </strong>
                en buenas condiciones, sin recomendar procesos fuertes si no los necesita.

                <br><br>

                ${askUsage()}
            `;
        }

        if (
            option.id ===
            "pintura"
        ) {
            assistantState.objective =
                "mejorarApariencia";

            return askPaintIssue();
        }

        if (
            option.id ===
            "proteccion"
        ) {
            assistantState.objective =
                "proteger";

            return askProtectionGoal();
        }

        if (
            option.id ===
            "venta"
        ) {
            assistantState.objective =
                "vender";

            const list =
                findServices(
                    [
                        "ready to sell",
                        "venta"
                    ],
                    2
                );

            return createRecommendations(
                list,
                "Perfecto. Si lo estás preparando para venta, conviene enfocarnos en presentación general sin prometer un aumento de valor comercial."
            );
        }

        if (
            option.id ===
            "no_se"
        ) {
            return askQuestion(
                "No hay problema. ¿Qué es lo que más notas actualmente?",
                "general_problem",
                [
                    {
                        id:
                            "pintura",
                        label:
                            "Pintura"
                    },
                    {
                        id:
                            "interior",
                        label:
                            "Interior"
                    },
                    {
                        id:
                            "faros",
                        label:
                            "Faros"
                    },
                    {
                        id:
                            "suciedad",
                        label:
                            "Suciedad general"
                    },
                    {
                        id:
                            "ninguno",
                        label:
                            "Está bien, solo quiero cuidarlo"
                    }
                ]
            );
        }
    }

    if (
        type ===
        "vehicle_usage"
    ) {
        assistantState.usage =
            option.id;

        return askParking();
    }

    if (
        type ===
        "vehicle_parking"
    ) {
        assistantState.parking =
            option.id;

        if (
            assistantState
                .objective ===
            "conservar"
        ) {
            return askProtectionGoal();
        }

        return askBudget();
    }

    if (
        type ===
        "paint_issue"
    ) {
        assistantState.paintIssue =
            option.id;

        if (
            option.id ===
                "rayones" ||
            option.id ===
                "ambos"
        ) {
            return askScratchDepth();
        }

        if (
            option.id ===
            "brillo"
        ) {
            const list =
                findServices(
                    [
                        "pulido basico",
                        "pulido"
                    ]
                );

            return createRecommendations(
                list,
                "Si buscas principalmente recuperar brillo, primero conviene revisar una opción de pulido antes de pensar en una corrección mayor."
            );
        }

        return askBudget();
    }

    if (
        type ===
        "scratch_depth"
    ) {
        assistantState.scratchDepth =
            option.id;

        if (
            option.id ===
            "ligeros"
        ) {
            const list =
                findServices(
                    [
                        "pulido basico",
                        "pulido"
                    ]
                );

            return createRecommendations(
                list,
                "Por lo que describes, podría tener sentido revisar primero una opción de mejora ligera antes de pensar en una corrección mayor."
            );
        }

        if (
            option.id ===
                "medios" ||
            option.id ===
                "profundos"
        ) {
            const list =
                findServices(
                    [
                        "correccion basica de pintura",
                        "correccion"
                    ]
                );

            return createRecommendations(
                list,
                "Como algunos defectos parecen más marcados, conviene revisar una opción de corrección y confirmar físicamente hasta dónde pueden reducirse."
            );
        }

        return askBudget();
    }

    if (
        type ===
        "protection_goal"
    ) {
        assistantState.protectionGoal =
            option.id;

        if (
            option.id ===
            "frente"
        ) {
            const list =
                findServices(
                    [
                        "ppf",
                        "paint protection film"
                    ]
                );

            return createRecommendations(
                list,
                "Si tu prioridad son las zonas expuestas a impactos ligeros, el PPF es la opción del catálogo más relacionada."
            );
        }

        if (
            option.id ===
            "completo"
        ) {
            const list =
                findServices(
                    [
                        "ceramic diamond",
                        "ceramic gold",
                        "ppf"
                    ]
                );

            return createRecommendations(
                list,
                "Si buscas una protección más completa, podemos comparar las opciones superiores publicadas por PMC."
            );
        }

        return askBudget();
    }

    if (
        type ===
        "budget"
    ) {
        assistantState.budget =
            option.id;

        let keywords = [];

        if (
            option.id ===
            "sencillo"
        ) {
            keywords = [
                "pulido basico",
                "ceramic silver",
                "lavado basico"
            ];
        }

        if (
            option.id ===
            "intermedio"
        ) {
            keywords = [
                "ceramic silver",
                "ceramic gold",
                "pulido basico"
            ];
        }

        if (
            option.id ===
            "proteccion"
        ) {
            keywords = [
                "ceramic gold",
                "ppf",
                "ceramic silver"
            ];
        }

        if (
            option.id ===
            "completo"
        ) {
            keywords = [
                "ceramic diamond",
                "ppf",
                "ceramic gold"
            ];
        }

        const list =
            findServices(
                keywords
            );

        return createRecommendations(
            list,
            "Perfecto. Tomando en cuenta lo que me has contado, estas son algunas opciones publicadas que podrían encajar contigo."
        );
    }

    if (
        type ===
        "general_problem"
    ) {
        if (
            option.id ===
            "pintura"
        ) {
            return askPaintIssue();
        }

        if (
            option.id ===
            "interior"
        ) {
            const list =
                findServices(
                    [
                        "supreme interior",
                        "interior"
                    ]
                );

            return createRecommendations(
                list,
                "Si el interior es lo que más te preocupa, puedo mostrarte las opciones publicadas relacionadas."
            );
        }

        if (
            option.id ===
            "faros"
        ) {
            const list =
                findServices(
                    [
                        "pulido de faros",
                        "faros"
                    ]
                );

            return createRecommendations(
                list,
                "Para faros opacos o amarillentos, PMC tiene opciones relacionadas con recuperación estética."
            );
        }

        if (
            option.id ===
            "suciedad"
        ) {
            const list =
                findServices(
                    [
                        "lavado basico",
                        "lavado",
                        "chasis"
                    ]
                );

            return createRecommendations(
                list,
                "Si el objetivo principal es limpieza general, estas son algunas opciones publicadas."
            );
        }

        if (
            option.id ===
            "ninguno"
        ) {
            assistantState.objective =
                "conservar";

            return askUsage();
        }
    }

    if (
        type ===
        "vehicle_missing"
    ) {
        return `
            Escríbeme la marca, modelo y año.

            <br><br>

            Por ejemplo:

            <br>

            <strong>
                Chevrolet Aveo 2018
            </strong>
        `;
    }

    return getMessage(
        "sinEntender"
    );
}

function handlePendingText(
    text
) {
    const pending =
        assistantState
            .pendingQuestion;

    if (
        !pending
    ) {
        return null;
    }

    const option =
        findOptionFromText(
            text,
            pending
        );

    if (
        option
    ) {
        return handlePendingOption(
            option,
            pending
        );
    }

    if (
        pending.type ===
        "vehicle_missing"
    ) {
        const vehicle =
            parseVehicle(
                text
            );

        if (
            vehicle.brand ||
            vehicle.model ||
            vehicle.year ||
            vehicle.vehicleType
        ) {
            clearPendingQuestion();

            return `
                Perfecto. Ya tomé en cuenta
                <strong>
                    ${escapeHTML(
                        getVehicleSummary()
                    )}
                </strong>.

                <br><br>

                ${askVehicleGoal()}
            `;
        }
    }

    return null;
}

function createCatalogResponse() {
    clearPendingQuestion();

    if (
        !services.length
    ) {
        return escapeHTML(
            getMessage(
                "sinCatalogo"
            )
        );
    }

    return `
        Actualmente tengo
        <strong>
            ${services.length}
            ${
                services.length ===
                    1
                    ? "servicio publicado"
                    : "servicios publicados"
            }
        </strong>
        disponibles para consultar.

        ${services
            .slice(
                0,
                5
            )
            .map(
                createServiceCardHTML
            )
            .join("")}

        ${createActionsHTML()}
    `;
}

function createAgendaResponse() {
    clearPendingQuestion();

    return `
        Claro. Puedes pasar directamente a la agenda de PMC para consultar horarios disponibles.

        <div class="pmc-chat-actions">

            <a
                href="agenda.html"
                class="pmc-chat-action pmc-chat-action--primary"
            >
                <i data-lucide="calendar-days"></i>
                Agendar ahora
            </a>

            <button
                type="button"
                class="pmc-chat-action"
                data-human-handoff="true"
            >
                <i data-lucide="headphones"></i>
                Hablar con PMC
            </button>

        </div>
    `;
}

function createOffTopicResponse() {
    return `
        ${createNotice(
            getSecurity()
                ?.fueraDeTema
                ?.respuesta ||
            getMessage(
                "fueraDeTema"
            ),
            "circle-help"
        )}

        ${askQuestion(
            "Puedo ayudarte con alguno de estos temas:",
            "inicio",
            [
                {
                    id:
                        "recomendacion",
                    label:
                        "Recomiéndame un servicio"
                },
                {
                    id:
                        "precios",
                    label:
                        "Consultar precios"
                },
                {
                    id:
                        "catalogo",
                    label:
                        "Ver servicios"
                },
                {
                    id:
                        "agenda",
                    label:
                        "Agendar cita"
                },
                {
                    id:
                        "persona",
                    label:
                        "Hablar con una persona"
                }
            ]
        )}
    `;
}

function isRelevantMessage(
    text
) {
    if (
        detectGreeting(
            text
        ) ||
        detectFarewell(
            text
        ) ||
        detectPriceIntent(
            text
        ) ||
        detectAgendaIntent(
            text
        ) ||
        detectContactIntent(
            text
        ) ||
        detectOwnerIntent(
            text
        ) ||
        detectHistoryIntent(
            text
        ) ||
        detectCatalogIntent(
            text
        ) ||
        detectWhoIsDecua(
            text
        ) ||
        detectHumanRequest(
            text
        ) ||
        detectPriceObjection(
            text
        ) ||
        detectHesitation(
            text
        ) ||
        detectIntent(
            text
        )
    ) {
        return true;
    }

    const vehicle =
        parseVehicle(
            text
        );

    if (
        vehicle.brand ||
        vehicle.model ||
        vehicle.year ||
        vehicle.vehicleType
    ) {
        return true;
    }

    if (
        assistantState
            .pendingQuestion
    ) {
        return true;
    }

    return false;
}

function registerMessage(
    text
) {
    const normalized =
        normalizeUserLanguage(
            text
        );

    assistantState.lastUserMessage =
        text;

    assistantState
        .history
        .push({
            role:
                "user",
            text,
            normalized
        });

    if (
        assistantState
            .history
            .length >
        30
    ) {
        assistantState
            .history
            .shift();
    }

    assistantState
        .repeatedMessages[
            normalized
        ] =
        (
            assistantState
                .repeatedMessages[
                    normalized
                ] ||
            0
        ) +
        1;
}

function detectSpam(
    text
) {
    const normalized =
        normalizeUserLanguage(
            text
        );

    const max =
        Number(
            getSecurity()
                ?.controlConversacion
                ?.maximoMensajesRepetidosAntesAviso ??
            3
        );

    return (
        assistantState
            .repeatedMessages[
                normalized
            ] >=
        max
    );
}

function findCheaperAlternatives() {
    const current =
        getLastRecommendations();

    if (
        !current.length
    ) {
        return [];
    }

    const currentPrices =
        current
            .map(
                getMinimumServicePrice
            )
            .filter(
                (
                    value
                ) =>
                    value !==
                    null
            );

    if (
        !currentPrices.length
    ) {
        return [];
    }

    const currentMin =
        Math.min(
            ...currentPrices
        );

    let keywords = [];

    if (
        assistantState.lastIntent ===
            "pintura" ||
        assistantState.objective ===
            "mejorarApariencia"
    ) {
        keywords = [
            "pulido",
            "correccion",
            "pintura"
        ];
    }

    if (
        assistantState.lastIntent ===
            "proteccion" ||
        assistantState.objective ===
            "proteger" ||
        assistantState.objective ===
            "conservar"
    ) {
        keywords = [
            "ceramic",
            "ppf",
            "proteccion"
        ];
    }

    if (
        assistantState.objective ===
        "vender"
    ) {
        keywords = [
            "ready to sell",
            "lavado",
            "pulido",
            "interior"
        ];
    }

    if (
        !keywords.length
    ) {
        const categories =
            current
                .map(
                    getServiceCategory
                )
                .filter(
                    Boolean
                );

        keywords =
            categories;
    }

    const candidates =
        findServices(
            keywords,
            10
        )
            .filter(
                (
                    service
                ) => {
                    const price =
                        getMinimumServicePrice(
                            service
                        );

                    if (
                        price ===
                        null
                    ) {
                        return false;
                    }

                    if (
                        price >=
                        currentMin
                    ) {
                        return false;
                    }

                    return !current.some(
                        (
                            item
                        ) =>
                            item.id ===
                            service.id
                    );
                }
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    getMinimumServicePrice(
                        b
                    ) -
                    getMinimumServicePrice(
                        a
                    )
            );

    return candidates.slice(
        0,
        2
    );
}

function createPriceObjectionResponse() {
    assistantState.objectionCount +=
        1;

    const alternatives =
        findCheaperAlternatives();

    if (
        alternatives.length
    ) {
        saveRecommendations(
            alternatives
        );

        return `
            Entiendo. No necesariamente tienes que irte por la opción más completa.

            <br><br>

            Podemos enfocarnos en lo que más quieres mejorar y revisar una alternativa más accesible que siga teniendo sentido para tu vehículo.

            ${alternatives
                .map(
                    createServiceCardHTML
                )
                .join("")}

            ${createNotice(
                "La alternativa puede tener menos procesos, menor duración o menor nivel de corrección que la opción anterior."
            )}

            ${askQuestion(
                "¿Qué quieres hacer ahora?",
                "price_objection",
                [
                    {
                        id:
                            "alternativa",
                        label:
                            "Me interesa esta alternativa"
                    },
                    {
                        id:
                            "comparar",
                        label:
                            "Comparar opciones"
                    },
                    {
                        id:
                            "agenda",
                        label:
                            "Agendar evaluación"
                    },
                    {
                        id:
                            "persona",
                        label:
                            "Hablar con PMC"
                    }
                ]
            )}
        `;
    }

    return `
        Entiendo. No quiero recomendarte algo que se salga de lo que estás buscando.

        <br><br>

        Podemos enfocarnos únicamente en la necesidad principal del vehículo y evitar procesos adicionales.

        <br><br>

        ${createHumanSuggestion()}
    `;
}

function createHesitationResponse() {
    return `
        No hay problema. No tienes que decidir ahora.

        <br><br>

        Puedo seguir explicándote las opciones, revisar algo más sencillo o dejarte directamente con una persona de PMC si quieres una recomendación más específica.

        ${askQuestion(
            "¿Qué prefieres?",
            "hesitation",
            [
                {
                    id:
                        "seguir",
                    label:
                        "Seguir viendo opciones"
                },
                {
                    id:
                        "economica",
                    label:
                        "Buscar algo más económico"
                },
                {
                    id:
                        "agenda",
                    label:
                        "Agendar una evaluación"
                },
                {
                    id:
                        "persona",
                    label:
                        "Hablar con una persona"
                }
            ]
        )}
    `;
}

function handleCommercialOption(
    option,
    type
) {
    clearPendingQuestion();

    if (
        option.id ===
        "persona"
    ) {
        return createHumanHandoffResponse();
    }

    if (
        option.id ===
        "agenda"
    ) {
        return createAgendaResponse();
    }

    if (
        type ===
            "price_objection" &&
        option.id ===
            "alternativa"
    ) {
        return `
            Perfecto. Entonces podemos continuar con esta alternativa.

            <br><br>

            ${createActionsHTML()}
        `;
    }

    if (
        type ===
            "price_objection" &&
        option.id ===
            "comparar"
    ) {
        return `
            Claro. La opción anterior normalmente ofrece un proceso más completo, mientras que esta alternativa busca atender la necesidad principal con una inversión menor.

            <br><br>

            ${createPriceResponse()}
        `;
    }

    if (
        type ===
            "hesitation" &&
        option.id ===
            "economica"
    ) {
        return createPriceObjectionResponse();
    }

    if (
        type ===
            "hesitation" &&
        option.id ===
            "seguir"
    ) {
        return askVehicleGoal();
    }

    return getMessage(
        "sinEntender"
    );
}

async function getAssistantResponse(
    text
) {
    await Promise.all([
        loadKnowledge(),
        loadServices()
    ]);

    const threat =
        detectSecurityThreat(
            text
        );

    if (
        threat
    ) {
        clearPendingQuestion();

        return createNotice(
            threat,
            "shield-alert",
            true
        );
    }

    if (
        containsBlockedLanguage(
            text
        )
    ) {
        clearPendingQuestion();

        return createNotice(
            getSecurity()
                ?.malUso
                ?.respuesta ||
            getMessage(
                "malUso"
            ),
            "shield-alert",
            true
        );
    }

    if (
        detectMechanicalDanger(
            text
        )
    ) {
        clearPendingQuestion();

        return `
            ${createNotice(
                getSecurity()
                    ?.mecanica
                    ?.respuesta ||
                "Ese problema puede requerir atención mecánica antes del detailing.",
                "triangle-alert",
                true
            )}

            ${createHumanSuggestion()}
        `;
    }

    if (
        detectHumanRequest(
            text
        )
    ) {
        clearPendingQuestion();

        return createHumanHandoffResponse();
    }

    if (
        detectPriceObjection(
            text
        )
    ) {
        return createPriceObjectionResponse();
    }

    if (
        detectHesitation(
            text
        )
    ) {
        return createHesitationResponse();
    }

    const contextual =
        handlePendingText(
            text
        );

    if (
        contextual
    ) {
        return contextual;
    }

    if (
        detectFarewell(
            text
        )
    ) {
        clearPendingQuestion();

        return escapeHTML(
            getMessage(
                "despedida"
            )
        );
    }

    if (
        detectGreeting(
            text
        )
    ) {
        return createGreetingResponse();
    }

    if (
        detectOwnerIntent(
            text
        )
    ) {
        clearPendingQuestion();

        return (
            `El propietario de PMC Auto Detailing es <strong>${escapeHTML(
                getBusinessData()
                    .propietario
            )}</strong>.`
        );
    }

    if (
        detectHistoryIntent(
            text
        )
    ) {
        clearPendingQuestion();

        return escapeHTML(
            getBusiness()
                ?.respuestasHistoria
                ?.media ||
            "PMC Auto Detailing abrió físicamente sus puertas el 15 de octubre de 2026, aunque la idea comenzó a desarrollarse desde antes."
        );
    }

    if (
        detectWhoIsDecua(
            text
        )
    ) {
        clearPendingQuestion();

        return escapeHTML(
            getBusiness()
                ?.decua
                ?.respuestaQuienEres ||
            "Soy Decua, Dedicado Al Cuidado Automotriz, el asistente digital de PMC Auto Detailing."
        );
    }

    if (
        detectContactIntent(
            text
        )
    ) {
        return createContactResponse();
    }

    if (
        detectAgendaIntent(
            text
        )
    ) {
        return createAgendaResponse();
    }

    if (
        detectCatalogIntent(
            text
        )
    ) {
        return createCatalogResponse();
    }

    if (
        detectPriceIntent(
            text
        )
    ) {
        clearPendingQuestion();

        return createPriceResponse();
    }

    const vehicle =
        parseVehicle(
            text
        );

    if (
        vehicle.brand ||
        vehicle.model ||
        vehicle.year ||
        vehicle.vehicleType
    ) {
        const classification =
            getAgeClassification();

        let intro =
            `Perfecto. Ya tomé en cuenta <strong>${escapeHTML(
                getVehicleSummary()
            )}</strong>.`;

        if (
            classification
                ?.nombre
        ) {
            intro +=
                `<br><br>Por su antigüedad entra de forma orientativa como <strong>${escapeHTML(
                    classification.nombre
                )}</strong>.`;
        }

        if (
            assistantState.age !==
                null &&
            assistantState.age <=
                1
        ) {
            intro +=
                "<br><br>Al ser un vehículo muy reciente, no tendría sentido recomendar una corrección fuerte sin saber primero qué quieres conseguir.";
        }

        return `
            ${intro}

            <br><br>

            ${askVehicleGoal()}
        `;
    }

    const intent =
        detectIntent(
            text
        );

    assistantState.lastIntent =
        intent ||
        assistantState.lastIntent;

    if (
        intent ===
        "pintura"
    ) {
        return askPaintIssue();
    }

    if (
        intent ===
        "proteccion"
    ) {
        assistantState.objective =
            "proteger";

        return askProtectionGoal();
    }

    if (
        intent ===
        "interior"
    ) {
        clearPendingQuestion();

        const list =
            findServices(
                [
                    "supreme interior",
                    "interior"
                ]
            );

        return createRecommendations(
            list,
            "Si el interior es lo que más te preocupa, puedo mostrarte las opciones publicadas relacionadas."
        );
    }

    if (
        intent ===
        "motor"
    ) {
        clearPendingQuestion();

        const list =
            findServices(
                [
                    "motor vapor",
                    "motor agua",
                    "detallado motor"
                ]
            );

        return createRecommendations(
            list,
            "PMC tiene opciones publicadas relacionadas con limpieza y detallado del compartimiento del motor."
        );
    }

    if (
        intent ===
        "chasis"
    ) {
        clearPendingQuestion();

        const list =
            findServices(
                [
                    "chasis",
                    "lavado chasis"
                ]
            );

        return createRecommendations(
            list,
            "Si buscas limpieza de la parte inferior del vehículo, estas son las opciones relacionadas."
        );
    }

    if (
        intent ===
        "faros"
    ) {
        clearPendingQuestion();

        const list =
            findServices(
                [
                    "faros",
                    "pulido faros"
                ]
            );

        return createRecommendations(
            list,
            "Si los faros están opacos o amarillentos, estas son las opciones relacionadas."
        );
    }

    if (
        intent ===
        "cristales"
    ) {
        clearPendingQuestion();

        const list =
            findServices(
                [
                    "vidrios",
                    "cristales"
                ]
            );

        return createRecommendations(
            list,
            "Si el problema está en vidrios o cristales, estas son las opciones relacionadas."
        );
    }

    if (
        intent ===
        "venta"
    ) {
        assistantState.objective =
            "vender";

        clearPendingQuestion();

        const list =
            findServices(
                [
                    "ready to sell",
                    "venta"
                ]
            );

        return createRecommendations(
            list,
            "Si quieres preparar el vehículo para venta, PMC tiene opciones orientadas a mejorar su presentación."
        );
    }

    if (
        !isRelevantMessage(
            text
        )
    ) {
        return createOffTopicResponse();
    }

    return `
        ${escapeHTML(
            getMessage(
                "sinEntender"
            )
        )}

        <br><br>

        ${askVehicleGoal()}
    `;
}

async function processMessage(
    text
) {
    const clean =
        String(
            text ||
            ""
        ).trim();

    if (
        !clean
    ) {
        return;
    }

    registerMessage(
        clean
    );

    addUserMessage(
        clean
    );

    if (
        pmcAssistantInput
    ) {
        pmcAssistantInput.value =
            "";

        resizeInput();
    }

    pmcAssistantSend.disabled =
        true;

    showTyping();

    try {
        if (
            detectSpam(
                clean
            )
        ) {
            await delay(
                250
            );

            removeTyping();

            addAssistantMessage(
                createNotice(
                    getSecurity()
                        ?.spam
                        ?.respuesta ||
                    "Parece que el mismo mensaje se está repitiendo.",
                    "message-circle-warning"
                )
            );

            return;
        }

        const response =
            await getAssistantResponse(
                clean
            );

        await delay(
            350
        );

        removeTyping();

        addAssistantMessage(
            response
        );
    } catch (error) {
        console.error(
            "Error de Decua:",
            error
        );

        removeTyping();

        addAssistantMessage(
            escapeHTML(
                getMessage(
                    "error"
                )
            )
        );
    } finally {
        pmcAssistantSend.disabled =
            false;

        pmcAssistantInput
            ?.focus();
    }
}

function resizeInput() {
    if (
        !pmcAssistantInput
    ) {
        return;
    }

    pmcAssistantInput
        .style
        .height =
        "auto";

    pmcAssistantInput
        .style
        .height =
        `${Math.min(
            pmcAssistantInput
                .scrollHeight,
            120
        )}px`;
}

function addPermanentHumanQuickAction() {
    if (
        !pmcAssistantQuickActions
    ) {
        return;
    }

    if (
        pmcAssistantQuickActions
            .querySelector(
                "[data-human-handoff]"
            )
    ) {
        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.setAttribute(
        "data-human-handoff",
        "true"
    );

    button.innerHTML = `
        <i data-lucide="headphones"></i>
        Hablar con una persona
    `;

    pmcAssistantQuickActions
        .appendChild(
            button
        );

    initIcons();
}

async function startConversation() {
    if (
        conversationStarted
    ) {
        return;
    }

    conversationStarted =
        true;

    showTyping();

    try {
        await Promise.all([
            loadKnowledge(),
            loadUserProfile(),
            loadServices()
        ]);

        addPermanentHumanQuickAction();

        await delay(
            300
        );

        removeTyping();

        addAssistantMessage(
            createGreetingResponse()
        );
    } catch (error) {
        console.error(
            "No se pudo iniciar Decua:",
            error
        );

        removeTyping();

        addAssistantMessage(
            createGreetingResponse()
        );
    }
}

function openAssistantPanel() {
    pmcAssistant
        ?.classList
        .add(
            "is-open"
        );

    pmcAssistant
        ?.setAttribute(
            "aria-hidden",
            "false"
        );

    document.body
        .classList
        .add(
            "pmc-assistant-open"
        );

    startConversation();

    setTimeout(
        () => {
            pmcAssistantInput
                ?.focus();
        },
        300
    );

    initIcons();
}

function closeAssistantPanel() {
    pmcAssistant
        ?.classList
        .remove(
            "is-open"
        );

    pmcAssistant
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body
        .classList
        .remove(
            "pmc-assistant-open"
        );
}

function handleHumanHandoffClick() {
    addUserMessage(
        "Quiero hablar con una persona de PMC"
    );

    showTyping();

    delay(
        250
    ).then(
        () => {
            removeTyping();

            addAssistantMessage(
                createHumanHandoffResponse()
            );
        }
    );
}

function handleContinueDecua() {
    addUserMessage(
        "Seguir con Decua"
    );

    addAssistantMessage(
        askVehicleGoal()
    );
}

function bindAssistant() {
    openAssistant
        ?.addEventListener(
            "click",
            openAssistantPanel
        );

    floatingAssistant
        ?.addEventListener(
            "click",
            openAssistantPanel
        );

    pmcAssistantBackdrop
        ?.addEventListener(
            "click",
            closeAssistantPanel
        );

    pmcAssistantClose
        ?.addEventListener(
            "click",
            closeAssistantPanel
        );

    pmcAssistantForm
        ?.addEventListener(
            "submit",
            (
                event
            ) => {
                event.preventDefault();

                processMessage(
                    pmcAssistantInput
                        ?.value
                );
            }
        );

    pmcAssistantInput
        ?.addEventListener(
            "input",
            resizeInput
        );

    pmcAssistantInput
        ?.addEventListener(
            "keydown",
            (
                event
            ) => {
                if (
                    event.key ===
                        "Enter" &&
                    !event.shiftKey
                ) {
                    event.preventDefault();

                    pmcAssistantForm
                        ?.requestSubmit();
                }
            }
        );

    pmcAssistantMessages
        ?.addEventListener(
            "click",
            (
                event
            ) => {
                const human =
                    event.target
                        .closest(
                            "[data-human-handoff]"
                        );

                if (
                    human
                ) {
                    handleHumanHandoffClick();

                    return;
                }

                const continueButton =
                    event.target
                        .closest(
                            "[data-continue-decua]"
                        );

                if (
                    continueButton
                ) {
                    handleContinueDecua();

                    return;
                }

                const option =
                    event.target
                        .closest(
                            "[data-option-id]"
                        );

                if (
                    !option
                ) {
                    return;
                }

                const pending =
                    assistantState
                        .pendingQuestion;

                if (
                    !pending
                ) {
                    return;
                }

                const optionId =
                    option
                        .dataset
                        .optionId;

                const selected =
                    pending
                        .options
                        .find(
                            (
                                item
                            ) =>
                                item.id ===
                                optionId
                        );

                if (
                    !selected
                ) {
                    return;
                }

                addUserMessage(
                    selected.label
                );

                pmcAssistantSend.disabled =
                    true;

                showTyping();

                delay(
                    250
                ).then(
                    () => {
                        removeTyping();

                        let response = "";

                        if (
                            pending.type ===
                                "price_objection" ||
                            pending.type ===
                                "hesitation"
                        ) {
                            response =
                                handleCommercialOption(
                                    selected,
                                    pending.type
                                );
                        } else {
                            response =
                                handlePendingOption(
                                    selected,
                                    pending
                                );
                        }

                        addAssistantMessage(
                            response
                        );

                        pmcAssistantSend.disabled =
                            false;
                    }
                );
            }
        );

    pmcAssistantQuickActions
        ?.addEventListener(
            "click",
            (
                event
            ) => {
                const human =
                    event.target
                        .closest(
                            "[data-human-handoff]"
                        );

                if (
                    human
                ) {
                    handleHumanHandoffClick();

                    return;
                }

                const button =
                    event.target
                        .closest(
                            "[data-assistant-message]"
                        );

                if (
                    !button
                ) {
                    return;
                }

                const message =
                    button
                        .dataset
                        .assistantMessage;

                if (
                    message
                ) {
                    processMessage(
                        message
                    );
                }
            }
        );

    document.addEventListener(
        "keydown",
        (
            event
        ) => {
            if (
                event.key ===
                    "Escape"
            ) {
                closeAssistantPanel();
            }
        }
    );
}

async function init() {
    await loadKnowledge();

    bindAssistant();

    addPermanentHumanQuickAction();

    initIcons();
}

document.addEventListener(
    "DOMContentLoaded",
    init
);