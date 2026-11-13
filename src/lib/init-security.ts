if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as {
    __zod_globalConfig?: { jitless?: boolean };
  };
  g.__zod_globalConfig = g.__zod_globalConfig || {};
  g.__zod_globalConfig.jitless = true;
}
