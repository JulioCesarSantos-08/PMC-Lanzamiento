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
    getDocs,
    query,
    where,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pageLoader = document.getElementById("pageLoader");
const siteHeader = document.getElementById("siteHeader");
const menuButton = document.getElementById("menuButton");
const menuClose = document.getElementById("menuClose");
const mobileMenu = document.getElementById("mobileMenu");
const menuBackdrop = mobileMenu?.querySelector(".mobile-menu__backdrop");
const mobileLinks = mobileMenu?.querySelectorAll("a");
const currentYear = document.getElementById("currentYear");

const agendaForm = document.getElementById("agendaForm");
const agendaSteps = document.querySelectorAll(".agenda-step");
const stepIndicators = document.querySelectorAll("[data-step-indicator]");

const agendaPrevious = document.getElementById("agendaPrevious");
const agendaNext = document.getElementById("agendaNext");
const agendaConfirm = document.getElementById("agendaConfirm");

const agendaServiceSearch = document.getElementById("agendaServiceSearch");
const agendaServices = document.getElementById("agendaServices");
const agendaServiceEmpty = document.getElementById("agendaServiceEmpty");

const vehicleType = document.getElementById("vehicleType");
const vehicleBrand = document.getElementById("vehicleBrand");
const vehicleModel = document.getElementById("vehicleModel");
const vehicleYear = document.getElementById("vehicleYear");
const vehicleColor = document.getElementById("vehicleColor");
const vehicleNotes = document.getElementById("vehicleNotes");

const previousMonth = document.getElementById("previousMonth");
const nextMonth = document.getElementById("nextMonth");
const calendarMonth = document.getElementById("calendarMonth");
const calendarDays = document.getElementById("calendarDays");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const availableTimes = document.getElementById("availableTimes");

const summaryService = document.getElementById("summaryService");
const summaryVehicle = document.getElementById("summaryVehicle");
const summaryDate = document.getElementById("summaryDate");
const summaryTime = document.getElementById("summaryTime");
const summaryPrice = document.getElementById("summaryPrice");

const confirmServiceName = document.getElementById("confirmServiceName");
const confirmServicePrice = document.getElementById("confirmServicePrice");
const confirmVehicle = document.getElementById("confirmVehicle");
const confirmVehicleType = document.getElementById("confirmVehicleType");
const confirmDate = document.getElementById("confirmDate");
const confirmTime = document.getElementById("confirmTime");

const DRAFT_KEY = "pmcAgendaDraft";

const fallbackAgendaConfig = {
    intervaloMinutos: 30,
    anticipacionHoras: 2,
    mesesDisponibles: 6,
    dias: {
        0: {
            activo: false,
            inicio: "09:00",
            fin: "18:00"
        },
        1: {
            activo: true,
            inicio: "09:00",
            fin: "18:00"
        },
        2: {
            activo: true,
            inicio: "09:00",
            fin: "18:00"
        },
        3: {
            activo: true,
            inicio: "09:00",
            fin: "18:00"
        },
        4: {
            activo: true,
            inicio: "09:00",
            fin: "18:00"
        },
        5: {
            activo: true,
            inicio: "09:00",
            fin: "18:00"
        },
        6: {
            activo: true,
            inicio: "09:00",
            fin: "18:00"
        }
    }
};

