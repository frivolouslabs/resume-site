// Resume page: screenshot clippings, role and deal drawers, flywheel animation,
// mobile rails and dock, and a photo viewer that grows out of its thumbnail.

const CLIPS = {
  "role-1": [
    ["r1-acquisition", 724, "Placeholder Wire", "2024-02-15", "https://example.com"],
    ["r1-partnership", 683, "The Sample Ledger", "2025-11-06", "https://example.com"],
    ["r1-buyback", 611, "Example Business Review", "2024-08-01", "https://example.com"],
    ["r1-subscription", 665, "demo/tech", "2025-01-03", "https://example.com"],
    ["r1-vertical", 609, "Placeholder Wire", "2025-10-22", "https://example.com"],
    ["r1-tuckin", 569, "The Sample Ledger", "2024-10-16", "https://example.com"],
  ],
  "role-2": [
    ["r2-seriesc", 645, "demo/tech", "2020-09-10", "https://example.com"],
    ["r2-unicorn", 611, "Example Business Review", "2021-09-10", "https://example.com"],
    ["r2-rebrand", 623, "The Sample Ledger", "2020-01-07", "https://example.com"],
    ["r2-launch", 517, "Placeholder Wire", "2020-02-12", "https://example.com"],
  ],
  "role-3": [
    ["r3-chapter11", 685, "Example Business Review", "2017-09-18", "https://example.com"],
    ["r3-tax", 569, "The Sample Ledger", "2018-03-21", "https://example.com"],
    ["r3-short", 629, "Placeholder Wire", "2017-01-20", "https://example.com"],
    ["r3-earnings", 513, "demo/tech", "2017-04-25", "https://example.com"],
  ],
};

const TICKER = [
  ["ONE", "Acquisition", "$500M", "up"],
  ["ONE", "Media partnership", "Signed", "up"],
  ["ONE", "Share repurchase", "$1.0B", "up"],
  ["ONE", "Subscription", "Launched", "up"],
  ["ONE", "New vertical", "Live", "up"],
  ["TWO", "Series C", "$70M", "up"],
  ["TWO", "Valuation", "$1B+", "up"],
  ["MKT", "Retailer", "Chapter 11", "down"],
  ["MKT", "Miner", "Tax dispute", "down"],
  ["MKT", "Supplier", "Short report", "down"],
];

const BOOKS = {
  network: [["book-network", "Book on Networks", "Author Name", "https://example.com"]],
  history: [
    ["book-1", "Book One", "Author Name", "https://example.com"],
    ["book-2", "Book Two", "Author Name", "https://example.com"],
    ["book-3", "Book Three", "Author Name", "https://example.com"],
    ["book-4", "Book Four", "Author Name", "https://example.com"],
    ["book-5", "Book Five", "Author Name", "https://example.com"],
    ["book-6", "Book Six", "Author Name", "https://example.com"],
  ],
  water: [["book-essay", "An Essay", "Author Name", "https://example.com"]],
};

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const compact = matchMedia("(max-width: 960px)");
const root = document.documentElement;

// ---------- Theme (same storage key and buttons as the homepage) ----------

const themeButtons = document.querySelectorAll("[data-theme-choice]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function setTheme(theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Storage can be unavailable; the theme still applies for this visit.
  }
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
  });
  if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#ffffff" : "#0b1014");
}

themeButtons.forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.themeChoice)));
setTheme(root.dataset.theme || "dark");

// ---------- Helpers ----------

