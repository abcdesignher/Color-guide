# Color Guide

A small color palette generator. Choose a color system based on the color wheel, and the
app gives you six colors that are built to work together.

Plain HTML, CSS and JavaScript. No frameworks, no build step, no internet connection needed.

---

## How to open it

Double-click `index.html`. That is all you need to do.

If your browser blocks saving when you open it that way, run a small local server instead:

```
python -m http.server 8000
```

Then visit `http://localhost:8000`.

---

## What's in the folder

Five files, all sitting next to each other. There are no sub-folders.

| File | What it is |
| --- | --- |
| `index.html` | The page itself. Holds the text, the buttons and the layout of the page, and nothing else. No styling, no script. |
| `styles.css` | Every color, font size, spacing and border in the app. This is the light theme. |
| `app.js` | All the JavaScript. Works out the six colors, draws the color wheel, checks contrast, and saves your palettes. |
| `README.md` | This file. How to use the app and how it is put together. |
| `JOURNAL.md` | Notes written while building the app, including the mistakes that were made and fixed. |

`index.html` is the only file you need to open. It loads the other two.

### The main parts of `app.js`

Read from the top down, the file is in this order:

| Part of `app.js` | What it holds |
| --- | --- |
| `HARMONIES` | The twelve color systems: their display names and the sentence shown under the buttons. |
| `VIBES` | The three vibrancy settings: Soft, Balanced and Bold. |
| `HUE_LABELS` | What each hue in a system is called, such as "Base" or "Complement". |
| `LIGHT_RANGES` | How light and dark the six colors are allowed to get, per vibrancy. |
| Color helpers | Convert a hue, saturation and lightness into a hex code, and work out contrast. |
| Web storage | Reading and writing `localStorage`, and checking saved data is the right shape. |
| `hueSetFor()` | Picks the hues for each color system. This is where the color theory lives. |
| `generatePalette()` | Builds the six colors. |
| Rendering functions | Draw the swatches, the wheel, the contrast boxes and the saved list. |
| Event handlers | What happens when you click or drag something. |

---

## How to use it

1. Click a **color system** to choose the rule, for example Triadic.
2. Set the **base hue** with the slider, or switch it to **Random**.
3. Pick a **vibrancy**: Soft, Balanced or Bold.
4. Click **Generate palette**.

The six colors always run from the deepest shade to the lightest, so they form a usable
scale straight away.

**Random versus Locked**, next to the slider:

- **Locked** uses whatever hue the slider is showing.
- **Random** ignores the slider and picks a new starting hue every time you generate. The
  slider is greyed out while it is on.

### The buttons

| Button | What it does |
| --- | --- |
| **Generate palette** | Makes a fresh set of six colors. Also unlocks a locked palette. |
| **Shuffle order** | Keeps the same six colors, but shows them in a random order. |
| **Lock: on / off** | Protects the palette. While locked, changing the system, vibrancy or hue will not throw your colors away. Generate always unlocks it. |
| **Save palette** | Stores the palette in your browser. |
| **Copy CSS** | Copies the palette to your clipboard as ready-to-paste CSS. |
| **Reset everything** | Deletes all saved palettes and puts every setting back to its default. |

Under each color there are two small buttons: **Copy hex** and **Copy HSL**. Use those to
copy a single color. The large block of color above them is not clickable.

---

## The twelve color systems

Each system places its hues at fixed spots on the color wheel. The angles below are how far
the hues sit from each other.

| System | What it does | Angles used |
| --- | --- | --- |
| Monochromatic | One single hue, made lighter and darker | one hue only |
| Analogous | Colors that sit next to each other on the wheel | about 45° apart |
| Complementary | A color and its opposite | 180° |
| Split complementary | A color plus the two neighbors of its opposite | 150° and 210° |
| Triadic | Three colors spaced evenly around the wheel | 120° apart |
| Tetradic | Two complementary pairs | 0°, 90°, 180°, 270° |
| Square | Four colors spaced evenly around the wheel | 0°, 90°, 180°, 270° |
| Compound | A complementary pair plus a split complement | 0°, 150°, 180°, 210° |
| Shades | One hue, only darkened. Moody and dramatic | one hue only |
| Earth tones | Soft, low-saturation browns, greens and greys | six fixed hues |
| Pastel | Light, gentle tints spread around the wheel | 35-65° apart |
| Vibrant | Strong, fully saturated colors | 60° apart |

