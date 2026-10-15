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
    limit,
    query,
    serverTimestamp,
    setDoc,
    where
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

const editorModeLabel =
    document.getElementById("editorModeLabel");

const editorHeaderTitle =
    document.getElementById("editorHeaderTitle");

const editorTitle =
    document.getElementById("editorTitle");

const editorSubtitle =
    document.getElementById("editorSubtitle");

const servicePreviewButton =
    document.getElementById("servicePreviewButton");

const serviceForm =
    document.getElementById("serviceForm");

const serviceDocumentId =
    document.getElementById("serviceDocumentId");

const serviceStatus =
    document.getElementById("serviceStatus");

const serviceName =
    document.getElementById("serviceName");

const serviceSlug =
    document.getElementById("serviceSlug");

const serviceCategory =
    document.getElementById("serviceCategory");

const serviceShortDescription =
    document.getElementById("serviceShortDescription");

const shortDescriptionCount =
    document.getElementById("shortDescriptionCount");

const serviceDescription =
    document.getElementById("serviceDescription");

const serviceDuration =
    document.getElementById("serviceDuration");

const serviceOrder =
    document.getElementById("serviceOrder");

const serviceWarranty =
    document.getElementById("serviceWarranty");

const servicePriceFrom =
    document.getElementById("servicePriceFrom");

const priceHatchbackMin =
    document.getElementById("priceHatchbackMin");

const priceHatchbackMax =
    document.getElementById("priceHatchbackMax");

const priceSedanMin =
    document.getElementById("priceSedanMin");

const priceSedanMax =
    document.getElementById("priceSedanMax");

const priceSuvMin =
    document.getElementById("priceSuvMin");

const priceSuvMax =
    document.getElementById("priceSuvMax");

const pricePickupMin =
    document.getElementById("pricePickupMin");

const pricePickupMax =
    document.getElementById("pricePickupMax");

const priceVanMin =
    document.getElementById("priceVanMin");

const priceVanMax =
    document.getElementById("priceVanMax");

const priceOtherMin =
    document.getElementById("priceOtherMin");

const priceOtherMax =
    document.getElementById("priceOtherMax");

const serviceIncludes =
    document.getElementById("serviceIncludes");

const serviceCleaning =
    document.getElementById("serviceCleaning");

const serviceProcesses =
    document.getElementById("serviceProcesses");

const serviceProtection =
    document.getElementById("serviceProtection");

const serviceOptions =
    document.getElementById("serviceOptions");

const serviceCoverUrl =
    document.getElementById("serviceCoverUrl");

const uploadCoverButton =
    document.getElementById("uploadCoverButton");

const coverPreviewEmpty =
    document.getElementById("coverPreviewEmpty");

const coverPreviewImage =
    document.getElementById("coverPreviewImage");

const serviceGalleryUrls =
    document.getElementById("serviceGalleryUrls");

const galleryImageCount =
    document.getElementById("galleryImageCount");

const galleryPreview =
    document.getElementById("galleryPreview");

const serviceActive =
    document.getElementById("serviceActive");

const serviceFeatured =
    document.getElementById("serviceFeatured");

const publicationStatusBadge =
    document.getElementById("publicationStatusBadge");

const publicationStatusText =
    document.getElementById("publicationStatusText");

const editorPreviewImage =
    document.getElementById("editorPreviewImage");

const editorPreviewPlaceholder =
    document.getElementById("editorPreviewPlaceholder");

const editorPreviewCategory =
    document.getElementById("editorPreviewCategory");

const editorPreviewName =
    document.getElementById("editorPreviewName");

const editorPreviewDescription =
    document.getElementById("editorPreviewDescription");

const editorPreviewPrice =
    document.getElementById("editorPreviewPrice");

const saveDraftButton =
    document.getElementById("saveDraftButton");

const publishServiceButton =
    document.getElementById("publishServiceButton");

const saveServiceButton =
    document.getElementById("saveServiceButton");

const editorDangerZone =
    document.getElementById("editorDangerZone");

const editorDeleteButton =
    document.getElementById("editorDeleteButton");

const editorDeleteModal =
    document.getElementById("editorDeleteModal");

const editorDeleteBackdrop =
    document.getElementById("editorDeleteBackdrop");

const editorDeleteClose =
    document.getElementById("editorDeleteClose");

const editorCancelDelete =
    document.getElementById("editorCancelDelete");

const editorConfirmDelete =
    document.getElementById("editorConfirmDelete");

const editorDeleteName =
    document.getElementById("editorDeleteName");

const adminToast =
    document.getElementById("adminToast");

let currentUser = null;
let currentUserData = null;
let currentServiceData = null;
let editingServiceId = "";
let slugManuallyEdited = false;
let savingService = false;
let deletingService = false;
let formDirty = false;
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

    window.setTimeout(() => {
        pageLoader.classList.add("is-hidden");
    }, 250);
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

function slugify(value) {
    return normalizeText(value)
        .replace(/&/g, "y")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
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
        parts[parts.length - 1][0]
    ).toUpperCase();
}