const fallbackServices = [
    {
        id: "lavado-basico-chasis-componentes",
        nombre: "Lavado básico de chasis y componentes",
        categoria: "Motor y chasis",
        descripcion:
            "Limpieza general con atención especial al motor, chasis y componentes.",
        precioDesde: 650,
        duracionMinutos: 120,
        precios: {
            hatchback: 650,
            sedan: 650,
            suv: 750,
            pickup: 850
        },
        activo: true,
        estado: "publicado",
        orden: 1
    },
    {
        id: "lavado-basico",
        nombre: "Lavado básico",
        categoria: "Lavado",
        descripcion:
            "Limpieza exterior e interior para mantener tu vehículo limpio y cuidado.",
        precioDesde: 180,
        duracionMinutos: 90,
        precios: {
            hatchback: 180,
            sedan: 200,
            suv: 250,
            pickup: 250,
            camioneta: 250
        },
        activo: true,
        estado: "publicado",
        orden: 2
    },
    {
        id: "detallado-motor-vapor",
        nombre: "Detallado de motor a base de vapor",
        categoria: "Motor y chasis",
        descripcion:
            "Limpieza especializada del compartimiento del motor utilizando vapor.",
        precioDesde: 500,
        duracionMinutos: 120,
        precios: {
            hatchback: 500,
            sedan: 500,
            suv: 700,
            pickup: 700,
            camioneta: 700
        },
        activo: true,
        estado: "publicado",
        orden: 3
    },
    {
        id: "limpieza-motor-agua",
        nombre: "Limpieza de motor a base de agua",
        categoria: "Motor y chasis",
        descripcion:
            "Limpieza y desengrase del compartimiento del motor con protección de componentes.",
        precioDesde: 500,
        duracionMinutos: 120,
        precios: {
            hatchback: 500,
            sedan: 500,
            suv: 700,
            pickup: 700,
            camioneta: 700
        },
        activo: true,
        estado: "publicado",
        orden: 4
    },
    {
        id: "pulido-basico",
        nombre: "Pulido básico",
        categoria: "Pintura",
        descripcion:
            "Corrección superficial, descontaminación y abrillantado de la pintura.",
        precioDesde: 2200,
        duracionMinutos: 300,
        precios: {
            hatchback: 2200,
            sedan: 2200,
            suv: 3000,
            pickup: 3000,
            camioneta: 3000
        },
        activo: true,
        estado: "publicado",
        orden: 5
    },
    {
        id: "correccion-basica-pintura",
        nombre: "Corrección básica de pintura",
        categoria: "Pintura",
        descripcion:
            "Corrección y nivelación del barniz hasta un 80% para recuperar brillo y acabado.",
        precioDesde: 3500,
        duracionMinutos: 480,
        precios: {
            hatchback: 3500,
            sedan: 3500,
            suv: 5000,
            pickup: 5000,
            camioneta: 5000
        },
        activo: true,
        estado: "publicado",
        orden: 6
    },
    {
        id: "pulido-faros",
        nombre: "Pulido de faros",
        categoria: "Pintura",
        descripcion:
            "Restauración de transparencia y brillo con protección cerámica.",
        precioDesde: 900,
        duracionMinutos: 120,
        precios: {
            hatchback: 900,
            sedan: 900,
            suv: 900,
            pickup: 900,
            camioneta: 900
        },
        activo: true,
        estado: "publicado",
        orden: 7
    },
    {
        id: "pulido-vidrios",
        nombre: "Pulido de vidrios",
        categoria: "Protección",
        descripcion:
            "Descontaminación y corrección de vidrios con recubrimiento cerámico.",
        precioDesde: 600,
        duracionMinutos: 180,
        precios: {
            hatchback: 600,
            sedan: 800,
            pickup: 1200
        },
        activo: true,
        estado: "publicado",
        orden: 8
    },
    {
        id: "ceramic-silver",
        nombre: "Ceramic Silver",
        categoria: "Cerámicos",
        descripcion:
            "Corrección de pintura al 80% y protección cerámica de 1 año.",
        precioDesde: 6500,
        duracionMinutos: 600,
        precios: {
            hatchback: 6500,
            sedan: 7000,
            suv: 8800,
            pickup: 10000
        },
        activo: true,
        estado: "publicado",
        orden: 9
    },
    {
        id: "ceramic-gold",
        nombre: "Ceramic Gold",
        categoria: "Cerámicos",
        descripcion:
            "Corrección de pintura al 90% y protección cerámica de 3 años.",
        precioDesde: 7500,
        duracionMinutos: 720,
        precios: {
            hatchback: 7500,
            sedan: 8000,
            suv: 10000,
            pickup: 11200
        },
        activo: true,
        estado: "publicado",
        orden: 10
    },
    {
        id: "ceramic-diamond",
        nombre: "Ceramic Diamond",
        categoria: "Cerámicos",
        descripcion:
            "Corrección de pintura al 95% y protección cerámica de 5 años.",
        precioDesde: 13500,
        duracionMinutos: 960,
        precios: {
            hatchback: 13500,
            sedan: 15500,
            suv: 20200,
            pickup: 22000
        },
        activo: true,
        estado: "publicado",
        orden: 11
    },
    {
        id: "aplicacion-ppf",
        nombre: "Aplicación de PPF",
        categoria: "PPF",
        descripcion:
            "Película de protección para conservar la pintura y proteger zonas de impacto.",
        precioDesde: 19200,
        duracionMinutos: 960,
        precios: {},
        activo: true,
        estado: "publicado",
        orden: 12
    },
    {
        id: "supreme-interior",
        nombre: "Supreme Interior",
        categoria: "Interior",
        descripcion:
            "Limpieza profunda y detallado completo del habitáculo.",
        precioDesde: 1700,
        duracionMinutos: 300,
        precios: {
            hatchback: 1700,
            sedan: 2200,
            suv: 2900,
            pickup: 3200
        },
        activo: true,
        estado: "publicado",
        orden: 13
    },
    {
        id: "ready-to-sell",
        nombre: "Ready to Sell",
        categoria: "Lavado",
        descripcion:
            "Preparación estética integral del vehículo antes de ponerlo en venta.",
        precioDesde: 2750,
        duracionMinutos: 360,
        precios: {
            hatchback: 2750,
            sedan: 3000,
            suv: 3300,
            pickup: 3500
        },
        activo: true,
        estado: "publicado",
        orden: 14
    }
];

let currentUser = null;
let currentStep = 1;
let services = [];
let filteredServices = [];
let selectedService = null;
let selectedDate = null;
let selectedTime = "";
let agendaConfig = fallbackAgendaConfig;
let calendarDate = startOfMonth(new Date());
let occupiedSlots = new Set();
let restoringDraft = false;
let submittingAppointment = false;

function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function hideLoader() {
    if (!pageLoader) {
        return;
    }

    window.setTimeout(() => {
        pageLoader.classList.add("is-hidden");
    }, 280);
}

function setCurrentYear() {
    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }
}

function openMobileMenu() {
    if (!mobileMenu || !menuButton) {
        return;
    }

    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
}

function closeMobileMenu() {
    if (!mobileMenu || !menuButton) {
        return;
    }

    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}

function toggleMobileMenu() {
    if (
        mobileMenu?.classList.contains("is-open")
    ) {
        closeMobileMenu();
    } else {
        openMobileMenu();
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
    const amount = Number(value);

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

function startOfMonth(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );
}

function endOfMonth(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
    );
}

function addMonths(date, amount) {
    return new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1
    );
}

