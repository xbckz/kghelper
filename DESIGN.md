---
name: Knight Game Helper
description: WGHelp page structure with original Knight Game visual materials.
colors:
  action-blue: "#2376bc"
  action-hover: "#348bd2"
  action-active: "#5bb3fe"
  ink: "#fff"
  income-gold: "#e6a64c"
  panel-edge: "#5b493c"
  focus-blue: "#73b9ed"
  field-paper: "#fff"
  field-ink: "#000"
  field-border: "#ccc"
typography:
  body:
    fontFamily: "'Times New Roman', Times, serif"
    fontSize: "16px"
  headline:
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: ".5px"
  portrait-title:
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    letterSpacing: ".5px"
  action:
    fontFamily: "'Times', serif"
    fontSize: "13px"
    fontWeight: 700
rounded:
  action: "4px"
  field: "6px"
  summary: "8px"
components:
  calculate-button:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "10px 12px"
  calculate-button-hover:
    backgroundColor: "{colors.action-hover}"
  calculator-input:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.field}"
    width: "150px"
    height: "32px"
    padding: "1px 2px"
---

# Design System: Knight Game Helper

## Overview

**Visual authority: WGHelp structure, Knight Game materials.** Preserve the reference site's page geometry and interaction patterns, using the game's locally stored textures, panel parts, portraits, sprites, and terminology. This is a record of the finished income-calculator conventions, not a new design direction or a complete audit of every page.

Source of truth: `assets/css/kg-assets.css`, `assets/css/income-calculators.css`, `assets/css/game-list.css`, the shared `site.css` / `site-fixes.css` cascade, and the two calculator pages. Page-specific composition and verification limits live in `.impeccable/surfaces/income-calculators.md`.

## Colors

Primary action colors are Knight Game blue, with lighter hover and active states. Unlock-level values are white throughout the site. Calculator income has no enclosing border or background box. Income figures use gold; keyboard focus uses a separate blue outline. White text sits on dark game textures. Inputs retain white backgrounds, black text, and pale borders. The frontmatter records the values; the raster artwork supplies much of the remaining palette.

## Typography

The shared body uses Times New Roman. Page titles and portrait title strips use Trebuchet MS with Segoe UI and sans-serif fallbacks. Calculate buttons use bold Times. Keep the incumbent mixed typography: it comes from the WGHelp shell and Knight Game presentation layer. Calculator instructions and summaries are compact (13px); result text is larger (16px). Shared mobile rules raise input text to (16px) at the (600px) breakpoint.

## Layout

The user's WGHelp screenshot is the calculator card composition authority. Each card retains the full-width Vassals outer panel frame, blue title bar, top/spacer/bottom caps and leather details. Inside that frame, use the framed Knight portrait on the left, income strip to its right, and Owned/Unlocked side by side below that income strip. The screenshot defines internal arrangement; it does not replace the outer framing. Use only these calculator fields; combat stats and unlock-level rows belong on the Vassals reference page. Preserve the Knight artwork, blue buttons, portrait border and leather surfaces. Portrait artwork is 125×150 inside its original 146×171 frame; the income strip is positioned 150px from the row's left and 22px below the portrait top. Owned/Unlocked labels start at 90px. The input uses the WGHelp 60px width and 22px height with a two-pixel border. Results copy WGHelp exactly: three 120px portrait tiles per row, 118px images, quantity strips, and a 176px adjacent popup opened by clicking a tile. Use Knight portraits and leather colors. The input-card framing and inner Owned/Unlocked arrangement are independent of this result grid.

The page order remains explanation and sheet toggle → vassal sheet → budget and calculation → results. Sequential unlock selection enables the preceding prefix and disables the following suffix. Mobile visual rendering remains unverified.

## Elevation & Depth

Original leather/panel textures, light top edges, dark bottom edges, and subtle text shadows provide depth. Calculate buttons share the exact Scroll to specials styling: the original Knight Game splatter texture, layered blue gradient, inset highlights and shadow. The shared rule lives in `assets/css/kg-assets.css` and targets both `.button` and `.equipment-specials-button`; `equipment.css` only adds that equipment button's placement margin. Result panels use translucent fills; the purchase-detail panel sits above cards at stacking level (5). Exact shadow and focus declarations are recorded in `.impeccable/design.json`.

## Shapes

Keep rectangular portrait cards and the game's textured title strips. Inputs and detail panels have gently rounded corners; summary boxes are slightly rounder. Do not normalize the existing components into a new universal card shape.

## Components

- **Calculate button:** textured blue gradient game button with white bold serif text, inset highlights, a visible keyboard-focus outline, and a brighter textured active state.
- **Number fields:** centered text fields with WGHelp's copied live comma formatter and cursor preservation, pale two-pixel borders, and a visible offset keyboard-focus outline. Preserve the separate budget, target, bonus, and owned field proportions.
- **Vassal sheet:** original enhancement portraits (`10001`–`10014`), full-width blue title bar, panel caps, leather details and original portrait frame, with income and Owned/Unlocked arranged as in the supplied screenshot. Sheet visibility uses the same success/fail artwork and exposes expanded state.
- **Purchase cards:** WGHelp's original portrait-plus-quantity tiles and three-column grid, with the same adjacent details popup and outside-click dismissal. Do not render full vassal panels as calculation results.
- **Money icon:** use `assets/images/game/source/mobilemiddleages/img/icons/icon_currency_2x.png`, including the smaller income-row and summary versions.
- **Navigation:** retain WGHelp's shared shell and compact tabs. The homepage Tools accordion contains the two calculator links.

## Do's and Don'ts

- **Do** preserve the copied WGHelp page arrangement and behavior while using the existing Knight Game artwork and data.
- **Do** keep keyboard focus, live result announcements, expanded-state attributes, and accessible field names.
- **Don't** replace the portrait sheet with a table or redesign the calculator controls; the user explicitly pinned this boundary.
- **Don't** treat these calculator-specific dimensions as a new layout requirement for unrelated surfaces.
