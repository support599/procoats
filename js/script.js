document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("nav-toggle");

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("This is a placeholder form — no data is submitted.");
    });
  });

  const track = document.getElementById("reviews-track");
  const prevBtn = document.getElementById("reviews-prev");
  const nextBtn = document.getElementById("reviews-next");
  const dotsWrap = document.getElementById("reviews-dots");

  if (track && prevBtn && nextBtn && dotsWrap) {
    const perPage = 2;
    const cardCount = track.children.length;
    const pageCount = Math.ceil(cardCount / perPage);

    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Go to reviews page ${i + 1}`);
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => {
        track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
      });
      dotsWrap.appendChild(dot);
    }
    const dots = Array.from(dotsWrap.children);

    const updateActiveDot = () => {
      const page = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === page));
    };

    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth, behavior: "smooth" });
    });
    track.addEventListener("scroll", () => {
      window.clearTimeout(track._scrollTimeout);
      track._scrollTimeout = window.setTimeout(updateActiveDot, 100);
    });
  }
});
