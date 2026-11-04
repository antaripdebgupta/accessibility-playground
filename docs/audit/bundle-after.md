# Bundle Measurement — After FIX-2

Measured via `@next/bundle-analyzer` (`ANALYZE=true npx next build --webpack`) on branch `fix/FIX-2`.

## Results Summary

### 1. `rule-knowledge.ts` (Split into lazy chunk via `RuleLesson.tsx`)

- **Before:** Statically imported into playground main client bundle (`static/chunks/22.08a3fd1d1ce92ae2.js`), accounting for **55,423 bytes** stat / **27,656 bytes** parsed.
- **After:** Isolated into dynamic chunk `static/chunks/2562.7fe5598fece57537.js` (69,505 bytes stat total with `RuleLesson.tsx` + `rule-knowledge.ts`).
- **Initial Playground Chunk:** Completely removed from the initial synchronous playground chunk. `RuleLesson` only loads when a finding detail is opened and rendered.

### 2. `challenges.ts` (Split into metadata + per-challenge dynamic imports)

- **Before:** Single monolithic module in `449-5621e89659cacda7.js` containing all 10 challenge starters, solutions, verify functions, and hints (**45,492 bytes** stat / **37,106 bytes** parsed).
- **After:**
  - Lightweight challenge metadata module in `static/chunks/346.9a7a0c9dfd10e014.js`: **7,646 bytes** stat / **5,387 bytes** parsed (**~83% reduction** in upfront challenge data).
  - Per-challenge content modules split into individual lazy chunks:
    - `accessible-form`: 5,427 bytes stat (`4353.3de55ad312018e74.js`)
    - `skip-link`: 4,869 bytes stat (`2077.02e032d58a2e568d.js`)
    - `custom-checkbox`: 4,086 bytes stat (`8261.2c7ca8f608b612e4.js`)
    - `card-link`: 4,049 bytes stat (`5885.bef6f342bb0bbbe6.js`)
    - `live-region`: 3,749 bytes stat (`1521.e1644797ebd408a7.js`)
    - `dialog-modal`: 3,709 bytes stat (`7876.3139f498f200b2ec.js`)
    - `table-headers`: 3,655 bytes stat (`3873.c736c2c47f314872.js`)
    - `status-message`: 3,173 bytes stat (`4329.01b6e69616f2f2b1.js`)
    - `img-alt`: 2,662 bytes stat (`4700.2225f6a3a2412211.js`)
    - `button-name`: 2,571 bytes stat (`5288.922cc493e68dd87a.js`)

## Conclusion

The initial playground bundle no longer ships challenge solutions or rule lessons. Both are loaded strictly on demand.