function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function tokenPx(name, fallback) {
  const value = parseFloat(getComputedStyle(root).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

// A lightly torn top and bottom edge, deterministic per clipping.
function tornEdge(rand) {
  const pts = [];
  const steps = 18;
  for (let i = 0; i <= steps; i += 1) pts.push(`${((i / steps) * 100).toFixed(2)}% ${(rand() * 0.9).toFixed(2)}%`);
  for (let i = steps; i >= 0; i -= 1) pts.push(`${((i / steps) * 100).toFixed(2)}% ${(100 - rand() * 1.4).toFixed(2)}%`);
  return `polygon(${pts.join(",")})`;
}

function buildClip([file, height, outlet, date, url], index, side) {
  const rand = seeded(hashString(file));
  const link = document.createElement("a");
  link.className = "clip";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.dataset.speed = (0.04 + rand() * 0.12).toFixed(3);
  link.dataset.tag = "Read";
  const tilt = (side === "left" ? -1 : 1) * (1 + rand() * 3.6) * (index % 2 ? -0.7 : 1);
  link.style.setProperty("--r", `${tilt.toFixed(2)}deg`);
  link.style.setProperty("--w", `${330 + Math.round(rand() * 40)}px`);
  link.style.setProperty("--x", `${(side === "left" ? 1 : -1) * Math.round(rand() * 12 - 3)}%`);
  link.setAttribute("aria-label", `${outlet}, ${formatDate(date)} (opens the article)`);
  link.innerHTML = `
    <span class="tape" style="--tr:${(rand() * 10 - 5).toFixed(1)}deg" aria-hidden="true"></span>
    <span class="paper">
      <img src="/resume/img/press/${file}.webp" alt="" width="1000" height="${height}" loading="lazy" decoding="async" />
      <span class="clip-meta"><b>${escapeHtml(outlet)}</b><span>${formatDate(date)}</span></span>
    </span>`;
  link.querySelector(".paper").style.clipPath = tornEdge(rand);
  return link;
}

// ---------- Chapters: clippings split left/right on desktop, one swipe rail on phones ----------

const chapterRails = [];

document.querySelectorAll(".chapter[data-chapter]").forEach((chapter) => {
  const items = CLIPS[chapter.dataset.chapter];
  if (!items) return;
  const left = chapter.querySelector(".clips-left");
  const right = chapter.querySelector(".clips-right");
  const nodes = items.map((item, i) => buildClip(item, Math.floor(i / 2), i % 2 ? "right" : "left"));
  const meta = document.createElement("div");
  meta.className = "clips-meta";
  meta.setAttribute("aria-hidden", "true");
  meta.innerHTML = `<span class="clips-count">1 / ${nodes.length}</span><span class="clips-bar"><i></i></span>`;
  left.after(meta);
  chapterRails.push({ left, right, nodes, meta });
});

function layoutClips() {
  chapterRails.forEach(({ left, right, nodes }) => {
    nodes.forEach((node, i) => (compact.matches || i % 2 === 0 ? left : right).appendChild(node));
  });
}

layoutClips();

// Counter and progress bar under each phone rail.
function bindRailMeta(rail, meta, count) {
  const label = meta.querySelector(".clips-count");
  const bar = meta.querySelector(".clips-bar");
  bar.style.setProperty("--seg", `${100 / count}%`);
  const update = () => {
    const first = rail.firstElementChild;
    if (!first) return;
    const stepW = first.getBoundingClientRect().width + 16;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    const i = atEnd ? count - 1 : Math.min(count - 1, Math.max(0, Math.round(rail.scrollLeft / stepW)));
    label.textContent = `${i + 1} / ${count}`;
    bar.style.setProperty("--pos", `${i * 100}%`);
  };
  rail.addEventListener("scroll", update, { passive: true });
  update();
}

chapterRails.forEach(({ left, meta, nodes }) => bindRailMeta(left, meta, nodes.length));

// ---------- Hero: blurred clippings at depth ----------

const heroField = document.getElementById("hero-field");
const heroPicks = [
  [CLIPS["role-1"][0], 9, 18, -8, 0.9, 0],
  [CLIPS["role-2"][1], 74, 12, 6, 0.75, 1.5],
  [CLIPS["role-1"][1], 80, 60, -5, 0.85, 0.6],
  [CLIPS["role-3"][1], 4, 64, 6, 0.65, 3],
  [CLIPS["role-2"][0], 30, 78, -3, 0.55, 4.5],
  [CLIPS["role-1"][3], 42, -14, 4, 0.5, 5],
  [CLIPS["role-3"][2], 90, 36, 10, 0.45, 6],
  [CLIPS["role-1"][2], 18, 42, -13, 0.4, 7],
];

heroPicks.forEach(([data, x, y, r, depth, blur], i) => {
  const clip = buildClip(data, i, i % 2 ? "right" : "left");
  clip.removeAttribute("href");
  clip.removeAttribute("aria-label");
  delete clip.dataset.tag;
  clip.tabIndex = -1;
  clip.querySelector("img").loading = "eager";
  clip.dataset.depth = String(depth);
  clip.style.left = `${x}%`;
  clip.style.top = `${y}%`;
  clip.style.setProperty("--r", `${r}deg`);
  clip.style.setProperty("--x", "-50%");
  clip.style.opacity = String(0.22 + depth * 0.5);
  clip.style.filter = `blur(${blur}px) drop-shadow(0 22px 26px var(--card-shadow))`;
  clip.style.scale = String(0.55 + depth * 0.4);
  heroField.appendChild(clip);
});

// ---------- Ticker ----------

const tickerHtml = TICKER.map(
  ([sym, what, val, dir]) =>
    `<span class="ticker-item"><b>${escapeHtml(sym)}</b><span>${escapeHtml(what)}</span><i class="${dir === "down" ? "down" : ""}">${escapeHtml(val)}</i></span>`,
).join("");
document.getElementById("ticker").innerHTML = tickerHtml + tickerHtml;

// ---------- Bookshelves ----------

document.querySelectorAll("[data-shelf]").forEach((shelf) => {
  (BOOKS[shelf.dataset.shelf] || []).forEach(([file, title, author, url]) => {
    const rand = seeded(hashString(file));
    const book = document.createElement("a");
    book.className = "book";
    book.href = url;
    book.target = "_blank";
    book.rel = "noopener noreferrer";
    book.dataset.tag = "Book";
    book.style.setProperty("--r", `${(rand() * 5 - 2.5).toFixed(2)}deg`);
    book.setAttribute("aria-label", `${title} by ${author}`);
    book.innerHTML = `
      <span class="book-cover"><img src="/resume/img/books/${file}.webp" alt="" loading="lazy" decoding="async" width="400" height="600" /></span>
      <span class="book-meta"><b>${escapeHtml(title)}</b><span>${escapeHtml(author)}</span></span>`;
    shelf.appendChild(book);
  });
});

// ---------- Role cards and deals open in place ----------

function bindDrawer(toggle, container) {
  toggle.addEventListener("click", () => {
    const open = !container.classList.contains("is-open");
    container.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
}

document.querySelectorAll(".role-card").forEach((card) => bindDrawer(card.querySelector(".role-toggle"), card));
document.querySelectorAll(".deal").forEach((deal) => bindDrawer(deal.querySelector(".deal-toggle"), deal));

// Keep each sticky card vertically centred as it grows or shrinks.
if ("ResizeObserver" in window) {
  const ro = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target;
      const h = card.getBoundingClientRect().height;
      const top = Math.max(tokenPx("--header-h", 64) + 12, (window.innerHeight - h) / 2);
      card.style.setProperty("--sticky-top", `${Math.round(top)}px`);
    });
  });
  document.querySelectorAll(".role-card").forEach((card) => ro.observe(card));
}

