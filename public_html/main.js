// -------------------------------------------
// Loading Spinner: Hides loader when page finishes loading
// -------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const spinner = document.getElementById("loading-spinner");
  window.addEventListener("load", function () {
    if (spinner) spinner.style.display = "none";
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
    // Hover on question: immediately show answer
    item.addEventListener("mouseenter", () => {
      if (window.matchMedia("(pointer: fine)").matches) {
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove("active");
            other.setAttribute("aria-expanded", "false");
          }
        });
        item.classList.add("active");
        item.setAttribute("aria-expanded", "true");
      }
    });

    // Click to toggle: click to show answer or toggle closed
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

// -------------------------------------------
// Initialize all core functions on load
// -------------------------------------------
function init() {
  navbar();
  carousel();
  initFaqAccordion();
  initTaxTabs();
  initConsultationAccordion();
  handleHashScroll();
  window.addEventListener("hashchange", handleHashScroll);
  window.addEventListener(
    "scroll",
    debounce(() => {
      // Add scroll-based logic if needed
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

