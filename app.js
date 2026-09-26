(function () {
  "use strict";

  /* =========================================================
     1. Constants
     ========================================================= */

  var STORAGE_KEY = "colorGuide.v1";

  var HARMONIES = {
    monochromatic: {
      label: "Monochromatic",
      note: "One hue, six tints and shades. The safest way to look polished."
    },
    analogous: {
      label: "Analogous",
      note: "Neighbouring hues (30\u00b0 apart) for a calm, cohesive feel."
    },
    complementary: {
      label: "Complementary",
      note: "Opposite hues (180\u00b0 apart) \u2014 high energy, strong contrast."
    },
    splitComplementary: {
      label: "Split complementary",
      note: "The base hue plus the two neighbours of its opposite. Contrasty but calmer than a straight complement."
    },
    triadic: {
      label: "Triadic",
      note: "Three hues evenly spaced 120\u00b0 apart on the wheel. Vibrant yet balanced."
    },
    tetradic: {
      label: "Tetradic",
      note: "Two complementary pairs \u2014 four hues at 0\u00b0, 90\u00b0, 180\u00b0, 270\u00b0."
    },
    square: {
      label: "Square",
      note: "Like tetradic but every hue sits 90\u00b0 from the next around the wheel."
    },
    compound: {
      label: "Compound",
      note: "A complementary pair plus a split complement, then stretched to six."
    },
    shades: {
      label: "Shades",
      note: "A single hue darkened into six steps \u2014 moody and dramatic."
    },
    earth: {
      label: "Earth tones",
      note: "Low-saturation warm and cool neutrals, like sand, clay and moss."
    },
    pastel: {
      label: "Pastel",
      note: "Light and desaturated tints spread around the wheel."
    },
    vibrant: {
      label: "Vibrant",
      note: "Fully saturated hues with strong light\u2013dark contrast."
    }
  };

  var VIBES = {
    soft: {
      label: "Soft",
      sat: [-22, -8],
      baseSat: 42
    },
    balanced: {
      label: "Balanced",
      sat: [-12, 12],
      baseSat: 66
    },
    bold: {
      label: "Bold",
      sat: [10, 28],
      baseSat: 88
    }
  };

  var DEPTH_WORDS = ["deepest", "deep", "base", "light", "lighter", "lightest"];

  var HUE_LABELS = {
    monochromatic: ["Base hue"],
    shades: ["Base hue"],
    analogous: ["Cool neighbour", "Base hue", "Warm neighbour"],
    complementary: ["Base", "Complement"],
    splitComplementary: ["Base", "Split A", "Split B"],
    triadic: ["Base", "Second", "Third"],
    tetradic: ["Base", "Second", "Opposite", "Fourth"],
    square: ["Base", "Second", "Opposite", "Fourth"],
    compound: ["Base", "Complement", "Split A", "Split B"],
    earth: ["Bark", "Terracotta", "Olive", "Moss", "Sand", "Stone"],
    pastel: ["Base", "Second", "Third", "Fourth"],
    vibrant: ["Base", "Second", "Third", "Fourth"]
  };

  /* Lightness is always an even, strictly increasing ramp from the deepest
     swatch to the lightest one. Because the hue of a swatch is fixed by
     (index % hueCount) and its lightness by index, no two swatches can ever
     collapse onto the same colour. */
  var LIGHT_RANGES = {
    soft: [55, 88],
    balanced: [32, 82],
    bold: [22, 68]
  };

  var SHADE_RANGE = [12, 78];

  var SWATCH_COUNT = 6;

  /* =========================================================
     2. Tiny helpers
     ========================================================= */

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function wrapHue(hue) {
    return ((Math.round(hue) % 360) + 360) % 360;
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randIntBetween(min, max) {
    return Math.round(randBetween(min, max));
  }

  function pickOffset(list) {
    if (list.length < 2) {
      return 0;
    }
    var offset = randIntBetween(1, list.length - 1);
    return Math.min(offset, list.length - offset);
  }

  function spread(list, amount) {
    if (list.length < 2 || !amount) {
      return list.slice();
    }
    var step = amount / (list.length - 1);
    return list.map(function (value, index) {
      return value + index * step;
    });
  }

  function rampLightness(range) {
    var step = (range[1] - range[0]) / (SWATCH_COUNT - 1);
    var values = [];
    for (var i = 0; i < SWATCH_COUNT; i += 1) {
      values.push(Math.round(range[0] + i * step));
    }
    return values;
  }

  function toHex(h, s, l) {
    var hue = wrapHue(h) / 360;
    var sat = clamp(s, 0, 100) / 100;
    var light = clamp(l, 0, 100) / 100;

    if (sat === 0) {
      var grey = Math.round(light * 255);
      return toHexPair(grey, grey, grey);
    }

    var q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    var p = 2 * light - q;

    return toHexPair(
      Math.round(hueToChannel(p, q, hue + 1 / 3) * 255),
      Math.round(hueToChannel(p, q, hue) * 255),
      Math.round(hueToChannel(p, q, hue - 1 / 3) * 255)
    );
  }

  function hueToChannel(p, q, t) {
    var value = t;
    if (value < 0) {
      value += 1;
    }
    if (value > 1) {
      value -= 1;
    }
    if (value < 1 / 6) {
      return p + (q - p) * 6 * value;
    }
    if (value < 1 / 2) {
      return q;
    }
    if (value < 2 / 3) {
      return p + (q - p) * (2 / 3 - value) * 6;
    }
    return p;
  }

  function toHexPair(r, g, b) {
    return "#" + [r, g, b].map(function (value) {
      var text = clamp(value, 0, 255).toString(16);
      return text.length === 1 ? "0" + text : text;
    }).join("");
  }

  function hexToRgb(hex) {
    var value = parseInt(String(hex).replace("#", ""), 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  function relativeLuminance(hex) {
    var rgb = hexToRgb(hex);
    var parts = [rgb.r, rgb.g, rgb.b].map(function (value) {
      var channel = value / 255;
      if (channel <= 0.03928) {
        return channel / 12.92;
      }
      return Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
  }

  function contrastRatio(a, b) {
    var lumA = relativeLuminance(a);
    var lumB = relativeLuminance(b);
    var lighter = Math.max(lumA, lumB);
    var darker = Math.min(lumA, lumB);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function bestTextColor(hex) {
    var onWhite = contrastRatio(hex, "#ffffff");
    var onBlack = contrastRatio(hex, "#141b26");
    return onWhite >= onBlack ? "#ffffff" : "#141b26";
  }

  function shuffle(items) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function formatTime(timestamp) {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return "";
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeId(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "");
  }

  /* =========================================================
     3. Web storage (localStorage with a memory fallback)
     ========================================================= */

  function readStore() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      raw = null;
    }
    if (!raw) {
      return null;
    }
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function writeStore(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  }

  function clearStore() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      return false;
    }
    return true;
  }

  function defaultState() {
    return {
      harmony: "monochromatic",
      vibe: "balanced",
      hue: 210,
      hueMode: "locked",
      locked: false,
      order: [0, 1, 2, 3, 4, 5],
      colors: null,
      saved: []
    };
  }

  function isValidHex(value) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  }

  function sanitizeState(raw) {
    var state = defaultState();

    if (raw && HARMONIES[raw.harmony]) {
      state.harmony = raw.harmony;
    }
    if (raw && VIBES[raw.vibe]) {
      state.vibe = raw.vibe;
    }
    if (raw && typeof raw.hue === "number" && isFinite(raw.hue)) {
      state.hue = wrapHue(raw.hue);
    }
    if (raw && (raw.hueMode === "random" || raw.hueMode === "locked")) {
      state.hueMode = raw.hueMode;
    }
    state.locked = Boolean(raw && raw.locked);

    if (raw && Array.isArray(raw.order) && raw.order.length === SWATCH_COUNT) {
      var order = raw.order.map(Number);
      var unique = order.filter(function (value, index) {
        return value >= 0 && value < SWATCH_COUNT && order.indexOf(value) === index;
      });
      if (unique.length === SWATCH_COUNT) {
        state.order = order;
      }
    }

    if (raw && Array.isArray(raw.colors) && raw.colors.length === SWATCH_COUNT) {
      var colors = raw.colors.filter(function (item) {
        return item && isValidHex(item.hex);
      });
      if (colors.length === SWATCH_COUNT) {
        state.colors = colors.map(function (item) {
          return {
            hex: item.hex.toLowerCase(),
            role: typeof item.role === "string" ? item.role.slice(0, 40) : "Color",
            hue: typeof item.hue === "number" ? wrapHue(item.hue) : 0,
            sat: typeof item.sat === "number" ? item.sat : 0,
            light: typeof item.light === "number" ? item.light : 0
          };
        });
      }
    }

    if (raw && Array.isArray(raw.saved)) {
      state.saved = raw.saved.filter(function (item) {
        if (!item || !Array.isArray(item.colors) || item.colors.length !== SWATCH_COUNT) {
          return false;
        }
        return item.colors.every(isValidHex);
      }).slice(0, 12).map(function (item) {
        return {
          id: safeId(item.id) || String(Date.now()),
          name: (typeof item.name === "string" ? item.name : "Saved palette").slice(0, 40),
          harmony: HARMONIES[item.harmony] ? item.harmony : "monochromatic",
          createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
          colors: item.colors.map(function (hex) {
            return String(hex).toLowerCase();
          })
        };
      });
    }

    return state;
  }

  /* =========================================================
     4. App state
     ========================================================= */

  var state = sanitizeState(readStore());

  function persist() {
    writeStore({
      harmony: state.harmony,
      vibe: state.vibe,
      hue: state.hue,
      hueMode: state.hueMode,
      locked: state.locked,
      order: state.order,
      colors: state.colors,
      saved: state.saved
    });
  }

  /* =========================================================
     5. Harmony generators
     ========================================================= */

  function evenHues(startHue, count, step) {
    var hues = [];
    for (var i = 0; i < count; i += 1) {
      hues.push(startHue + i * step);
    }
    return hues;
  }

  function hueSetFor(harmony, baseHue) {
    switch (harmony) {
      case "monochromatic":
      case "shades":
        return [baseHue];
      case "analogous": {
        var run = [baseHue - 45, baseHue, baseHue + 45];
        return spread(run, pickOffset(run));
      }
      case "complementary":
        return [baseHue, baseHue + 180];
      case "splitComplementary":
        return [baseHue, baseHue + 150, baseHue + 210];
      case "triadic":
        return evenHues(baseHue, 3, 120);
      case "tetradic":
      case "square":
        return evenHues(baseHue, 4, 90);
      case "compound":
        return [baseHue, baseHue + 180, baseHue + 150, baseHue + 210];
      case "earth":
        return [24, 14, 68, 96, 40, 200];
      case "pastel":
        return evenHues(baseHue - randIntBetween(10, 70), 4, randIntBetween(35, 65));
      case "vibrant":
        return evenHues(baseHue, 4, 60);
      default:
        return [baseHue];
    }
  }

  function lightnessPlanFor(harmony, vibe) {
    return rampLightness(harmony === "shades" ? SHADE_RANGE : LIGHT_RANGES[vibe]);
  }

  /* Single-hue rules keep one saturation for the whole ramp, so the six
     swatches read as clean steps of one colour instead of six similar
     colours. Multi-hue rules get small per-swatch variation. */
  function saturationFor(harmony, vibe, index) {
    var settings = VIBES[vibe];
    var base;

    if (harmony === "earth") {
      return randIntBetween(16, 42);
    }
    if (harmony === "pastel") {
      return randIntBetween(32, 62);
    }
    if (harmony === "vibrant") {
      return randIntBetween(76, 96);
    }
    if (harmony === "monochromatic" || harmony === "shades") {
      return clamp(settings.baseSat, 12, 96);
    }

    if (index === 0) {
      return clamp(settings.baseSat + randIntBetween(-6, 10), 12, 96);
    }

    base = settings.baseSat + randIntBetween(settings.sat[0], settings.sat[1]);
    if (index !== 1) {
      base -= 8;
    }
    return clamp(base, 12, 96);
  }

  function roleName(harmony, index, offsetIndex) {
    var labels = HUE_LABELS[harmony] || HUE_LABELS.monochromatic;
    var hueLabel = labels[offsetIndex % labels.length] || labels[0];
    var depth = DEPTH_WORDS[index] || DEPTH_WORDS[2];
    return hueLabel + " \u00b7 " + depth;
  }

  function generatePalette() {
    var harmony = state.harmony;
    var vibe = state.vibe;
    var baseHue = wrapHue(state.hue);
    var hues = hueSetFor(harmony, baseHue);
    var lights = lightnessPlanFor(harmony, vibe);

    var colors = [];
    for (var i = 0; i < SWATCH_COUNT; i += 1) {
      var offsetIndex = i % hues.length;
      var hue = wrapHue(hues[offsetIndex]);
      var sat = saturationFor(harmony, vibe, i);
      var light = clamp(Math.round(lights[i]), 3, 96);

      colors.push({
        hex: toHex(hue, sat, light),
        role: roleName(harmony, i, offsetIndex),
        hue: hue,
        sat: sat,
        light: light
      });
    }

    state.colors = colors;
    state.order = [0, 1, 2, 3, 4, 5];
  }

  /* =========================================================
     6. Copy helpers
     ========================================================= */

  function paletteCss(colors) {
    var lines = [":root {"];
    colors.forEach(function (color, index) {
      var name = (color.role || "color-" + (index + 1))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || ("color-" + (index + 1));
      lines.push("  --" + name + ": " + color.hex + ";");
    });
    lines.push("}");
    return lines.join("\n");
  }

  function writeToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(area);
        if (ok) {
          resolve();
        } else {
          reject(new Error("copy failed"));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /* =========================================================
     7. DOM rendering
     ========================================================= */

  var els = {
    harmonyChips: document.getElementById("harmonyChips"),
    ruleNote: document.getElementById("ruleNote"),
    hueRange: document.getElementById("hueRange"),
    hueOut: document.getElementById("hueOut"),
    hueStrip: document.getElementById("hueStrip"),
    generateBtn: document.getElementById("generateBtn"),
    shuffleBtn: document.getElementById("shuffleBtn"),
    lockBtn: document.getElementById("lockBtn"),
    resetBtn: document.getElementById("resetBtn"),
    copyCssBtn: document.getElementById("copyCssBtn"),
    saveBtn: document.getElementById("saveBtn"),
    swatches: document.getElementById("swatches"),
    paletteMeta: document.getElementById("paletteMeta"),
    scaleBar: document.getElementById("scaleBar"),
    checks: document.getElementById("checks"),
    wheel: document.getElementById("wheel"),
    savedList: document.getElementById("savedList"),
    savedCount: document.getElementById("savedCount"),
    toast: document.getElementById("toast")
  };

  var toastTimer = null;

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, 1800);
  }

  function currentPalette() {
    if (!state.colors) {
      return [];
    }
    return state.order.map(function (index) {
      return state.colors[index];
    }).filter(Boolean);
  }

  function renderHueStrip() {
    var parts = [];
    for (var i = 0; i < 12; i += 1) {
      var hue = i * 30;
      parts.push("<span style=\"background:" + toHex(hue, 72, 62) + "\"></span>");
    }
    els.hueStrip.innerHTML = parts.join("");
  }

  function renderControls() {
    var chips = els.harmonyChips.querySelectorAll(".chip");
    for (var i = 0; i < chips.length; i += 1) {
      var chip = chips[i];
      if (chip.getAttribute("data-harmony") === state.harmony) {
        chip.classList.add("is-active");
      } else {
        chip.classList.remove("is-active");
      }
    }

    var segs = document.querySelectorAll(".seg");
    for (var j = 0; j < segs.length; j += 1) {
      var seg = segs[j];
      var vibe = seg.getAttribute("data-vibe");
      var hueMode = seg.getAttribute("data-huemode");
      if (vibe) {
        seg.classList.toggle("is-active", vibe === state.vibe);
      }
      if (hueMode) {
        seg.classList.toggle("is-active", hueMode === state.hueMode);
      }
    }

    els.hueRange.value = String(state.hue);
    els.hueRange.disabled = state.hueMode === "random";
    els.hueOut.textContent = state.hue + "\u00b0";
    els.ruleNote.textContent = HARMONIES[state.harmony].note;

    els.lockBtn.textContent = "Lock: " + (state.locked ? "on" : "off");
    els.lockBtn.classList.toggle("is-on", state.locked);
    els.lockBtn.setAttribute("aria-pressed", state.locked ? "true" : "false");
  }

  function renderPalette() {
    var palette = currentPalette();

    if (!palette.length) {
      els.swatches.innerHTML = "<p class=\"empty-state\">No palette yet.</p>";
      return;
    }

    els.paletteMeta.textContent = HARMONIES[state.harmony].label + " \u00b7 base " + state.hue + "\u00b0 \u00b7 " + VIBES[state.vibe].label;

    els.swatches.innerHTML = palette.map(function (color) {
      var role = escapeHtml(color.role);
      return "" +
        "<figure class=\"swatch\">" +
          "<div class=\"swatch-chip\" style=\"background:" + color.hex + ";\"></div>" +
          "<figcaption class=\"swatch-body\">" +
            "<div class=\"swatch-role\">" +
              "<span class=\"swatch-name\">" + role + "</span>" +
              "<span class=\"swatch-hue\">" + color.hue + "\u00b0</span>" +
            "</div>" +
            "<div class=\"swatch-hex\">" + color.hex + "</div>" +
            "<div class=\"swatch-sub\">S " + color.sat + "% \u00b7 L " + color.light + "%</div>" +
            "<div class=\"swatch-actions\">" +
              "<button type=\"button\" class=\"mini-btn\" data-copy-hex=\"" + color.hex + "\">Copy hex</button>" +
              "<button type=\"button\" class=\"mini-btn\" data-copy-hsl=\"hsl(" + color.hue + ", " + color.sat + "%, " + color.light + "%)\">Copy HSL</button>" +
            "</div>" +
          "</figcaption>" +
        "</figure>";
    }).join("");

    renderScaleBar(palette);
    renderChecks(palette);
    renderWheel(palette);
  }

  function renderScaleBar(palette) {
    var baseHue = state.hue;
    var steps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var parts = steps.map(function (step) {
      var light = 8 + step * 9.4;
      return "<span style=\"background:" + toHex(baseHue, 62, light) + "\" title=\"L " + Math.round(light) + "%\"></span>";
    });
    els.scaleBar.innerHTML = parts.join("");
  }

  function renderChecks(palette) {
    els.checks.innerHTML = palette.map(function (color) {
      var onWhite = contrastRatio(color.hex, "#ffffff");
      var onBlack = contrastRatio(color.hex, "#141b26");
      var passWhite = onWhite >= 4.5;
      var passBlack = onBlack >= 4.5;

      return "" +
        "<div class=\"check\">" +
          "<div class=\"check-preview\" style=\"background:" + color.hex + ";color:" + bestTextColor(color.hex) + "\">" +
            "Aa" +
          "</div>" +
          "<div class=\"check-row\"><span>on white</span><strong class=\"" + (passWhite ? "pass" : "fail") + "\">" + onWhite.toFixed(1) + ":1</strong></div>" +
          "<div class=\"check-row\"><span>on black</span><strong class=\"" + (passBlack ? "pass" : "fail") + "\">" + onBlack.toFixed(1) + ":1</strong></div>" +
        "</div>";
    }).join("");
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(name, attributes) {
    var node = document.createElementNS(SVG_NS, name);
    for (var key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        node.setAttribute(key, attributes[key]);
      }
    }
    return node;
  }

  function polar(radius, degrees) {
    var radian = ((degrees - 90) * Math.PI) / 180;
    return {
      x: 160 + radius * Math.cos(radian),
      y: 160 + radius * Math.sin(radian)
    };
  }

  function arcPath(innerRadius, outerRadius, fromHue, toHue) {
    var outerFrom = polar(outerRadius, fromHue);
    var outerTo = polar(outerRadius, toHue);
    var innerTo = polar(innerRadius, toHue);
    var innerFrom = polar(innerRadius, fromHue);
    var large = Math.abs(toHue - fromHue) > 180 ? 1 : 0;

    return "M " + outerFrom.x.toFixed(2) + " " + outerFrom.y.toFixed(2) +
      " A " + outerRadius + " " + outerRadius + " 0 " + large + " 1 " + outerTo.x.toFixed(2) + " " + outerTo.y.toFixed(2) +
      " L " + innerTo.x.toFixed(2) + " " + innerTo.y.toFixed(2) +
      " A " + innerRadius + " " + innerRadius + " 0 " + large + " 0 " + innerFrom.x.toFixed(2) + " " + innerFrom.y.toFixed(2) +
      " Z";
  }

  function buildWheel() {
    var svg = els.wheel;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    var outer = 146;
    var inner = 44;
    var steps = 72;
    var stepSize = 360 / steps;

    for (var i = 0; i < steps; i += 1) {
      var from = i * stepSize;
      var to = from + stepSize;
      var lightness = 30 + 46 * (1 - i / (steps - 1));
      var path = svgEl("path", {
        d: arcPath(inner, outer, from, to),
        fill: toHex(from + stepSize / 2, 78, lightness),
        stroke: "#ffffff",
        "stroke-width": "0.6"
      });
      svg.appendChild(path);
    }

    var plate = svgEl("circle", {
      cx: "160",
      cy: "160",
      r: String(inner - 2),
      fill: "#ffffff",
      stroke: "#e4e7ec",
      "stroke-width": "1.5"
    });
    svg.appendChild(plate);

    [104, 122, 140].forEach(function (radius) {
      svg.appendChild(svgEl("circle", {
        cx: "160",
        cy: "160",
        r: String(radius),
        fill: "none",
        stroke: "#f1f3f5",
        "stroke-width": "1"
      }));
    });

    var dotLayer = svgEl("g", { id: "wheelDots" });
    svg.appendChild(dotLayer);
  }

  function renderWheel(palette) {
    var layer = document.getElementById("wheelDots");
    if (!layer) {
      return;
    }
    while (layer.firstChild) {
      layer.removeChild(layer.firstChild);
    }

    var outer = 146;
    var inner = 44;
    var centerText = svgEl("text", {
      x: "160",
      y: "156",
      "text-anchor": "middle",
      "font-size": "11",
      "font-weight": "700",
      fill: "#8a94a6"
    });
    centerText.textContent = HARMONIES[state.harmony].label.split(" ")[0].toUpperCase();
    layer.appendChild(centerText);

    var centerValue = svgEl("text", {
      x: "160",
      y: "170",
      "text-anchor": "middle",
      "font-size": "10",
      fill: "#a3abba"
    });
    centerValue.textContent = state.hue + "\u00b0";
    layer.appendChild(centerValue);

    palette.forEach(function (color, index) {
      var ratio = clamp(color.light / 100, 0, 1);
      var radius = inner + (outer - inner) * ratio;
      var point = polar(radius, color.hue);

      layer.appendChild(svgEl("circle", {
        cx: point.x.toFixed(2),
        cy: point.y.toFixed(2),
        r: "9",
        fill: color.hex,
        stroke: "#ffffff",
        "stroke-width": "2.5"
      }));

      var label = svgEl("text", {
        x: point.x.toFixed(2),
        y: (point.y + 3.2).toFixed(2),
        "text-anchor": "middle",
        "font-size": "8.5",
        "font-weight": "700",
        fill: bestTextColor(color.hex)
      });
      label.textContent = String(index + 1);
      layer.appendChild(label);
    });
  }

  function renderSaved() {
    els.savedCount.textContent = String(state.saved.length);

    if (!state.saved.length) {
      els.savedList.innerHTML = "<p class=\"empty-state\">No saved palettes yet. Hit <strong>Save palette</strong> to keep one here \u2014 it survives a refresh.</p>";
      return;
    }

    els.savedList.innerHTML = state.saved.map(function (item) {
      var id = safeId(item.id);
      var ramp = item.colors.map(function (hex) {
        return "<span style=\"background:" + hex + "\" data-copy-hex=\"" + hex + "\" title=\"Copy " + hex + "\"></span>";
      }).join("");

      return "" +
        "<div class=\"saved-item\" data-id=\"" + id + "\">" +
          "<div class=\"saved-ramp\">" + ramp + "</div>" +
          "<div class=\"saved-meta\">" +
            "<div>" +
              "<div class=\"saved-name\">" + escapeHtml(item.name) + "</div>" +
              "<div class=\"saved-sub\">" + HARMONIES[item.harmony].label + " \u00b7 " + item.colors.length + " colors \u00b7 " + escapeHtml(formatTime(item.createdAt)) + "</div>" +
            "</div>" +
            "<div class=\"saved-actions\">" +
              "<button type=\"button\" class=\"mini-btn\" data-load-id=\"" + id + "\">Load</button>" +
              "<button type=\"button\" class=\"icon-btn\" data-delete-id=\"" + id + "\" aria-label=\"Delete " + escapeHtml(item.name) + "\">Delete</button>" +
            "</div>" +
          "</div>" +
        "</div>";
    }).join("");
  }

  function renderAll() {
    renderControls();
    renderPalette();
    renderSaved();
  }

  /* =========================================================
     8. Actions
     ========================================================= */

  function doGenerate() {
    if (state.hueMode === "random") {
      state.hue = randIntBetween(0, 359);
    }
    state.locked = false;
    generatePalette();
    persist();
    renderAll();
  }

  function blockedByLock() {
    if (!state.locked) {
      return false;
    }
    showToast("Palette is locked \u2014 press Generate to unlock");
    return true;
  }

  function doShuffle() {
    if (!state.colors) {
      return;
    }
    state.order = shuffle(state.order);
    persist();
    renderPalette();
    showToast("Order shuffled");
  }

  function doToggleLock() {
    state.locked = !state.locked;
    persist();
    renderControls();
    showToast(state.locked ? "Palette locked" : "Palette unlocked");
  }

  function doSave() {
    if (!state.colors) {
      return;
    }
    var harmonyLabel = HARMONIES[state.harmony].label;
    var palette = currentPalette();

    state.saved.unshift({
      id: String(Date.now()) + Math.floor(Math.random() * 1000),
      name: harmonyLabel + " " + state.hue + "\u00b0",
      harmony: state.harmony,
      createdAt: Date.now(),
      colors: palette.map(function (color) {
        return color.hex;
      })
    });

    state.saved = state.saved.slice(0, 12);
    persist();
    renderSaved();
    showToast("Palette saved");
  }

  function doCopyCss() {
    var palette = currentPalette();
    if (!palette.length) {
      return;
    }
    writeToClipboard(paletteCss(palette)).then(function () {
      showToast("CSS variables copied");
    }, function () {
      showToast("Copy failed \u2014 select manually");
    });
  }

  function doLoad(id) {
    var item = null;
    for (var i = 0; i < state.saved.length; i += 1) {
      if (state.saved[i].id === id) {
        item = state.saved[i];
        break;
      }
    }
    if (!item) {
      return;
    }

    state.harmony = item.harmony;
    state.colors = item.colors.map(function (hex, index) {
      var rgb = hexToRgb(hex);
      var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return {
        hex: hex,
        role: "Color " + (index + 1),
        hue: hsl.h,
        sat: hsl.s,
        light: hsl.l
      };
    });
    state.order = [0, 1, 2, 3, 4, 5];
    state.locked = false;
    persist();
    renderAll();
    showToast("Loaded " + item.name);
  }

  function rgbToHsl(r, g, b) {
    var rn = r / 255;
    var gn = g / 255;
    var bn = b / 255;
    var max = Math.max(rn, gn, bn);
    var min = Math.min(rn, gn, bn);
    var delta = max - min;
    var l = (max + min) / 2;
    var h = 0;
    var s = 0;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      if (max === rn) {
        h = 60 * (((gn - bn) / delta) % 6);
      } else if (max === gn) {
        h = 60 * ((bn - rn) / delta + 2);
      } else {
        h = 60 * ((rn - gn) / delta + 4);
      }
    }

    return {
      h: wrapHue(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function doDelete(id) {
    state.saved = state.saved.filter(function (item) {
      return item.id !== id;
    });
    persist();
    renderSaved();
    showToast("Palette deleted");
  }

  function doReset() {
    clearStore();
    state = defaultState();
    generatePalette();
    state.saved = [];
    persist();
    renderAll();
    showToast("Saved data reset");
  }

  /* =========================================================
     9. Events
     ========================================================= */

  function onDocumentClick(event) {
    var target = event.target;
    if (!target || !target.getAttribute) {
      return;
    }

    var copyHex = target.getAttribute("data-copy-hex");
    if (copyHex) {
      copy(copyHex, "Copied " + copyHex);
      return;
    }

    var copyHsl = target.getAttribute("data-copy-hsl");
    if (copyHsl) {
      copy(copyHsl, "Copied " + copyHsl);
      return;
    }

    var loadId = target.getAttribute("data-load-id");
    if (loadId) {
      doLoad(loadId);
      return;
    }

    var deleteId = target.getAttribute("data-delete-id");
    if (deleteId) {
      doDelete(deleteId);
    }
  }

  function copy(text, message) {
    writeToClipboard(text).then(function () {
      showToast(message);
    }, function () {
      showToast("Copy failed \u2014 select the text manually");
    });
  }

  function bindEvents() {
    els.harmonyChips.addEventListener("click", function (event) {
      var chip = event.target.closest(".chip");
      if (!chip) {
        return;
      }
      state.harmony = chip.getAttribute("data-harmony");
      persist();
      renderControls();
      if (blockedByLock()) {
        return;
      }
      generatePalette();
      persist();
      renderPalette();
    });

    document.addEventListener("click", function (event) {
      var seg = event.target.closest(".seg");
      if (!seg) {
        return;
      }
      var vibe = seg.getAttribute("data-vibe");
      var hueMode = seg.getAttribute("data-huemode");

      if (vibe) {
        state.vibe = vibe;
      } else if (hueMode) {
        state.hueMode = hueMode;
      } else {
        return;
      }

      if (hueMode && hueMode === "random" && !state.colors) {
        state.hue = randIntBetween(0, 359);
      }

      persist();
      renderControls();
      if (blockedByLock()) {
        return;
      }
      generatePalette();
      persist();
      renderPalette();
    });

    els.hueRange.addEventListener("input", function () {
      state.hue = Number(els.hueRange.value);
      els.hueOut.textContent = state.hue + "\u00b0";
      if (state.hueMode === "locked" && !state.locked) {
        generatePalette();
        renderPalette();
      }
    });

    els.hueRange.addEventListener("change", function () {
      state.hue = Number(els.hueRange.value);
      if (blockedByLock()) {
        return;
      }
      generatePalette();
      persist();
      renderAll();
    });

    els.generateBtn.addEventListener("click", doGenerate);
    els.shuffleBtn.addEventListener("click", doShuffle);
    els.lockBtn.addEventListener("click", doToggleLock);
    els.saveBtn.addEventListener("click", doSave);
    els.copyCssBtn.addEventListener("click", doCopyCss);
    els.resetBtn.addEventListener("click", doReset);

    document.addEventListener("click", onDocumentClick);
  }

  /* =========================================================
     10. Boot
     ========================================================= */

  function init() {
    buildWheel();
    renderHueStrip();
    bindEvents();

    if (!state.colors) {
      if (state.hueMode === "random") {
        state.hue = randIntBetween(0, 359);
      }
      generatePalette();
      persist();
    }

    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