**Worth knowing:** Square and Tetradic pick the same four hues in this app. They differ
only in the names given to each color, so try both and use whichever wording suits you.

### Vibrancy

Vibrancy changes how strongly the colors feel. It affects the saturation and how dark the
darkest color is.

- **Soft** — light and gentle. Good for backgrounds and calm designs.
- **Balanced** — an all-purpose palette.
- **Bold** — darker and more saturated. Good for buttons and highlights.

---

## Reading the color wheel

The numbered dots are your six colors.

- **Where a dot sits** around the circle is that color's hue.
- **How far the dot is from the middle** is how light the color is. Pale colors sit on the
  outside, dark colors near the center.

So if two dots are on opposite sides of the wheel, you have a complementary pair. If they
are a third of the way apart, you have a triadic palette.

## Reading the contrast boxes

Each color has a box showing how it looks on white and on black.

- The number is the **contrast ratio**. Higher means easier to read.
- **4.5 or higher** passes the accessibility standard for normal text.
- The number turns green when it passes and red when it does not.

This is the quickest way to pick a color for text, links or buttons that people can
actually read.

---

## Saved palettes

Saved palettes are stored in your browser using `localStorage`. They survive closing the tab
and restarting the computer, and they exist only in that one browser on that one device.

- Up to **12 palettes** are kept, newest at the top. Saving a thirteenth removes the oldest.
- **Load** puts a saved palette back on screen.
- **Delete** removes it.
- Clicking a single color inside a saved palette copies that hex code.
- **Reset everything** clears them all.

Nothing is uploaded anywhere. There is no account and no server.

---

## How it is built

A few choices worth knowing about, in case you want to change something.

**No CSS variables.** Every color in the interface is written out as a plain hex value.
There is no `var()` anywhere in `styles.css`.

**Light theme only.** The page background is `#f4f5f7`, the panels are white, and the text
is dark grey.

**No JavaScript in the HTML.** All the script lives in `app.js`. The HTML has no `onclick`
handlers and no inline script blocks.

**No libraries.** The color wheel is drawn with plain SVG shapes, built by hand in
`app.js`.

**Copy CSS does use variables, on purpose.** When you press **Copy CSS**, the app puts CSS
custom properties on your clipboard for you to paste into your own project:

```css
:root {
  --base-hue-deepest: #1c5287;
  --base-hue-deep: #246bb2;
  /* and so on */
}
```

The names depend on which system and hue you used. This text is output for you to use; the
app's own stylesheet does not use variables.

**Colors are calculated, not picked from a list.** Every color is worked out from a hue
(0-360), a saturation and a lightness, then converted to a hex code. That is why the wheel,
the contrast numbers and the swatches always agree with each other.

**The six colors can never be identical.** A color's hue is decided by its position in the
list, and its lightness always steps up as you move down the list. So the same hue can
appear twice, but never twice at the same lightness. Six identical-looking colors are not
possible.

---

## Changing things

**To add a color system.** In `app.js`, add a name and description to `HARMONIES`, add the
hues you want to `hueSetFor()`, and add a label for each hue to `HUE_LABELS`. Then add a
matching button in `index.html`. `HUE_LABELS` is what gives each hue its name, such as
"Base" or "Complement".

**To change how light or dark the colors get.** Look for `LIGHT_RANGES` and `SHADE_RANGE`
in `app.js`. Each entry is a lowest and highest lightness value.

**To change the look.** Edit the hex values in `styles.css`.

**To rename the app.** Change the text in the top bar in `index.html`.

---

## Browser support

Works in current versions of Chrome, Edge, Firefox and Safari. Tested in Chrome.

Copying to the clipboard needs `navigator.clipboard`. If a browser blocks that, the app
falls back to an older copy method, and if that also fails it tells you to copy by hand.

Some browsers restrict saving when a page is opened straight from disk. If palettes will
not save, use the local server method at the top of this file.

---

## If something goes wrong

**The colors did not change when I clicked something.**
Check whether the lock is on. While locked, the app is protecting your palette on purpose.
Click **Generate palette** to unlock it.

**My saved palettes disappeared.**
Saved palettes live in one browser on one device, and they are deleted if you clear your
browsing data. There is no other copy.

**Copy CSS did nothing.**
The browser may be blocking clipboard access on pages opened from disk. Try the local
server method at the top of this file.

**A saved palette has a name I did not choose.**
Names are generated from the system and hue at the moment you saved, for example
"Triadic 210°".
