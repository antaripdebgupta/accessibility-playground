# Bundle Measurement — Before FIX-2

Measured via `@next/bundle-analyzer` (`ANALYZE=true next build --webpack`) on branch `fix/FIX-2`.

## Target Chunks Containing Static Data

### 1. `rule-knowledge.ts`

- **Location:** Static import in `src/features/playground/FindingDetail.tsx`
- **Chunk:** `static/chunks/22.08a3fd1d1ce92ae2.js` (Playground main client chunk)
- **Total Chunk Size:** 626,907 bytes stat / 314,195 bytes parsed / 82,016 bytes gzip
- **`rule-knowledge.ts` Module Size:**
  - `statSize`: 55,423 bytes
  - `parsedSize`: 27,656 bytes

### 2. `challenges.ts`

- **Location:** Static import in `src/features/playground/hooks/useActiveChallenge.ts`
- **Chunk:** `static/chunks/449-5621e89659cacda7.js` (Challenges module chunk)
- **Total Chunk Size:** 53,189 bytes stat / 40,001 bytes parsed / 9,396 bytes gzip
- **`challenges.ts` Module Size:**
  - `statSize`: 45,492 bytes
  - `parsedSize`: 37,106 bytes

## Summary

Both large datasets (1,005 lines of challenges and 1,176 lines of rule lessons) are currently statically bundled into the initial client graph of the playground even when the user is not taking a challenge or reading an in-depth lesson.
