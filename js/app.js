const LAUNCH_DATE = new Date("2026-10-14T09:00:00-06:00");

const pageLoader = document.getElementById("pageLoader");
const header = document.getElementById("header");
const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");
const cursorGlow = document.getElementById("cursorGlow");

const countdown = document.getElementById("countdown");
const launchMessage = document.getElementById("launchMessage");

const countDays = document.getElementById("countDays");
const countHours = document.getElementById("countHours");
const countMinutes = document.getElementById("countMinutes");
const countSeconds = document.getElementById("countSeconds");

const systemModal = document.getElementById("systemModal");
const servicesModal = document.getElementById("servicesModal");

const openSystemModal = document.getElementById("openSystemModal");
const trySystemButton = document.getElementById("trySystemButton");
const fakeSendButton = document.getElementById("fakeSendButton");
const openServicesModal = document.getElementById("openServicesModal");

const heartButton = document.getElementById("heartButton");
const heartCount = document.getElementById("heartCount");
const heartMessage = document.getElementById("heartMessage");
const toast = document.getElementById("toast");

const currentYear = document.getElementById("currentYear");

let toastTimer = null;
let localHeartTotal = Number(localStorage.getItem("pmcHeartTotal")) || 0;
let hasLiked = localStorage.getItem("pmcHeartLiked") === "true";

window.addEventListener("load", () => {
    setTimeout(() => {
        pageLoader?.classList.add("hidden");

        setTimeout(() => {
            pageLoader?.remove();
        }, 900);
    }, 900);
});

function updateHeader() {
    if (!header) return;

    if (window.scrollY > 30) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
}

updateHeader();

window.addEventListener("scroll", updateHeader, {
    passive: true
});

function openMenu() {
    if (!menuButton || !mobileMenu) return;

    menuButton.classList.add("active");
    mobileMenu.classList.add("active");
    document.body.classList.add("menu-open");
}

function closeMenu() {
    if (!menuButton || !mobileMenu) return;

    menuButton.classList.remove("active");
    mobileMenu.classList.remove("active");
    document.body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
    if (mobileMenu.classList.contains("active")) {
        closeMenu();
    } else {
        openMenu();
    }
});

document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
    if (window.innerWidth >= 850) {
        closeMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
        closeAllModals();
    }
});

function formatCountdownNumber(value) {
    return String(value).padStart(2, "0");
}

function updateCountdown() {
    if (
        !countDays ||
        !countHours ||
        !countMinutes ||
        !countSeconds
    ) {
        return;
    }

    const now = new Date();
    const difference = LAUNCH_DATE.getTime() - now.getTime();

    if (difference <= 0) {
        countDays.textContent = "00";
        countHours.textContent = "00";
        countMinutes.textContent = "00";
        countSeconds.textContent = "00";

        if (countdown) {
            countdown.hidden = true;
        }

        if (launchMessage) {
            launchMessage.hidden = false;
        }

        return;
    }

    const totalSeconds = Math.floor(difference / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countDays.textContent = formatCountdownNumber(days);
    countHours.textContent = formatCountdownNumber(hours);
    countMinutes.textContent = formatCountdownNumber(minutes);
    countSeconds.textContent = formatCountdownNumber(seconds);
}

updateCountdown();

setInterval(updateCountdown, 1000);

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    revealElements.forEach((element, index) => {
        const delay = Math.min(index % 4, 3) * 70;

        element.style.transitionDelay = `${delay}ms`;
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });
}

function openModal(modal) {
    if (!modal) return;

    closeMenu();

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");

    const anyModalOpen = document.querySelector(".modal.active");

    if (!anyModalOpen) {
        document.body.classList.remove("modal-open");
    }
}

function closeAllModals() {
    document.querySelectorAll(".modal.active").forEach((modal) => {
        closeModal(modal);
    });
}

openSystemModal?.addEventListener("click", () => {
    openModal(systemModal);
});

trySystemButton?.addEventListener("click", () => {
    openModal(systemModal);
});

fakeSendButton?.addEventListener("click", () => {
    openModal(systemModal);
});

