import { describe, it, expect } from "vitest";
import { computeAccessibleName } from "@/lib/accessible-name";

describe("Accessible Name Computation (W3C AccName 1.2)", () => {
  it("computes name from text content for buttons", () => {
    document.body.innerHTML = `<button id="btn">Submit Form</button>`;
    const btn = document.getElementById("btn")!;
    const res = computeAccessibleName(btn, document);
    expect(res.name).toBe("Submit Form");
    expect(res.hasAccessibleName).toBe(true);
    expect(res.source).toBe("subtree text");
  });

  it("prioritizes aria-labelledby over aria-label and text content", () => {
    document.body.innerHTML = `
      <span id="label-ref">Reference Label</span>
      <button id="btn" aria-labelledby="label-ref" aria-label="Aria Label">Inner Text</button>
    `;
    const btn = document.getElementById("btn")!;
    const res = computeAccessibleName(btn, document);
    expect(res.name).toBe("Reference Label");
    expect(res.source).toBe("aria-labelledby");
  });

  it("prioritizes aria-label over native text content", () => {
    document.body.innerHTML = `<button id="btn" aria-label="Close dialog">×</button>`;
    const btn = document.getElementById("btn")!;
    const res = computeAccessibleName(btn, document);
    expect(res.name).toBe("Close dialog");
    expect(res.source).toBe("aria-label");
  });

  it("computes name from associated <label for='...'>", () => {
    document.body.innerHTML = `
      <label for="email-input">Email Address</label>
      <input id="email-input" type="email" />
    `;
    const input = document.getElementById("email-input")!;
    const res = computeAccessibleName(input, document);
    expect(res.name).toBe("Email Address");
    expect(res.source).toBe("<label for>");
  });

  it("computes name from wrapping <label>", () => {
    document.body.innerHTML = `
      <label id="wrap-lbl">
        <span>Username</span>
        <input id="user-input" type="text" />
      </label>
    `;
    const input = document.getElementById("user-input")!;
    const res = computeAccessibleName(input, document);
    expect(res.name).toBe("Username");
    expect(res.source).toBe("enclosing <label>");
  });

  it("computes name from alt attribute for images", () => {
    document.body.innerHTML = `<img id="img" src="/cat.jpg" alt="A sleeping cat" />`;
    const img = document.getElementById("img")!;
    const res = computeAccessibleName(img, document);
    expect(res.name).toBe("A sleeping cat");
    expect(res.source).toBe("alt attribute");
  });

  it("returns empty string and hidden source for aria-hidden='true'", () => {
    document.body.innerHTML = `<button id="btn" aria-hidden="true">Hidden Button</button>`;
    const btn = document.getElementById("btn")!;
    const res = computeAccessibleName(btn, document);
    expect(res.name).toBe("");
    expect(res.hasAccessibleName).toBe(false);
    expect(res.source).toBe("hidden");
  });
});
