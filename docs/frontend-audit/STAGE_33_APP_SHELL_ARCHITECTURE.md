# Stage 33 App Shell Architecture

## Shell Structure

The application keeps the existing hierarchy:

```text
App.vue -> AppShell.vue -> Topbar.vue + SidebarNav.vue + MobileNav.vue + RouterView
```

Stage 33 upgrades spacing, responsive behavior, and navigation affordances while leaving route registration and page ownership unchanged.

## Responsive Model

- Mobile and tablet portrait use the bottom navigation.
- Tablet landscape and desktop use the sidebar.
- Desktop at extra-wide widths expands the sidebar from compact icon rail to full label/description navigation.
- Page content is constrained by shared page containers instead of page-local max-width choices.

## Header Model

The top header now carries global shell context only: product name and date. Page titles remain owned by route content, avoiding duplicate route headings.

## Page Container Model

`PageLayout.vue` centralizes default, wide, and narrow page containers. Weather routes use the wide variant; standard productivity pages use the default variant; not-found uses the narrow variant.

## Weather Boundary

The shell wraps weather routes without changing weather providers, WMO mapping, Pixi renderer internals, vendor manifest, or authorized vendor assets.