openServicesModal?.addEventListener("click", () => {
    openModal(servicesModal);
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", () => {
        closeModal(systemModal);
    });
});

document.querySelectorAll("[data-close-services]").forEach((element) => {
    element.addEventListener("click", () => {
        closeModal(servicesModal);
    });
});

function showToast() {
    if (!toast) return;

    toast.classList.add("active");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("active");
    }, 3500);
}

function updateLocalHeartUI() {
    if (!heartCount || !heartButton || !heartMessage) return;

    heartCount.textContent = localHeartTotal.toLocaleString("es-MX");

    if (hasLiked) {
        heartButton.classList.add("liked");
        heartMessage.textContent = "Ya eres parte de PMC";
        heartButton.setAttribute(
            "aria-label",
            "Ya dejaste tu corazón a PMC"
        );
    } else {
        heartButton.classList.remove("liked");
        heartMessage.textContent = "Toca el corazón";
        heartButton.setAttribute(
            "aria-label",
            "Me emociona PMC"
        );
    }
}

updateLocalHeartUI();

function createHeartParticles(button) {
    if (!button) return;

    const rect = button.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const totalParticles = 12;

    for (let i = 0; i < totalParticles; i++) {
        const particle = document.createElement("i");

        particle.className = "fa-solid fa-heart heart-particle";

        const angle =
            (Math.PI * 2 * i) / totalParticles +
            (Math.random() * 0.35);

        const distance = 45 + Math.random() * 70;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const rotation = `${Math.floor(
            Math.random() * 90 - 45
        )}deg`;

        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;

        particle.style.setProperty(
            "--particle-x",
            `${x}px`
        );

        particle.style.setProperty(
            "--particle-y",
            `${y}px`
        );

        particle.style.setProperty(
            "--particle-rotate",
            rotation
        );

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1200);
    }
}

async function handleHeartClick() {
    if (!heartButton) return;

    if (hasLiked) {
        heartButton.animate(
            [
                {
                    transform: "scale(1)"
                },
                {
                    transform: "scale(0.94)"
                },
                {
                    transform: "scale(1)"
                }
            ],
            {
                duration: 260,
                easing: "ease-out"
            }
        );

        return;
    }

    hasLiked = true;
    localHeartTotal += 1;

    localStorage.setItem("pmcHeartLiked", "true");
    localStorage.setItem(
        "pmcHeartTotal",
        String(localHeartTotal)
    );

    updateLocalHeartUI();
    createHeartParticles(heartButton);
    showToast();

    window.dispatchEvent(
        new CustomEvent("pmc-heart-added")
    );
}

heartButton?.addEventListener("click", handleHeartClick);

window.addEventListener("pmc-heart-total", (event) => {
    const total = Number(event.detail?.total);

    if (!Number.isFinite(total)) return;

    localHeartTotal = total;

    localStorage.setItem(
        "pmcHeartTotal",
        String(total)
    );

    updateLocalHeartUI();
});

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        closeMenu();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

if (
    cursorGlow &&
    window.matchMedia("(pointer: fine)").matches
) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    let currentX = targetX;
    let currentY = targetY;

    document.addEventListener("mousemove", (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
    });

    function animateCursorGlow() {
        currentX += (targetX - currentX) * 0.09;
        currentY += (targetY - currentY) * 0.09;

        cursorGlow.style.left = `${currentX}px`;
        cursorGlow.style.top = `${currentY}px`;

        requestAnimationFrame(animateCursorGlow);
    }

    animateCursorGlow();
}

const interactiveElements = document.querySelectorAll(
    ".service-card, .social-card, .button, .heart-button"
);

interactiveElements.forEach((element) => {
    element.addEventListener("pointerdown", () => {
        element.style.transform = "scale(0.985)";
    });

    element.addEventListener("pointerup", () => {
        element.style.transform = "";
    });

    element.addEventListener("pointercancel", () => {
        element.style.transform = "";
    });

    element.addEventListener("pointerleave", () => {
        element.style.transform = "";
    });
});