// ---------- Flywheel slide: orbit around the slide's ring, nodes ping as it passes ----------

const slideAnim = document.querySelector(".slide-anim");
if (slideAnim) {
  const cx = 755;
  const cy = 680;
  const r = 315;
  const trail = slideAnim.querySelector(".orbit-trail");
  const head = slideAnim.querySelector(".orbit-head");
  const pulses = slideAnim.querySelector(".pulses");
  // Node angles measured clockwise from the top of the ring: import, cook, share, friends, creators.
  const nodeAngles = [0, 72, 144, 216, 288];
  const pings = nodeAngles.map((deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("class", "pulse");
    c.setAttribute("cx", String(cx + Math.cos(a) * r));
    c.setAttribute("cy", String(cy + Math.sin(a) * r));
    c.setAttribute("r", "64");
    pulses.appendChild(c);
    return c;
  });
  const period = 6500;
  let visible = false;
  let lastSweep = null;
  const place = (sweep) => {
    const a = ((sweep - 90) * Math.PI) / 180;
    head.setAttribute("cx", (cx + Math.cos(a) * r).toFixed(1));
    head.setAttribute("cy", (cy + Math.sin(a) * r).toFixed(1));
    // The circle's path starts at 3 o'clock (sweep 90); keep the dash ending at the head.
    const along = ((((sweep - 90) % 360) + 360) % 360) / 360 * 1000;
    trail.style.strokeDashoffset = String(90 - along);
  };
  const ping = (i) => {
    pings[i].classList.remove("is-on");
    void pings[i].getBBox();
    pings[i].classList.add("is-on");
  };
  const tick = (now) => {
    if (!visible) return;
    const sweep = ((now % period) / period) * 360;
    if (lastSweep !== null) {
      nodeAngles.forEach((node, i) => {
        const wrapped = sweep < lastSweep;
        if ((!wrapped && node > lastSweep && node <= sweep) || (wrapped && (node > lastSweep || node <= sweep))) ping(i);
      });
    }
    lastSweep = sweep;
    place(sweep);
    requestAnimationFrame(tick);
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    place(0);
  } else {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      lastSweep = null;
      if (visible) requestAnimationFrame(tick);
    }).observe(slideAnim);
  }
}

