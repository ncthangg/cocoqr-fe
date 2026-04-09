---
name: region-note
description: Clean comments and organize file with regions.
---

# Region Note Skill

## Purpose
- Remove unnecessary comments
- Standardize file structure
- Improve readability

## Steps
- Remove `//` comments, but don't remove in `#region` and `#endregion` render
- Remove unused comments
- Add region structure

## Regions
- state
- handler
- fetch
- render

## Structure

```tsx
//#region state

//#endregion

//#region handler

//#endregion

//#region fetch

//#endregion

//#region render
return (
);
//#endregion