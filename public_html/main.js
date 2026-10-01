// -------------------------------------------
// Loading Spinner: Hides loader when page finishes loading
// -------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const spinner = document.getElementById("loading-spinner");
  window.addEventListener("load", function () {
    spinner.style.display = "none";
  });
});
// -------------------------------------------
// Navbar Toggle + Mobile & Desktop Dropdown
// -------------------------------------------
function navbar() {
  const navbar = document.getElementById("navbar");
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeIcon = document.getElementById("close-icon");
  const hamburgerIcon = document.getElementById("hamburger-icon");
// Check if this is the privacy page
  const isPrivacyPage = document.body.classList.contains("privacy-page");
  if (isPrivacyPage) {
    // On privacy page: always show bg-navColor, never remove it
    navbar.classList.add("bg-navColor");
  } else {
    // On other pages: transparent at top, bg-navColor on scroll
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        navbar.classList.add("bg-navColor");
      } else {
        if (mobileMenu.classList.contains("hidden")) {
          navbar.classList.remove("bg-navColor");
        }
      }
    });
  }
  // Toggle mobile menu
  mobileMenuButton.addEventListener("click", function (e) {
    e.stopPropagation();
    mobileMenu.classList.toggle("hidden");
    if (!mobileMenu.classList.contains("hidden")) {
      navbar.classList.add("bg-navColor");
    } else if (window.scrollY === 0) {
      navbar.classList.remove("bg-navColor");
    }
    hamburgerIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
  });
  // Close menu on clicking outside or on link
  document.addEventListener("click", function (e) {
    const isClickInsideMenu = mobileMenu.contains(e.target);
    const isClickOnButton = mobileMenuButton.contains(e.target);
    const isClickOnLink = e.target.closest(".mobile-menu-link");
    if (
      !isClickInsideMenu &&
      !isClickOnButton &&
      !mobileMenu.classList.contains("hidden")
    ) {
      mobileMenu.classList.add("hidden");
      if (window.scrollY === 0) navbar.classList.remove("bg-navColor");
      hamburgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    }
    if (isClickOnLink) {
      mobileMenu.classList.add("hidden");
      if (window.scrollY === 0) navbar.classList.remove("bg-navColor");
      hamburgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    }
  });
  // -------------------------------------------
  // Mobile Services Dropdown (Hover on mobile responsiveness & desktop, clean tap on touch)
  // -------------------------------------------
  const mobileDropdownButton = document.getElementById("mobile-dropdown-button");
  const mobileDropdown = document.getElementById("mobile-dropdown");
  const mobileDropdownContainer = mobileDropdownButton?.closest(".relative") || mobileDropdownButton?.parentElement;

  if (mobileDropdownButton && mobileDropdown) {
    const openMobileDropdown = () => {
      mobileDropdown.classList.add("is-open");
      mobileDropdownButton.classList.add("is-active");
    };

    const closeMobileDropdown = () => {
      mobileDropdown.classList.remove("is-open");
      mobileDropdownButton.classList.remove("is-active");
    };

    // Hover triggers on container wrapping button + submenu
    if (mobileDropdownContainer) {
      mobileDropdownContainer.addEventListener("mouseenter", openMobileDropdown);
      mobileDropdownContainer.addEventListener("mouseleave", closeMobileDropdown);
    }
    mobileDropdownButton.addEventListener("mouseenter", openMobileDropdown);

    // Touch tap toggle for mobile screens
    mobileDropdownButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = mobileDropdown.classList.contains("is-open");
      if (isOpen) {
        closeMobileDropdown();
      } else {
        openMobileDropdown();
      }
    });

    // Dismiss when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !mobileDropdownButton.contains(e.target) &&
        !mobileDropdown.contains(e.target)
      ) {
        closeMobileDropdown();
      }
    });
  }

  // -------------------------------------------
  // Desktop Services Dropdown (Hover-only display)
  // -------------------------------------------
  const toggleButton = document.getElementById("dropdownToggle");
  const dropdownContainer = toggleButton?.closest(".dropdown");
  const dropdownMenu = toggleButton?.nextElementSibling;

  if (dropdownContainer && dropdownMenu) {
    const openDesktopDropdown = () => {
      dropdownMenu.classList.add("is-open");
    };
    const closeDesktopDropdown = () => {
      dropdownMenu.classList.remove("is-open");
    };

    dropdownContainer.addEventListener("mouseenter", openDesktopDropdown);
    dropdownContainer.addEventListener("mouseleave", closeDesktopDropdown);
    toggleButton.addEventListener("mouseenter", openDesktopDropdown);
    dropdownMenu.addEventListener("mouseenter", openDesktopDropdown);
    dropdownMenu.addEventListener("mouseleave", closeDesktopDropdown);

    // Dismiss on clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdownContainer.contains(e.target)) {
        closeDesktopDropdown();
      }
    });
  }
}
// -------------------------------------------
//About Page Carousel functionality with auto-rotation
// -------------------------------------------
function carousel() {
  const carouselList = document.querySelector(".carousel__list");
  if (!carouselList) return;
  const carouselItems = document.querySelectorAll(".carousel__item");
  const elems = Array.from(carouselItems);
  if (!elems.length) return;
  carouselList.addEventListener("click", function (event) {
    const newActive = event.target.closest(".carousel__item");
    if (!newActive) return;
    update(newActive);
  });
  const update = function (newActive) {
    const newActivePos = parseInt(newActive.dataset.pos);
    if (newActivePos === 0) return;
    elems.forEach((item) => {
      const itemPos = parseInt(item.dataset.pos);
      item.dataset.pos = getPos(itemPos, newActivePos);
    });
  };
  const getPos = function (current, active) {
    const diff = current - active;
    if (Math.abs(diff) > 2) {
      return diff > 0 ? diff - 5 : diff + 5;
    }
    return diff;
  };
  let autoRotate = setInterval(() => {
    const current = elems.find((elem) => elem.dataset.pos == 0);
    const next = elems.find((elem) => elem.dataset.pos == 1) || elems[0];
    if (next) update(next);
  }, 2000);
  carouselList?.addEventListener("mouseenter", () => clearInterval(autoRotate));
  carouselList?.addEventListener("mouseleave", () => {
    autoRotate = setInterval(() => {
      const current = elems.find((elem) => elem.dataset.pos == 0);
      const next = elems.find((elem) => elem.dataset.pos == 1) || elems[0];
      if (next) update(next);
    }, 3000);
  });
}
// -------------------------------------------
// Show/hide answers when user clicks on question
// -------------------------------------------
function dropDescription(element) {
  const description = element?.nextElementSibling;
  if (!description) return;
  description.classList.toggle("hidden");
}
window.dropDescription = dropDescription; // Expose globally
// -------------------------------------------
// Popup toggling and outside click close
// -------------------------------------------
function togglePopup(id) {
  const popups = document.querySelectorAll(".popup");
  popups.forEach((popup) => popup.classList.add("hidden"));
  const popup = document.getElementById(id);
  popup?.classList.toggle("hidden");
}
window.togglePopup = togglePopup;
window.addEventListener("click", (event) => {
  if (event.target.classList.contains("popup")) {
    event.target.classList.add("hidden");
  }
});
// -------------------------------------------
// Debounce function to optimize performance
// -------------------------------------------
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
// -------------------------------------------
// Hash scroll handler for anchor links
// -------------------------------------------
function handleHashScroll() {
  const hash = window.location.hash;
  if (hash) {
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      const navbarHeight = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }
}
// -------------------------------------------
// FAQ Accordion with Toggle on Click Support
// -------------------------------------------
function initFaqAccordion() {
  const faqContainer = document.querySelector(".faq-container");
  if (!faqContainer) return;
  if (faqContainer.dataset.faqInitialized === "true") return;
  faqContainer.dataset.faqInitialized = "true";

  const faqItems = faqContainer.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  function toggleFaq(targetItem) {
    const isCurrentlyActive = targetItem.classList.contains("active");

    // Close all items
    faqItems.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-expanded", "false");
    });

    // If it was not active before, open it now (click to show answer)
    // If it was already active, it stays closed (click again to close)
    if (!isCurrentlyActive) {
      targetItem.classList.add("active");
      targetItem.setAttribute("aria-expanded", "true");
    }
  }

  function closeAllFaqs() {
    faqItems.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-expanded", "false");
    });
  }

  faqItems.forEach((item) => {
    // Click to toggle: click once to show answer, click again on question to close
    const header = item.querySelector(".faq-header");
    if (header) {
      header.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFaq(item);
      });
    }
  });

  // Automatically close open question when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".faq-item")) {
      closeAllFaqs();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllFaqs();
    }
  });
}
window.initFaqAccordion = initFaqAccordion;