// ---------- Reveal clippings on scroll ----------

const revealables = chapterRails.flatMap(({ nodes }) => nodes);
if ("IntersectionObserver" in window && !reduceMotion) {
  revealables.forEach((el) => el.classList.add("is-pending"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        setTimeout(() => {
          el.classList.add("is-in");
          el.classList.remove("is-pending");
        }, Number(el.dataset.order || 0) * 90);
        io.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  revealables.forEach((el, i) => {
    el.dataset.order = String(i % 3);
    io.observe(el);
  });
} else {
  revealables.forEach((el) => el.classList.add("is-in"));
}

// ---------- Parallax, header backdrop and dock ----------

const ghostWords = Array.from(document.querySelectorAll(".ghost-word"));
const heroClips = Array.from(heroField.querySelectorAll(".clip"));
const heroEl = document.getElementById("top");
const dock = document.querySelector(".dock");
const dockTrack = dock.querySelector(".dock-track");
let bases = [];
let mouseX = 0;
let mouseY = 0;
let ticking = false;

function pageTop(el) {
  let top = 0;
  for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

function measure() {
  bases = revealables.map((el) => pageTop(el) + el.offsetHeight / 2);
}

function frame() {
  ticking = false;
  const vh = window.innerHeight;
  const y = window.scrollY;
  const mid = y + vh / 2;
  const on = !compact.matches && !reduceMotion;
  revealables.forEach((el, i) => {
    const py = on ? Math.max(-150, Math.min(150, (bases[i] - mid) * Number(el.dataset.speed))) : 0;
    el.style.setProperty("--py", `${py.toFixed(1)}px`);
  });
  ghostWords.forEach((word) => {
    const rel = word.closest("section").offsetTop - y;
    word.style.setProperty("--gy", `${on ? Math.max(-220, Math.min(260, rel * 0.22)).toFixed(1) : 0}px`);
  });
  if (!reduceMotion && y < vh * 1.2) {
    heroClips.forEach((clip) => {
      const depth = Number(clip.dataset.depth);
      clip.style.translate = `${(mouseX * depth * -26).toFixed(1)}px ${(mouseY * depth * -18 - y * depth * 0.35).toFixed(1)}px`;
    });
  }
  document.body.classList.toggle("is-scrolled", y > 24);
  dock.classList.toggle("is-on", y > heroEl.offsetHeight * 0.55);
}

function requestFrame() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
}

window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", () => {
  measure();
  requestFrame();
});
window.addEventListener("load", () => {
  measure();
  requestFrame();
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); requestFrame(); });
window.addEventListener(
  "pointermove",
  (event) => {
    if (event.pointerType !== "mouse") return;
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
    requestFrame();
  },
  { passive: true },
);
compact.addEventListener("change", () => {
  layoutClips();
  measure();
  requestFrame();
});
measure();
frame();

// Active section in the dock, keeping the active chip in view without moving the page.
const dockLinks = new Map(Array.from(dock.querySelectorAll("a")).map((a) => [a.dataset.rail, a]));
if ("IntersectionObserver" in window) {
  const sectionIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        dockLinks.forEach((a) => a.classList.remove("is-active"));
        const link = dockLinks.get(entry.target.dataset.chapter);
        if (!link) return;
        link.classList.add("is-active");
        const target = link.offsetLeft - (dockTrack.clientWidth - link.offsetWidth) / 2;
        dockTrack.scrollTo({ left: target, behavior: reduceMotion ? "auto" : "smooth" });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  document.querySelectorAll("[data-chapter]").forEach((s) => sectionIo.observe(s));
}

