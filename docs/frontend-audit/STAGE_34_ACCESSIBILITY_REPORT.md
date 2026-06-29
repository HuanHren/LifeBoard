# Stage 34 Accessibility Report

## Checks

- Page has a single `h1`.
- Main workspace and side workspace have accessible labels.
- Sections use visible headings.
- Today task completion uses native checkbox controls.
- Bookmark links use anchor semantics and open in a new tab with `rel="noopener noreferrer"`.
- Tool shortcuts use router links with text labels.
- Loading states use existing `BaseSkeleton`.
- Error states use existing `BaseError`.
- Date values use `time` elements where applicable.
- Decorative icons use `BaseIcon`, which is hidden from assistive technology.

## Theme and Locale

- Chinese and English were checked.
- Light and dark themes were checked.
- Runtime theme and language changes do not require Home-specific state resets.

## Evidence

Machine-readable results:

```text
docs/frontend-audit-local/stage-34/home-accessibility-results.json
docs/frontend-audit-local/stage-34/home-locale-results.json
```