function formatCurrency(value) {
    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return "Cotizar";
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
    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    const returnUrl =
        id
            ? `js/admin/servicio-editor.html?id=${encodeURIComponent(id)}`
            : "js/admin/servicio-editor.html";

    window.location.href =
        `../../login.html?return=${encodeURIComponent(returnUrl)}`;
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
            id: snapshot.id,
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

function getEditingServiceId() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("id") ||
        ""
    ).trim();
}

function categoryToSlug(category) {
    const normalized =
        normalizeText(category);

    if (normalized === "lavado") {
        return "lavado";
    }

    if (normalized === "pintura") {
        return "pintura";
    }

    if (normalized === "proteccion") {
        return "proteccion";
    }

    if (
        normalized.includes("ceram")
    ) {
        return "ceramicos";
    }

    if (normalized === "interior") {
        return "interior";
    }

    if (
        normalized.includes("motor") ||
        normalized.includes("chasis")
    ) {
        return "motor-chasis";
    }

    if (normalized === "ppf") {
        return "ppf";
    }

    if (
        normalized.includes("moto")
    ) {
        return "motos";
    }

    return slugify(category);
}

function parseLines(value) {
    return String(value || "")
        .split(/\r?\n/)
        .map(
            (item) =>
                item.trim()
        )
        .filter(Boolean);
}

function arrayToLines(value) {
    if (!Array.isArray(value)) {
        return "";
    }

    return value
        .map(
            (item) => {
                if (
                    typeof item ===
                    "string"
                ) {
                    return item;
                }

                if (
                    item &&
                    typeof item === "object"
                ) {
                    return (
                        item.nombre ||
                        item.texto ||
                        item.descripcion ||
                        ""
                    );
                }

                return "";
            }
        )
        .filter(Boolean)
        .join("\n");
}

function numberOrNull(value) {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function normalizePriceObject(value) {
    if (
        value &&
        typeof value === "object"
    ) {
        const min =
            numberOrNull(
                value.desde ??
                value.min ??
                value.precio
            );

        const max =
            numberOrNull(
                value.hasta ??
                value.max
            );

        return {
            desde: min,
            hasta: max ?? min
        };
    }

    if (
        typeof value === "number"
    ) {
        return {
            desde: value,
            hasta: value
        };
    }

    if (
        typeof value === "string"
    ) {
        const numbers =
            value
                .replaceAll(",", "")
                .match(/\d+/g);

        if (!numbers?.length) {
            return {
                desde: null,
                hasta: null
            };
        }

        const first =
            Number(numbers[0]);

        const second =
            numbers[1]
                ? Number(numbers[1])
                : first;

        return {
            desde: first,
            hasta: second
        };
    }

    return {
        desde: null,
        hasta: null
    };
}

function getPriceFromData(
    prices,
    key
) {
    if (!prices) {
        return {
            desde: null,
            hasta: null
        };
    }

    if (
        !Array.isArray(prices) &&
        typeof prices === "object"
    ) {
        return normalizePriceObject(
            prices[key]
        );
    }

    return {
        desde: null,
        hasta: null
    };
}

function setPriceFields(
    minField,
    maxField,
    value
) {
    const normalized =
        normalizePriceObject(value);

    if (minField) {
        minField.value =
            normalized.desde ??
            "";
    }

    if (maxField) {
        maxField.value =
            normalized.hasta != null &&
            normalized.hasta !==
                normalized.desde
                ? normalized.hasta
                : "";
    }
}

function populatePriceFields(prices) {
    setPriceFields(
        priceHatchbackMin,
        priceHatchbackMax,
        getPriceFromData(
            prices,
            "hatchback"
        )
    );

    setPriceFields(
        priceSedanMin,
        priceSedanMax,
        getPriceFromData(
            prices,
            "sedan"
        )
    );

    setPriceFields(
        priceSuvMin,
        priceSuvMax,
        getPriceFromData(
            prices,
            "suv"
        )
    );

    setPriceFields(
        pricePickupMin,
        pricePickupMax,
        getPriceFromData(
            prices,
            "pickup"
        )
    );

    setPriceFields(
        priceVanMin,
        priceVanMax,
        getPriceFromData(
            prices,
            "camioneta"
        )
    );

    setPriceFields(
        priceOtherMin,
        priceOtherMax,
        getPriceFromData(
            prices,
            "otro"
        )
    );
}

function populateForm(data) {
    serviceDocumentId.value =
        editingServiceId;

    serviceName.value =
        data.nombre ||
        "";

    serviceSlug.value =
        data.slug ||
        editingServiceId ||
        "";

    serviceCategory.value =
        data.categoria ||
        "";

    serviceShortDescription.value =
        data.descripcionCorta ||
        "";

    serviceDescription.value =
        data.descripcion ||
        "";

    serviceDuration.value =
        data.duracionMinutos ??
        "";

    serviceOrder.value =
        data.orden ??
        "";

    serviceWarranty.value =
        data.garantia ||
        "";

    servicePriceFrom.value =
        data.precioDesde ??
        "";

    servicePriceFrom.dataset.manual =
        data.precioDesde != null
            ? "true"
            : "false";

    serviceIncludes.value =
        arrayToLines(
            data.incluye
        );

    serviceCleaning.value =
        arrayToLines(
            data.limpieza
        );

    serviceProcesses.value =
        arrayToLines(
            data.procesos
        );

    serviceProtection.value =
        arrayToLines(
            data.proteccion
        );

    serviceOptions.value =
        arrayToLines(
            data.opciones
        );

    serviceCoverUrl.value =
        data.imagenPrincipal ||
        data.imagenPortada ||
        data.portada ||
        "";

    serviceGalleryUrls.value =
        Array.isArray(
            data.imagenes
        )
            ? data.imagenes
                .map(
                    (image) => {
                        if (
                            typeof image ===
                            "string"
                        ) {
                            return image;
                        }

                        return (
                            image?.url ||
                            image?.secure_url ||
                            ""
                        );
                    }
                )
                .filter(Boolean)
                .join("\n")
            : "";

    serviceActive.checked =
        data.activo !== false;

    serviceFeatured.checked =
        data.destacado === true;

    serviceStatus.value =
        normalizeText(
            data.estado
        ) === "publicado"
            ? "publicado"
            : "borrador";

    populatePriceFields(
        data.precios
    );

    slugManuallyEdited =
        true;

    updateEditorMode();
    updateAllPreviews();
}

async function loadServiceForEdit() {
    editingServiceId =
        getEditingServiceId();

    if (!editingServiceId) {
        currentServiceData =
            null;

        serviceDocumentId.value =
            "";

        serviceStatus.value =
            "borrador";

        serviceActive.checked =
            true;

        servicePriceFrom.dataset.manual =
            "false";

        updateEditorMode();
        updateAllPreviews();

        return true;
    }

    try {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "servicios",
                    editingServiceId
                )
            );

        if (!snapshot.exists()) {
            showToast(
                "El servicio no existe.",
                "error"
            );

            window.setTimeout(
                () => {
                    window.location.href =
                        "servicios.html";
                },
                1300
            );

            return false;
        }

        currentServiceData = {
            id: snapshot.id,
            ...snapshot.data()
        };

        populateForm(
            currentServiceData
        );

        formDirty =
            false;

        return true;
    } catch (error) {
        console.error(
            "No se pudo cargar el servicio:",
            error
        );

        showToast(
            "No se pudo cargar el servicio.",
            "error"
        );

        return false;
    }
}

