import {
    auth,
    db
} from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc
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

const saveConfigurationButton =
    document.getElementById("saveConfigurationButton");

const saveConfigurationButtonHero =
    document.getElementById("saveConfigurationButtonHero");

const saveConfigurationButtonSidebar =
    document.getElementById("saveConfigurationButtonSidebar");

const configAgendaInterval =
    document.getElementById("configAgendaInterval");

const configAgendaAdvance =
    document.getElementById("configAgendaAdvance");

const configAgendaMonths =
    document.getElementById("configAgendaMonths");

const configTimezone =
    document.getElementById("configTimezone");

const blockedDateInput =
    document.getElementById("blockedDateInput");

const blockedDateReason =
    document.getElementById("blockedDateReason");

const addBlockedDateButton =
    document.getElementById("addBlockedDateButton");

const blockedDatesList =
    document.getElementById("blockedDatesList");

const configBusinessName =
    document.getElementById("configBusinessName");

const configBusinessPhone =
    document.getElementById("configBusinessPhone");

const configBusinessEmail =
    document.getElementById("configBusinessEmail");

const configBusinessInstagram =
    document.getElementById("configBusinessInstagram");

const configBusinessMaps =
    document.getElementById("configBusinessMaps");

const adminToast =
    document.getElementById("adminToast");

const dayElements = {
    lunes: {
        article:
            document.querySelector('[data-day="lunes"]'),
        active:
            document.getElementById("configMondayActive"),
        open:
            document.getElementById("configMondayOpen"),
        close:
            document.getElementById("configMondayClose")
    },
    martes: {
        article:
            document.querySelector('[data-day="martes"]'),
        active:
            document.getElementById("configTuesdayActive"),
        open:
            document.getElementById("configTuesdayOpen"),
        close:
            document.getElementById("configTuesdayClose")
    },
    miercoles: {
        article:
            document.querySelector('[data-day="miercoles"]'),
        active:
            document.getElementById("configWednesdayActive"),
        open:
            document.getElementById("configWednesdayOpen"),
        close:
            document.getElementById("configWednesdayClose")
    },
    jueves: {
        article:
            document.querySelector('[data-day="jueves"]'),
        active:
            document.getElementById("configThursdayActive"),
        open:
            document.getElementById("configThursdayOpen"),
        close:
            document.getElementById("configThursdayClose")
    },
    viernes: {
        article:
            document.querySelector('[data-day="viernes"]'),
        active:
            document.getElementById("configFridayActive"),
        open:
            document.getElementById("configFridayOpen"),
        close:
            document.getElementById("configFridayClose")
    },
    sabado: {
        article:
            document.querySelector('[data-day="sabado"]'),
        active:
            document.getElementById("configSaturdayActive"),
        open:
            document.getElementById("configSaturdayOpen"),
        close:
            document.getElementById("configSaturdayClose")
    },
    domingo: {
        article:
            document.querySelector('[data-day="domingo"]'),
        active:
            document.getElementById("configSundayActive"),
        open:
            document.getElementById("configSundayOpen"),
        close:
            document.getElementById("configSundayClose")
    }
};

const DEFAULT_AGENDA = {
    intervaloMinutos: 30,
    anticipacionMinutos: 120,
    mesesDisponibles: 6,
    zonaHoraria: "America/Mexico_City",
    horarios: {
        lunes: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        martes: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        miercoles: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        jueves: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        viernes: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        sabado: {
            activo: true,
            apertura: "09:00",
            cierre: "18:00"
        },
        domingo: {
            activo: false,
            apertura: "09:00",
            cierre: "18:00"
        }
    },
    fechasBloqueadas: [],
    motivosFechasBloqueadas: {}
};

const DEFAULT_GENERAL = {
    nombre: "PMC Auto Detailing",
    telefono: "9542038099",
    email: "PMC.Auto.Detailing@outlook.com",
    instagram: "@pmcautodetailing",
    mapsUrl: "https://maps.app.goo.gl/3gQFe95HU2uQ6BZU6"
};

let currentUser = null;
let currentUserData = null;

