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
  // Mobile dropdown
  const mobileDropdownButton = document.getElementById("mobile-dropdown-button");
  const mobileDropdown = document.getElementById("mobile-dropdown");
  const mobileDropdownContainer = mobileDropdownButton?.parentElement;

  mobileDropdownButton?.addEventListener("click", function () {
    mobileDropdown.classList.toggle("hidden");
  });
  if (mobileDropdownContainer && mobileDropdown) {
    mobileDropdownContainer.addEventListener("mouseenter", () => {
      mobileDropdown.classList.remove("hidden");
    });
    mobileDropdownContainer.addEventListener("mouseleave", () => {
      mobileDropdown.classList.add("hidden");
    });
  }

  // Header / Desktop dropdown
  const toggleButton = document.getElementById("dropdownToggle");
  const dropdownContainer = toggleButton?.closest(".dropdown");
  const dropdownMenu = toggleButton?.nextElementSibling;

  if (dropdownContainer && dropdownMenu) {
    dropdownContainer.addEventListener("mouseenter", () => {
      dropdownMenu.style.display = "block";
    });

    dropdownContainer.addEventListener("mouseleave", () => {
      dropdownMenu.style.display = "none";
    });
  }

  toggleButton?.addEventListener("mouseenter", () => {
    if (dropdownMenu) dropdownMenu.style.display = "block";
  });

  dropdownMenu?.addEventListener("mouseenter", () => {
    dropdownMenu.style.display = "block";
  });

  dropdownMenu?.addEventListener("mouseleave", () => {
    dropdownMenu.style.display = "none";
  });

  toggleButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = dropdownMenu.style.display === "block" || getComputedStyle(dropdownMenu).display === "block";
    dropdownMenu.style.display = isVisible ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!toggleButton?.contains(e.target) && !dropdownMenu?.contains(e.target)) {
      if (dropdownMenu) dropdownMenu.style.display = "none";
    }
  });
}
// -------------------------------------------
//About Page Carousel functionality with auto-rotation
// -------------------------------------------
function carousel() {
  const carouselList = document.querySelector(".carousel__list");
  const carouselItems = document.querySelectorAll(".carousel__item");
  const elems = Array.from(carouselItems);
  carouselList?.addEventListener("click", function (event) {
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
// Initialize all core functions on load
// -------------------------------------------
function init() {
  navbar();
  carousel();
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
