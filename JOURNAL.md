# Journal

A plain-English log of building Color Guide. Written as I go, so it also records the
mistakes I made and how I found them.

---

## 26 September 2026 - Flattening the folders

I had originally put the two asset files inside their own folders, so the layout was
`index.html`, `css/styles.css` and `js/app.js`. That is a habit from bigger projects, where
grouping assets stops the root folder turning into a pile of files.

For a project this size it was the wrong call. Three files do not need sorting into
categories, and the folders only added nesting to read through and extra places for a path
to break.

**What I did:** moved both files up next to `index.html`, so it is now just
`index.html`, `styles.css` and `app.js`, then deleted the two empty folders. Updated the
two references in `index.html` and the file listings in this journal and the README, then
ran the tests again to confirm nothing broke.

Worth remembering: the folders were my preference, not a requirement of the brief. If a
project is small enough, flat is usually the better default.

---

## 26 September 2026 - First version

### The brief

Build a small app that suggests six colors that work well together, using color theory
rules like triadic and monochromatic. Light theme. Plain HTML, CSS and JavaScript only.
Remember user data using web storage.

### A note on the brief

One line was hard to read: "no js, no css variables". A color generator needs JavaScript
to work at all, so I took it to mean no JavaScript inside the HTML file, and no CSS
variables. That is what I built: the script lives in its own file, the HTML has no
`onclick` handlers, and the stylesheet has no `var()` in it anywhere.

There is one deliberate exception, and I documented it in the README. The **Copy CSS**
button puts CSS variables on your clipboard, because that is the most useful thing to
paste into a real project. Those variables are output for the user. The app's own styling
does not use them.

### What I built

Three files, no libraries:

- `index.html` - the page
- `styles.css` - the look
- `app.js` - the color logic, the color wheel, and saving

The app has twelve color systems, three vibrancy settings, a slider for the starting
color, a drawn color wheel, contrast checks, and saved palettes.

### How I started

I wrote the three files first, then stopped and tested the color logic before doing
anything else. This turned out to be the right order, because the color logic was the
part most likely to be quietly wrong.

---

## The first real problem: colors that did not match their labels

My first version shuffled the six lightness values randomly, so the palette could look
like this:

```
Base · deepest = #2a73bb     <- actually a light blue
Base light     = #1f2f0e     <- actually a very dark green
```

The names were describing an order that the colors did not actually follow. A user
selecting a color called "base light" would get a color that was nearly black.

**What I did:** stopped shuffling. The lightness values now always climb in an even
line from the darkest swatch to the lightest one. The names describe what is really
there. The names became `Base hue · deepest`, `Base hue · base`, `Base hue · lightest`,
and so on, so they cannot drift away from the truth again.

## The second problem: six almost identical colors

A test that generated 2,160 random palettes found that 507 of them contained two colors
that were effectively the same. The worst case was a soft monochromatic palette:

```
#f5f2f8   #f5f3f7   #f5f2f8
```

Three pale colors a couple of values apart. Technically different. Practically useless.

The cause was that lightness was random, so two swatches could land on almost the same
lightness, and saturation was also random, so they could land on almost the same
saturation too.

**What I did:** made lightness an even, always-increasing ramp, with no randomness at
all. For rules that use a single hue, I also fixed the saturation to one value for all
six colors, so a monochromatic palette reads as six clean steps of one color instead of
six vaguely similar colors.

There is a useful side effect. A swatch's hue comes from its position in the list, and
its lightness comes from its position too. Since lightness always moves, two swatches
can share a hue but can never share a hue *and* a lightness. Getting six identical-looking
colors is now impossible by construction, not just unlikely.

## The third problem: a number outside the allowed range

The same test caught 553 invalid colors. In Bold mode the saturation could reach 128%,
but a saturation above 100% is not a real color.

**What I did:** clamped every saturation to a sane range, and tested for it.

## The fourth problem: Earth tones had the wrong names

The Earth tones rule listed six hues, but the names were attached in the wrong order, so
"Terracotta" was pointing at a yellow-green.

**What I did:** reordered the hues so each name sits next to the color it describes.

---

## Testing

I did not trust the code by looking at it, so I wrote three test scripts and ran them.

**1. Color math.** Checked the hex conversion against known values, such as red at hue 0
and the exact gray at 50% lightness. Then generated 2,160 palettes across every
combination of system and vibrancy and checked each color for a valid hex code, a
saturation between 0 and 100, a sensible lightness, and no duplicates. All clean.

**2. Fake browser (jsdom).** Loaded the real page and clicked the real buttons. This
covered switching systems, moving the slider, random mode, the lock, shuffling, saving,
loading, deleting, resetting, and reloading the page to confirm the data came back. Also
fed the app five kinds of broken saved data to make sure it would not crash.

**3. Real browser (headless Chrome).** Checked the layout at three screen widths,
confirmed the panels do not overlap, nothing spills off the side, the six swatches are
visibly different colors, the wheel is drawn, and the numbered dots on the wheel actually
line up with the hue of the matching swatch.

### The bug the fake browser found

One test stored a value that was the wrong shape, for example saved palettes saved as
plain text instead of a list. The app crashed trying to read it.

This one matters more than it looks. Anything can end up in browser storage: a user
editing it by hand, an old version of the app, a half-written value. Bad data should
mean the app falls back to sensible defaults, not a blank page.

**What I did:** every value read from storage is now checked for the right type and
shape before it is used. Anything unexpected is quietly replaced with a default.

### The bug I found by reading my own code

Saved palette names and color names are inserted into the page as HTML. The app writes
those names itself, so this looked harmless. But storage is not fully under the app's
control, and a hand-edited value containing HTML would be rendered as markup.

**What I did:** all text coming from storage is now escaped before it goes on the page,
and stored ids are stripped down to plain letters and numbers. Tested with deliberately
hostile stored data to confirm nothing is injected.

---

## Smaller things I tidied

- A stray character got into one of the color values in the stylesheet. It was invisible
  on screen because the line right after it set the same property correctly, but it was
  wrong, so I removed it.
- The reset button said "Reset saved data" but it also reset your settings. Confusing, so
  I renamed it to "Reset everything" and added a tooltip saying exactly what it clears.
- Removed code I had written and then no longer used, including a helper for spreading
  numbers that the new lightness ramp replaced.
- Gave the clipboard copy a fallback for older browsers, and a clear message if even that
  fails.

---

## Things I could not check the way I wanted

I cannot look at images, so I could not simply view the finished page and judge how it
looks. Instead I measured it inside a real browser: the position and size of every panel,
whether any of them overlap, whether the page scrolls sideways, the exact rendered color
of each swatch, and whether the wheel dots sit at the right angle for their hue.

That catches layout faults and wrong colors. It does not catch a design that is simply
unattractive. Someone should open it and look at it with their own eyes before deciding
it is finished.

---

## What I would do next

In rough order of value:

1. **Open it and look at it.** The one gap in my checking.
2. **Add keyboard shortcuts.** Generating with the spacebar would make it much faster to
   use, and it needs very little code.
3. **Let people paste in their own color.** Pick a starting color from a photo or another
   tool and generate a palette around it.
4. **Name palettes yourself.** Right now the name is generated, like "Triadic 210°". A
   text box would be a small change.
5. **Let people export other formats,** such as a list of hex codes for design tools, or
   a PNG image of the palette.
6. **Check it on a real phone,** not just a narrow window.
