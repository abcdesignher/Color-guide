# Color Guide

A small color palette generator. Pick a color system from the color wheel, and the app
gives you six colors that are built to work together.

Everything is plain HTML, CSS and JavaScript. No frameworks, no build step, no internet
connection needed.

---

## How to open it

Double-click `index.html`. That is it.

You can also start a tiny local server if you prefer:

```
python -m http.server 8000
```

Then visit `http://localhost:8000`.

---

## What the app does

- Generates **six colors** at a time.
- Uses real color theory rules, not random colors: triadic, analogous, complementary and more.
- Shows a **color wheel** with your six colors plotted on it.
- Shows the **contrast** of every color on white and on black, so you know if text will be readable.
- Lets you **save palettes** in your browser and load them back later.
- Works out of the box in any modern browser.

---

## The twelve color systems

Each system places its hues at fixed spots on the color wheel. The number is how far
apart the hues sit from each other.

| System | What it does | Angles used |
| --- | --- | --- |
| Monochromatic | One single hue, made lighter and darker | 0° |
| Analogous | Colors that sit next to each other on the wheel | about 45° apart |
| Complementary | A color and its opposite | 180° |
| Split complementary | A color plus the two neighbors of its opposite | 150° and 210° |
| Triadic | Three colors spaced evenly around the wheel | 120° apart |
| Tetradic | Two complementary pairs | 0°, 90°, 180°, 270° |
| Square | Four colors spaced evenly around the wheel | 90° apart |
| Compound | A complementary pair plus a split complement | mixed |
| Shades | One hue, only darkened. Moody and dramatic | 0° |
| Earth tones | Soft, low-saturation browns, greens and greys | fixed set |
| Pastel | Light, gentle tints spread around the wheel | 35-65° apart |
| Vibrant | Fully saturated, strong colors | 60° apart |

**Vibrancy** changes how the six colors feel:

- **Soft** — light and calm. Good for backgrounds and calm brands.
- **Balanced** — a normal, all-purpose palette.
- **Bold** — darker and more saturated. Good for buttons and highlights.

---

## How to use it

1. Pick a **color system** from the round buttons.
2. Move the **base hue** slider to choose a starting color, or switch it to **Random**.
3. Pick a **vibrancy**: Soft, Balanced or Bold.
4. Press **Generate palette**.

The six colors always run from the deepest shade to the lightest, so they naturally
form a usable scale.

### The buttons

| Button | What it does |
| --- | --- |
| **Generate palette** | Makes a fresh set of six colors. Also unlocks a locked palette. |
| **Shuffle order** | Keeps the same six colors but shows them in a random order. |
| **Lock: on / off** | Protects the palette. While locked, changing settings will not throw your colors away. Generate always unlocks it. |
| **Save palette** | Stores the palette in your browser. |
| **Copy CSS** | Copies the palette to your clipboard as ready-to-paste CSS. |
| **Reset everything** | Deletes saved palettes and puts all settings back to their defaults. |

You can also click any single color to copy its hex code, or use the small buttons
under each swatch to copy the hex or HSL value.

### Reading the color wheel

The numbered dots are your six colors.

- **Where the dot sits** around the circle is the color's hue.
- **How far the dot is from the middle** is how light the color is. Pale colors sit on
  the outside, dark colors sit near the center.

So if two dots are on opposite sides of the wheel, you have a complementary pair.

### Reading the contrast boxes

Each color has a box showing how it looks on white and on black.

- The number is the **contrast ratio**. Higher is easier to read.
- Anything **4.5 or higher** passes the accessibility standard for normal text.
- The label turns green when it passes and red when it does not.

This is the quickest way to pick a readable color for buttons, links or body text.

---

## Saved palettes

Saved palettes live in your browser using `localStorage`. They stay after you close the
tab or restart the computer, and they only exist in that one browser on that one device.

- Up to **12 palettes** are kept. The newest is at the top. Saving a thirteenth removes the oldest.
- **Load** puts a saved palette back on screen.
- **Delete** removes it.
- Clicking a single color inside a saved palette copies that hex code.
- **Reset everything** clears them all.

Nothing is uploaded anywhere. There is no account and no server.

---

## Files

```
Color guide/
├── index.html      the page structure
├── css/
│   └── styles.css  all the styling
├── js/
│   └── app.js      the color logic, the wheel, and saving
├── README.md       this file
└── JOURNAL.md      the build log, including the mistakes
```

---

## Notes on how it is built

A few choices worth knowing about, in case you want to change something.

**No CSS variables.** The stylesheet uses plain hex values written out directly. Every
color in the interface is spelled out, not stored in a variable.

**The stylesheet is light theme only.** The page background is `#f4f5f7`, panels are white,
and text is dark grey.

**No JavaScript inside the HTML.** All the script lives in `js/app.js`. The HTML has no
`onclick` handlers and no inline script blocks.

**No libraries.** The color wheel is drawn with plain SVG shapes built by hand.

**Copy CSS does use variables.** This is the one exception, and it is on purpose. When you
press **Copy CSS**, the app puts CSS custom properties on your clipboard for you to paste
into your own project:

```css
:root {
  --base-hue-deepest: #1c5287;
  --base-hue-deep: #246bb2;
  /* and so on */
}
```

That text is output for you to use. The app's own stylesheet does not use variables.

**Colors are calculated, not picked from a list.** Every color is worked out from a hue
(0-360), a saturation and a lightness, then converted to a hex code. That is why the wheel,
the contrast numbers and the swatches always agree with each other.

**The six colors can never be identical.** A swatch's hue is decided by its position in the
list and its lightness always increases step by step. So the same hue can appear twice, but
never at the same lightness. Six identical-looking colors are not possible.

---

## Changing things

**To add a color system:** add an entry to `HARMONIES` and to `HUE_LABELS` near the top of
`js/app.js`, then add a matching button in `index.html`. The `HUE_LABELS` list tells the app
what to call each hue, such as "Base" or "Complement".

**To change the colors:** look for `LIGHT_RANGES` and `SHADE_RANGE` in `js/app.js`. These set
how light and dark the six colors are allowed to get.

**To change the look:** edit the hex values in `css/styles.css`.

**To rename the app:** change the text in the top bar in `index.html`.

---

## Browser support

Works in current versions of Chrome, Edge, Firefox and Safari. Tested in Chrome.

Copying to the clipboard needs `navigator.clipboard`. If your browser blocks it, the app
falls back to an older copy method, and if that also fails it tells you to copy by hand.

---

## If something goes wrong

**The colors did not change when I pressed a button.**
Check whether the lock is on. While locked, the app protects your palette on purpose. Press
**Generate palette** to unlock it.

**My saved palettes disappeared.**
Saved palettes only live in one browser on one device, and they are removed if you clear
your browsing data. There is no copy kept anywhere else.

**Copy CSS did nothing.**
Your browser may be blocking clipboard access on files opened from disk. Try serving the
folder with `python -m http.server 8000` and using `http://localhost:8000` instead.

**A saved palette has a strange name.**
Names are generated from the system and hue at the time you saved, for example
"Triadic 210°".