let agendaData = {};
let generalData = {};

let blockedDates = [];
let blockedReasons = {};

let hasChanges = false;
let isSaving = false;
let initialLoadComplete = false;
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
        typeof data.permisos === "object"
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

function normalizeDateKey(value) {
    const match =
        String(value || "")
            .match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );

    if (!match) {
        return "";
    }

    return match[0];
}

function parseDateKey(value) {
    const dateKey =
        normalizeDateKey(value);

    if (!dateKey) {
        return null;
    }

    const [
        year,
        month,
        day
    ] =
        dateKey
            .split("-")
            .map(Number);

    const date =
        new Date(
            year,
            month - 1,
            day,
            12,
            0,
            0,
            0
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
}

function formatBlockedDate(value) {
    const date =
        parseDateKey(value);

    if (!date) {
        return value;
    }

    const text =
        new Intl.DateTimeFormat(
            "es-MX",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);

    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );
}

function timeToMinutes(value) {
    const [
        hours,
        minutes
    ] =
        String(value || "")
            .split(":")
            .map(Number);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return null;
    }

    return (
        hours * 60 +
        minutes
    );
}

function normalizePhone(value) {
    return String(value || "")
        .replace(/[^\d+]/g, "")
        .trim();
}

function normalizeInstagram(value) {
    let result =
        String(value || "")
            .trim();

    if (
        result &&
        !result.startsWith("@") &&
        !result.startsWith("http")
    ) {
        result =
            `@${result}`;
    }

    return result;
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

function getSaveStateElement() {
    let element =
        document.getElementById(
            "configurationSaveState"
        );

    if (element) {
        return element;
    }

    const container =
        document.querySelector(
            ".admin-configuration-actions"
        );

    if (!container) {
        return null;
    }

    element =
        document.createElement(
            "div"
        );

    element.id =
        "configurationSaveState";

    element.className =
        "admin-configuration-save-state";

    container.appendChild(
        element
    );

    return element;
}

function renderSaveState(
    type = "saved"
) {
    const element =
        getSaveStateElement();

    if (!element) {
        return;
    }

    element.className =
        "admin-configuration-save-state";

    if (type === "dirty") {
        element.classList.add(
            "is-dirty"
        );

        element.innerHTML = `
            <i data-lucide="circle-dot"></i>
            <span>
                Hay cambios sin guardar
            </span>
        `;
    } else if (
        type === "error"
    ) {
        element.classList.add(
            "is-error"
        );

        element.innerHTML = `
            <i data-lucide="circle-alert"></i>
            <span>
                Revisa la configuración
            </span>
        `;
    } else if (
        type === "saving"
    ) {
        element.innerHTML = `
            <i data-lucide="loader-circle"></i>
            <span>
                Guardando cambios...
            </span>
        `;
    } else {
        element.innerHTML = `
            <i data-lucide="circle-check"></i>
            <span>
                Configuración guardada
            </span>
        `;
    }

    initIcons();
}

function markDirty() {
    if (!initialLoadComplete) {
        return;
    }

    hasChanges =
        true;

    renderSaveState(
        "dirty"
    );
}

function markSaved() {
    hasChanges =
        false;

    renderSaveState(
        "saved"
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
            "js/admin/configuracion.html"
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

function normalizeBlockedDates(
    agenda
) {
    const dates = [];
    const reasons = {};

    const rawDates =
        agenda?.fechasBloqueadas;

    const rawReasons =
        agenda?.motivosFechasBloqueadas;

    if (
        rawReasons &&
        typeof rawReasons === "object" &&
        !Array.isArray(rawReasons)
    ) {
        Object.entries(
            rawReasons
        ).forEach(
            (
                [
                    dateKey,
                    reason
                ]
            ) => {
                const normalized =
                    normalizeDateKey(
                        dateKey
                    );

                if (normalized) {
                    reasons[
                        normalized
                    ] =
                        String(
                            reason ||
                            ""
                        );
                }
            }
        );
    }

    if (
        Array.isArray(rawDates)
    ) {
        rawDates.forEach(
            (item) => {
                if (
                    typeof item ===
                    "string"
                ) {
                    const normalized =
                        normalizeDateKey(
                            item
                        );

                    if (
                        normalized &&
                        !dates.includes(
                            normalized
                        )
                    ) {
                        dates.push(
                            normalized
                        );
                    }

                    return;
                }

                if (
                    item &&
                    typeof item ===
                        "object"
                ) {
                    const normalized =
                        normalizeDateKey(
                            item.fecha ||
                            item.fechaKey
                        );

                    if (
                        normalized &&
                        !dates.includes(
                            normalized
                        )
                    ) {
                        dates.push(
                            normalized
                        );
                    }

                    if (
                        normalized &&
                        item.motivo
                    ) {
                        reasons[
                            normalized
                        ] =
                            String(
                                item.motivo
                            );
                    }
                }
            }
        );
    } else if (
        rawDates &&
        typeof rawDates ===
            "object"
    ) {
        Object.entries(
            rawDates
        ).forEach(
            (
                [
                    dateKey,
                    value
                ]
            ) => {
                const normalized =
                    normalizeDateKey(
                        dateKey
                    );

                if (!normalized) {
                    return;
                }

                const active =
                    value === true ||
                    value?.activo === true;

                if (
                    active &&
                    !dates.includes(
                        normalized
                    )
                ) {
                    dates.push(
                        normalized
                    );
                }

                if (
                    value &&
                    typeof value ===
                        "object" &&
                    value.motivo
                ) {
                    reasons[
                        normalized
                    ] =
                        String(
                            value.motivo
                        );
                }
            }
        );
    }

    dates.sort();

    return {
        dates,
        reasons
    };
}

function normalizeDay(
    agenda,
    dayName
) {
    const fallback =
        DEFAULT_AGENDA
            .horarios[
                dayName
            ];

    const possibleSources = [
        agenda?.horarios,
        agenda?.dias,
        agenda?.semana
    ];

    let source =
        null;

    for (
        const possibleSource
        of possibleSources
    ) {
        if (
            possibleSource &&
            typeof possibleSource ===
                "object" &&
            possibleSource[
                dayName
            ]
        ) {
            source =
                possibleSource[
                    dayName
                ];

            break;
        }
    }

    if (
        !source &&
        agenda?.[dayName] &&
        typeof agenda[
            dayName
        ] === "object"
    ) {
        source =
            agenda[
                dayName
            ];
    }

    if (!source) {
        return {
            ...fallback
        };
    }

    return {
        activo:
            source.activo !==
                false &&
            source.cerrado !==
                true,
        apertura:
            source.apertura ||
            source.inicio ||
            source.desde ||
            source.horaInicio ||
            fallback.apertura,
        cierre:
            source.cierre ||
            source.fin ||
            source.hasta ||
            source.horaFin ||
            fallback.cierre
    };
}

function normalizeAgendaData(
    agenda
) {
    const blocked =
        normalizeBlockedDates(
            agenda
        );

    const normalized = {
        intervaloMinutos:
            Number(
                agenda?.intervaloMinutos
            ) ||
            DEFAULT_AGENDA
                .intervaloMinutos,
        anticipacionMinutos:
            Number(
                agenda?.anticipacionMinutos
            ) >= 0
                ? Number(
                    agenda
                        .anticipacionMinutos
                )
                : DEFAULT_AGENDA
                    .anticipacionMinutos,
        mesesDisponibles:
            Number(
                agenda?.mesesDisponibles ??
                agenda?.mesesAnticipacion
            ) ||
            DEFAULT_AGENDA
                .mesesDisponibles,
        zonaHoraria:
            agenda?.zonaHoraria ||
            DEFAULT_AGENDA
                .zonaHoraria,
        horarios: {},
        fechasBloqueadas:
            blocked.dates,
        motivosFechasBloqueadas:
            blocked.reasons
    };

    Object.keys(
        DEFAULT_AGENDA.horarios
    ).forEach(
        (dayName) => {
            normalized.horarios[
                dayName
            ] =
                normalizeDay(
                    agenda,
                    dayName
                );
        }
    );

    return normalized;
}

function normalizeGeneralData(
    general
) {
    return {
        nombre:
            general?.nombre ||
            general?.nombreComercial ||
            DEFAULT_GENERAL.nombre,
        telefono:
            general?.telefono ||
            general?.whatsapp ||
            DEFAULT_GENERAL.telefono,
        email:
            general?.email ||
            general?.correo ||
            DEFAULT_GENERAL.email,
        instagram:
            general?.instagram ||
            DEFAULT_GENERAL.instagram,
        mapsUrl:
            general?.mapsUrl ||
            general?.googleMaps ||
            DEFAULT_GENERAL.mapsUrl
    };
}

async function loadConfiguration() {
    try {
        const [
            agendaSnapshot,
            generalSnapshot
        ] =
            await Promise.all([
                getDoc(
                    doc(
                        db,
                        "configuracion",
                        "agenda"
                    )
                ),
                getDoc(
                    doc(
                        db,
                        "configuracion",
                        "general"
                    )
                )
            ]);

        agendaData =
            normalizeAgendaData(
                agendaSnapshot.exists()
                    ? agendaSnapshot.data()
                    : DEFAULT_AGENDA
            );

        generalData =
            normalizeGeneralData(
                generalSnapshot.exists()
                    ? generalSnapshot.data()
                    : DEFAULT_GENERAL
            );

        blockedDates =
            [
                ...agendaData
                    .fechasBloqueadas
            ];

        blockedReasons =
            {
                ...agendaData
                    .motivosFechasBloqueadas
            };

        renderConfiguration();

        initialLoadComplete =
            true;

        markSaved();
    } catch (error) {
        console.error(
            "No se pudo cargar la configuración:",
            error
        );

        agendaData =
            normalizeAgendaData(
                DEFAULT_AGENDA
            );

        generalData =
            normalizeGeneralData(
                DEFAULT_GENERAL
            );

        blockedDates = [];
        blockedReasons = {};

        renderConfiguration();

        initialLoadComplete =
            true;

        renderSaveState(
            "error"
        );

        showToast(
            "No se pudo cargar la configuración guardada.",
            "error"
        );
    }
}

function renderAgendaSettings() {
    if (configAgendaInterval) {
        configAgendaInterval.value =
            String(
                agendaData
                    .intervaloMinutos
            );
    }

    if (configAgendaAdvance) {
        configAgendaAdvance.value =
            String(
                agendaData
                    .anticipacionMinutos
            );
    }

    if (configAgendaMonths) {
        configAgendaMonths.value =
            String(
                agendaData
                    .mesesDisponibles
            );
    }

    if (configTimezone) {
        configTimezone.value =
            agendaData.zonaHoraria ||
            "America/Mexico_City";
    }

    Object.entries(
        dayElements
    ).forEach(
        (
            [
                dayName,
                elements
            ]
        ) => {
            const day =
                agendaData.horarios[
                    dayName
                ];

            if (!day) {
                return;
            }

            if (elements.active) {
                elements.active.checked =
                    day.activo !==
                    false;
            }

            if (elements.open) {
                elements.open.value =
                    day.apertura ||
                    "09:00";
            }

            if (elements.close) {
                elements.close.value =
                    day.cierre ||
                    "18:00";
            }

            updateDayState(
                dayName
            );
        }
    );
}

function renderGeneralSettings() {
    if (configBusinessName) {
        configBusinessName.value =
            generalData.nombre ||
            "";
    }

    if (configBusinessPhone) {
        configBusinessPhone.value =
            generalData.telefono ||
            "";
    }

    if (configBusinessEmail) {
        configBusinessEmail.value =
            generalData.email ||
            "";
    }

    if (
        configBusinessInstagram
    ) {
        configBusinessInstagram.value =
            generalData.instagram ||
            "";
    }

    if (configBusinessMaps) {
        configBusinessMaps.value =
            generalData.mapsUrl ||
            "";
    }
}

function renderConfiguration() {
    renderAgendaSettings();
    renderGeneralSettings();
    renderBlockedDates();
    initIcons();
}

function updateDayState(
    dayName
) {
    const elements =
        dayElements[
            dayName
        ];

    if (!elements) {
        return;
    }

    const active =
        elements.active
            ?.checked === true;

    elements.article
        ?.classList.toggle(
            "is-disabled",
            !active
        );

    if (elements.open) {
        elements.open.disabled =
            !active;
    }

    if (elements.close) {
        elements.close.disabled =
            !active;
    }
}

function renderBlockedDates() {
    if (!blockedDatesList) {
        return;
    }

    const sorted =
        [...blockedDates]
            .sort();

    if (!sorted.length) {
        blockedDatesList.innerHTML = `
            <div class="admin-configuration-empty">

                <i data-lucide="calendar-check-2"></i>

                <div>

                    <strong>
                        Sin fechas bloqueadas
                    </strong>

                    <span>
                        Todos los días activos de la semana están disponibles.
                    </span>

                </div>

            </div>
        `;

        initIcons();

        return;
    }

    blockedDatesList.innerHTML =
        sorted
            .map(
                (dateKey) => `
                    <article class="admin-blocked-date">

                        <div class="admin-blocked-date__icon">

                            <i data-lucide="calendar-x-2"></i>

                        </div>

                        <div class="admin-blocked-date__content">

                            <strong>
                                ${escapeHTML(
                                    formatBlockedDate(
                                        dateKey
                                    )
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    blockedReasons[
                                        dateKey
                                    ] ||
                                    "Fecha no disponible"
                                )}
                            </span>

                        </div>

                        <button
                            type="button"
                            class="admin-blocked-date__remove"
                            data-remove-blocked-date="${escapeHTML(
                                dateKey
                            )}"
                            aria-label="Eliminar fecha bloqueada"
                            title="Eliminar bloqueo"
                        >

                            <i data-lucide="trash-2"></i>

                        </button>

                    </article>
                `
            )
            .join("");

    initIcons();
}

function addBlockedDate() {
    const dateKey =
        normalizeDateKey(
            blockedDateInput
                ?.value
        );

    const reason =
        blockedDateReason
            ?.value
            .trim() ||
        "";

    if (!dateKey) {
        showToast(
            "Selecciona una fecha para bloquear.",
            "error"
        );

        return;
    }

    if (
        blockedDates.includes(
            dateKey
        )
    ) {
        showToast(
            "Esa fecha ya está bloqueada.",
            "error"
        );

        return;
    }

    blockedDates.push(
        dateKey
    );

    blockedDates.sort();

    blockedReasons[
        dateKey
    ] =
        reason;

    if (blockedDateInput) {
        blockedDateInput.value =
            "";
    }

    if (blockedDateReason) {
        blockedDateReason.value =
            "";
    }

    renderBlockedDates();
    markDirty();

    showToast(
        "Fecha agregada. Guarda los cambios para aplicarla."
    );
}

function removeBlockedDate(
    dateKey
) {
    blockedDates =
        blockedDates.filter(
            (item) =>
                item !==
                dateKey
        );

    delete blockedReasons[
        dateKey
    ];

    renderBlockedDates();
    markDirty();
}

function collectSchedules() {
    const schedules =
        {};

    for (
        const [
            dayName,
            elements
        ] of Object.entries(
            dayElements
        )
    ) {
        const active =
            elements.active
                ?.checked ===
            true;

        const open =
            elements.open
                ?.value ||
            "";

        const close =
            elements.close
                ?.value ||
            "";

        if (
            active &&
            (!open || !close)
        ) {
            return {
                error:
                    `Completa el horario de ${dayName}.`
            };
        }

        if (active) {
            const openMinutes =
                timeToMinutes(
                    open
                );

            const closeMinutes =
                timeToMinutes(
                    close
                );

            if (
                openMinutes === null ||
                closeMinutes === null ||
                closeMinutes <=
                    openMinutes
            ) {
                return {
                    error:
                        `El horario de ${dayName} no es válido.`
                };
            }
        }

        schedules[
            dayName
        ] = {
            activo:
                active,
            apertura:
                open ||
                "09:00",
            cierre:
                close ||
                "18:00"
        };
    }

    return {
        horarios:
            schedules
    };
}

function validateGeneralSettings() {
    const email =
        configBusinessEmail
            ?.value
            .trim() ||
        "";

    const mapsUrl =
        configBusinessMaps
            ?.value
            .trim() ||
        "";

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {
        return {
            error:
                "El correo del negocio no es válido."
        };
    }

    if (mapsUrl) {
        try {
            const url =
                new URL(
                    mapsUrl
                );

            if (
                ![
                    "http:",
                    "https:"
                ].includes(
                    url.protocol
                )
            ) {
                throw new Error(
                    "INVALID_URL"
                );
            }
        } catch {
            return {
                error:
                    "El enlace de Google Maps no es válido."
            };
        }
    }

    return {
        general: {
            nombre:
                configBusinessName
                    ?.value
                    .trim() ||
                "PMC Auto Detailing",
            telefono:
                normalizePhone(
                    configBusinessPhone
                        ?.value
                ),
            email,
            instagram:
                normalizeInstagram(
                    configBusinessInstagram
                        ?.value
                ),
            mapsUrl
        }
    };
}

function collectConfiguration() {
    const schedules =
        collectSchedules();

    if (schedules.error) {
        return schedules;
    }

    const general =
        validateGeneralSettings();

    if (general.error) {
        return general;
    }

    const interval =
        Number(
            configAgendaInterval
                ?.value
        );

    const advance =
        Number(
            configAgendaAdvance
                ?.value
        );

    const months =
        Number(
            configAgendaMonths
                ?.value
        );

    if (
        ![
            15,
            30,
            45,
            60
        ].includes(
            interval
        )
    ) {
        return {
            error:
                "Selecciona un intervalo de agenda válido."
        };
    }

    if (
        !Number.isFinite(
            advance
        ) ||
        advance < 0
    ) {
        return {
            error:
                "La anticipación mínima no es válida."
        };
    }

    if (
        ![
            1,
            2,
            3,
            6,
            12
        ].includes(
            months
        )
    ) {
        return {
            error:
                "Selecciona una cantidad de meses válida."
        };
    }

    const reasons = {};

    blockedDates.forEach(
        (dateKey) => {
            reasons[
                dateKey
            ] =
                blockedReasons[
                    dateKey
                ] ||
                "";
        }
    );

    return {
        agenda: {
            intervaloMinutos:
                interval,
            anticipacionMinutos:
                advance,
            mesesDisponibles:
                months,
            mesesAnticipacion:
                months,
            zonaHoraria:
                configTimezone
                    ?.value ||
                "America/Mexico_City",
            horarios:
                schedules.horarios,
            fechasBloqueadas:
                [
                    ...blockedDates
                ].sort(),
            motivosFechasBloqueadas:
                reasons
        },
        general:
            general.general
    };
}

function setSavingState(
    state
) {
    isSaving =
        state;

    const buttons = [
        saveConfigurationButton,
        saveConfigurationButtonHero,
        saveConfigurationButtonSidebar
    ];

    buttons.forEach(
        (button) => {
            if (!button) {
                return;
            }

            button.disabled =
                state;

            if (state) {
                button.innerHTML = `
                    <i data-lucide="loader-circle"></i>
                    <span>
                        Guardando...
                    </span>
                `;
            } else {
                button.innerHTML = `
                    <i data-lucide="save"></i>
                    <span>
                        Guardar cambios
                    </span>
                `;
            }
        }
    );

    renderSaveState(
        state
            ? "saving"
            : (
                hasChanges
                    ? "dirty"
                    : "saved"
            )
    );

    initIcons();
}

async function saveConfiguration() {
    if (isSaving) {
        return;
    }

    const configuration =
        collectConfiguration();

    if (configuration.error) {
        renderSaveState(
            "error"
        );

        showToast(
            configuration.error,
            "error"
        );

        return;
    }

    setSavingState(
        true
    );

    try {
        const agendaReference =
            doc(
                db,
                "configuracion",
                "agenda"
            );

        const generalReference =
            doc(
                db,
                "configuracion",
                "general"
            );

        await Promise.all([
            setDoc(
                agendaReference,
                {
                    ...configuration.agenda,
                    actualizadoEn:
                        serverTimestamp(),
                    actualizadoPor:
                        currentUser.uid
                },
                {
                    merge: true
                }
            ),
            setDoc(
                generalReference,
                {
                    ...configuration.general,
                    actualizadoEn:
                        serverTimestamp(),
                    actualizadoPor:
                        currentUser.uid
                },
                {
                    merge: true
                }
            )
        ]);

        agendaData = {
            ...configuration.agenda
        };

        generalData = {
            ...configuration.general
        };

        blockedDates =
            [
                ...configuration
                    .agenda
                    .fechasBloqueadas
            ];

        blockedReasons =
            {
                ...configuration
                    .agenda
                    .motivosFechasBloqueadas
            };

        hasChanges =
            false;

        setSavingState(
            false
        );

        markSaved();

        showToast(
            "Configuración guardada correctamente."
        );
    } catch (error) {
        console.error(
            "No se pudo guardar la configuración:",
            error
        );

        setSavingState(
            false
        );

        renderSaveState(
            "error"
        );

        showToast(
            "No se pudo guardar la configuración.",
            "error"
        );
    }
}

function bindAgendaFields() {
    [
        configAgendaInterval,
        configAgendaAdvance,
        configAgendaMonths
    ].forEach(
        (element) => {
            element?.addEventListener(
                "change",
                markDirty
            );
        }
    );

    Object.entries(
        dayElements
    ).forEach(
        (
            [
                dayName,
                elements
            ]
        ) => {
            elements.active
                ?.addEventListener(
                    "change",
                    () => {
                        updateDayState(
                            dayName
                        );

                        markDirty();
                    }
                );

            elements.open
                ?.addEventListener(
                    "change",
                    markDirty
                );

            elements.close
                ?.addEventListener(
                    "change",
                    markDirty
                );
        }
    );
}

function bindGeneralFields() {
    [
        configBusinessName,
        configBusinessPhone,
        configBusinessEmail,
        configBusinessInstagram,
        configBusinessMaps
    ].forEach(
        (element) => {
            element?.addEventListener(
                "input",
                markDirty
            );
        }
    );
}

function bindBlockedDates() {
    addBlockedDateButton
        ?.addEventListener(
            "click",
            addBlockedDate
        );

    blockedDateReason
        ?.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key ===
                    "Enter"
                ) {
                    event.preventDefault();

                    addBlockedDate();
                }
            }
        );

    blockedDatesList
        ?.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-remove-blocked-date]"
                    );

                if (!button) {
                    return;
                }

                removeBlockedDate(
                    button.dataset
                        .removeBlockedDate
                );
            }
        );
}

function bindSaveButtons() {
    [
        saveConfigurationButton,
        saveConfigurationButtonHero,
        saveConfigurationButtonSidebar
    ].forEach(
        (button) => {
            button?.addEventListener(
                "click",
                saveConfiguration
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
                event.ctrlKey &&
                event.key.toLowerCase() ===
                    "s"
            ) {
                event.preventDefault();

                saveConfiguration();

                return;
            }

            if (
                event.key ===
                "Escape"
            ) {
                closeSidebar();
            }
        }
    );
}

function bindBeforeUnload() {
    window.addEventListener(
        "beforeunload",
        (event) => {
            if (
                !hasChanges ||
                isSaving
            ) {
                return;
            }

            event.preventDefault();

            event.returnValue =
                "";
        }
    );
}

async function init() {
    initIcons();

    setCurrentYear();
    setCurrentDateText();

    bindSidebar();
    bindLogout();
    bindAgendaFields();
    bindGeneralFields();
    bindBlockedDates();
    bindSaveButtons();
    bindKeyboard();
    bindBeforeUnload();

    const allowed =
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    await loadConfiguration();

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