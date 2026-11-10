# Design QA — WANO tenant prototype

final result: passed

## Source and scope

- Visual truth: three user-attached screenshots in this chat (tenant list, operations overview, tenant detail), replacing the inaccessible Stitch page as the target.
- Desktop source dimensions: list 1760 × 1425; overview and detail 1750 × 1408.
- Visual comparison against the attached images; not a pixel-difference test. Original files, source DOM, fonts, assets and interaction states were not supplied. No claim is made about unseen original-site behavior.
- Implementation captures: `artifacts/desktop-tenants.png`, `artifacts/desktop-overview.png`, `artifacts/desktop-detail.png`.
- Matching desktop CSS viewports: 1760 × 1425 and 1750 × 1408. DPR 1, viewport screenshots at CSS pixel scale.
- Responsive captures: `artifacts/mobile-tenants.png`, `artifacts/mobile-overview.png`, `artifacts/mobile-detail.png`; 390 × 844 CSS viewport, Chromium iPhone 13 emulation, DPR 3 normalized with screenshot `scale: css`. No mobile source was supplied; these are responsive checks.
- State: initial list with 18 tenants, unfiltered overview, first tenant detail on the basic-information tab. Data is frontend demo data; changes are held in memory.

## Comparison history

1. Initial browser captures showed a single-line progress badge, excess vertical space and an expanding application frame. These were P2 differences.
2. Fixed table height/vertical rhythm, progress-label wrapping, overview metric/filter positions and scrolling inside the rounded frame. Aligned detail grid spacing and English branding on overview/detail.
3. Recaptured all three desktop pages at the source viewports and inspected them against the references. Main positions, table columns, card proportions, status hierarchy and lower-page cropping follow the screenshots. No actionable P0/P1/P2 layout findings remain within the screenshot-based scope.
4. Disabled chart animation to render the complete reference state immediately.

## Required fidelity surfaces

- Typography: Arial with Noto Sans CJK SC fallback, navy headings, muted labels and monospace identifiers. Hierarchy, line-height and wrapping checked. Original font files were unavailable; font metrics are approximate.
- Spacing/layout: gray rounded frame, white navigation, pale background, broad padding, capsule controls, four metrics, two-column overview and 2:1 detail layout. Narrow tables/tabs scroll horizontally within their containers; navigation remains visible.
- Colors: near-black primary buttons, navy text, white surfaces, pale-blue pills, restrained blue highlights and light borders. No added decorative colors.
- Images/icons: local generated portrait replaces the screenshot avatar; Tabler Icons replace unavailable source icons and brand mark. No hotlinked assets or broken placeholders. These are documented approximations, not exact brand reproduction.
- Copy/content: visible source titles, fields, first six tenant names, metrics, units, descriptions and badges retained. No additional instructional page copy. Extra demo records and unpictured modal/tab contents support frontend interaction.

## Focused checks

Inspected the table header/first six rows, filters/actions, metric cards/donut legend, detail grid, quota bars and security card in the rendered captures against the supplied reference regions. Shared components keep control styling consistent. Source dashed focus artifacts, broken logo and squeezed navigation are intentionally corrected.

## Functional evidence

- 8 Playwright tests passed across desktop/mobile: multi-area filtering, empty/reset, pagination, duplicate-ID validation, tenant create/edit, CSV download, quota save/cancel, project creation, members/audit tabs, direct-route refresh and navigation.
- No document-level horizontal overflow or browser application runtime errors found.
- Production build with `BASE_PATH=/yua-design/` passed. A static HTTP server without SPA fallback served all three repository-prefixed routes directly and after refresh: HTTP 200, expected page content, no failed resources/runtime errors.
- Remote GitHub deployment must be verified separately; local QA does not establish publication.

## Follow-up polish

- P3: replace generated avatar, substitute brand icon and font approximation when original assets are available.
- Stitch source and unpictured source interactions remain unverified. Screenshot implementation and local browser QA are complete.
