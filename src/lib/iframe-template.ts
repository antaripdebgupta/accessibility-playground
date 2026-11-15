import { AXE_SCRIPT_PATH } from "./constants";

export interface PreviewSimulations {
  readonly reducedMotion?: boolean;
  readonly forcedColors?: boolean;
}

export function generatePreviewSrcDoc(
  instrumentedHtml: string,
  css = "",
  axeUrl = AXE_SCRIPT_PATH,
  useTailwind = false,
  simulations?: PreviewSimulations
): string {
  const safeCss = (css || "").replace(/<\/style/gi, "<\\/style");
  const tailwindScript = useTailwind
    ? '<script src="https://cdn.tailwindcss.com" onerror="window.__tailwindFailed=true;"></script>'
    : "";

  const reducedMotionCss = simulations?.reducedMotion
    ? `
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
    `
    : "";

  const forcedColorsCss = simulations?.forcedColors
    ? `
    html, body {
      background-color: Canvas !important;
      color: CanvasText !important;
    }
    a {
      color: LinkText !important;
    }
    button, input, select, textarea {
      background-color: ButtonFace !important;
      color: ButtonText !important;
      border: 1px solid ButtonText !important;
    }
    :focus-visible {
      outline: 2px solid Highlight !important;
    }
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview Sandbox</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 1.25rem;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #18181b;
      background-color: #ffffff;
      line-height: 1.5;
    }
    /* Selected element inspection outline */
    .a11y-inspect-selected {
      outline: 2px dashed #1d4ed8 !important;
      outline-offset: 4px !important;
      box-shadow: 0 0 0 6px rgba(29, 78, 216, 0.15) !important;
    }
    /* Subtle hover indicator for clickable inspection */
    [data-a11y-id] {
      cursor: pointer;
    }
    [data-a11y-id]:hover {
      outline: 1px dotted #93c5fd;
      outline-offset: 2px;
    }
    ${reducedMotionCss}
    ${forcedColorsCss}
  </style>
  ${tailwindScript}
  <style id="user-css">${safeCss}</style>
</head>
<body>
  <div id="sandbox-root">${instrumentedHtml}</div>

  <script id="axe-core-script" src="${axeUrl}" onerror="window.__axeScriptError=true;"></script>
  <script>
    (function() {
      function sendParent(msg) {
        try {
          window.parent.postMessage(msg, "*");
        } catch (_) {
          // Parent window may be unreachable or destroyed during iframe teardown; postMessage is best-effort
        }
      }

      var lastReportedErrorTime = 0;
      function reportIframeError(context, err) {
        var now = Date.now();
        if (now - lastReportedErrorTime > 2000) {
          lastReportedErrorTime = now;
          sendParent({
            type: "runtime-error",
            message: context + (err ? ": " + (err.message || String(err)) : ""),
            timestamp: new Date().toISOString()
          });
        }
      }

      // Catch uncaught runtime exceptions and forward to workbench
      window.addEventListener("error", function(event) {
        sendParent({
          type: "runtime-error",
          message: event.message || "Uncaught runtime exception",
          source: event.filename || undefined,
          lineno: event.lineno || undefined,
          colno: event.colno || undefined,
          timestamp: new Date().toISOString()
        });
      });

      window.addEventListener("unhandledrejection", function(event) {
        var reasonMsg = event.reason ? (event.reason.message || String(event.reason)) : "Promise rejected";
        sendParent({
          type: "runtime-error",
          message: "Unhandled Promise Rejection: " + reasonMsg,
          timestamp: new Date().toISOString()
        });
      });

      // 1. Click-to-inspect listener
      document.body.addEventListener("click", function(e) {
        var target = e.target;
        if (!target) return;
        var nodeWithId = target.closest ? target.closest("[data-a11y-id]") : null;
        if (nodeWithId) {
          var id = nodeWithId.getAttribute("data-a11y-id");
          if (id) {
            e.preventDefault();
            sendParent({ type: "element-clicked", id: id });
          }
        }
      }, true);

      // 2. Run axe-core audit
      function runAxeScan(scanId) {
        if (typeof window.axe === "undefined") {
          loadAxeScript(function(success) {
            if (success && typeof window.axe !== "undefined") {
              runAxeScan(scanId);
            } else {
              sendParent({
                type: "scan-error",
                scanId: scanId,
                message: "axe-core could not be loaded from ${axeUrl}. Please verify axe.min.js is present and accessible."
              });
            }
          });
          return;
        }

        var axePromise = window.axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]
          },
          resultTypes: ["violations", "incomplete"],
          rules: {
            region: { enabled: false },
            "landmark-one-main": { enabled: false },
            "page-has-heading-one": { enabled: false },
            "document-title": { enabled: false },
            "html-has-lang": { enabled: false },
            bypass: { enabled: false }
          }
        });

        var timeoutPromise = new Promise(function(_, reject) {
          setTimeout(function() {
            reject(new Error("axe scan timed out after 10 seconds."));
          }, 10000);
        });

        Promise.race([axePromise, timeoutPromise]).then(function(results) {
          function mapFinding(v, type) {
            var wcag = [];
            if (v.tags && Array.isArray(v.tags)) {
              for (var i = 0; i < v.tags.length; i++) {
                var t = v.tags[i];
                var m = t.match(/^wcag(\\d)(\\d)(\\d{1,2})$/);
                if (m) {
                  wcag.push(m[1] + "." + m[2] + "." + m[3]);
                }
              }
            }

            var validImpacts = ["critical", "serious", "moderate", "minor"];
            var impact = (v.impact && validImpacts.indexOf(v.impact) !== -1) ? v.impact : "minor";

            return {
              id: v.id,
              impact: impact,
              description: v.description || "",
              help: v.help || "",
              helpUrl: v.helpUrl || "",
              wcag: wcag.length > 0 ? wcag : undefined,
              source: "axe-core",
              type: type,
              nodes: (v.nodes || []).map(function(n) {
                var targetId = undefined;
                try {
                  if (n.target && n.target.length > 0) {
                    var sel = Array.isArray(n.target)
                      ? n.target.map(function(t) { return Array.isArray(t) ? t.join(" ") : String(t); }).join(", ")
                      : String(n.target);
                    var el = document.querySelector(sel);
                    if (el) {
                      var a11yEl = el.getAttribute("data-a11y-id") ? el : (el.closest ? el.closest("[data-a11y-id]") : null);
                      if (a11yEl) {
                        targetId = a11yEl.getAttribute("data-a11y-id") || undefined;
                      }
                    }
                  }
                } catch (err) {
                  reportIframeError("target-resolution", err);
                }

                var normalizedTarget = (n.target || []).map(function(t) {
                  return Array.isArray(t) ? t.join(" ") : String(t);
                });

                return {
                  html: n.html || "",
                  target: normalizedTarget,
                  targetId: targetId,
                  failureSummary: n.failureSummary || undefined
                };
              })
            };
          }

          sendParent({
            type: "scan-results",
            scanId: scanId,
            violations: (results.violations || []).map(function(v) { return mapFinding(v, "violation"); }),
            incomplete: (results.incomplete || []).map(function(v) { return mapFinding(v, "incomplete"); })
          });
        }).catch(function(err) {
          sendParent({
            type: "scan-error",
            scanId: scanId,
            message: err && err.message ? err.message : "axe-core scan failed."
          });
        });
      }

      // 3. Focus order measurement
      function measureFocusOrder() {
        var focusables = document.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex], [contenteditable="true"], summary'
        );
        var positions = [];
        for (var i = 0; i < focusables.length; i++) {
          var el = focusables[i];
          var a11yEl = el.closest ? el.closest('[data-a11y-id]') : el;
          var id = a11yEl ? a11yEl.getAttribute('data-a11y-id') : null;
          if (id) {
            var rawTab = el.getAttribute('tabindex');
            var tIndex = 0;
            if (rawTab !== null && rawTab !== '') {
              var p = parseInt(rawTab, 10);
              if (!isNaN(p)) tIndex = p;
            }
            var rect = el.getBoundingClientRect();
            positions.push({
              id: id,
              tabIndex: tIndex,
              rect: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              }
            });
          }
        }
        sendParent({ type: "focus-order", elements: positions });
      }

      window.addEventListener("message", function(e) {
        if (!e.data || typeof e.data !== "object") return;

        if (e.data.type === "render-document" && typeof e.data.html === "string") {
          document.open();
          document.write(e.data.html);
          document.close();
          return;
        }

        if (e.data.type === "select-node") {
          var prev = document.querySelectorAll(".a11y-inspect-selected");
          for (var i = 0; i < prev.length; i++) {
            prev[i].classList.remove("a11y-inspect-selected");
          }
          if (e.data.id) {
            var targetEl = document.querySelector('[data-a11y-id="' + e.data.id + '"]');
            if (targetEl) {
              targetEl.classList.add("a11y-inspect-selected");
              try {
                targetEl.scrollIntoView({ block: "nearest", inline: "nearest" });
              } catch (err) {
                reportIframeError("scrollIntoView failed", err);
              }
            }
          }
        } else if (e.data.type === "run-scan") {
          runAxeScan(e.data.scanId);
          measureFocusOrder();
        } else if (e.data.type === "focus-element" && e.data.id) {
          var targetEl = document.querySelector('[data-a11y-id="' + e.data.id + '"]');
          if (targetEl) {
            var focusableChild = targetEl.querySelector('a, button, input, select, textarea, [tabindex]') || targetEl;
            if (focusableChild && typeof focusableChild.focus === "function") {
              try {
                focusableChild.focus();
              } catch (err) {
                reportIframeError("focusElement failed", err);
              }
              try {
                targetEl.scrollIntoView({ block: "nearest", inline: "nearest" });
              } catch (err) {
                reportIframeError("scrollIntoView failed", err);
              }
            }
          }
        }
      });

      // Initial scan with robust initialization and retry polling
      var hasRetriedAxe = false;

      function loadAxeScript(cb) {
        if (typeof window.axe !== "undefined") {
          if (cb) cb(true);
          return;
        }
        var oldScript = document.getElementById("axe-core-script");
        if (oldScript && oldScript.parentNode) {
          oldScript.parentNode.removeChild(oldScript);
        }
        var newScript = document.createElement("script");
        newScript.id = "axe-core-script";
        var separator = "${axeUrl}".indexOf("?") === -1 ? "?" : "&";
        newScript.src = "${axeUrl}" + separator + "_retry=" + Date.now();
        newScript.onload = function() {
          if (typeof window.axe !== "undefined") {
            if (cb) cb(true);
          } else {
            if (cb) cb(false);
          }
        };
        newScript.onerror = function() {
          window.__axeScriptError = true;
          if (cb) cb(false);
        };
        document.body.appendChild(newScript);
      }

      function tryInitAxe() {
        if (typeof window.axe !== "undefined") {
          sendParent({ type: "ready" });
          runAxeScan("initial");
          measureFocusOrder();
          return true;
        }
        return false;
      }

      function injectAxeRetry() {
        if (hasRetriedAxe) return;
        hasRetriedAxe = true;
        window.__axeScriptError = false;
        loadAxeScript(function(ok) {
          if (ok && tryInitAxe()) {
            clearInterval(axeTimer);
          }
        });
      }

      if (!tryInitAxe()) {
        var axeCheckCount = 0;
        var maxAxeChecks = 80; // 80 * 50ms = 4000ms
        var axeTimer = setInterval(function() {
          axeCheckCount++;
          if (tryInitAxe()) {
            clearInterval(axeTimer);
          } else if (window.__axeScriptError) {
            if (!hasRetriedAxe) {
              injectAxeRetry();
            } else {
              clearInterval(axeTimer);
              sendParent({
                type: "scan-error",
                message: "axe-core could not be loaded from ${axeUrl}. Please verify axe.min.js is present and accessible."
              });
              measureFocusOrder();
            }
          } else if (axeCheckCount >= maxAxeChecks) {
            if (!hasRetriedAxe) {
              injectAxeRetry();
              axeCheckCount = 40;
            } else {
              clearInterval(axeTimer);
              sendParent({
                type: "scan-error",
                message: "axe-core failed to initialize in sandbox from ${axeUrl}. Please verify axe.min.js is present."
              });
              measureFocusOrder();
            }
          }
        }, 50);

        var axeScriptEl = document.getElementById("axe-core-script");
        if (axeScriptEl) {
          axeScriptEl.addEventListener("load", function() {
            if (tryInitAxe()) {
              clearInterval(axeTimer);
            }
          });
          axeScriptEl.addEventListener("error", function() {
            window.__axeScriptError = true;
          });
        }
      }
      window.addEventListener("resize", measureFocusOrder);

      ${
        useTailwind
          ? `setTimeout(function() {
        if (window.__tailwindFailed || typeof window.tailwind === "undefined") {
          sendParent({
            type: "scan-error",
            message: "Tailwind CSS failed to load from cdn.tailwindcss.com. Check network/CSP connection."
          });
        }
      }, 1500);`
          : ""
      }
    })();
  </script>
</body>
</html>`;
}