function updateEditorMode() {
    const editing =
        Boolean(editingServiceId);

    if (editorModeLabel) {
        editorModeLabel.textContent =
            editing
                ? "Editando servicio"
                : "Catálogo PMC";
    }

    if (editorHeaderTitle) {
        editorHeaderTitle.textContent =
            editing
                ? (
                    serviceName.value.trim() ||
                    "Editar servicio"
                )
                : "Nuevo servicio";
    }

    if (editorTitle) {
        editorTitle.textContent =
            editing
                ? "Editar servicio"
                : "Crear servicio";
    }

    if (editorSubtitle) {
        editorSubtitle.textContent =
            editing
                ? "Actualiza la información, precios, contenido y visibilidad del servicio."
                : "Agrega la información que aparecerá en el catálogo público y en el sistema de citas.";
    }

    if (editorDangerZone) {
        editorDangerZone.hidden =
            !editing;
    }

    updatePreviewButton();
}

function updateCharacterCounter() {
    if (!shortDescriptionCount) {
        return;
    }

    shortDescriptionCount.textContent =
        String(
            serviceShortDescription
                .value.length
        );
}

function getMinimumEnteredPrice() {
    const fields = [
        priceHatchbackMin,
        priceSedanMin,
        priceSuvMin,
        pricePickupMin,
        priceVanMin,
        priceOtherMin
    ];

    const values =
        fields
            .map(
                (field) =>
                    numberOrNull(
                        field?.value
                    )
            )
            .filter(
                (value) =>
                    value != null &&
                    value >= 0
            );

    if (!values.length) {
        return null;
    }

    return Math.min(...values);
}

function updateAutomaticPrice() {
    if (
        servicePriceFrom.dataset
            .manual === "true"
    ) {
        return;
    }

    const minimum =
        getMinimumEnteredPrice();

    if (minimum == null) {
        servicePriceFrom.value =
            "";

        return;
    }

    servicePriceFrom.value =
        String(minimum);
}