// -------------------------------------------
// Tax Solutions: Direct vs Indirect Tax Tabs
// -------------------------------------------
function switchTaxTab(type) {
  const btnDirect = document.getElementById("btn-direct-tax");
  const btnIndirect = document.getElementById("btn-indirect-tax");
  const panelDirect = document.getElementById("panel-direct-tax");
  const panelIndirect = document.getElementById("panel-indirect-tax");

  if (!btnDirect || !btnIndirect || !panelDirect || !panelIndirect) return;

  const activeClasses = ["bg-[#CBBA4F]", "text-white", "shadow-sm"];
  const inactiveClasses = ["bg-transparent", "text-gray-700"];

  if (type === "indirect") {
    // Set Indirect Tax Active
    btnIndirect.classList.remove(...inactiveClasses);
    btnIndirect.classList.add(...activeClasses);
    const indirectIcon = btnIndirect.querySelector("i");
    if (indirectIcon) {
      indirectIcon.classList.remove("text-gray-600");
      indirectIcon.classList.add("text-white");
    }

    // Set Direct Tax Inactive
    btnDirect.classList.remove(...activeClasses);
    btnDirect.classList.add(...inactiveClasses);
    const directIcon = btnDirect.querySelector("i");
    if (directIcon) {
      directIcon.classList.remove("text-white");
      directIcon.classList.add("text-gray-600");
    }

    panelIndirect.classList.remove("hidden");
    panelDirect.classList.add("hidden");
  } else {
    // Set Direct Tax Active
    btnDirect.classList.remove(...inactiveClasses);
    btnDirect.classList.add(...activeClasses);
    const directIcon = btnDirect.querySelector("i");
    if (directIcon) {
      directIcon.classList.remove("text-gray-600");
      directIcon.classList.add("text-white");
    }

    // Set Indirect Tax Inactive
    btnIndirect.classList.remove(...activeClasses);
    btnIndirect.classList.add(...inactiveClasses);
    const indirectIcon = btnIndirect.querySelector("i");
    if (indirectIcon) {
      indirectIcon.classList.remove("text-white");
      indirectIcon.classList.add("text-gray-600");
    }

    panelDirect.classList.remove("hidden");
    panelIndirect.classList.add("hidden");
  }
}
window.switchTaxTab = switchTaxTab;

