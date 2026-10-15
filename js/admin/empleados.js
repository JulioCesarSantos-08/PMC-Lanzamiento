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
    getDocs,
    serverTimestamp,
    updateDoc
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

const employeesTotalCount =
    document.getElementById("employeesTotalCount");

const employeesActiveCount =
    document.getElementById("employeesActiveCount");

const employeesAdminCount =
    document.getElementById("employeesAdminCount");

const employeesOperationCount =
    document.getElementById("employeesOperationCount");

const employeeSearch =
    document.getElementById("employeeSearch");

const employeeRoleFilter =
    document.getElementById("employeeRoleFilter");

const employeeStatusFilter =
    document.getElementById("employeeStatusFilter");

const employeesResultsCount =
    document.getElementById("employeesResultsCount");

const resetEmployeeFilters =
    document.getElementById("resetEmployeeFilters");

const employeesEmptyReset =
    document.getElementById("employeesEmptyReset");

const employeesList =
    document.getElementById("employeesList");

const employeesEmpty =
    document.getElementById("employeesEmpty");

const employeeDetailsModal =
    document.getElementById("employeeDetailsModal");

const employeeDetailsBackdrop =
    document.getElementById("employeeDetailsBackdrop");

const employeeDetailsClose =
    document.getElementById("employeeDetailsClose");

const employeeDetailsCancel =
    document.getElementById("employeeDetailsCancel");

const employeeDetailsAvatar =
    document.getElementById("employeeDetailsAvatar");

const employeeDetailsName =
    document.getElementById("employeeDetailsName");

const employeeDetailsEmail =
    document.getElementById("employeeDetailsEmail");

const employeeDetailsStatus =
    document.getElementById("employeeDetailsStatus");

const employeeDetailsRole =
    document.getElementById("employeeDetailsRole");

const employeePermissionAdmin =
    document.getElementById("employeePermissionAdmin");

const employeePermissionOperation =
    document.getElementById("employeePermissionOperation");

const employeePermissionFinance =
    document.getElementById("employeePermissionFinance");

const employeeEditName =
    document.getElementById("employeeEditName");

const employeeEditRole =
    document.getElementById("employeeEditRole");

const employeeActive =
    document.getElementById("employeeActive");

const employeeDetailsSave =
    document.getElementById("employeeDetailsSave");

const newEmployeeButton =
    document.getElementById("newEmployeeButton");

const newEmployeeButtonHero =
    document.getElementById("newEmployeeButtonHero");

const newEmployeeModal =
    document.getElementById("newEmployeeModal");

const newEmployeeBackdrop =
    document.getElementById("newEmployeeBackdrop");

const newEmployeeClose =
    document.getElementById("newEmployeeClose");

const newEmployeeCancel =
    document.getElementById("newEmployeeCancel");

const newEmployeeForm =
    document.getElementById("newEmployeeForm");

const newEmployeeName =
    document.getElementById("newEmployeeName");

const newEmployeeEmail =
    document.getElementById("newEmployeeEmail");

const newEmployeeRole =
    document.getElementById("newEmployeeRole");

const newEmployeeStatus =
    document.getElementById("newEmployeeStatus");

const newEmployeePermissionAdmin =
    document.getElementById("newEmployeePermissionAdmin");

const newEmployeePermissionOperation =
    document.getElementById("newEmployeePermissionOperation");

const newEmployeePermissionFinance =
    document.getElementById("newEmployeePermissionFinance");

const newEmployeeSubmit =
    document.getElementById("newEmployeeSubmit");

const adminToast =
    document.getElementById("adminToast");

let currentUser = null;
let currentUserData = null;

let allUsers = [];
let employees = [];
let filteredEmployees = [];

let selectedEmployee = null;

let searchTerm = "";
let roleFilter = "todos";
let statusFilter = "todos";

let savingEmployee = false;
let addingEmployee = false;
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

