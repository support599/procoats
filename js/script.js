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

  // EPDM Color Mixer
  const mixerRowsEl = document.getElementById("mixer-rows");
  const mixerCanvas = document.getElementById("mixer-canvas");
  const addColorBtn = document.getElementById("mixer-add-color");
  const printBtn = document.getElementById("mixer-print");
  const downloadBtn = document.getElementById("mixer-download");
  const gridEl = document.getElementById("color-options-grid");
  const optionsToggle = document.getElementById("color-options-toggle");
  const optionsPanel = document.getElementById("color-options-panel");

  if (mixerRowsEl && mixerCanvas && gridEl) {
    // `image` is the photo shown in the "EPDM Colors Options" reference grid.
    // `mixerImage` is a separate, dedicated photo used inside the mixer itself
    // (row swatches, row dropdown, and the blended preview) — falls back to
    // `image` when a color has no dedicated mixer photo yet. Either falls
    // back to a procedurally generated granule texture if its file 404s.
    const EPDM_COLORS = [
      { id: "056", name: "056 Eggshell", hex: "#ddc9a1", image: "images/epdm/056-eggshell.png", mixerImage: "images/epdm/color-mixer-100-056-eggshell.png" },
      { id: "062", name: "062 Standard Red", hex: "#a8432c", image: "images/epdm/062-standard-red.png", mixerImage: "images/epdm/color-mixer-100-062-standard-red.png" },
      { id: "064", name: "064 Standard Blue", hex: "#1f6fb0", image: "images/epdm/064-standard-blue.png", mixerImage: "images/epdm/color-mixer-100-064-standard-blue.png" },
      { id: "067", name: "067 Standard Green", hex: "#7c8c56", image: "images/epdm/067-standard-green.png", mixerImage: "images/epdm/color-mixer-100-067-standard-green.png" },
      { id: "054", name: "054 Dark Blue", hex: "#1b3a8a", image: "images/epdm/054-dark-blue.png", mixerImage: "images/epdm/color-mixer-100-054-dark-blue.png" },
      { id: "084", name: "084 Bright Blue", hex: "#3aa8dc", image: "images/epdm/084-bright-blue.png", mixerImage: "images/epdm/color-mixer-100-084-bright-blue.png" },
      { id: "044", name: "044 Lilac", hex: "#8d7cb8", image: "images/epdm/044-lilac.png", mixerImage: "images/epdm/color-mixer-100-044-lilac.png" },
      { id: "083", name: "083 Bright Orange", hex: "#dd7a2e", image: "images/epdm/083-bright-orange.png", mixerImage: "images/epdm/color-mixer-100-083-bright-orange.png" },
      { id: "082", name: "082 Bright Red", hex: "#c65141", image: "images/epdm/082-bright-red.webp", mixerImage: "images/epdm/color-mixer-100-082-bright-red.png" },
      { id: "069", name: "069 Yellow", hex: "#c99a3a", image: "images/epdm/069-yellow.png", mixerImage: "images/epdm/color-mixer-100-069-yellow.png" },
      { id: "089", name: "089 Bright Yellow", hex: "#dcb52e", image: "images/epdm/089-bright-yellow.png" },
      { id: "087", name: "087 Bright Green", hex: "#6ea85a", image: "images/epdm/087-bright-green.png", mixerImage: "images/epdm/color-mixer-100-087-bright-green.png" },
      { id: "047", name: "047 Dark Green", hex: "#163d2f", image: "images/epdm/047-dark-green.png", mixerImage: "images/epdm/color-mixer-100-047-dark-green.png" },
      { id: "060", name: "060 White", hex: "#e8e1d2", image: "images/epdm/060-white.png", mixerImage: "images/epdm/color-mixer-100-060-white.png" },
      { id: "046", name: "046 Brown", hex: "#4a3226", image: "images/epdm/046-brown.png", mixerImage: "images/epdm/color-mixer-100-046-brown.png" },
      { id: "076", name: "076 Beige Brown", hex: "#8a5a3d", image: "images/epdm/076-beige-brown.png", mixerImage: "images/epdm/color-mixer-100-076-beige-brown.png" },
      { id: "065", name: "065 Gray", hex: "#b9b9b3", image: "images/epdm/065-gray.png", mixerImage: "images/epdm/color-mixer-100-065-gray.png" },
      { id: "055", name: "055 Mid Gray", hex: "#6f6f68", image: "images/epdm/055-mid-gray.png", mixerImage: "images/epdm/color-mixer-100-055-mid-gray.png" },
      { id: "045", name: "045 Dark Gray", hex: "#2e2b2c", image: "images/epdm/045-dark-gray.png", mixerImage: "images/epdm/color-mixer-100-045-dark-gray.png" },
      { id: "black", name: "Black", hex: "#161414", image: "images/epdm/black.png", mixerImage: "images/epdm/color-mixer-100-black.png" },
    ];

    const findColor = (id) => EPDM_COLORS.find((c) => c.id === id) || EPDM_COLORS[0];

    const hexToRgb = (hex) => {
      const num = parseInt(hex.replace("#", ""), 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };

    const shade = (rgb, percent) => {
      const t = percent < 0 ? 0 : 255;
      const p = Math.abs(percent);
      const r = Math.round((t - rgb.r) * p + rgb.r);
      const g = Math.round((t - rgb.g) * p + rgb.g);
      const b = Math.round((t - rgb.b) * p + rgb.b);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Real photo loading, keyed by file path (each color can have up to two
    // distinct photos — grid vs. mixer — so path is the only stable key).
    // Falls back silently (procedural texture) until a given path 404s.
    const rawImages = new Map();
    const scaledImageCache = new Map();

    const ensureImageLoaded = (path) => {
      if (!path || rawImages.has(path)) return;
      const entry = { status: "loading", img: null };
      rawImages.set(path, entry);
      const img = new Image();
      img.onload = () => {
        entry.status = "loaded";
        entry.img = img;
        scaledImageCache.clear();
        renderRows();
        renderPreview();
        renderGrid();
      };
      img.onerror = () => {
        entry.status = "error";
      };
      img.src = path;
    };

    // Crops/scales a loaded photo to fill a size x size square (object-fit: cover),
    // cached so repeated granule draws just blit an already-sized canvas.
    const getScaledImage = (path, size) => {
      if (!path) return null;
      const key = path + ":" + size;
      if (scaledImageCache.has(key)) return scaledImageCache.get(key);
      const raw = rawImages.get(path);
      if (!raw || raw.status !== "loaded") return null;
      const img = raw.img;
      const off = document.createElement("canvas");
      off.width = size;
      off.height = size;
      const octx = off.getContext("2d");
      const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      octx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
      scaledImageCache.set(key, off);
      return off;
    };

    // Renders a crumb-rubber granule texture weighted by each entry's mix
    // percentage. Uses the real photo for a color when it has loaded, otherwise
    // falls back to a shaded solid fill so the mixer still works with no assets.
    const drawMixedTexture = (canvas, entries) => {
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#211f1d";
      ctx.fillRect(0, 0, w, h);

      const totalWeight = entries.reduce((s, e) => s + e.weight, 0) || 1;
      const cell = Math.max(5, Math.round(w / 40));
      let seed = 42;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      for (let y = -cell; y < h + cell; y += cell) {
        for (let x = -cell; x < w + cell; x += cell) {
          if (rand() < 0.12) continue;

          let r = rand() * totalWeight;
          let chosen = entries[entries.length - 1];
          for (const e of entries) {
            if (r < e.weight) { chosen = e; break; }
            r -= e.weight;
          }

          const cx = x + rand() * cell;
          const cy = y + rand() * cell;
          const rad = cell * (0.55 + rand() * 0.4);
          const sides = 5 + Math.floor(rand() * 3);
          const rotation = rand() * Math.PI;

          ctx.save();
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = rotation + (i / sides) * Math.PI * 2;
            const rr = rad * (0.75 + rand() * 0.35);
            const px = cx + Math.cos(angle) * rr;
            const py = cy + Math.sin(angle) * rr;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.clip();

          if (chosen.image) {
            ctx.drawImage(chosen.image, 0, 0, w, h);
          } else {
            ctx.fillStyle = shade(hexToRgb(chosen.hex), (rand() - 0.5) * 0.5);
            ctx.fill();
          }
          ctx.restore();
        }
      }
    };

    const swatchCache = new Map();
    const proceduralSwatch = (id) => {
      if (!swatchCache.has(id)) {
        const c = document.createElement("canvas");
        c.width = 120;
        c.height = 120;
        drawMixedTexture(c, [{ hex: findColor(id).hex, weight: 100, image: null }]);
        swatchCache.set(id, c.toDataURL());
      }
      return swatchCache.get(id);
    };

    // Used by the "EPDM Colors Options" reference grid — the original photos.
    const gridSwatchUrl = (id) => {
      const path = findColor(id).image;
      const raw = rawImages.get(path);
      if (raw && raw.status === "loaded") return path;
      return proceduralSwatch(id);
    };

    // Used inside the mixer itself (row swatch, row dropdown, preview) — the
    // dedicated mixer photo when one exists, otherwise the grid photo.
    const mixerSwatchUrl = (id) => {
      const color = findColor(id);
      const path = color.mixerImage || color.image;
      const raw = rawImages.get(path);
      if (raw && raw.status === "loaded") return path;
      return proceduralSwatch(id);
    };

    let rows = [{ color: EPDM_COLORS[0].id, weight: 100 }];
    let activeRow = 0;
    let openRow = null;
    let sliderRefs = [];
    let cardRefs = [];
    let rafHandle = null;

    // When a slider moves to `value`, the other rows' weights shrink/grow
    // proportionally so everything keeps summing to 100 — the same "linked
    // sliders" behavior as the reference mixer.
    const setWeight = (index, rawValue) => {
      const value = Math.max(0, Math.min(100, rawValue));
      const others = rows.map((_, i) => i).filter((i) => i !== index);
      if (others.length === 0) { rows[index].weight = 100; return; }
      const remaining = 100 - value;
      const othersSum = others.reduce((s, i) => s + rows[i].weight, 0);
      if (othersSum <= 0) {
        const each = remaining / others.length;
        others.forEach((i) => { rows[i].weight = each; });
      } else {
        others.forEach((i) => { rows[i].weight = (rows[i].weight / othersSum) * remaining; });
      }
      rows[index].weight = value;
      normalizeWeights();
    };

    const normalizeWeights = () => {
      rows.forEach((r) => { r.weight = Math.round(r.weight); });
      const diff = 100 - rows.reduce((s, r) => s + r.weight, 0);
      if (diff !== 0) {
        let idx = 0;
        rows.forEach((r, i) => { if (r.weight > rows[idx].weight) idx = i; });
        rows[idx].weight += diff;
      }
    };

    const setActiveRowVisual = (i) => {
      activeRow = i;
      cardRefs.forEach((card, idx) => { if (card) card.classList.toggle("is-active", idx === i); });
    };

    const updateSliderDisplays = () => {
      rows.forEach((r, i) => {
        const ref = sliderRefs[i];
        if (!ref) return;
        ref.input.value = String(Math.round(r.weight));
        ref.pct.textContent = Math.round(r.weight) + "%:";
      });
    };

    const scheduleRenderPreview = () => {
      if (rafHandle) return;
      rafHandle = requestAnimationFrame(() => {
        rafHandle = null;
        renderPreview();
      });
    };

    function renderPreview() {
      const size = mixerCanvas.width;
      const entries = rows.map((r) => {
        const color = findColor(r.color);
        return {
          hex: color.hex,
          weight: r.weight,
          image: getScaledImage(color.mixerImage || color.image, size),
        };
      });

      if (entries.length === 1 && entries[0].image) {
        const ctx = mixerCanvas.getContext("2d");
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(entries[0].image, 0, 0);
      } else {
        drawMixedTexture(mixerCanvas, entries);
      }
    }

    function renderRows() {
      mixerRowsEl.innerHTML = "";
      sliderRefs = [];
      cardRefs = [];

      rows.forEach((row, i) => {
        const color = findColor(row.color);
        const wrap = document.createElement("div");
        wrap.className = "mixer-row" + (openRow === i ? " is-open" : "");

        const card = document.createElement("div");
        card.className = "mixer-row__card" + (activeRow === i ? " is-active" : "");
        cardRefs[i] = card;

        const select = document.createElement("button");
        select.type = "button";
        select.className = "mixer-row__select";
        select.innerHTML =
          '<span class="mixer-row__swatch" style="background-image:url(\'' + mixerSwatchUrl(row.color) + '\')"></span>' +
          '<span class="mixer-row__name">' + color.name + "</span>" +
          '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
        select.addEventListener("click", (e) => {
          e.stopPropagation();
          activeRow = i;
          openRow = openRow === i ? null : i;
          renderRows();
        });
        card.appendChild(select);

        if (rows.length > 1) {
          const slider = document.createElement("div");
          slider.className = "mixer-slider";

          const pct = document.createElement("span");
          pct.className = "mixer-slider__pct";
          pct.textContent = Math.round(row.weight) + "%:";

          const input = document.createElement("input");
          input.type = "range";
          input.min = "0";
          input.max = "100";
          input.step = "1";
          input.value = String(Math.round(row.weight));
          input.className = "mixer-slider__input";
          input.style.accentColor = color.hex;
          input.addEventListener("pointerdown", () => setActiveRowVisual(i));
          input.addEventListener("input", (e) => {
            setWeight(i, parseFloat(e.target.value));
            updateSliderDisplays();
            scheduleRenderPreview();
          });

          slider.appendChild(pct);
          slider.appendChild(input);
          card.appendChild(slider);
          sliderRefs[i] = { input, pct };
        }

        if (openRow === i) {
          const dropdown = document.createElement("div");
          dropdown.className = "mixer-dropdown";
          EPDM_COLORS.forEach((c) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "mixer-dropdown__item" + (c.id === row.color ? " is-active" : "");
            item.innerHTML =
              '<span class="mixer-dropdown__swatch" style="background-image:url(\'' + mixerSwatchUrl(c.id) + '\')"></span>' + c.name;
            item.addEventListener("click", (e) => {
              e.stopPropagation();
              rows[i].color = c.id;
              activeRow = i;
              openRow = null;
              renderRows();
              renderPreview();
              renderGrid();
            });
            dropdown.appendChild(item);
          });
          card.appendChild(dropdown);
        }

        wrap.appendChild(card);

        if (rows.length > 1) {
          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "mixer-row__remove";
          removeBtn.innerHTML = '<i class="fa-solid fa-minus" aria-hidden="true"></i>';
          removeBtn.setAttribute("aria-label", "Remove color");
          removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeRow(i);
          });
          wrap.appendChild(removeBtn);
        }

        mixerRowsEl.appendChild(wrap);
      });
    }

    function renderGrid() {
      gridEl.innerHTML = "";
      const selectedIds = new Set(rows.map((r) => r.color));
      EPDM_COLORS.forEach((color) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "color-swatch" + (selectedIds.has(color.id) ? " is-selected" : "");
        btn.innerHTML =
          '<span class="color-swatch__img" style="background-image:url(\'' + gridSwatchUrl(color.id) + '\')"></span>' +
          '<span class="color-swatch__label">' + color.name + "</span>";
        btn.addEventListener("click", () => {
          rows[activeRow].color = color.id;
          renderRows();
          renderPreview();
          renderGrid();
        });
        gridEl.appendChild(btn);
      });
    }

    function removeRow(i) {
      const removedWeight = rows[i].weight;
      rows.splice(i, 1);
      if (rows.length === 1) {
        rows[0].weight = 100;
      } else if (rows.length > 1) {
        const sum = rows.reduce((s, r) => s + r.weight, 0);
        if (sum <= 0) {
          const each = 100 / rows.length;
          rows.forEach((r) => { r.weight = each; });
        } else {
          rows.forEach((r) => { r.weight += removedWeight * (r.weight / sum); });
        }
        normalizeWeights();
      }
      if (activeRow >= rows.length) activeRow = rows.length - 1;
      openRow = null;
      renderRows();
      renderPreview();
      renderGrid();
    }

    document.addEventListener("click", () => {
      if (openRow === null) return;
      openRow = null;
      renderRows();
    });

    addColorBtn.addEventListener("click", () => {
      if (rows.length >= 6) return;
      const used = new Set(rows.map((r) => r.color));
      const next = EPDM_COLORS.find((c) => !used.has(c.id)) || EPDM_COLORS[0];
      const newWeight = 5;
      const shrink = (100 - newWeight) / 100;
      rows.forEach((r) => { r.weight *= shrink; });
      rows.push({ color: next.id, weight: newWeight });
      normalizeWeights();
      activeRow = rows.length - 1;
      openRow = null;
      renderRows();
      renderPreview();
      renderGrid();
    });

    if (printBtn) {
      printBtn.addEventListener("click", () => {
        const dataUrl = mixerCanvas.toDataURL("image/png");
        const names = rows
          .map((r) => findColor(r.color).name + (rows.length > 1 ? " (" + Math.round(r.weight) + "%)" : ""))
          .join(" + ");
        const win = window.open("", "_blank", "width=480,height=640");
        if (!win) return;
        win.document.write(
          '<html><head><title>EPDM Color Mix</title></head>' +
          '<body style="font-family:Arial, sans-serif; text-align:center; padding:32px;">' +
          "<h2 style=\"margin-bottom:20px;\">" + names + "</h2>" +
          '<img src="' + dataUrl + '" style="width:100%; max-width:400px; border-radius:12px;">' +
          "</body></html>"
        );
        win.document.close();
        win.focus();
        win.print();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const dataUrl = mixerCanvas.toDataURL("image/png");
        const names = rows
          .map((r) => findColor(r.color).name.replace(/\s+/g, "-") + (rows.length > 1 ? "-" + Math.round(r.weight) : ""))
          .join("_");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "epdm-color-mix-" + names + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    }

    if (optionsToggle && optionsPanel) {
      optionsToggle.addEventListener("click", () => {
        const expanded = optionsToggle.getAttribute("aria-expanded") === "true";
        optionsToggle.setAttribute("aria-expanded", String(!expanded));
        optionsPanel.classList.toggle("is-collapsed", expanded);
      });

      // Collapsed by default on mobile so the color grid doesn't push the
      // rest of the page down before the visitor has even used the mixer.
      if (window.matchMedia("(max-width: 640px)").matches) {
        optionsToggle.setAttribute("aria-expanded", "false");
        optionsPanel.classList.add("is-collapsed");
      }
    }

    EPDM_COLORS.forEach((c) => {
      ensureImageLoaded(c.image);
      ensureImageLoaded(c.mixerImage);
    });
    renderRows();
    renderPreview();
    renderGrid();
  }
});
