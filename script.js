/* =====================================================
   BREW & BLOOM  |  script.js  (dark theme version)
   1 Helpers        2 Mobile menu      3 Header, progress, active link
   4 Reveal + counters   5 Mouse effects (glow, spotlight, tilt)
   6 Coffee panels  7 Menu tabs        8 Mood picker
   9 Locations      10 Cart            11 Contact form
   12 Back to top   13 Image fallback  14 Footer year
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. HELPERS ---------- */
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // 1500 -> "Rs 1,500"
  const formatPrice = (n) => "Rs " + n.toLocaleString("en-US");

  // Small popup message at the bottom of the screen
  const toast = $("#toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // Only use mouse effects on devices that really have a mouse
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 2. MOBILE MENU ---------- */
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  function closeMobileMenu() {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  $$(".nav-link").forEach((link) => link.addEventListener("click", closeMobileMenu));

  /* ---------- 3. HEADER, SCROLL PROGRESS, ACTIVE LINK ---------- */
  const header = $("#header");
  const progress = $("#progress");
  const backTop = $("#backTop");
  const sections = $$("main section[id]");
  const navItems = $$(".nav-link");

  function onScroll() {
    const y = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle("scrolled", y > 40);
    backTop.classList.toggle("show", y > 600);
    progress.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;

    // Which section are we in?
    let currentId = "home";
    sections.forEach((section) => {
      if (y >= section.offsetTop - 160) currentId = section.id;
    });
    // Sections without their own nav link belong to a nearby one
    const map = { products: "coffee", match: "coffee", why: "story", reviews: "locations" };
    const activeId = map[currentId] || currentId;
    navItems.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + activeId);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. SCROLL REVEAL + NUMBER COUNTERS ---------- */
  function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const plain = el.dataset.plain === "true"; // plain = no comma, e.g. the year 2018
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.floor(target * eased);
      el.textContent = (plain ? value : value.toLocaleString("en-US")) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const revealItems = $$(".reveal");
  const counters = $$("[data-count]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => observer.observe(item));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  } else {
    // Very old browsers: show everything immediately
    revealItems.forEach((item) => item.classList.add("visible"));
    counters.forEach((c) => {
      c.textContent = c.dataset.count + (c.dataset.suffix || "");
    });
  }

  /* ---------- 5. MOUSE EFFECTS (desktop only) ---------- */
  if (hasMouse) {
    // 5a. Soft glow that follows the cursor
    const glow = $("#cursorGlow");
    window.addEventListener("mousemove", (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      glow.classList.add("on");
    });
    document.addEventListener("mouseleave", () => glow.classList.remove("on"));

    // 5b. Spotlight inside cards: tell CSS where the mouse is
    $$(".spot").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - rect.left + "px");
        el.style.setProperty("--my", e.clientY - rect.top + "px");
      });
    });

    // 5c. Gentle 3D tilt on cards, tiles and reviews
    function addTilt(el, max) {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-6px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    }
    $$(".card").forEach((el) => addTilt(el, 7));
    $$(".review").forEach((el) => addTilt(el, 4));

    // 5d. Hero image follows the mouse a little
    const hero = $("#home");
    const orb = $("#orb");
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      orb.style.transform = `perspective(1000px) rotateY(${(x * 12).toFixed(2)}deg) rotateX(${(-y * 12).toFixed(2)}deg)`;
    });
    hero.addEventListener("mouseleave", () => { orb.style.transform = ""; });
  }

  /* ---------- 6. EXPANDING COFFEE PANELS ---------- */
  const panels = $$(".panel");

  function activatePanel(panel) {
    panels.forEach((p) => p.classList.toggle("active", p === panel));
  }
  panels.forEach((panel) => {
    panel.addEventListener("click", () => activatePanel(panel));
    panel.addEventListener("focus", () => activatePanel(panel));
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activatePanel(panel); }
    });
    if (hasMouse) panel.addEventListener("mouseenter", () => activatePanel(panel));
  });

  /* ---------- 7. MENU TABS (Hot / Cold / Bakery) ---------- */
  const tabs = $$(".tab");
  const menuItems = $$(".menu-item");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
      });
      menuItems.forEach((item) => { item.hidden = item.dataset.category !== filter; });
    });
  });

  /* ---------- 8. MOOD PICKER ---------- */
  // Each mood points to one drink
  const moods = {
    energetic: { tag: "For a big day", name: "Espresso", price: 450, text: "Bold, quick and ready for anything. A concentrated shot with deep cocoa notes and golden crema." },
    cozy:      { tag: "For a slow evening", name: "Caramel Latte", price: 750, text: "Smooth espresso, steamed milk and golden caramel. Like a warm blanket in a cup." },
    sweet:     { tag: "For a treat", name: "Mocha Delight", price: 800, text: "Dark chocolate meets espresso, finished with whipped cream and a dusting of cocoa." },
    focus:     { tag: "For deep work", name: "Classic Cold Brew", price: 700, text: "Steeped for 18 hours: smooth, clean and gentle on the stomach, perfect for long study sessions." }
  };

  const moodButtons = $$(".mood-btn");
  const moodCard = $(".match-card");
  let currentMood = moods.energetic;

  function showMood(key) {
    currentMood = moods[key];
    $("#moodTag").textContent = currentMood.tag;
    $("#moodName").textContent = currentMood.name;
    $("#moodText").textContent = currentMood.text;
    $("#moodPrice").textContent = formatPrice(currentMood.price);

    // Replay a small fade animation
    moodCard.classList.remove("swap");
    void moodCard.offsetWidth;
    moodCard.classList.add("swap");
  }

  moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      moodButtons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      showMood(btn.dataset.mood);
    });
  });

  $("#moodAdd").addEventListener("click", () => addToCart(currentMood.name, currentMood.price));

  /* ---------- 9. LOCATIONS ---------- */
  const locButtons = $$(".loc-btn");
  const locPanels = $$(".loc-panel");

  locButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.loc;
      locButtons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
      });
      locPanels.forEach((p) => { p.hidden = p.dataset.panel !== index; });
    });
  });

  /* ---------- 10. SHOPPING CART ---------- */
  const cartEl = $("#cart");
  const overlay = $("#overlay");
  const cartBtn = $("#cartBtn");
  const cartClose = $("#cartClose");
  const cartCount = $("#cartCount");
  const cartItemsEl = $("#cartItems");
  const cartEmpty = $("#cartEmpty");
  const cartTotal = $("#cartTotal");

  // The cart is a list of objects: { name, price, qty }
  let cart = [];

  function openCart() {
    cartEl.classList.add("open");
    cartEl.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    cartClose.focus();
  }

  function closeCart() {
    cartEl.classList.remove("open");
    cartEl.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    cartBtn.focus();
  }

  function renderCart() {
    cartItemsEl.innerHTML = "";
    let totalQty = 0;
    let totalPrice = 0;

    cart.forEach((item, index) => {
      totalQty += item.qty;
      totalPrice += item.price * item.qty;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <h3>${item.name}</h3>
        <span class="price">${formatPrice(item.price * item.qty)}</span>
        <div class="qty">
          <button data-action="minus" data-index="${index}" aria-label="Decrease quantity of ${item.name}">&minus;</button>
          <span aria-live="polite">${item.qty}</span>
          <button data-action="plus" data-index="${index}" aria-label="Increase quantity of ${item.name}">+</button>
          <button class="remove" data-action="remove" data-index="${index}">Remove</button>
        </div>`;
      cartItemsEl.appendChild(li);
    });

    cartCount.textContent = totalQty;
    cartTotal.textContent = formatPrice(totalPrice);
    cartEmpty.hidden = cart.length > 0;
    cartBtn.setAttribute("aria-label", `Open cart, ${totalQty} item${totalQty === 1 ? "" : "s"}`);
  }

  function addToCart(name, price) {
    const existing = cart.find((item) => item.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price, qty: 1 });

    renderCart();

    // Little bump animation on the counter
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth;
    cartCount.classList.add("bump");

    showToast(`${name} added to cart ☕`);
  }

  // Every "Add to Cart" button on product cards
  $$(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.name, Number(btn.dataset.price)));
  });

  // + / - / Remove inside the cart
  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const index = Number(btn.dataset.index);

    if (btn.dataset.action === "plus") cart[index].qty += 1;
    if (btn.dataset.action === "minus") cart[index].qty -= 1;
    if (btn.dataset.action === "remove" || cart[index].qty <= 0) cart.splice(index, 1);

    renderCart();
  });

  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  $("#clearCart").addEventListener("click", () => { cart = []; renderCart(); });

  // Pretend checkout (no payment in this project)
  $("#checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) { showToast("Your cart is empty. Add a coffee first!"); return; }
    cart = [];
    renderCart();
    closeCart();
    showToast("Thank you! Your order has been placed 🎉");
  });

  // Escape closes the cart and the mobile menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (cartEl.classList.contains("open")) closeCart();
      closeMobileMenu();
    }
  });

  renderCart();

  /* ---------- 11. CONTACT FORM VALIDATION ---------- */
  const form = $("#contactForm");
  const success = $("#formSuccess");

  function setError(fieldId, message) {
    const input = $("#" + fieldId);
    $("#" + fieldId + "Error").textContent = message;
    input.parentElement.classList.toggle("invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateForm() {
    const name = $("#name").value.trim();
    const email = $("#email").value.trim();
    const message = $("#message").value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (name.length < 2) { setError("name", "Please enter your name (at least 2 letters)."); valid = false; }
    else setError("name", "");

    if (!emailPattern.test(email)) { setError("email", "Please enter a valid email address."); valid = false; }
    else setError("email", "");

    if (message.length < 10) { setError("message", "Your message should be at least 10 characters."); valid = false; }
    else setError("message", "");

    return valid;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop the page from reloading
    success.hidden = true;

    if (validateForm()) {
      form.reset();
      success.hidden = false;
      showToast("Message sent successfully ✉️");
    } else {
      const firstInvalid = form.querySelector(".invalid input, .invalid textarea");
      if (firstInvalid) firstInvalid.focus();
    }
  });

  ["name", "email", "message"].forEach((id) => {
    $("#" + id).addEventListener("input", () => setError(id, ""));
  });

  /* ---------- 12. BACK TO TOP ---------- */
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- 13. IMAGE FALLBACK ---------- */
  // If an online image fails to load, hide it so the dark gradient shows instead of a broken icon
  $$("img").forEach((img) => {
    const hide = () => { img.style.visibility = "hidden"; };
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* ---------- 14. FOOTER YEAR ---------- */
  $("#year").textContent = new Date().getFullYear();
});