function normalizeMediaUrl(value) {
    const text =
        String(value || "")
            .trim();

    if (!text) {
        return "";
    }

    if (
        text.startsWith(
            "imagenes/"
        )
    ) {
        return `../../${text}`;
    }

    if (
        text.startsWith(
            "../../imagenes/"
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
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {
            return url.href;
        }
    } catch {
        return "";
    }

    return "";
}

function updateCoverPreview() {
    const rawUrl =
        serviceCoverUrl.value
            .trim();

    const url =
        normalizeMediaUrl(
            rawUrl
        );

    if (!url) {
        coverPreviewImage.hidden =
            true;

        coverPreviewImage.removeAttribute(
            "src"
        );

        coverPreviewEmpty.hidden =
            false;

        editorPreviewImage.hidden =
            true;

        editorPreviewImage.removeAttribute(
            "src"
        );

        editorPreviewPlaceholder.hidden =
            false;

        return;
    }

    coverPreviewImage.src =
        url;

    coverPreviewImage.hidden =
        false;

    coverPreviewEmpty.hidden =
        true;

    editorPreviewImage.src =
        url;

    editorPreviewImage.hidden =
        false;

    editorPreviewPlaceholder.hidden =
        true;
}

function handlePreviewImageError() {
    coverPreviewImage.hidden =
        true;

    coverPreviewImage.removeAttribute(
        "src"
    );

    coverPreviewEmpty.hidden =
        false;

    editorPreviewImage.hidden =
        true;

    editorPreviewImage.removeAttribute(
        "src"
    );

    editorPreviewPlaceholder.hidden =
        false;
}

function getGalleryUrls() {
    return parseLines(
        serviceGalleryUrls.value
    ).filter(
        (url) => {
            if (
                url.startsWith(
                    "imagenes/"
                )
            ) {
                return true;
            }

            try {
                const parsed =
                    new URL(url);

                return (
                    parsed.protocol ===
                        "https:" ||
                    parsed.protocol ===
                        "http:"
                );
            } catch {
                return false;
            }
        }
    );
}

function renderGalleryPreview() {
    const images =
        getGalleryUrls();

    if (galleryImageCount) {
        galleryImageCount.textContent =
            images.length === 1
                ? "1 imagen"
                : `${images.length} imágenes`;
    }

    if (!galleryPreview) {
        return;
    }

    if (!images.length) {
        galleryPreview.innerHTML = `
            <div class="admin-editor-gallery-preview__empty">

                <i data-lucide="images"></i>

                <span>
                    Agrega imágenes para visualizar la galería.
                </span>

            </div>
        `;

        initIcons();

        return;
    }

    galleryPreview.innerHTML =
        images
            .slice(0, 12)
            .map(
                (url) => `
                    <div class="admin-editor-gallery-preview__item">

                        <img
                            src="${escapeHTML(
                                normalizeMediaUrl(url)
                            )}"
                            alt="Imagen de galería"
                            loading="lazy"
                        >

                    </div>
                `
            )
            .join("");

    galleryPreview
        .querySelectorAll("img")
        .forEach(
            (image) => {
                image.addEventListener(
                    "error",
                    () => {
                        image
                            .closest(
                                ".admin-editor-gallery-preview__item"
                            )
                            ?.remove();
                    }
                );
            }
        );
}

function updateCardPreview() {
    if (editorPreviewCategory) {
        editorPreviewCategory.textContent =
            serviceCategory.value ||
            "Categoría";
    }

    if (editorPreviewName) {
        editorPreviewName.textContent =
            serviceName.value.trim() ||
            "Nuevo servicio";
    }

    if (
        editorPreviewDescription
    ) {
        editorPreviewDescription.textContent =
            serviceShortDescription
                .value
                .trim() ||
            "La descripción del servicio aparecerá aquí.";
    }

    const price =
        numberOrNull(
            servicePriceFrom.value
        ) ??
        getMinimumEnteredPrice();

    if (editorPreviewPrice) {
        editorPreviewPrice.textContent =
            price != null
                ? formatCurrency(price)
                : "Cotizar";
    }
}

function updatePublicationStatus() {
    const status =
        serviceStatus.value ===
        "publicado"
            ? "publicado"
            : "borrador";

    publicationStatusBadge
        ?.classList.remove(
            "is-draft",
            "is-published"
        );

    if (
        status ===
        "publicado"
    ) {
        publicationStatusBadge
            ?.classList.add(
                "is-published"
            );

        publicationStatusText.textContent =
            serviceActive.checked
                ? "Publicado"
                : "Publicado · inactivo";
    } else {
        publicationStatusBadge
            ?.classList.add(
                "is-draft"
            );

        publicationStatusText.textContent =
            "Borrador";
    }

    updatePreviewButton();
}

function updatePreviewButton() {
    if (!servicePreviewButton) {
        return;
    }

    const slug =
        serviceSlug.value.trim();

    const visible =
        serviceStatus.value ===
            "publicado" &&
        serviceActive.checked &&
        Boolean(slug);

    servicePreviewButton.hidden =
        !visible;

    if (visible) {
        servicePreviewButton.href =
            `../../servicio.html?servicio=${encodeURIComponent(slug)}`;
    }
}

function updateAllPreviews() {
    updateCharacterCounter();
    updateAutomaticPrice();
    updateCoverPreview();
    renderGalleryPreview();
    updateCardPreview();
    updatePublicationStatus();
}

function buildPriceEntry(
    minField,
    maxField
) {
    let min =
        numberOrNull(
            minField?.value
        );

    let max =
        numberOrNull(
            maxField?.value
        );

    if (
        min == null &&
        max == null
    ) {
        return null;
    }

    if (
        min == null &&
        max != null
    ) {
        min =
            max;
    }

    if (max == null) {
        max =
            min;
    }

    return {
        desde: min,
        hasta: max
    };
}

function buildPrices() {
    const prices = {};

    const mappings = [
        [
            "hatchback",
            priceHatchbackMin,
            priceHatchbackMax
        ],
        [
            "sedan",
            priceSedanMin,
            priceSedanMax
        ],
        [
            "suv",
            priceSuvMin,
            priceSuvMax
        ],
        [
            "pickup",
            pricePickupMin,
            pricePickupMax
        ],
        [
            "camioneta",
            priceVanMin,
            priceVanMax
        ],
        [
            "otro",
            priceOtherMin,
            priceOtherMax
        ]
    ];

    mappings.forEach(
        ([
            key,
            minField,
            maxField
        ]) => {
            const entry =
                buildPriceEntry(
                    minField,
                    maxField
                );

            if (entry) {
                prices[key] =
                    entry;
            }
        }
    );

    return prices;
}

function getLowestPrice(prices) {
    const values =
        Object.values(prices)
            .map(
                (price) =>
                    Number(price.desde)
            )
            .filter(
                (price) =>
                    Number.isFinite(price) &&
                    price >= 0
            );

    if (!values.length) {
        return null;
    }

    return Math.min(...values);
}

function collectServiceData(
    targetStatus
) {
    const prices =
        buildPrices();

    const manualPrice =
        numberOrNull(
            servicePriceFrom.value
        );

    const automaticPrice =
        getLowestPrice(
            prices
        );

    return {
        nombre:
            serviceName.value.trim(),

        slug:
            slugify(
                serviceSlug.value
            ),

        categoria:
            serviceCategory.value,

        categoriaSlug:
            categoryToSlug(
                serviceCategory.value
            ),

        descripcionCorta:
            serviceShortDescription
                .value
                .trim(),

        descripcion:
            serviceDescription
                .value
                .trim(),

        duracionMinutos:
            numberOrNull(
                serviceDuration.value
            ),

        orden:
            numberOrNull(
                serviceOrder.value
            ),

        garantia:
            serviceWarranty
                .value
                .trim(),

precioDesde:
    manualPrice ??
    automaticPrice,

precios:
    prices,

incluye:
    parseLines(
        serviceIncludes.value
    ),

        limpieza:
            parseLines(
                serviceCleaning.value
            ),

        procesos:
            parseLines(
                serviceProcesses.value
            ),

        proteccion:
            parseLines(
                serviceProtection.value
            ),

        opciones:
            parseLines(
                serviceOptions.value
            ),

        imagenPrincipal:
            serviceCoverUrl
                .value
                .trim(),

        imagenes:
            getGalleryUrls(),

        destacado:
            serviceFeatured.checked,

        activo:
            serviceActive.checked,

        estado:
            targetStatus,

        requiereRevision:
            targetStatus !==
            "publicado",

        actualizadoEn:
            serverTimestamp(),

        actualizadoPor:
            currentUser.uid
    };
}

function clearValidationErrors() {
    serviceForm
        ?.querySelectorAll(
            ".admin-editor-validation-error"
        )
        .forEach(
            (element) => {
                element.classList.remove(
                    "admin-editor-validation-error"
                );
            }
        );

    serviceForm
        ?.querySelectorAll(
            ".admin-editor-field-error"
        )
        .forEach(
            (element) => {
                element.remove();
            }
        );
}

function markFieldError(
    field,
    message
) {
    if (!field) {
        return;
    }

    field.classList.add(
        "admin-editor-validation-error"
    );

    const container =
        field.closest(
            ".admin-editor-field"
        );

    if (!container) {
        return;
    }

    const error =
        document.createElement(
            "span"
        );

    error.className =
        "admin-editor-field-error";

    error.textContent =
        message;

    container.appendChild(error);
}

function validatePriceRanges() {
    const pairs = [
        [
            priceHatchbackMin,
            priceHatchbackMax
        ],
        [
            priceSedanMin,
            priceSedanMax
        ],
        [
            priceSuvMin,
            priceSuvMax
        ],
        [
            pricePickupMin,
            pricePickupMax
        ],
        [
            priceVanMin,
            priceVanMax
        ],
        [
            priceOtherMin,
            priceOtherMax
        ]
    ];

    for (
        const [
            minField,
            maxField
        ] of pairs
    ) {
        const min =
            numberOrNull(
                minField.value
            );

        const max =
            numberOrNull(
                maxField.value
            );

        if (
            min != null &&
            min < 0
        ) {
            markFieldError(
                minField,
                "El precio no puede ser negativo."
            );

            minField.focus();

            return false;
        }

        if (
            max != null &&
            max < 0
        ) {
            markFieldError(
                maxField,
                "El precio no puede ser negativo."
            );

            maxField.focus();

            return false;
        }

        if (
            min != null &&
            max != null &&
            max < min
        ) {
            markFieldError(
                maxField,
                "El precio máximo no puede ser menor al mínimo."
            );

            maxField.focus();

            return false;
        }
    }

    return true;
}

function validateService(
    targetStatus
) {
    clearValidationErrors();

    if (
        !serviceName.value.trim()
    ) {
        markFieldError(
            serviceName,
            "Escribe el nombre del servicio."
        );

        serviceName.focus();

        return false;
    }

    if (
        serviceName.value
            .trim()
            .length < 3
    ) {
        markFieldError(
            serviceName,
            "El nombre es demasiado corto."
        );

        serviceName.focus();

        return false;
    }

    const slug =
        slugify(
            serviceSlug.value ||
            serviceName.value
        );

    serviceSlug.value =
        slug;

    if (!slug) {
        markFieldError(
            serviceSlug,
            "Escribe un slug válido."
        );

        serviceSlug.focus();

        return false;
    }

    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
            slug
        )
    ) {
        markFieldError(
            serviceSlug,
            "El slug contiene caracteres no válidos."
        );

        serviceSlug.focus();

        return false;
    }

    if (
        !validatePriceRanges()
    ) {
        return false;
    }

    if (
        targetStatus ===
        "borrador"
    ) {
        return true;
    }

    if (
        !serviceCategory.value
    ) {
        markFieldError(
            serviceCategory,
            "Selecciona una categoría."
        );

        serviceCategory.focus();

        return false;
    }

    if (
        serviceShortDescription
            .value
            .trim()
            .length < 10
    ) {
        markFieldError(
            serviceShortDescription,
            "Agrega una descripción corta del servicio."
        );

        serviceShortDescription.focus();

        return false;
    }

    const duration =
        numberOrNull(
            serviceDuration.value
        );

    if (
        duration == null ||
        duration < 30
    ) {
        markFieldError(
            serviceDuration,
            "Define una duración mínima de 30 minutos."
        );

        serviceDuration.focus();

        return false;
    }

    if (
        duration % 30 !== 0
    ) {
        markFieldError(
            serviceDuration,
            "La duración debe configurarse en intervalos de 30 minutos."
        );

        serviceDuration.focus();

        return false;
    }

    return true;
}

