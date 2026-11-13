export const dynamic = "force-static";

export function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview Sandbox</title>
</head>
<body>
  <script>
    window.addEventListener("message", function(e) {
      if (e.data && e.data.type === "render-document" && typeof e.data.html === "string") {
        document.open();
        document.write(e.data.html);
        document.close();
      }
    });
    try {
      window.parent.postMessage({ type: "preview-frame-ready" }, "*");
    } catch (_) {}
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
