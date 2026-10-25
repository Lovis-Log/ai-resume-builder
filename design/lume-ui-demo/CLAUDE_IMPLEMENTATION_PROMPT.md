# Lume — Frontend Refinement Brief for Claude Code

You are working in my existing **Lume** resume-builder Next.js web application. I have provided four screenshots of the current production UI and an HTML design demo containing the intended direction (`index.html` and the `assets/` folder). **Update my real app in place; do not replace it with the demo.**

## Primary goal

Unify the visual language across the landing/hero page, signed-in workspace/dashboard, resume builder, and Google sign-in page. Preserve the existing Lume brand, clean blue-indigo/lavender palette, soft cloud-sky atmosphere, white paper previews and liquid-glass navigation. Improve legibility. Add tasteful, real cloud animation to **BOTH the public landing hero and the left half of the sign-in screen**.

Use the attached demo as an **implementation reference**, not an excuse to rewrite auth, database, routing, editor, payments or score calculation.

## 1. Animate the HERO clouds

- Keep the current sky/mountain/cloud aesthetic and existing layout hierarchy: centered hero title, supporting paragraph, CTAs, navigation, and product preview.
- The clouds must actually drift on screen over time. A static background image plus a generic fade-in is **not** sufficient.
- Split the visuals into composited layers: a stationary sky/scenery base, a distant translucent cloud layer, and a nearer cloud layer. Optionally have a third wispy layer.
- Move only the cloud layers (not text, navbar, CTAs, embedded resume mockup, or scenery), using slow, irregular-feeling horizontal drifts and extremely subtle vertical parallax. Suggested production cycles: ~18–35 s depending on layer and viewport; use clearly perceptible drift (often ~50–140 px on desktop), so a comparison 2–4 seconds apart shows visible movement. The demo provides a 3× speed control solely for rapid validation. Use gentle easing and seamless alternating loops so the image never jumps or flashes.
- Use GPU-friendly `transform: translate3d(...)` plus appropriately sized image layers with `overflow:hidden`. Avoid continuous `filter: blur()`, large repainting shadows, heavy canvas rendering, and gratuitous dependencies. A tiny number of transform-animated DOM elements is preferred over a video asset for this iteration.
- Keep the image dark enough behind white headline text. Never blur or animate the text itself.
- Respect `prefers-reduced-motion: reduce` and prevent content layout shift. Mobile cropping must be deliberate; do not stretch clouds into unnatural shapes.
- The existing liquid-glass navbar must remain readable with subtle blur and a defined outline.

## 2. Increase typography legibility in the WORKSPACE / HOME

The current workspace screenshot contains many text labels that are too small, especially cards, descriptions, metadata, the top navigation and the right-side suggestions area. Fix these consistently **without blindly scaling the entire page**:

| UI region | Target desktop font size |
|---|---:|
| Main dashboard heading | ~48–60 px |
| Section headings | ~23–26 px |
| Main body and supporting paragraphs | ~16–18 px |
| Resume titles / primary card content | ~18–22 px |
| Navigation / buttons / search / regular labels | ~14–16 px |
| Secondary metadata / chips / eyebrows | ~13–14 px minimum |
| Form inputs and editing controls | ~15–16 px |

- Maintain a clear typographic scale with font weight, line height, spacing and contrast, not size alone. Set supporting text around `#72809E` or darker on very light surfaces; avoid low-contrast tiny pale gray text.
- Allow cards to grow vertically as necessary. Improve whitespace instead of cramming everything into the previous dimensions.
- Keep responsive behavior across ~375, 768, 1024 and 1440 px widths. No horizontal overflow.
- Also make sidebar text and field labels in the actual resume editor more comfortable to read. Preserve the natural typography and A4 pagination of the **exported resume document**; don't alter actual PDF layout as a side effect of enlarging dashboard UI text.
- Keep the live resume preview synchronized, the score visuals intact, and all existing workflows operational.

## 3. Redesign SIGN-IN: replace the mismatched green panel

The existing saturated teal/green left panel clashes with the rest of Lume. Replace it with the new visual direction shown in the reference demo:

- **Left side:** atmospheric midnight-blue → cornflower-blue sky with soft lavender/pink-lit clouds and distant mountain peaks. High contrast white marketing copy. Reuse the Lume logo, slogan, benefits and footer; avoid baking any text into a background raster. The reference blue sky asset supplied in `assets/lume-sky-base.jpg` may be reused, optimized or replaced by a better clean illustration in the same family.
- **IMPORTANT:** the clouds on this sign-in screen must also be **genuinely animated**, in separate DOM layers, using the same restrained drift system as the landing hero. It is not enough for only the hero page to move. Do not animate the entire background screenshot or move the words.
- **Right side:** soft off-white / near-white background with hints of lavender and a restrained white/frosted card. Strong navy heading and readable supporting text. Google sign-in button should be a blue → indigo gradient with a subtle hover transition, not teal.
- Keep approximately 55% visual story / 45% sign-in at desktop; stack responsively on small screens.
- Keep all actual Google OAuth handlers, loading/error states, legal links, session routing and auth protections unchanged. Do not invent a fake sign-in operation.
- Visually consistent CTA sizing, border radius, glass treatment and shadows across pages. Avoid aggressive neon saturation or glowing gradients.