async function slugAlreadyExists(slug) {
    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    "servicios"
                ),
                where(
                    "slug",
                    "==",
                    slug
                )
            )
        );

    return snapshot.docs.some(
        (documentSnapshot) =>
            documentSnapshot.id !==
            editingServiceId
    );
}

async function determineDocumentId(slug) {
    if (editingServiceId) {
        return editingServiceId;
    }

    const reference =
        doc(
            db,
            "servicios",
            slug
        );

    const snapshot =
        await getDoc(reference);

    if (snapshot.exists()) {
        throw new Error(
            "SLUG_EXISTENTE"
        );
    }

    return slug;
}

function setSavingState(
    saving,
    action = "save"
) {
    savingService =
        saving;

    serviceForm
        ?.classList.toggle(
            "admin-editor-saving",
            saving
        );

    [
        saveDraftButton,
        publishServiceButton,
        saveServiceButton
    ].forEach(
        (button) => {
            if (button) {
                button.disabled =
                    saving;
            }
        }
    );

    if (!saving) {
        saveDraftButton.innerHTML = `
            <i data-lucide="file-pen-line"></i>
            Guardar borrador
        `;

        publishServiceButton.innerHTML = `
            <i data-lucide="send"></i>
            Publicar servicio
        `;

        saveServiceButton.innerHTML = `
            <i data-lucide="save"></i>
            Guardar cambios
        `;

        initIcons();

        return;
    }

    if (
        action === "draft"
    ) {
        saveDraftButton.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Guardando...
        `;
    } else if (
        action === "publish"
    ) {
        publishServiceButton.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Publicando...
        `;
    } else {
        saveServiceButton.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Guardando...
        `;
    }

    initIcons();
}

async function saveService(
    targetStatus,
    action = "save"
) {
    if (
        savingService ||
        !currentUser
    ) {
        return;
    }

    if (
        !validateService(
            targetStatus
        )
    ) {
        showToast(
            "Revisa los campos marcados.",
            "error"
        );

        return;
    }

    setSavingState(
        true,
        action
    );

    try {
        const slug =
            slugify(
                serviceSlug.value
            );

        if (
            await slugAlreadyExists(
                slug
            )
        ) {
            throw new Error(
                "SLUG_EXISTENTE"
            );
        }

        const documentId =
            await determineDocumentId(
                slug
            );

        const reference =
            doc(
                db,
                "servicios",
                documentId
            );

        const data =
            collectServiceData(
                targetStatus
            );

        if (!editingServiceId) {
            data.creadoEn =
                serverTimestamp();

            data.creadoPor =
                currentUser.uid;
        }

        await setDoc(
            reference,
            data,
            {
                merge:
                    Boolean(
                        editingServiceId
                    )
            }
        );

        editingServiceId =
            documentId;

        serviceDocumentId.value =
            documentId;

        serviceStatus.value =
            targetStatus;

        currentServiceData = {
            ...(currentServiceData || {}),
            ...data,
            id: documentId
        };

        formDirty =
            false;

        const newUrl =
            `servicio-editor.html?id=${encodeURIComponent(documentId)}`;

        window.history.replaceState(
            {},
            "",
            newUrl
        );

        updateEditorMode();
        updatePublicationStatus();

        if (
            targetStatus ===
            "publicado"
        ) {
            showToast(
                serviceActive.checked
                    ? "Servicio publicado correctamente."
                    : "Servicio publicado, pero permanece desactivado."
            );
        } else {
            showToast(
                "Borrador guardado correctamente."
            );
        }
    } catch (error) {
        console.error(
            "No se pudo guardar el servicio:",
            error
        );

        if (
            error.message ===
            "SLUG_EXISTENTE"
        ) {
            markFieldError(
                serviceSlug,
                "Ya existe otro servicio utilizando este slug."
            );

            serviceSlug.focus();

            showToast(
                "Ese slug ya está siendo utilizado.",
                "error"
            );
        } else if (
            error.code ===
            "permission-denied"
        ) {
            showToast(
                "Firestore rechazó la operación. Revisa tus permisos de administrador.",
                "error"
            );
        } else {
            showToast(
                "No se pudo guardar el servicio.",
                "error"
            );
        }
    } finally {
        setSavingState(false);
    }
}

function getCurrentSaveStatus() {
    return (
        serviceStatus.value ===
        "publicado"
            ? "publicado"
            : "borrador"
    );
}

async function serviceHasHistory() {
    if (!editingServiceId) {
        return false;
    }

    try {
        const appointmentSnapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "citas"
                    ),
                    where(
                        "servicioId",
                        "==",
                        editingServiceId
                    ),
                    limit(1)
                )
            );

        if (
            !appointmentSnapshot.empty
        ) {
            return true;
        }
    } catch (error) {
        console.error(
            "No se pudo comprobar historial de citas:",
            error
        );
    }

    try {
        const ordersSnapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "ordenes"
                    ),
                    where(
                        "servicioId",
                        "==",
                        editingServiceId
                    ),
                    limit(1)
                )
            );

        if (
            !ordersSnapshot.empty
        ) {
            return true;
        }
    } catch (error) {
        console.error(
            "No se pudo comprobar historial de órdenes:",
            error
        );
    }

    return false;
}

function openDeleteModal() {
    if (
        !editingServiceId ||
        !editorDeleteModal
    ) {
        return;
    }

    if (editorDeleteName) {
        editorDeleteName.textContent =
            serviceName.value.trim() ||
            "este servicio";
    }

    editorDeleteModal.classList.add(
        "is-open"
    );

    editorDeleteModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );
}

function closeDeleteModal() {
    if (deletingService) {
        return;
    }

    editorDeleteModal
        ?.classList.remove(
            "is-open"
        );

    editorDeleteModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );
}

async function deleteCurrentService() {
    if (
        deletingService ||
        !editingServiceId
    ) {
        return;
    }

    deletingService =
        true;

    editorConfirmDelete.disabled =
        true;

    editorConfirmDelete.innerHTML = `
        <i data-lucide="loader-circle"></i>
        Comprobando...
    `;

    initIcons();

    try {
        const hasHistory =
            await serviceHasHistory();

        if (hasHistory) {
            deletingService =
                false;

            editorConfirmDelete.disabled =
                false;

            editorConfirmDelete.innerHTML = `
                <i data-lucide="trash-2"></i>
                Eliminar
            `;

            initIcons();

            closeDeleteModal();

            showToast(
                "Este servicio ya tiene historial. Desactívalo en lugar de eliminarlo.",
                "error"
            );

            return;
        }

        editorConfirmDelete.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Eliminando...
        `;

        initIcons();

        await deleteDoc(
            doc(
                db,
                "servicios",
                editingServiceId
            )
        );

        formDirty =
            false;

        window.location.href =
            "servicios.html";
    } catch (error) {
        console.error(
            "No se pudo eliminar el servicio:",
            error
        );

        deletingService =
            false;

        editorConfirmDelete.disabled =
            false;

        editorConfirmDelete.innerHTML = `
            <i data-lucide="trash-2"></i>
            Eliminar
        `;

        initIcons();

        showToast(
            "No se pudo eliminar el servicio.",
            "error"
        );
    }
}