function sameDate(a, b) {
    if (!a || !b) {
        return false;
    }

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function dateToKey(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
    const [
        year,
        month,
        day
    ] = String(value)
        .split("-")
        .map(Number);

    if (
        !year ||
        !month ||
        !day
    ) {
        return null;
    }

    return new Date(
        year,
        month - 1,
        day
    );
}

function minutesFromTime(time) {
    const [
        hours,
        minutes
    ] = String(time)
        .split(":")
        .map(Number);

    return (
        (hours || 0) * 60 +
        (minutes || 0)
    );
}

function timeFromMinutes(total) {
    const normalized =
        Math.max(
            0,
            total
        );

    const hours =
        Math.floor(
            normalized / 60
        );

    const minutes =
        normalized % 60;

    return (
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}`
    );
}

function addMinutesToTime(
    time,
    amount
) {
    return timeFromMinutes(
        minutesFromTime(time) +
        amount
    );
}

function formatTime(time) {
    const minutes =
        minutesFromTime(time);

    const date =
        new Date(
            2000,
            0,
            1,
            Math.floor(
                minutes / 60
            ),
            minutes % 60
        );

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}

function formatDateLong(date) {
    if (!date) {
        return "";
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

function formatDateShort(date) {
    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day: "numeric",
            month: "long"
        }
    ).format(date);
}

function capitalize(value) {
    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

function getServiceDuration(service) {
    const direct =
        Number(
            service?.duracionMinutos
        );

    if (
        Number.isFinite(direct) &&
        direct > 0
    ) {
        return direct;
    }

    if (
        typeof service?.duracion === "number" &&
        service.duracion > 0
    ) {
        return service.duracion;
    }

    const text =
        normalizeText(
            service?.duracionTexto ||
            service?.duracion ||
            ""
        );

    const hoursMatch =
        text.match(
            /(\d+(?:\.\d+)?)\s*h/
        );

    if (hoursMatch) {
        return Math.ceil(
            Number(
                hoursMatch[1]
            ) * 60
        );
    }

    const minuteMatch =
        text.match(
            /(\d+)\s*min/
        );

    if (minuteMatch) {
        return Number(
            minuteMatch[1]
        );
    }

    return 120;
}

function formatDuration(minutes) {
    const value =
        Number(minutes);

    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return "Por definir";
    }

    if (value < 60) {
        return `${value} min`;
    }

    const hours =
        Math.floor(
            value / 60
        );

    const remaining =
        value % 60;

    if (!remaining) {
        return `${hours} h`;
    }

    return (
        `${hours} h ` +
        `${remaining} min`
    );
}

function getVehicleLabel(value) {
    const labels = {
        hatchback: "Hatchback",
        sedan: "Sedán",
        suv: "SUV",
        pickup: "Pick-up",
        camioneta: "Camioneta",
        otro: "Otro"
    };

    return (
        labels[value] ||
        value ||
        "Vehículo"
    );
}

function getServicePrice(
    service,
    vehicle = ""
) {
    if (!service) {
        return null;
    }

    const prices =
        service.precios;

    if (
        prices &&
        !Array.isArray(prices) &&
        typeof prices === "object"
    ) {
        const aliases = {
            hatchback: [
                "hatchback"
            ],
            sedan: [
                "sedan",
                "sedán"
            ],
            suv: [
                "suv"
            ],
            pickup: [
                "pickup",
                "pick_up",
                "pick-up"
            ],
            camioneta: [
                "camioneta",
                "camionetas",
                "camioneta_cerrada",
                "camionetas_cerradas",
                "suv"
            ]
        };

        const possibleKeys =
            aliases[vehicle] || [
                vehicle
            ];

        for (
            const key of possibleKeys
        ) {
            if (
                prices[key] != null
            ) {
                const value =
                    prices[key];

                if (
                    typeof value ===
                    "number"
                ) {
                    return value;
                }

                if (
                    value &&
                    typeof value ===
                    "object"
                ) {
                    return (
                        value.desde ??
                        value.min ??
                        value.precio ??
                        null
                    );
                }
            }
        }
    }

    if (
        Array.isArray(
            prices
        )
    ) {
        const requested =
            normalizeText(
                getVehicleLabel(
                    vehicle
                )
            );

        const entry =
            prices.find(
                (item) => {
                    const name =
                        normalizeText(
                            item.vehiculo ||
                            item.tipo ||
                            item.nombre
                        );

                    return (
                        name.includes(
                            requested
                        ) ||
                        requested.includes(
                            name
                        )
                    );
                }
            );

        if (entry) {
            const value =
                entry.precio ??
                entry.valor ??
                entry.monto;

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
                    .replaceAll(",", "")
                    .match(/\d+/);

            if (match) {
                return Number(
                    match[0]
                );
            }
        }
    }

    const direct =
        Number(
            service.precioDesde ??
            service.precio
        );

    if (
        Number.isFinite(direct) &&
        direct > 0
    ) {
        return direct;
    }

    return null;
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

function getServiceIdFromUrl() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("servicio") ||
        ""
    ).trim();
}

function normalizeService(snapshot) {
    return {
        id: snapshot.id,
        ...snapshot.data()
    };
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
                    normalizeService
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

    filteredServices = [
        ...services
    ];

    renderServices();

    selectServiceFromUrl();
}

async function loadAgendaConfig() {
    try {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "configuracion",
                    "agenda"
                )
            );

        if (
            snapshot.exists()
        ) {
            const data =
                snapshot.data();

            agendaConfig = {
                ...fallbackAgendaConfig,
                ...data,
                dias: {
                    ...fallbackAgendaConfig.dias,
                    ...(data.dias || {})
                }
            };

            return;
        }
    } catch (error) {
        console.error(
            "No se pudo cargar la configuración de agenda:",
            error
        );
    }

    agendaConfig =
        fallbackAgendaConfig;
}

function renderServices() {
    if (!agendaServices) {
        return;
    }

    agendaServices.innerHTML = "";

    if (
        !filteredServices.length
    ) {
        agendaServices.hidden =
            true;

        agendaServiceEmpty.hidden =
            false;

        return;
    }

    agendaServices.hidden =
        false;

    agendaServiceEmpty.hidden =
        true;

    const fragment =
        document.createDocumentFragment();

    filteredServices.forEach(
        (service) => {
            const card =
                document.createElement(
                    "button"
                );

            card.type = "button";

            card.className =
                "agenda-service-card";

            if (
                selectedService?.id ===
                service.id
            ) {
                card.classList.add(
                    "is-selected"
                );
            }

            const duration =
                getServiceDuration(
                    service
                );

            const price =
                getServicePrice(
                    service,
                    vehicleType?.value
                );

            card.innerHTML = `
                <div class="agenda-service-card__top">

                    <div>

                        <span class="agenda-service-card__category">
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

                    </div>

                    <span class="agenda-service-card__check">
                        <i data-lucide="check"></i>
                    </span>

                </div>

                <div class="agenda-service-card__bottom">

                    <div class="agenda-service-card__price">

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

                    <span class="agenda-service-card__duration">
                        <i data-lucide="clock-3"></i>

                        ${formatDuration(
                            duration
                        )}
                    </span>

                </div>
            `;

            card.addEventListener(
                "click",
                () => {
                    selectService(
                        service
                    );
                }
            );

            fragment.appendChild(
                card
            );
        }
    );

    agendaServices.appendChild(
        fragment
    );

    initIcons();
}

function selectService(service) {
    selectedService =
        service;

    selectedDate =
        null;

    selectedTime =
        "";

    occupiedSlots.clear();

    renderServices();
    updateSummary();
    updateNavigation();
    renderCalendar();
    saveDraft();
}

function selectServiceFromUrl() {
    const requested =
        getServiceIdFromUrl();

    if (!requested) {
        return;
    }

    const service =
        services.find(
            (item) =>
                item.id === requested ||
                item.slug === requested
        );

    if (
        service &&
        selectedService?.id !==
        service.id
    ) {
        selectService(
            service
        );
    }
}

function handleServiceSearch(event) {
    const term =
        normalizeText(
            event.target.value
        );

    filteredServices =
        services.filter(
            (service) => {
                const haystack =
                    normalizeText(
                        [
                            service.nombre,
                            service.descripcion,
                            service.descripcionCorta,
                            getServiceCategory(
                                service
                            )
                        ]
                            .filter(Boolean)
                            .join(" ")
                    );

                return haystack.includes(
                    term
                );
            }
        );

    renderServices();
}

function vehicleIsValid() {
    const year =
        Number(
            vehicleYear?.value
        );

    return Boolean(
        vehicleType?.value &&
        vehicleBrand?.value.trim() &&
        vehicleModel?.value.trim() &&
        Number.isInteger(year) &&
        year >= 1950 &&
        year <= 2030
    );
}

function getVehicleData() {
    return {
        tipo:
            vehicleType?.value ||
            "",
        marca:
            vehicleBrand?.value
                .trim() ||
            "",
        modelo:
            vehicleModel?.value
                .trim() ||
            "",
        anio:
            Number(
                vehicleYear?.value
            ) ||
            null,
        color:
            vehicleColor?.value
                .trim() ||
            "",
        notas:
            vehicleNotes?.value
                .trim() ||
            ""
    };
}

function updateSummary() {
    if (
        selectedService
    ) {
        summaryService.textContent =
            selectedService.nombre ||
            "Servicio PMC";
    } else {
        summaryService.textContent =
            "Sin seleccionar";
    }

    const vehicle =
        getVehicleData();

    if (
        vehicle.marca ||
        vehicle.modelo
    ) {
        summaryVehicle.textContent =
            [
                vehicle.marca,
                vehicle.modelo,
                vehicle.anio
            ]
                .filter(Boolean)
                .join(" ");
    } else {
        summaryVehicle.textContent =
            "Sin registrar";
    }

    summaryDate.textContent =
        selectedDate
            ? capitalize(
                formatDateShort(
                    selectedDate
                )
            )
            : "Sin seleccionar";

    summaryTime.textContent =
        selectedTime
            ? formatTime(
                selectedTime
            )
            : "Sin seleccionar";

    const price =
        getServicePrice(
            selectedService,
            vehicle.tipo
        );

    summaryPrice.textContent =
        price
            ? `Desde ${formatCurrency(
                price
            )}`
            : selectedService
                ? "Cotizar"
                : "-";
}

function updateConfirmation() {
    const vehicle =
        getVehicleData();

    const price =
        getServicePrice(
            selectedService,
            vehicle.tipo
        );

    confirmServiceName.textContent =
        selectedService?.nombre ||
        "-";

    confirmServicePrice.textContent =
        price
            ? `Estimado desde ${formatCurrency(
                price
            )}`
            : "Precio sujeto a cotización";

    confirmVehicle.textContent =
        [
            vehicle.marca,
            vehicle.modelo,
            vehicle.anio
        ]
            .filter(Boolean)
            .join(" ") ||
        "-";

    confirmVehicleType.textContent =
        getVehicleLabel(
            vehicle.tipo
        );

    confirmDate.textContent =
        selectedDate
            ? capitalize(
                formatDateLong(
                    selectedDate
                )
            )
            : "-";

    confirmTime.textContent =
        selectedTime
            ? formatTime(
                selectedTime
            )
            : "-";
}

function stepIsValid(step) {
    if (
        step === 1
    ) {
        return Boolean(
            selectedService
        );
    }

    if (
        step === 2
    ) {
        return vehicleIsValid();
    }

    if (
        step === 3
    ) {
        return Boolean(
            selectedDate &&
            selectedTime
        );
    }

    return true;
}

function updateNavigation() {
    agendaPrevious.hidden =
        currentStep === 1;

    agendaNext.hidden =
        currentStep === 4;

    agendaConfirm.hidden =
        currentStep !== 4;

    agendaNext.disabled =
        !stepIsValid(
            currentStep
        );

    stepIndicators.forEach(
        (indicator) => {
            const step =
                Number(
                    indicator.dataset
                        .stepIndicator
                );

            indicator.classList.toggle(
                "is-active",
                step === currentStep
            );

            indicator.classList.toggle(
                "is-complete",
                step < currentStep
            );
        }
    );
}

function showStep(step) {
    currentStep =
        Math.min(
            4,
            Math.max(
                1,
                Number(step)
            )
        );

    agendaSteps.forEach(
        (section) => {
            const sectionStep =
                Number(
                    section.dataset.step
                );

            const active =
                sectionStep ===
                currentStep;

            section.hidden =
                !active;

            section.classList.toggle(
                "is-active",
                active
            );
        }
    );

    if (
        currentStep === 3
    ) {
        renderCalendar();

        if (
            selectedDate
        ) {
            loadAvailableTimes(
                selectedDate
            );
        }
    }

    if (
        currentStep === 4
    ) {
        updateConfirmation();
    }

    updateSummary();
    updateNavigation();
    saveDraft();

    window.scrollTo({
        top:
            document.querySelector(
                ".agenda-section"
            )?.offsetTop -
            70,
        behavior:
            "smooth"
    });
}

function goNext() {
    if (
        !stepIsValid(
            currentStep
        )
    ) {
        return;
    }

    showStep(
        currentStep + 1
    );
}

function goPrevious() {
    showStep(
        currentStep - 1
    );
}

function getDayConfig(date) {
    const day =
        date.getDay();

    const config =
        agendaConfig.dias?.[day] ??
        agendaConfig.dias?.[
            String(day)
        ];

    if (!config) {
        return {
            activo: false,
            inicio: "09:00",
            fin: "18:00"
        };
    }

    return config;
}

function isBlockedDate(date) {
    const blocked =
        agendaConfig.fechasBloqueadas;

    if (
        !Array.isArray(
            blocked
        )
    ) {
        return false;
    }

    return blocked.includes(
        dateToKey(
            date
        )
    );
}

function isDateAvailable(date) {
    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const candidate =
        new Date(date);

    candidate.setHours(
        0,
        0,
        0,
        0
    );

    if (
        candidate < today
    ) {
        return false;
    }

    if (
        isBlockedDate(
            candidate
        )
    ) {
        return false;
    }

    const maxDate =
        addMonths(
            startOfMonth(
                new Date()
            ),
            Number(
                agendaConfig
                    .mesesDisponibles ??
                6
            ) + 1
        );

    if (
        candidate >= maxDate
    ) {
        return false;
    }

    const dayConfig =
        getDayConfig(
            candidate
        );

    return (
        dayConfig?.activo ===
        true
    );
}

function renderCalendar() {
    if (
        !calendarDays ||
        !calendarMonth
    ) {
        return;
    }

    const monthStart =
        startOfMonth(
            calendarDate
        );

    const monthEnd =
        endOfMonth(
            calendarDate
        );

    calendarMonth.textContent =
        capitalize(
            new Intl.DateTimeFormat(
                "es-MX",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(
                calendarDate
            )
        );

    const firstWeekday =
        monthStart.getDay();

    const daysInMonth =
        monthEnd.getDate();

    calendarDays.innerHTML =
        "";

    const previousMonthEnd =
        new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            0
        );

    const previousDays =
        previousMonthEnd.getDate();

    for (
        let index =
            firstWeekday - 1;
        index >= 0;
        index--
    ) {
        const day =
            previousDays -
            index;

        const date =
            new Date(
                monthStart.getFullYear(),
                monthStart.getMonth() - 1,
                day
            );

        calendarDays.appendChild(
            createCalendarDay(
                date,
                true
            )
        );
    }

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        const date =
            new Date(
                monthStart.getFullYear(),
                monthStart.getMonth(),
                day
            );

        calendarDays.appendChild(
            createCalendarDay(
                date,
                false
            )
        );
    }

    const totalRendered =
        calendarDays.children.length;

    const remaining =
        totalRendered <= 35
            ? 35 - totalRendered
            : 42 - totalRendered;

    for (
        let day = 1;
        day <= remaining;
        day++
    ) {
        const date =
            new Date(
                monthStart.getFullYear(),
                monthStart.getMonth() + 1,
                day
            );

        calendarDays.appendChild(
            createCalendarDay(
                date,
                true
            )
        );
    }

    updateMonthButtons();
}

function createCalendarDay(
    date,
    outside
) {
    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "calendar-day";

    button.textContent =
        String(
            date.getDate()
        );

    if (outside) {
        button.classList.add(
            "is-outside"
        );
    }

    if (
        sameDate(
            date,
            new Date()
        )
    ) {
        button.classList.add(
            "is-today"
        );
    }

    if (
        selectedDate &&
        sameDate(
            date,
            selectedDate
        )
    ) {
        button.classList.add(
            "is-selected"
        );
    }

    if (
        isBlockedDate(
            date
        )
    ) {
        button.classList.add(
            "is-blocked"
        );
    }

    if (
        !isDateAvailable(
            date
        ) ||
        outside
    ) {
        button.disabled =
            true;
    }

    button.addEventListener(
        "click",
        () => {
            selectDate(
                date
            );
        }
    );

    return button;
}

function updateMonthButtons() {
    const current =
        startOfMonth(
            new Date()
        );

    const difference =
        (
            calendarDate.getFullYear() -
            current.getFullYear()
        ) *
            12 +
        (
            calendarDate.getMonth() -
            current.getMonth()
        );

    previousMonth.disabled =
        difference <= 0;

    nextMonth.disabled =
        difference >=
        Number(
            agendaConfig
                .mesesDisponibles ??
            6
        ) -
            1;
}

async function selectDate(date) {
    selectedDate =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    selectedTime =
        "";

    renderCalendar();
    updateSummary();
    updateNavigation();
    saveDraft();

    await loadAvailableTimes(
        selectedDate
    );
}

async function loadOccupiedSlots(
    dateKey
) {
    occupiedSlots =
        new Set();

    try {
        const slotsQuery =
            query(
                collection(
                    db,
                    "agendaSlots"
                ),
                where(
                    "fechaKey",
                    "==",
                    dateKey
                )
            );

        const snapshot =
            await getDocs(
                slotsQuery
            );

        snapshot.docs.forEach(
            (
                documentSnapshot
            ) => {
                const data =
                    documentSnapshot.data();

                if (
                    data.estado ===
                    "ocupado"
                ) {
                    occupiedSlots.add(
                        data.hora
                    );
                }
            }
        );
    } catch (error) {
        console.error(
            "No se pudieron consultar los horarios ocupados:",
            error
        );
    }
}

function getRequiredSlots(
    startTime,
    duration
) {
    const interval =
        Number(
            agendaConfig
                .intervaloMinutos ??
            30
        );

    const count =
        Math.ceil(
            duration /
            interval
        );

    const slots = [];

    for (
        let index = 0;
        index < count;
        index++
    ) {
        slots.push(
            addMinutesToTime(
                startTime,
                index *
                    interval
            )
        );
    }

    return slots;
}

function slotIsFree(
    startTime,
    duration
) {
    return getRequiredSlots(
        startTime,
        duration
    ).every(
        (slot) =>
            !occupiedSlots.has(
                slot
            )
    );
}

function slotRespectsAdvance(
    date,
    time
) {
    const minutes =
        minutesFromTime(
            time
        );

    const candidate =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            Math.floor(
                minutes / 60
            ),
            minutes % 60
        );

    const minimum =
        new Date(
            Date.now() +
            Number(
                agendaConfig
                    .anticipacionHoras ??
                2
            ) *
                60 *
                60 *
                1000
        );

    return (
        candidate >= minimum
    );
}

function generateAvailableTimes(
    date
) {
    if (
        !selectedService
    ) {
        return [];
    }

    const dayConfig =
        getDayConfig(
            date
        );

    if (
        !dayConfig?.activo
    ) {
        return [];
    }

    const start =
        minutesFromTime(
            dayConfig.inicio
        );

    const end =
        minutesFromTime(
            dayConfig.fin
        );

    const interval =
        Number(
            agendaConfig
                .intervaloMinutos ??
            30
        );

    const duration =
        getServiceDuration(
            selectedService
        );

    const times = [];

    for (
        let minute = start;
        minute + duration <= end;
        minute += interval
    ) {
        const time =
            timeFromMinutes(
                minute
            );

        if (
            !slotRespectsAdvance(
                date,
                time
            )
        ) {
            continue;
        }

        if (
            !slotIsFree(
                time,
                duration
            )
        ) {
            continue;
        }

        times.push(time);
    }

    return times;
}

async function loadAvailableTimes(
    date
) {
    if (
        !availableTimes ||
        !selectedDateLabel
    ) {
        return;
    }

    selectedDateLabel.textContent =
        capitalize(
            formatDateLong(
                date
            )
        );

    availableTimes.innerHTML = `
        <div class="agenda-times__empty">

            <i data-lucide="loader-circle"></i>

            <span>
                Consultando disponibilidad...
            </span>

        </div>
    `;

    initIcons();

    await loadOccupiedSlots(
        dateToKey(
            date
        )
    );

    const times =
        generateAvailableTimes(
            date
        );

    if (
        selectedTime &&
        !times.includes(
            selectedTime
        )
    ) {
        selectedTime = "";

        updateSummary();
        updateNavigation();
        saveDraft();
    }

    if (!times.length) {
        availableTimes.innerHTML = `
            <div class="agenda-times__empty">

                <i data-lucide="calendar-x-2"></i>

                <span>
                    No hay horarios disponibles para esta fecha.
                </span>

            </div>
        `;

        initIcons();
        updateNavigation();

        return;
    }

    availableTimes.innerHTML =
        "";

    times.forEach(
        (time) => {
            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "agenda-time-button";

            button.textContent =
                formatTime(time);

            if (
                selectedTime ===
                time
            ) {
                button.classList.add(
                    "is-selected"
                );
            }

            button.addEventListener(
                "click",
                () => {
                    selectTime(
                        time
                    );
                }
            );

            availableTimes.appendChild(
                button
            );
        }
    );
}

function selectTime(time) {
    selectedTime =
        time;

    availableTimes
        .querySelectorAll(
            ".agenda-time-button"
        )
        .forEach(
            (button) => {
                button.classList.toggle(
                    "is-selected",
                    button.textContent ===
                        formatTime(time)
                );
            }
        );

    updateSummary();
    updateNavigation();
    saveDraft();
}

function changeMonth(amount) {
    calendarDate =
        addMonths(
            calendarDate,
            amount
        );

    renderCalendar();
}

function saveDraft() {
    if (
        restoringDraft
    ) {
        return;
    }

    const draft = {
        paso:
            currentStep,
        servicioId:
            selectedService?.id ||
            selectedService?.slug ||
            "",
        vehiculo:
            getVehicleData(),
        fecha:
            selectedDate
                ? dateToKey(
                    selectedDate
                )
                : "",
        hora:
            selectedTime
    };

    sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(
            draft
        )
    );
}

function getDraft() {
    try {
        const raw =
            sessionStorage.getItem(
                DRAFT_KEY
            );

        if (!raw) {
            return null;
        }

        return JSON.parse(
            raw
        );
    } catch {
        return null;
    }
}

async function restoreDraft() {
    const draft =
        getDraft();

    if (!draft) {
        return;
    }

    restoringDraft =
        true;

    const requestedService =
        getServiceIdFromUrl();

    if (
        !requestedService &&
        draft.servicioId
    ) {
        const service =
            services.find(
                (item) =>
                    item.id ===
                        draft.servicioId ||
                    item.slug ===
                        draft.servicioId
            );

        if (service) {
            selectedService =
                service;
        }
    }

    const vehicle =
        draft.vehiculo ||
        {};

    if (vehicleType) {
        vehicleType.value =
            vehicle.tipo ||
            "";
    }

    if (vehicleBrand) {
        vehicleBrand.value =
            vehicle.marca ||
            "";
    }

    if (vehicleModel) {
        vehicleModel.value =
            vehicle.modelo ||
            "";
    }

    if (vehicleYear) {
        vehicleYear.value =
            vehicle.anio ||
            "";
    }

    if (vehicleColor) {
        vehicleColor.value =
            vehicle.color ||
            "";
    }

    if (vehicleNotes) {
        vehicleNotes.value =
            vehicle.notas ||
            "";
    }

    if (
        draft.fecha
    ) {
        selectedDate =
            parseDateKey(
                draft.fecha
            );

        if (
            selectedDate
        ) {
            calendarDate =
                startOfMonth(
                    selectedDate
                );
        }
    }

    selectedTime =
        draft.hora ||
        "";

    const requestedStep =
        Number(
            draft.paso ||
            1
        );

    if (
        selectedService &&
        vehicleIsValid() &&
        selectedDate &&
        selectedTime
    ) {
        currentStep =
            currentUser
                ? 4
                : Math.min(
                    requestedStep,
                    4
                );
    } else {
        currentStep =
            Math.min(
                requestedStep,
                3
            );
    }

    restoringDraft =
        false;

    renderServices();

    showStep(
        currentStep
    );

    if (
        selectedDate
    ) {
        await loadAvailableTimes(
            selectedDate
        );
    }
}

function getAppointmentPrice() {
    const vehicle =
        getVehicleData();

    return getServicePrice(
        selectedService,
        vehicle.tipo
    );
}

function getAppointmentEndTime() {
    if (
        !selectedService ||
        !selectedTime
    ) {
        return "";
    }

    return addMinutesToTime(
        selectedTime,
        getServiceDuration(
            selectedService
        )
    );
}

function buildAppointmentData(
    reservedSlots
) {
    const vehicle =
        getVehicleData();

    return {
        clienteUid:
            currentUser.uid,
        clienteEmail:
            currentUser.email ||
            "",
        servicioId:
            selectedService.id,
        servicioNombre:
            selectedService.nombre,
        categoria:
            getServiceCategory(
                selectedService
            ),
        vehiculo:
            vehicle,
        fechaKey:
            dateToKey(
                selectedDate
            ),
        horaInicio:
            selectedTime,
        horaFin:
            getAppointmentEndTime(),
        duracionMinutos:
            getServiceDuration(
                selectedService
            ),
        slotsReservados:
            reservedSlots,
        precioEstimado:
            getAppointmentPrice(),
        estado:
            "agendada",
        origen:
            "web",
        pagoEstado:
            "pendiente",
        creadoEn:
            serverTimestamp(),
        actualizadoEn:
            serverTimestamp()
    };
}

function getSlotDocumentId(
    dateKey,
    time
) {
    return (
        `${dateKey}_` +
        time.replace(
            ":",
            ""
        )
    );
}

async function createAppointment() {
    if (
        !currentUser ||
        !selectedService ||
        !selectedDate ||
        !selectedTime
    ) {
        return null;
    }

    const duration =
        getServiceDuration(
            selectedService
        );

    const dateKey =
        dateToKey(
            selectedDate
        );

    const requiredSlots =
        getRequiredSlots(
            selectedTime,
            duration
        );

    const appointmentRef =
        doc(
            collection(
                db,
                "citas"
            )
        );

    await runTransaction(
        db,
        async (
            transaction
        ) => {
            const slotRefs =
                requiredSlots.map(
                    (time) =>
                        doc(
                            db,
                            "agendaSlots",
                            getSlotDocumentId(
                                dateKey,
                                time
                            )
                        )
                );

            const slotSnapshots =
                [];

            for (
                const slotRef of
                slotRefs
            ) {
                const snapshot =
                    await transaction.get(
                        slotRef
                    );

                slotSnapshots.push(
                    snapshot
                );
            }

            const occupied =
                slotSnapshots.some(
                    (snapshot) =>
                        snapshot.exists() &&
                        snapshot.data()
                            .estado ===
                            "ocupado"
                );

            if (occupied) {
                throw new Error(
                    "HORARIO_OCUPADO"
                );
            }

            transaction.set(
                appointmentRef,
                buildAppointmentData(
                    requiredSlots
                )
            );

            slotRefs.forEach(
                (
                    slotRef,
                    index
                ) => {
                    transaction.set(
                        slotRef,
                        {
                            fechaKey:
                                dateKey,
                            hora:
                                requiredSlots[
                                    index
                                ],
                            estado:
                                "ocupado",
                            creadoEn:
                                serverTimestamp(),
                            actualizadoEn:
                                serverTimestamp()
                        }
                    );
                }
            );
        }
    );

    return appointmentRef.id;
}

async function handleSubmit(
    event
) {
    event.preventDefault();

    if (
        submittingAppointment
    ) {
        return;
    }

    if (
        !selectedService ||
        !vehicleIsValid() ||
        !selectedDate ||
        !selectedTime
    ) {
        return;
    }

    saveDraft();

    if (!currentUser) {
        const returnUrl =
            `agenda.html?servicio=${encodeURIComponent(
                selectedService.id
            )}`;

        sessionStorage.setItem(
            "pmcLoginReturn",
            returnUrl
        );

        window.location.href =
            `login.html?return=${encodeURIComponent(
                returnUrl
            )}`;

        return;
    }

    submittingAppointment =
        true;

    agendaConfirm.disabled =
        true;

    agendaConfirm.innerHTML = `
        Registrando cita...
        <i data-lucide="loader-circle"></i>
    `;

    initIcons();

    try {
        if (
            !isDateAvailable(
                selectedDate
            )
        ) {
            throw new Error(
                "FECHA_NO_DISPONIBLE"
            );
        }

        await loadOccupiedSlots(
            dateToKey(
                selectedDate
            )
        );

        const currentAvailableTimes =
            generateAvailableTimes(
                selectedDate
            );

        if (
            !currentAvailableTimes.includes(
                selectedTime
            )
        ) {
            throw new Error(
                "HORARIO_OCUPADO"
            );
        }

        const appointmentId =
            await createAppointment();

        sessionStorage.removeItem(
            DRAFT_KEY
        );

        sessionStorage.setItem(
            "pmcLastAppointmentId",
            appointmentId
        );

        window.location.href =
            `cuenta.html?cita=${encodeURIComponent(
                appointmentId
            )}`;
    } catch (error) {
        console.error(
            "No se pudo registrar la cita:",
            error
        );

        if (
            error.message ===
            "HORARIO_OCUPADO"
        ) {
            selectedTime =
                "";

            await loadAvailableTimes(
                selectedDate
            );

            showStep(3);

            window.alert(
                "Ese horario ya no está disponible. Selecciona otro horario."
            );
        } else if (
            error.message ===
            "FECHA_NO_DISPONIBLE"
        ) {
            selectedDate =
                null;

            selectedTime =
                "";

            showStep(3);

            window.alert(
                "La fecha seleccionada ya no está disponible. Selecciona otra fecha."
            );
        } else {
            window.alert(
                "No se pudo registrar la cita. Revisa tu conexión e inténtalo nuevamente."
            );
        }
    } finally {
        submittingAppointment =
            false;

        agendaConfirm.disabled =
            false;

        agendaConfirm.innerHTML = `
            Confirmar cita
            <i data-lucide="calendar-check-2"></i>
        `;

        initIcons();
    }
}

function handleVehicleChange() {
    if (
        selectedService
    ) {
        renderServices();
    }

    updateSummary();
    updateNavigation();
    saveDraft();
}

function bindVehicleFields() {
    [
        vehicleType,
        vehicleBrand,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        vehicleNotes
    ].forEach(
        (field) => {
            field?.addEventListener(
                "input",
                handleVehicleChange
            );

            field?.addEventListener(
                "change",
                handleVehicleChange
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
}

function bindAgenda() {
    agendaServiceSearch?.addEventListener(
        "input",
        handleServiceSearch
    );

    agendaPrevious?.addEventListener(
        "click",
        goPrevious
    );

    agendaNext?.addEventListener(
        "click",
        goNext
    );

    previousMonth?.addEventListener(
        "click",
        () => {
            changeMonth(-1);
        }
    );

    nextMonth?.addEventListener(
        "click",
        () => {
            changeMonth(1);
        }
    );

    agendaForm?.addEventListener(
        "submit",
        handleSubmit
    );

    bindVehicleFields();
}

function watchAuth() {
    return new Promise(
        (resolve) => {
            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {
                        currentUser =
                            user ||
                            null;

                        unsubscribe();

                        resolve();
                    },
                    () => {
                        currentUser =
                            null;

                        unsubscribe();

                        resolve();
                    }
                );
        }
    );
}

async function init() {
    initIcons();
    setCurrentYear();

    bindNavigation();
    bindAgenda();

    await Promise.all([
        watchAuth(),
        loadAgendaConfig()
    ]);

    await loadServices();

    await restoreDraft();

    selectServiceFromUrl();

    renderCalendar();
    updateSummary();
    updateNavigation();
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