// ---------- Photo viewer ----------

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbCaption = document.getElementById("lightbox-caption");
const lbCount = document.getElementById("lightbox-count");
const photoButtons = Array.from(document.querySelectorAll("[data-photo]"));
let current = -1;
let lastFocus = null;
let animating = null;

function sizeOf(button) {
  const img = button.querySelector("img");
  return { w: img.naturalWidth || Number(img.getAttribute("width")), h: img.naturalHeight || Number(img.getAttribute("height")) };
}

// Largest rect for the photo inside the viewport minus the viewer's padding tokens.
function fitRect(button) {
  const { w, h } = sizeOf(button);
  const padX = tokenPx("--lb-pad-x", 16);
  const padTop = tokenPx("--lb-pad-top", 72);
  const padBottom = tokenPx("--lb-pad-bottom", 76);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const availW = vw - padX * 2;
  const availH = vh - padTop - padBottom;
  const scale = Math.min(availW / w, availH / h, 2);
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);
  return { left: Math.round((vw - width) / 2), top: Math.round(padTop + (availH - height) / 2), width, height };
}

function placeImage(rect) {
  lbImg.style.left = `${rect.left}px`;
  lbImg.style.top = `${rect.top}px`;
  lbImg.style.width = `${rect.width}px`;
  lbImg.style.height = `${rect.height}px`;
}

// The thumbnail is a cover-cropped view of the same photo: start from its rect and
// reveal the rest by animating a clip-path inset alongside the transform.
function thumbKeyframes(button, rect) {
  const thumb = button.querySelector("img").getBoundingClientRect();
  if (!thumb.width || thumb.bottom < 0 || thumb.top > window.innerHeight) return null;
  const s = Math.max(thumb.width / rect.width, thumb.height / rect.height);
  const insetX = (rect.width - thumb.width / s) / 2;
  const insetY = (rect.height - thumb.height / s) / 2;
  const tx = thumb.left - (rect.left + insetX * s);
  const ty = thumb.top - (rect.top + insetY * s);
  return [
    { transform: `translate(${tx}px, ${ty}px) scale(${s})`, clipPath: `inset(${insetY}px ${insetX}px round ${8 / s}px)` },
    { transform: "translate(0px, 0px) scale(1)", clipPath: "inset(0px 0px round 8px)" },
  ];
}

function updateMeta() {
  const button = photoButtons[current];
  lbCaption.textContent = button.dataset.caption || "";
  lbCount.textContent = `${current + 1} / ${photoButtons.length}`;
  [current - 1, current + 1].forEach((i) => {
    const pre = new Image();
    pre.src = photoButtons[(i + photoButtons.length) % photoButtons.length].dataset.photo;
  });
}

function setPhoto(index) {
  current = (index + photoButtons.length) % photoButtons.length;
  const button = photoButtons[current];
  lbImg.src = button.dataset.photo;
  lbImg.alt = button.querySelector("img").alt;
  placeImage(fitRect(button));
  updateMeta();
}

function openViewer(index) {
  lastFocus = document.activeElement;
  setPhoto(index);
  lightbox.hidden = false;
  root.classList.add("is-locked");
  const frames = reduceMotion ? null : thumbKeyframes(photoButtons[current], fitRect(photoButtons[current]));
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
  animating = frames
    ? lbImg.animate(frames, { duration: 520, easing: "cubic-bezier(0.2, 0.85, 0.25, 1)" })
    : lbImg.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "scale(1)" }], { duration: 260, easing: "ease-out" });
  document.getElementById("lightbox-close").focus({ preventScroll: true });
}