function handleNameInput() {
    if (!slugManuallyEdited) {
        serviceSlug.value =
            slugify(
                serviceName.value
            );
    }

    updateEditorMode();
    updateCardPreview();
    updatePreviewButton();

    formDirty =
        true;
}

function handleSlugInput() {
    slugManuallyEdited =
        true;

    serviceSlug.value =
        slugify(
            serviceSlug.value
        );

    updatePreviewButton();

    formDirty =
        true;
}

function handlePriceInput() {
    updateAutomaticPrice();
    updateCardPreview();

    formDirty =
        true;
}

function bindFormPreview() {
    serviceName
        ?.addEventListener(
            "input",
            handleNameInput
        );

    serviceSlug
        ?.addEventListener(
            "input",
            handleSlugInput
        );

    serviceShortDescription
        ?.addEventListener(
            "input",
            () => {
                updateCharacterCounter();
                updateCardPreview();

                formDirty =
                    true;
            }
        );

    serviceCategory
        ?.addEventListener(
            "change",
            () => {
                updateCardPreview();

                formDirty =
                    true;
            }
        );

    serviceDescription
        ?.addEventListener(
            "input",
            () => {
                formDirty =
                    true;
            }
        );

    serviceDuration
        ?.addEventListener(
            "input",
            () => {
                formDirty =
                    true;
            }
        );

    serviceOrder
        ?.addEventListener(
            "input",
            () => {
                formDirty =
                    true;
            }
        );

    serviceWarranty
        ?.addEventListener(
            "input",
            () => {
                formDirty =
                    true;
            }
        );

    servicePriceFrom
        ?.addEventListener(
            "input",
            () => {
                servicePriceFrom.dataset
                    .manual =
                    servicePriceFrom.value
                        ? "true"
                        : "false";

                updateCardPreview();

                formDirty =
                    true;
            }
        );

    [
        priceHatchbackMin,
        priceHatchbackMax,
        priceSedanMin,
        priceSedanMax,
        priceSuvMin,
        priceSuvMax,
        pricePickupMin,
        pricePickupMax,
        priceVanMin,
        priceVanMax,
        priceOtherMin,
        priceOtherMax
    ].forEach(
        (field) => {
            field?.addEventListener(
                "input",
                handlePriceInput
            );
        }
    );

    [
        serviceIncludes,
        serviceCleaning,
        serviceProcesses,
        serviceProtection,
        serviceOptions
    ].forEach(
        (field) => {
            field?.addEventListener(
                "input",
                () => {
                    formDirty =
                        true;
                }
            );
        }
    );

    serviceCoverUrl
        ?.addEventListener(
            "input",
            () => {
                updateCoverPreview();

                formDirty =
                    true;
            }
        );

    serviceGalleryUrls
        ?.addEventListener(
            "input",
            () => {
                renderGalleryPreview();

                formDirty =
                    true;
            }
        );

    serviceActive
        ?.addEventListener(
            "change",
            () => {
                updatePublicationStatus();

                formDirty =
                    true;
            }
        );

    serviceFeatured
        ?.addEventListener(
            "change",
            () => {
                formDirty =
                    true;
            }
        );

    coverPreviewImage
        ?.addEventListener(
            "error",
            handlePreviewImageError
        );

    editorPreviewImage
        ?.addEventListener(
            "error",
            handlePreviewImageError
        );
}