function normalizeEmail(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
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

function userHasOperation(data) {
    return (
        data?.rol === "empleado" ||
        getPermissions(data)
            .operacion === true
    );
}

function isInternalUser(data) {
    const permissions =
        getPermissions(data);

    return (
        data?.rol === "admin" ||
        data?.rol === "empleado" ||
        permissions.admin === true ||
        permissions.operacion === true ||
        permissions.finanzas === true
    );
}

function isCurrentUser(employee) {
    return (
        currentUser &&
        employee?.id === currentUser.uid
    );
}

function getRoleLabel(employee) {
    if (
        employee?.rol === "admin" ||
        getPermissions(employee)
            .admin === true
    ) {
        return "Administrador";
    }

    return "Empleado";
}

function getRoleKey(employee) {
    if (
        employee?.rol === "admin" ||
        getPermissions(employee)
            .admin === true
    ) {
        return "admin";
    }

    return "empleado";
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
            "js/admin/empleados.html"
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

async function loadEmployees() {
    if (employeesList) {
        employeesList.hidden =
            false;

        employeesList.innerHTML = `
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
            <div class="admin-skeleton"></div>
        `;
    }

    if (employeesEmpty) {
        employeesEmpty.hidden =
            true;
    }

    try {
        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        allUsers =
            snapshot.docs.map(
                (
                    documentSnapshot
                ) => ({
                    id:
                        documentSnapshot.id,
                    ...documentSnapshot.data()
                })
            );

        employees =
            allUsers
                .filter(
                    (user) =>
                        isInternalUser(user)
                )
                .sort(
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

        renderSummary();
        applyFilters();
    } catch (error) {
        console.error(
            "No se pudo cargar el personal:",
            error
        );

        allUsers = [];
        employees = [];
        filteredEmployees = [];

        renderSummary();
        renderEmployees();

        showToast(
            "No se pudo cargar el personal.",
            "error"
        );
    }
}

function renderSummary() {
    const total =
        employees.length;

    const active =
        employees.filter(
            (employee) =>
                employee.activo !==
                false
        ).length;

    const admins =
        employees.filter(
            (employee) =>
                userIsAdmin(employee)
        ).length;

    const operation =
        employees.filter(
            (employee) =>
                userHasOperation(
                    employee
                )
        ).length;

    if (employeesTotalCount) {
        employeesTotalCount.textContent =
            String(total);
    }

    if (employeesActiveCount) {
        employeesActiveCount.textContent =
            String(active);
    }

    if (employeesAdminCount) {
        employeesAdminCount.textContent =
            String(admins);
    }

    if (employeesOperationCount) {
        employeesOperationCount.textContent =
            String(operation);
    }
}

function getEmployeeSearchText(
    employee
) {
    return normalizeText(
        [
            employee.nombre,
            employee.email,
            employee.id,
            employee.rol,
            userIsAdmin(employee)
                ? "administrador"
                : "",
            userHasOperation(employee)
                ? "operacion"
                : "",
            userHasFinance(employee)
                ? "finanzas"
                : ""
        ]
            .filter(Boolean)
            .join(" ")
    );
}

function matchesRole(
    employee
) {
    if (
        roleFilter === "todos"
    ) {
        return true;
    }

    return (
        getRoleKey(employee) ===
        roleFilter
    );
}

function matchesStatus(
    employee
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
            employee.activo !==
            false
        );
    }

    if (
        statusFilter ===
        "inactivos"
    ) {
        return (
            employee.activo ===
            false
        );
    }

    return true;
}

function applyFilters() {
    filteredEmployees =
        employees.filter(
            (employee) => {
                const searchMatches =
                    !searchTerm ||
                    getEmployeeSearchText(
                        employee
                    ).includes(
                        searchTerm
                    );

                return (
                    searchMatches &&
                    matchesRole(
                        employee
                    ) &&
                    matchesStatus(
                        employee
                    )
                );
            }
        );

    renderEmployees();
}

function updateResultsCount() {
    if (!employeesResultsCount) {
        return;
    }

    const count =
        filteredEmployees.length;

    employeesResultsCount.textContent =
        count === 1
            ? "1 empleado"
            : `${count} empleados`;
}

function buildAvatarHTML(
    employee
) {
    const photo =
        employee.fotoURL ||
        employee.foto ||
        employee.photoURL ||
        "";

    if (!photo) {
        return escapeHTML(
            getInitials(
                employee.nombre ||
                employee.email ||
                "PMC"
            )
        );
    }

    return `
        <img
            src="${escapeHTML(photo)}"
            alt="${escapeHTML(
                employee.nombre ||
                "Personal PMC"
            )}"
        >
    `;
}

function buildPermissionsHTML(
    employee
) {
    const permissions =
        getPermissions(employee);

    const items = [];

    if (
        permissions.admin ===
            true ||
        employee.rol === "admin"
    ) {
        items.push(`
            <span class="admin-employee-card__permission is-active">

                <i data-lucide="shield-check"></i>

                Admin

            </span>
        `);
    }

    if (
        permissions.operacion ===
            true ||
        employee.rol === "empleado"
    ) {
        items.push(`
            <span class="admin-employee-card__permission is-active">

                <i data-lucide="wrench"></i>

                Operación

            </span>
        `);
    }

    if (
        permissions.finanzas ===
        true
    ) {
        items.push(`
            <span class="admin-employee-card__permission is-finance">

                <i data-lucide="landmark"></i>

                Finanzas

            </span>
        `);
    }

    if (!items.length) {
        return `
            <span class="admin-employee-card__permission">

                Sin permisos

            </span>
        `;
    }

    return items.join("");
}

function createEmployeeCard(
    employee
) {
    const active =
        employee.activo !==
        false;

    const admin =
        userIsAdmin(employee);

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "admin-employee-card";

    if (!active) {
        article.classList.add(
            "is-inactive"
        );
    }

    article.innerHTML = `
        <div class="admin-employee-card__avatar">
            ${buildAvatarHTML(
                employee
            )}
        </div>

        <div class="admin-employee-card__main">

            <h3>
                ${escapeHTML(
                    employee.nombre ||
                    "Personal PMC"
                )}
            </h3>

            <span>
                ${escapeHTML(
                    employee.email ||
                    "Sin correo"
                )}
            </span>

            <div class="admin-employee-card__meta">

                <i data-lucide="${
                    admin
                        ? "shield-check"
                        : "badge-check"
                }"></i>

                <span>
                    ${
                        isCurrentUser(
                            employee
                        )
                            ? "Tu cuenta"
                            : (
                                admin
                                    ? "Administración PMC"
                                    : "Personal operativo"
                            )
                    }
                </span>

            </div>

        </div>

        <span class="admin-employee-role ${
            admin
                ? "is-admin"
                : ""
        }">

            ${
                admin
                    ? "Administrador"
                    : "Empleado"
            }

        </span>

        <div class="admin-employee-card__permissions">

            ${buildPermissionsHTML(
                employee
            )}

        </div>

        <div class="admin-employee-card__end">

            <span class="admin-employee-status ${
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
                class="admin-employee-card__open"
                data-employee-id="${escapeHTML(
                    employee.id
                )}"
                aria-label="Editar empleado"
                title="Editar empleado"
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
                                ".admin-employee-card__avatar"
                            );

                        if (avatar) {
                            avatar.innerHTML =
                                escapeHTML(
                                    getInitials(
                                        employee.nombre ||
                                        employee.email ||
                                        "PMC"
                                    )
                                );
                        }
                    }
                );
            }
        );

    return article;
}

function renderEmployees() {
    if (!employeesList) {
        return;
    }

    employeesList.innerHTML =
        "";

    updateResultsCount();

    if (
        !filteredEmployees.length
    ) {
        employeesList.hidden =
            true;

        if (employeesEmpty) {
            employeesEmpty.hidden =
                false;
        }

        return;
    }

    employeesList.hidden =
        false;

    if (employeesEmpty) {
        employeesEmpty.hidden =
            true;
    }

    const fragment =
        document.createDocumentFragment();

    filteredEmployees.forEach(
        (employee) => {
            fragment.appendChild(
                createEmployeeCard(
                    employee
                )
            );
        }
    );

    employeesList.appendChild(
        fragment
    );

    initIcons();
}

function resetFilters() {
    searchTerm = "";
    roleFilter = "todos";
    statusFilter = "todos";

    if (employeeSearch) {
        employeeSearch.value =
            "";
    }

    if (employeeRoleFilter) {
        employeeRoleFilter.value =
            "todos";
    }

    if (employeeStatusFilter) {
        employeeStatusFilter.value =
            "todos";
    }

    applyFilters();
}

function renderModalAvatar(
    employee
) {
    if (!employeeDetailsAvatar) {
        return;
    }

    employeeDetailsAvatar.innerHTML =
        "";

    const photo =
        employee.fotoURL ||
        employee.foto ||
        employee.photoURL ||
        "";

    if (!photo) {
        employeeDetailsAvatar.textContent =
            getInitials(
                employee.nombre ||
                employee.email ||
                "PMC"
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
        employee.nombre ||
        "Personal PMC";

    image.addEventListener(
        "error",
        () => {
            employeeDetailsAvatar.innerHTML =
                "";

            employeeDetailsAvatar.textContent =
                getInitials(
                    employee.nombre ||
                    employee.email ||
                    "PMC"
                );
        }
    );

    employeeDetailsAvatar.appendChild(
        image
    );
}

function setModalStatus(
    employee
) {
    const active =
        employee.activo !==
        false;

    if (employeeDetailsStatus) {
        employeeDetailsStatus.className =
            `admin-employee-status ${
                active
                    ? ""
                    : "is-inactive"
            }`;

        employeeDetailsStatus.textContent =
            active
                ? "Activo"
                : "Inactivo";
    }

    const admin =
        userIsAdmin(employee);

    if (employeeDetailsRole) {
        employeeDetailsRole.className =
            `admin-employee-role ${
                admin
                    ? "is-admin"
                    : ""
            }`;

        employeeDetailsRole.textContent =
            admin
                ? "Administrador"
                : "Empleado";
    }
}

function setOwnAccountProtection(
    employee
) {
    const own =
        isCurrentUser(employee);

    if (employeeEditRole) {
        employeeEditRole.disabled =
            own;
    }

    if (employeePermissionAdmin) {
        employeePermissionAdmin.disabled =
            own;
    }

    if (employeeActive) {
        employeeActive.disabled =
            own;
    }
}

function openEmployeeDetails(
    employeeId
) {
    const employee =
        employees.find(
            (item) =>
                item.id ===
                employeeId
        );

    if (
        !employee ||
        !employeeDetailsModal
    ) {
        return;
    }

    selectedEmployee =
        employee;

    renderModalAvatar(
        employee
    );

    if (employeeDetailsName) {
        employeeDetailsName.textContent =
            employee.nombre ||
            "Personal PMC";
    }

    if (employeeDetailsEmail) {
        employeeDetailsEmail.textContent =
            employee.email ||
            "Sin correo";
    }

    setModalStatus(
        employee
    );

    const permissions =
        getPermissions(employee);

    if (employeePermissionAdmin) {
        employeePermissionAdmin.checked =
            permissions.admin === true ||
            employee.rol === "admin";
    }

    if (employeePermissionOperation) {
        employeePermissionOperation.checked =
            permissions.operacion === true ||
            employee.rol === "empleado";
    }

    if (employeePermissionFinance) {
        employeePermissionFinance.checked =
            permissions.finanzas === true;
    }

    if (employeeEditName) {
        employeeEditName.value =
            employee.nombre ||
            "";
    }

    if (employeeEditRole) {
        employeeEditRole.value =
            getRoleKey(employee);
    }

    if (employeeActive) {
        employeeActive.checked =
            employee.activo !==
            false;
    }

    setOwnAccountProtection(
        employee
    );

    employeeDetailsModal.classList.add(
        "is-open"
    );

    employeeDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );

    initIcons();
}

function closeEmployeeDetails() {
    if (savingEmployee) {
        return;
    }

    employeeDetailsModal
        ?.classList.remove(
            "is-open"
        );

    employeeDetailsModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );

    selectedEmployee =
        null;
}

function setSavingEmployeeState(
    state
) {
    savingEmployee =
        state;

    if (!employeeDetailsSave) {
        return;
    }

    employeeDetailsSave.disabled =
        state;

    employeeDetailsSave.innerHTML =
        state
            ? `
                <i data-lucide="loader-circle"></i>
                Guardando...
            `
            : `
                <i data-lucide="save"></i>
                Guardar cambios
            `;

    initIcons();
}

function getEmployeePayload() {
    if (!selectedEmployee) {
        return null;
    }

    const own =
        isCurrentUser(
            selectedEmployee
        );

    let role =
        employeeEditRole?.value ||
        "empleado";

    let active =
        employeeActive?.checked !==
        false;

    let permissionAdmin =
        employeePermissionAdmin
            ?.checked === true;

    const permissionOperation =
        employeePermissionOperation
            ?.checked === true;

    const permissionFinance =
        employeePermissionFinance
            ?.checked === true;

    if (own) {
        role =
            "admin";

        active =
            true;

        permissionAdmin =
            true;
    }

    if (
        role === "admin"
    ) {
        permissionAdmin =
            true;
    }

    if (
        role === "empleado" &&
        !permissionAdmin
    ) {
        if (
            !permissionOperation &&
            !permissionFinance
        ) {
            return {
                error:
                    "El empleado debe conservar al menos un permiso."
            };
        }
    }

    const name =
        employeeEditName
            ?.value
            .trim() ||
        "";

    if (!name) {
        return {
            error:
                "Escribe el nombre del empleado."
        };
    }

    return {
        nombre:
            name,
        rol:
            role,
        activo:
            active,
        permisos: {
            ...getPermissions(
                selectedEmployee
            ),
            admin:
                permissionAdmin,
            operacion:
                permissionOperation,
            finanzas:
                permissionFinance
        },
        actualizadoEn:
            serverTimestamp()
    };
}

async function saveEmployee() {
    if (
        !selectedEmployee ||
        savingEmployee
    ) {
        return;
    }

    const payload =
        getEmployeePayload();

    if (!payload) {
        return;
    }

    if (payload.error) {
        showToast(
            payload.error,
            "error"
        );

        return;
    }

    setSavingEmployeeState(
        true
    );

    try {
        await updateDoc(
            doc(
                db,
                "usuarios",
                selectedEmployee.id
            ),
            payload
        );

        selectedEmployee.nombre =
            payload.nombre;

        selectedEmployee.rol =
            payload.rol;

        selectedEmployee.activo =
            payload.activo;

        selectedEmployee.permisos =
            payload.permisos;

        const globalUser =
            allUsers.find(
                (user) =>
                    user.id ===
                    selectedEmployee.id
            );

        if (globalUser) {
            Object.assign(
                globalUser,
                {
                    nombre:
                        payload.nombre,
                    rol:
                        payload.rol,
                    activo:
                        payload.activo,
                    permisos:
                        payload.permisos
                }
            );
        }

        if (
            selectedEmployee.id ===
            currentUser.uid
        ) {
            currentUserData.nombre =
                payload.nombre;

            currentUserData.rol =
                payload.rol;

            currentUserData.activo =
                payload.activo;

            currentUserData.permisos =
                payload.permisos;

            renderAdminProfile();
        }

        renderSummary();
        applyFilters();

        setModalStatus(
            selectedEmployee
        );

        if (employeeDetailsName) {
            employeeDetailsName.textContent =
                payload.nombre;
        }

        setSavingEmployeeState(
            false
        );

        closeEmployeeDetails();

        showToast(
            "Empleado actualizado correctamente."
        );
    } catch (error) {
        console.error(
            "No se pudo actualizar el empleado:",
            error
        );

        setSavingEmployeeState(
            false
        );

        showToast(
            "No se pudieron guardar los cambios.",
            "error"
        );
    }
}

function openNewEmployeeModal() {
    if (!newEmployeeModal) {
        return;
    }

    newEmployeeForm?.reset();

    if (newEmployeeRole) {
        newEmployeeRole.value =
            "empleado";
    }

    if (newEmployeeStatus) {
        newEmployeeStatus.value =
            "activo";
    }

    if (
        newEmployeePermissionAdmin
    ) {
        newEmployeePermissionAdmin.checked =
            false;
    }

    if (
        newEmployeePermissionOperation
    ) {
        newEmployeePermissionOperation.checked =
            true;
    }

    if (
        newEmployeePermissionFinance
    ) {
        newEmployeePermissionFinance.checked =
            false;
    }

    newEmployeeModal.classList.add(
        "is-open"
    );

    newEmployeeModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "admin-modal-open"
    );

    initIcons();
}

function closeNewEmployeeModal() {
    if (addingEmployee) {
        return;
    }

    newEmployeeModal
        ?.classList.remove(
            "is-open"
        );

    newEmployeeModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );

    document.body.classList.remove(
        "admin-modal-open"
    );
}

function setAddingEmployeeState(
    state
) {
    addingEmployee =
        state;

    if (!newEmployeeSubmit) {
        return;
    }

    newEmployeeSubmit.disabled =
        state;

    newEmployeeSubmit.innerHTML =
        state
            ? `
                <i data-lucide="loader-circle"></i>
                Agregando...
            `
            : `
                <i data-lucide="user-plus"></i>
                Agregar empleado
            `;

    initIcons();
}

function findUserByEmail(email) {
    const normalized =
        normalizeEmail(email);

    return (
        allUsers.find(
            (user) =>
                normalizeEmail(
                    user.email
                ) ===
                normalized
        ) ||
        null
    );
}

async function addExistingUserAsEmployee(
    event
) {
    event.preventDefault();

    if (addingEmployee) {
        return;
    }

    const name =
        newEmployeeName
            ?.value
            .trim() ||
        "";

    const email =
        normalizeEmail(
            newEmployeeEmail
                ?.value
        );

    const role =
        newEmployeeRole
            ?.value ||
        "empleado";

    const active =
        newEmployeeStatus
            ?.value !==
        "inactivo";

    if (
        !name ||
        !email
    ) {
        showToast(
            "Completa nombre y correo.",
            "error"
        );

        return;
    }

    const existingUser =
        findUserByEmail(
            email
        );

    if (!existingUser) {
        showToast(
            "Ese correo todavía no tiene una cuenta registrada. Primero debe registrarse en PMC y después podrás asignarle permisos aquí.",
            "error"
        );

        return;
    }

    if (
        isInternalUser(
            existingUser
        )
    ) {
        showToast(
            "Ese usuario ya pertenece al equipo de PMC.",
            "error"
        );

        return;
    }

    let permissionAdmin =
        newEmployeePermissionAdmin
            ?.checked === true;

    let permissionOperation =
        newEmployeePermissionOperation
            ?.checked === true;

    const permissionFinance =
        newEmployeePermissionFinance
            ?.checked === true;

    if (
        role === "admin"
    ) {
        permissionAdmin =
            true;
    }

    if (
        role === "empleado" &&
        !permissionOperation &&
        !permissionFinance &&
        !permissionAdmin
    ) {
        permissionOperation =
            true;
    }

    const payload = {
        nombre:
            name,
        rol:
            role,
        activo:
            active,
        permisos: {
            ...getPermissions(
                existingUser
            ),
            cliente:
                false,
            admin:
                permissionAdmin,
            operacion:
                permissionOperation,
            finanzas:
                permissionFinance
        },
        actualizadoEn:
            serverTimestamp()
    };

    setAddingEmployeeState(
        true
    );

    try {
        await updateDoc(
            doc(
                db,
                "usuarios",
                existingUser.id
            ),
            payload
        );

        setAddingEmployeeState(
            false
        );

        closeNewEmployeeModal();

        await loadEmployees();

        showToast(
            "Usuario agregado al equipo de PMC."
        );
    } catch (error) {
        console.error(
            "No se pudo agregar el empleado:",
            error
        );

        setAddingEmployeeState(
            false
        );

        showToast(
            "No se pudo agregar al empleado.",
            "error"
        );
    }
}

function syncRoleWithAdminPermission() {
    if (
        !newEmployeeRole ||
        !newEmployeePermissionAdmin
    ) {
        return;
    }

    if (
        newEmployeeRole.value ===
        "admin"
    ) {
        newEmployeePermissionAdmin.checked =
            true;
    }
}

function syncEditRoleWithAdminPermission() {
    if (
        !employeeEditRole ||
        !employeePermissionAdmin
    ) {
        return;
    }

    if (
        employeeEditRole.value ===
        "admin"
    ) {
        employeePermissionAdmin.checked =
            true;
    }
}

function bindFilters() {
    employeeSearch
        ?.addEventListener(
            "input",
            () => {
                searchTerm =
                    normalizeText(
                        employeeSearch.value
                    );

                applyFilters();
            }
        );

    employeeRoleFilter
        ?.addEventListener(
            "change",
            () => {
                roleFilter =
                    employeeRoleFilter.value;

                applyFilters();
            }
        );

    employeeStatusFilter
        ?.addEventListener(
            "change",
            () => {
                statusFilter =
                    employeeStatusFilter.value;

                applyFilters();
            }
        );

    resetEmployeeFilters
        ?.addEventListener(
            "click",
            resetFilters
        );

    employeesEmptyReset
        ?.addEventListener(
            "click",
            resetFilters
        );
}

function bindEmployeeList() {
    employeesList
        ?.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-employee-id]"
                    );

                if (!button) {
                    return;
                }

                openEmployeeDetails(
                    button.dataset
                        .employeeId
                );
            }
        );
}

function bindEmployeeModal() {
    employeeDetailsBackdrop
        ?.addEventListener(
            "click",
            closeEmployeeDetails
        );

    employeeDetailsClose
        ?.addEventListener(
            "click",
            closeEmployeeDetails
        );

    employeeDetailsCancel
        ?.addEventListener(
            "click",
            closeEmployeeDetails
        );

    employeeDetailsSave
        ?.addEventListener(
            "click",
            saveEmployee
        );

    employeeEditRole
        ?.addEventListener(
            "change",
            syncEditRoleWithAdminPermission
        );
}

function bindNewEmployeeModal() {
    newEmployeeButton
        ?.addEventListener(
            "click",
            openNewEmployeeModal
        );

    newEmployeeButtonHero
        ?.addEventListener(
            "click",
            openNewEmployeeModal
        );

    newEmployeeBackdrop
        ?.addEventListener(
            "click",
            closeNewEmployeeModal
        );

    newEmployeeClose
        ?.addEventListener(
            "click",
            closeNewEmployeeModal
        );

    newEmployeeCancel
        ?.addEventListener(
            "click",
            closeNewEmployeeModal
        );

    newEmployeeRole
        ?.addEventListener(
            "change",
            syncRoleWithAdminPermission
        );

    newEmployeeForm
        ?.addEventListener(
            "submit",
            addExistingUserAsEmployee
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
                newEmployeeModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeNewEmployeeModal();

                return;
            }

            if (
                employeeDetailsModal
                    ?.classList.contains(
                        "is-open"
                    )
            ) {
                closeEmployeeDetails();

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
    bindEmployeeList();
    bindEmployeeModal();
    bindNewEmployeeModal();
    bindKeyboard();

    const allowed =
        await validateAdminAccess();

    if (!allowed) {
        return;
    }

    await loadEmployees();

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