## 4. Assets and reusable structure

Files in the demo package:

- `index.html` — interactive, zero-dependency design reference. Switch between Landing, Workspace, Resume editor and Sign in at the top. The pause control lets you verify that the clouds are moving.
- `assets/lume-sky-base.jpg` — **no UI text**; sky and cloud backdrop.
- `assets/lume-cloud-near.png` — transparent foreground cloud/photo layer.
- `assets/lume-cloud-far.png` — transparent distant left cloud layer.
- `assets/lume-cloud-wisp.png` — transparent right-side wisps.
- `assets/lume-cloud-mid.png` — independent middle-distance cloud layer.

All cloud sprites must be genuinely transparent with **no text, logos, buttons, or mountain scenery** baked into moving layers. Do not simply animate a full screenshot. The stationary sky may include scenery.
- `assets/lume-cloud-mid.png` — independent middle-distance cloud layer.

All cloud sprites must be genuinely transparent with **no text, logos, buttons, or mountain scenery** baked into moving layers. Do not simply animate a full screenshot. The stationary sky may include scenery.

Integrate the art into the existing asset pipeline (e.g. `public/images/`) if appropriate. You may build reusable components such as `AnimatedSky`, `CloudLayer` and shared typography/style tokens, following the repo conventions. Keep cloud elements `aria-hidden`, noninteractive and absolutely positioned behind the page content. Keep asset quality sensible and loading optimized.

Suggested design tokens (adapt to the actual design system):

```css
--color-ink: #172541;
--color-muted: #7180a0;
--color-primary: #5069ff;
--color-indigo: #5963ef;
--color-lavender: #8378f2;
--color-paper: #ffffff;
--color-canvas: #f7f9ff;
--color-border: #e5eaf7;
```

## 5. Implementation process

1. Inspect existing routes/components/styles and locate the landing hero, workspace, editor, sign-in, and existing assets.
2. Identify global vs per-page text styles; avoid accidental global regressions. Reuse existing CSS/Tailwind conventions. Don't install motion libraries unless the project already uses one and it materially simplifies the work.
3. Implement a reusable animated sky that can be used independently on landing and sign-in. The demo shows one CSS approach; adapt it intelligently for the existing Next.js architecture.
4. Apply typography fixes throughout workspace and relevant editor controls.
5. Replace green sign-in styling while retaining functional auth components and handlers.
6. Run existing lint/typecheck/build/tests and fix regressions. Visually review landing, dashboard, login and editor at desktop/tablet/mobile sizes. Verify both cloud backgrounds animate in a normal-motion environment and stop under reduced-motion settings.
7. Summarize changed files, core decisions, test results and any limitations. No dummy handlers or hidden functionality changes.

## Acceptance checklist (all items mandatory)

- [ ] Landing **hero** clouds visibly drift independently behind stationary copy; no distracting movement or discontinuities.
- [ ] **Sign-in LEFT PANEL clouds also drift independently** in the blue/purple mountain-sky scene; no green remains.
- [ ] The sign-in RIGHT PANEL uses a light Lume-aligned background and blue/indigo Google sign-in styling; real OAuth is preserved.
- [ ] Workspace/dashboard text is substantially easier to read; small UI text meets the scale above.
- [ ] Editor form labels and fields are more legible, while real A4/PDF output stays correct.
- [ ] Responsive layouts remain polished; reduced-motion preference works.
- [ ] All existing auth, routing, editing, previews, saving, billing and export behavior remain intact.
- [ ] Project build and relevant tests pass.

**Do not stop after changing the login background. Complete all three requested areas and verify both animated cloud scenes.**

## Animation verification requirement (added after fixing original demo)

The previous demo technically animated transforms but the motion was not visually apparent and some cropped cloud assets had embedded screenshot text. These defects are corrected in the provided v2 assets and demo. **Do not repeat them.** Open both routes in a normal browser with reduced-motion OFF; take screenshots 3 seconds apart and confirm cloud edges have moved clearly while headlines and buttons remain stationary. A computed animation-style change alone is insufficient. Offer a temporary debug 3× speed control during development if needed.

## Animation verification requirement (added after fixing original demo)

The previous demo technically animated transforms but the motion was not visually apparent and some cropped cloud assets had embedded screenshot text. These defects are corrected in the provided v2 assets and demo. **Do not repeat them.** Open both routes in a normal browser with reduced-motion OFF; take screenshots 3 seconds apart and confirm cloud edges have moved clearly while headlines and buttons remain stationary. A computed animation-style change alone is insufficient. Offer a temporary debug 3× speed control during development if needed.