function bindSaveActions() {
    saveDraftButton
        ?.addEventListener(
            "click",
            () => {
                saveService(
                    "borrador",
                    "draft"
                );
            }
        );

    publishServiceButton
        ?.addEventListener(
            "click",
            () => {
                saveService(
                    "publicado",
                    "publish"
                );
            }
        );

    serviceForm
        ?.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                saveService(
                    getCurrentSaveStatus(),
                    "save"
                );
            }
        );
}

function bindDeleteActions() {
    editorDeleteButton
        ?.addEventListener(
            "click",
            openDeleteModal
        );

    editorDeleteBackdrop
        ?.addEventListener(
            "click",
            closeDeleteModal
        );

    editorDeleteClose
        ?.addEventListener(
            "click",
            closeDeleteModal
        );

    editorCancelDelete
        ?.addEventListener(
            "click",
            closeDeleteModal
        );

    editorConfirmDelete
        ?.addEventListener(
            "click",
            deleteCurrentService
        );
}

function bindCloudinaryPlaceholder() {
    uploadCoverButton
        ?.addEventListener(
            "click",
            () => {
                showToast(
                    "La subida directa a Cloudinary se conectará más adelante."
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

    if (
        formDirty &&
        !window.confirm(
            "Hay cambios sin guardar. ¿Quieres cerrar sesión de todos modos?"
        )
    ) {
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
                event.key !== "Escape"
            ) {
                return;
            }

            if (
                editorDeleteModal
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

function bindDirtyProtection() {
    window.addEventListener(
        "beforeunload",
        (event) => {
            if (
                !formDirty ||
                savingService ||
                deletingService
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

    bindSidebar();
    bindLogout();
    bindFormPreview();
    bindSaveActions();
    bindDeleteActions();
    bindCloudinaryPlaceholder();
    bindKeyboard();
    bindDirtyProtection();

    const allowed =
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    const loaded =
        await loadServiceForEdit();

    if (!loaded) {
        hideLoader();
        return;
    }

    updateAllPreviews();

    formDirty =
        false;

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