function closeViewer() {
  if (lightbox.hidden) return;
  const button = photoButtons[current];
  const frames = reduceMotion ? null : thumbKeyframes(button, fitRect(button));
  const from = lbImg.style.transform || "translate(0px, 0px) scale(1)";
  lightbox.classList.remove("is-open");
  const anim = frames
    ? lbImg.animate([{ transform: from, clipPath: "inset(0px 0px round 8px)" }, frames[0]], { duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" })
    : lbImg.animate([{ opacity: 1, transform: from }, { opacity: 0, transform: from }], { duration: 220, fill: "forwards" });
  anim.onfinish = () => {
    lightbox.hidden = true;
    anim.cancel();
    lbImg.removeAttribute("src");
    lbImg.style.transform = "";
    root.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
}

function step(dir) {
  if (lightbox.hidden) return;
  if (animating) animating.cancel();
  setPhoto(current + dir);
  animating = reduceMotion
    ? null
    : lbImg.animate(
        [{ opacity: 0, transform: `translateX(${dir * 48}px) scale(0.98)` }, { opacity: 1, transform: "translateX(0) scale(1)" }],
        { duration: 340, easing: "cubic-bezier(0.2, 0.85, 0.25, 1)" },
      );
}

photoButtons.forEach((button, i) => {
  button.dataset.tag = "View";
  button.setAttribute("aria-label", `Open photo: ${button.querySelector("img").alt}`);
  button.addEventListener("click", () => openViewer(i));
});
document.getElementById("lightbox-close").addEventListener("click", closeViewer);
document.getElementById("lightbox-prev").addEventListener("click", () => step(-1));
document.getElementById("lightbox-next").addEventListener("click", () => step(1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeViewer();
});
document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowLeft") step(-1);
  if (event.key === "ArrowRight") step(1);
});
window.addEventListener("resize", () => {
  if (!lightbox.hidden) placeImage(fitRect(photoButtons[current]));
});

// Swipe: the photo follows the finger; sideways changes photo, down closes.
let drag = null;
lightbox.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" || event.target.closest("button")) return;
  drag = { x: event.clientX, y: event.clientY, dx: 0, dy: 0, axis: null };
});
lightbox.addEventListener("pointermove", (event) => {
  if (!drag) return;
  drag.dx = event.clientX - drag.x;
  drag.dy = event.clientY - drag.y;
  if (!drag.axis && Math.hypot(drag.dx, drag.dy) > 8) drag.axis = Math.abs(drag.dx) > Math.abs(drag.dy) ? "x" : "y";
  if (drag.axis === "x") lbImg.style.transform = `translate(${drag.dx}px, 0px) scale(1)`;
  if (drag.axis === "y" && drag.dy > 0) {
    lbImg.style.transform = `translate(0px, ${drag.dy}px) scale(${(1 - Math.min(drag.dy / 1600, 0.2)).toFixed(3)})`;
    lightbox.style.background = `color-mix(in srgb, var(--bg) ${Math.max(40, 90 - drag.dy / 6).toFixed(0)}%, transparent)`;
  }
});
function endDrag() {
  if (!drag) return;
  const { dx, dy, axis } = drag;
  drag = null;
  lightbox.style.background = "";
  if (axis === "x" && Math.abs(dx) > 60) {
    lbImg.style.transform = "";
    step(dx < 0 ? 1 : -1);
  } else if (axis === "y" && dy > 110) {
    closeViewer();
  } else {
    const from = lbImg.style.transform;
    lbImg.style.transform = "";
    if (from) lbImg.animate([{ transform: from }, { transform: "translate(0px, 0px) scale(1)" }], { duration: 260, easing: "cubic-bezier(0.2, 0.85, 0.25, 1)" });
  }
}
lightbox.addEventListener("pointerup", endDrag);
lightbox.addEventListener("pointercancel", endDrag);

// ---------- Cursor tag (mouse only) ----------

if (finePointer && !reduceMotion) {
  const tag = document.getElementById("cursor-tag");
  const tagText = tag.querySelector("span");
  root.classList.add("has-tag");
  document.addEventListener(
    "pointermove",
    (event) => {
      tag.style.setProperty("--cx", `${event.clientX}px`);
      tag.style.setProperty("--cy", `${event.clientY}px`);
      const target = lightbox.hidden ? event.target.closest("[data-tag]") : null;
      if (target && !target.closest(".hero-field")) {
        tagText.textContent = target.dataset.tag;
        tag.classList.add("is-on");
      } else {
        tag.classList.remove("is-on");
      }
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => tag.classList.remove("is-on"));
}
