document.documentElement.classList.add("js");

// Mobile menu
(() => {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  const closeMenu = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  document.addEventListener("click", (e) => {
    const inside = links.contains(e.target) || toggle.contains(e.target);
    if (!inside) closeMenu();
  });
})();

// Reveal on scroll
(() => {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();

// Animated counters
(() => {
  const counters = Array.from(document.querySelectorAll("[data-counter]"));
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.counter || "0");
    const duration = 900;
    const t0 = performance.now();

    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const val = Math.floor(target * p);
      el.textContent = String(val);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const nums = Array.from(e.target.querySelectorAll("[data-counter]"));
        nums.forEach(animate);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  // Observe the hero mini stats (first) and expertise stats bar
  const heroMini = document.querySelector(".hero__mini");
  if (heroMini) io.observe(heroMini);
  const statsBar = document.querySelector(".statsBar");
  if (statsBar) io.observe(statsBar);
})();

// Contact form validation (demo)
(() => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const topic = document.getElementById("topic");
  const message = document.getElementById("message");
  const hint = document.getElementById("formHint");

  const setError = (field, msg) => {
    const el = document.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = msg;
  };

  const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ["name","email","topic","message"].forEach(k => setError(k, ""));
    if (hint) hint.textContent = "";

    const n = (name?.value || "").trim();
    const em = (email?.value || "").trim();
    const tp = (topic?.value || "").trim();
    const msg = (message?.value || "").trim();

    let ok = true;

    if (n.length < 2) { setError("name", "Please enter a valid name (min 2 characters)."); ok = false; }
    if (!isEmailValid(em)) { setError("email", "Please enter a valid email address."); ok = false; }
    if (!tp) { setError("topic", "Please select a topic."); ok = false; }
    if (msg.length < 10) { setError("message", "Please write a longer message (min 10 characters)."); ok = false; }

    if (!ok) {
      if (hint) hint.textContent = "Please review the highlighted fields.";
      return;
    }

    if (hint) hint.textContent = "Message ready (demo). No email was sent.";
    form.reset();
  });
})();

// Footer year
(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

// Particles background (triangles + dots)
(() => {
  const canvas = document.getElementById("bgParticles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w = 0, h = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  const resize = () => {
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };

  const TRI_COUNT = 34;
  const DOT_COUNT = 42;

  const tris = Array.from({ length: TRI_COUNT }, () => ({
    x: rand(0, 1) * window.innerWidth,
    y: rand(0, 1) * window.innerHeight,
    s: rand(10, 22),
    vx: rand(-0.10, 0.10),
    vy: rand(-0.10, 0.10),
    a: rand(0.06, 0.14)
  }));

  const dots = Array.from({ length: DOT_COUNT }, () => ({
    x: rand(0, 1) * window.innerWidth,
    y: rand(0, 1) * window.innerHeight,
    r: rand(1, 2.2),
    vx: rand(-0.08, 0.08),
    vy: rand(-0.08, 0.08),
    a: rand(0.05, 0.12)
  }));

  const wrap = (p) => {
    if (p.x < -50) p.x = w + 50;
    if (p.x > w + 50) p.x = -50;
    if (p.y < -50) p.y = h + 50;
    if (p.y > h + 50) p.y = -50;
  };

  function drawTriangle(x, y, s, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((x + y) * 0.0006);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.9, s * 0.8);
    ctx.lineTo(-s * 0.9, s * 0.8);
    ctx.closePath();
    ctx.fillStyle = `rgba(46,247,208,${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      wrap(d);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${d.a})`;
      ctx.fill();
    }

    for (const t of tris) {
      t.x += t.vx; t.y += t.vy;
      wrap(t);
      drawTriangle(t.x, t.y, t.s, t.a);
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  tick();
})();