let logoClicks = 0;
let logoClickTimer = null;

document
    .querySelectorAll(".header-brand, .hero-logo")
    .forEach((logo) => {
        logo.addEventListener("click", (event) => {
            if (
                logo.classList.contains("hero-logo")
            ) {
                event.preventDefault();
            }

            logoClicks += 1;

            clearTimeout(logoClickTimer);

            logoClickTimer = setTimeout(() => {
                logoClicks = 0;
            }, 1700);

            if (logoClicks >= 5) {
                logoClicks = 0;

                showSecretMessage();
            }
        });
    });

function showSecretMessage() {
    const existingSecret = document.querySelector(
        ".pmc-secret-message"
    );

    if (existingSecret) {
        existingSecret.remove();
    }

    const secret = document.createElement("div");

    secret.className = "pmc-secret-message";

    secret.innerHTML = `
        <span>👀</span>
        <strong>Ya vimos que te gustó el logo.</strong>
        <p>Pero deja de picarle... el sistema todavía no está listo 😂</p>
    `;

    Object.assign(secret.style, {
        position: "fixed",
        left: "50%",
        bottom: "25px",
        zIndex: "7000",
        width: "calc(100% - 30px)",
        maxWidth: "390px",
        padding: "16px",
        border:
            "1px solid rgba(41, 171, 255, 0.18)",
        borderRadius: "14px",
        background: "rgba(7, 13, 18, 0.96)",
        boxShadow:
            "0 25px 70px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(15px)",
        textAlign: "center",
        transform:
            "translate(-50%, 20px)",
        opacity: "0",
        transition:
            "opacity .35s ease, transform .35s ease"
    });

    const secretSpan =
        secret.querySelector("span");

    const secretStrong =
        secret.querySelector("strong");

    const secretParagraph =
        secret.querySelector("p");

    Object.assign(secretSpan.style, {
        display: "block",
        marginBottom: "7px",
        fontSize: "1.25rem"
    });

    Object.assign(secretStrong.style, {
        display: "block",
        color: "#e9f3f9",
        fontSize: ".78rem"
    });

    Object.assign(secretParagraph.style, {
        marginTop: "5px",
        color: "#74838e",
        fontSize: ".68rem",
        lineHeight: "1.5"
    });

    document.body.appendChild(secret);

    requestAnimationFrame(() => {
        secret.style.opacity = "1";
        secret.style.transform =
            "translate(-50%, 0)";
    });

    setTimeout(() => {
        secret.style.opacity = "0";
        secret.style.transform =
            "translate(-50%, 20px)";

        setTimeout(() => {
            secret.remove();
        }, 400);
    }, 4500);
}

const hero = document.querySelector(".hero");

if (
    hero &&
    window.matchMedia("(pointer: fine)").matches
) {
    hero.addEventListener("mousemove", (event) => {
        const rect = hero.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) /
            rect.width;

        const y =
            (event.clientY - rect.top) /
            rect.height;

        const moveX = (x - 0.5) * 12;
        const moveY = (y - 0.5) * 8;

        const heroLogo =
            hero.querySelector(".hero-logo");

        if (heroLogo) {
            heroLogo.style.transform =
                `translate(${moveX * 0.25}px, ${moveY * 0.25}px)`;
        }
    });

    hero.addEventListener("mouseleave", () => {
        const heroLogo =
            hero.querySelector(".hero-logo");

        if (heroLogo) {
            heroLogo.style.transform = "";
        }
    });
}

document.addEventListener(
    "visibilitychange",
    () => {
        if (!document.hidden) {
            updateCountdown();
        }
    }
);

window.addEventListener("pageshow", () => {
    updateCountdown();
});

console.log(
    "%cPMC AUTO DETAILING",
    "font-size:22px;font-weight:900;color:#20a9ff;"
);

console.log(
    "%cThirst For Life · 14 OCT 2026",
    "font-size:12px;color:#8b9aa5;"
);

console.log(
    "%c¿Qué haces viendo la consola? 👀",
    "font-size:11px;color:#ffffff;"
);