function initTaxTabs() {
  const btnDirect = document.getElementById("btn-direct-tax");
  const btnIndirect = document.getElementById("btn-indirect-tax");

  if (!btnDirect || !btnIndirect) return;

  btnDirect.addEventListener("click", () => switchTaxTab("direct"));
  btnIndirect.addEventListener("click", () => switchTaxTab("indirect"));

  btnDirect.addEventListener("mouseenter", () => switchTaxTab("direct"));
  btnIndirect.addEventListener("mouseenter", () => switchTaxTab("indirect"));
}
window.initTaxTabs = initTaxTabs;

// -------------------------------------------
// Consultation Accordion with Hover & Click Support
// -------------------------------------------
function initConsultationAccordion() {
  const items = document.querySelectorAll(".consultation-item");
  if (!items.length) return;

  function openItem(activeItem) {
    items.forEach((item) => {
      const content = item.querySelector(".consultation-content");
      const arrow = item.querySelector(".consultation-arrow");
      if (item === activeItem) {
        item.classList.add("consultation-active");
        if (content) {
          content.style.maxHeight = content.scrollHeight + "px";
          content.style.opacity = "1";
        }
        if (arrow) {
          arrow.style.transform = "rotate(90deg)";
          arrow.style.color = "#CBBA4F";
        }
      } else {
        item.classList.remove("consultation-active");
        if (content) {
          content.style.maxHeight = "0px";
          content.style.opacity = "0";
        }
        if (arrow) {
          arrow.style.transform = "rotate(0deg)";
          arrow.style.color = "";
        }
      }
    });
  }

  function closeItem(item) {
    item.classList.remove("consultation-active");
    const content = item.querySelector(".consultation-content");
    const arrow = item.querySelector(".consultation-arrow");
    if (content) {
      content.style.maxHeight = "0px";
      content.style.opacity = "0";
    }
    if (arrow) {
      arrow.style.transform = "rotate(0deg)";
      arrow.style.color = "";
    }
  }

  items.forEach((item) => {
    // Click / tap toggle — opens on first click, closes on second click
    const header = item.querySelector(".consultation-header");
    header?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isActive = item.classList.contains("consultation-active");
      if (isActive) {
        closeItem(item);
      } else {
        openItem(item);
      }
    });
  });

  // Automatically close open Consultation item when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".consultation-item")) {
      items.forEach((item) => closeItem(item));
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      items.forEach((item) => closeItem(item));
    }
  });
}
window.initConsultationAccordion = initConsultationAccordion;

