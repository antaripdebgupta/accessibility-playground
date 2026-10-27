import fs from "fs";
import path from "path";

const targetFile = path.resolve(
  "node_modules/@accessly-ui/utils/dist/use-reduced-motion.js"
);

if (fs.existsSync(targetFile)) {
  const content = fs.readFileSync(targetFile, "utf8");
  if (!content.includes('typeof window !== "undefined"')) {
    const patched = `import { useState, useEffect } from "react";
export function useReducedMotion() {
    const [reduced, setReduced] = useState(() => typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const listener = (e) => setReduced(e.matches);
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, []);
    return reduced;
}
`;
    fs.writeFileSync(targetFile, patched, "utf8");
    console.log("Applied SSR compatibility patch to @accessly-ui/utils");
  }
}

// Copy axe-core to public/axe.min.js
const axeSource = path.resolve("node_modules/axe-core/axe.min.js");
const axeDest = path.resolve("public/axe.min.js");
if (fs.existsSync(axeSource)) {
  fs.copyFileSync(axeSource, axeDest);
  console.log("Copied axe-core to public/axe.min.js");
}
