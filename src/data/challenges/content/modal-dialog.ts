import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<button type="button" id="open-dialog">Delete Account</button>\n\n<div class="modal-overlay" id="modal-overlay">\n  <div class="modal" id="modal" role="dialog">\n    <h2>Confirm Deletion</h2>\n    <p>This action is permanent. All your data will be removed.</p>\n    <div class="modal-actions">\n      <button type="button" class="btn-cancel" onclick="document.getElementById(\'modal-overlay\').style.display=\'none\'">Cancel</button>\n      <button type="button" class="btn-danger">Delete</button>\n    </div>\n  </div>\n</div>\n\n<script>\ndocument.getElementById(\'open-dialog\').addEventListener(\'click\', function() {\n  document.getElementById(\'modal-overlay\').style.display = \'flex\';\n});\n</script>',
  startCss:
    ".modal-overlay {\n  display: flex; position: fixed; inset: 0; z-index: 50;\n  background: rgba(0,0,0,0.4); align-items: center; justify-content: center;\n}\n.modal {\n  background: #fff; border-radius: 12px; padding: 1.5rem; max-width: 400px;\n  width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.18);\n  font-family: system-ui, sans-serif;\n}\n.modal h2 { font-size: 1.125rem; margin: 0 0 0.5rem; }\n.modal p { color: #4b5563; margin: 0 0 1.25rem; font-size: 0.9375rem; }\n.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }\n.btn-cancel {\n  padding: 8px 16px; border: 1px solid #c9ccd3; border-radius: 6px;\n  background: #fff; cursor: pointer;\n}\n.btn-danger {\n  padding: 8px 16px; border: none; border-radius: 6px;\n  background: #dc2626; color: #fff; cursor: pointer;\n}",
  expected: [
    {
      ruleId: "dialog-no-name",
      wcag: ["4.1.2"],
    },
  ],
  hints: [
    'The <div> acting as a dialog has no role or accessible name. Use <dialog> or role="dialog".',
    "Add aria-labelledby pointing to the dialog heading, or aria-label.",
    "Native <dialog> with showModal() provides built-in focus trapping and Escape handling.",
  ],
  solutionHtml:
    '<button type="button" id="open-dialog" onclick="document.getElementById(\'confirm-dialog\').showModal()">Delete Account</button>\n\n<dialog id="confirm-dialog" class="modal" aria-labelledby="dialog-title" aria-modal="true">\n  <h2 id="dialog-title">Confirm Deletion</h2>\n  <p>This action is permanent. All your data will be removed.</p>\n  <div class="modal-actions">\n    <button type="button" class="btn-cancel" onclick="document.getElementById(\'confirm-dialog\').close()">Cancel</button>\n    <button type="button" class="btn-danger" onclick="document.getElementById(\'confirm-dialog\').close()">Delete</button>\n  </div>\n</dialog>',
  solutionCss:
    ".modal {\n  border: none; border-radius: 12px; padding: 1.5rem; max-width: 400px;\n  width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.18);\n  font-family: system-ui, sans-serif;\n}\n.modal::backdrop { background: rgba(0,0,0,0.4); }\n.modal h2 { font-size: 1.125rem; margin: 0 0 0.5rem; }\n.modal p { color: #4b5563; margin: 0 0 1.25rem; font-size: 0.9375rem; }\n.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }\n.btn-cancel {\n  padding: 8px 16px; border: 1px solid #c9ccd3; border-radius: 6px;\n  background: #fff; cursor: pointer;\n}\n.btn-danger {\n  padding: 8px 16px; border: none; border-radius: 6px;\n  background: #dc2626; color: #fff; cursor: pointer;\n}",
  verify: {
    ruleIdsMustBeAbsent: ["dialog-no-name"],
  },
  manualSteps: [
    "Open the dialog. Can you close it with Escape?",
    "Tab through — does focus stay inside the dialog?",
    "When closed, does focus return to the trigger button?",
  ],
};

export default content;
