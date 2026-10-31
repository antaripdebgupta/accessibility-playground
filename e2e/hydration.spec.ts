import { test, expect } from "@playwright/test";

test("playground hydrates cleanly with a restored session", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && /hydrat/i.test(m.text())) errors.push(m.text());
  });
  page.on(
    "pageerror",
    (e) => /hydrat/i.test(e.message) && errors.push(e.message)
  );

  // A saved session that differs from the default template is what triggered it.
  await page.addInitScript(() => {
    localStorage.setItem("a11y-playground:last-html", "<p>x</p>\n".repeat(52));
    localStorage.setItem("a11y-playground:use-tailwind", "true");
  });

  await page.goto("/playground");
  await expect(page.getByText("52 lines")).toBeVisible();
  expect(errors).toEqual([]);
});