// ========================================================
// Junca Studio Custom Cursor Follower & Magnetic Physics
// ========================================================
function initJuncaCursorAndMagnetic() {
  if (window.innerWidth < 1024) return;

  // Append elements if not already present
  let dot = document.querySelector(".custom-cursor-dot");
  let ring = document.querySelector(".custom-cursor-ring");

  if (!dot) {
    dot = document.createElement("div");
    dot.className = "custom-cursor-dot";
    document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement("div");
    ring.className = "custom-cursor-ring";
    document.body.appendChild(ring);
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const renderCursor = () => {
    // Lerp dot & ring for fluid organic feel
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0px) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0px) translate(-50%, -50%)`;

    requestAnimationFrame(renderCursor);
  };
  requestAnimationFrame(renderCursor);

  // Hover state detection
  const interactiveElements = document.querySelectorAll("a, button, .card-3d, input, textarea, select");
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  // Junca Magnetic Hover Targets
  const magneticTargets = document.querySelectorAll(".magnetic-btn, .editorial-badge, .card-3d-stack-item");
  magneticTargets.forEach((target) => {
    target.addEventListener("mousemove", (e) => {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      target.style.transform = `translate3d(${x * 0.28}px, ${y * 0.28}px, 0px)`;
    });

    target.addEventListener("mouseleave", () => {
      target.style.transform = "translate3d(0px, 0px, 0px)";
    });
  });
}

// ========================================================
// 3D Interactive Mouse Tilt & Parallax Engine
// ========================================================
function init3DMouseTilt() {
  const cards = document.querySelectorAll(".card-3d");
  if (!cards.length) return;

  cards.forEach((card) => {
    let rect = card.getBoundingClientRect();

    const handleMouseMove = (e) => {
      rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Set CSS variables for spotlight highlight
      card.style.setProperty("--mouse-x", `${mouseX}px`);
      card.style.setProperty("--mouse-y", `${mouseY}px`);

      // Compute normalized rotation angle (-0.5 to 0.5)
      const xPct = mouseX / rect.width - 0.5;
      const yPct = mouseY / rect.top - 0.5;

      const tiltX = (yPct * -14).toFixed(2); // Rotate around X
      const tiltY = (xPct * 14).toFixed(2);  // Rotate around Y

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

      // Parallax inner layers
      const layerMid = card.querySelector(".card-3d-layer-mid");
      const layerFront = card.querySelector(".card-3d-layer-front");

      if (layerMid) {
        layerMid.style.transform = `translate3d(${xPct * 15}px, ${yPct * 15}px, 25px)`;
      }
      if (layerFront) {
        layerFront.style.transform = `translate3d(${xPct * 30}px, ${yPct * 30}px, 45px)`;
      }
    };

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      const layerMid = card.querySelector(".card-3d-layer-mid");
      const layerFront = card.querySelector(".card-3d-layer-front");

      if (layerMid) layerMid.style.transform = "translate3d(0px, 0px, 25px)";
      if (layerFront) layerFront.style.transform = "translate3d(0px, 0px, 45px)";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
  });
}

// ========================================================
// GSAP 3D ScrollTrigger & Stack Animation Engine
// ========================================================
function initGSAP3DScroll() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    // Retry if scripts loading asynchronously
    setTimeout(initGSAP3DScroll, 200);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 3D Hero Parallax Floating Cards
  const heroContainer = document.querySelector(".hero-3d-container");
  if (heroContainer) {
    const floatingCards = heroContainer.querySelectorAll(".hero-3d-card");
    heroContainer.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 30;
      const yPos = (clientY / window.innerHeight - 0.5) * 30;

      floatingCards.forEach((card, idx) => {
        const depth = parseFloat(card.getAttribute("data-depth") || (idx + 1) * 10);
        gsap.to(card, {
          x: xPos * (depth / 20),
          y: yPos * (depth / 20),
          rotateX: yPos * 0.1,
          rotateY: -xPos * 0.1,
          duration: 0.8,
          ease: "power2.out",
        });
      });
    });
  }

  // 3D Stacked Featured Projects Scroll Reveal & Unstacking
  const stackSection = document.querySelector(".featured-3d-stack-section");
  if (stackSection) {
    const stackCards = stackSection.querySelectorAll(".featured-3d-card");

    // Pin section on desktop for cinematic 3D unstacking
    if (window.innerWidth > 768 && stackCards.length) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stackSection,
          start: "top top+=80",
          end: "+=1500",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      stackCards.forEach((card, index) => {
        const zOffset = (stackCards.length - index) * -80;
        const targetX = (index % 2 === 0 ? -1 : 1) * (index * 25);
        
        tl.fromTo(
          card,
          {
            z: zOffset,
            scale: 0.88 - index * 0.05,
            y: index * 40,
            rotateX: 12,
            opacity: index === 0 ? 1 : 0.6,
          },
          {
            z: 0,
            scale: 1,
            y: 0,
            rotateX: 0,
            opacity: 1,
            duration: 1,
          },
          index * 0.4
        );
      });
    }
  }

  // Scroll Reveal Animations for Cards & Headers
  gsap.utils.toArray(".reveal-3d-card").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50, rotateX: -8, z: -50 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        z: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

// -------------------------------------------
// Initialize all core functions on load
// -------------------------------------------
function init() {
  navbar();
  carousel();
  initFaqAccordion();
  initTaxTabs();
  initConsultationAccordion();
  initJuncaCursorAndMagnetic();
  init3DMouseTilt();
  initGSAP3DScroll();
  handleHashScroll();
  window.addEventListener("hashchange", handleHashScroll);
  window.addEventListener(
    "scroll",
    debounce(() => {
      // Refresh tilt rects if needed
    }, 100)
  );
}
// Start initialization after DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
// Reset the contact form
window.addEventListener("pageshow", function () {
  const form = document.querySelector("form");
  if (form) {
    form.reset();
  }
});


