"use client";

import React, { useState } from "react";

export function InspectorDemo() {
  const [activeTab, setActiveTab] = useState<
    "elements" | "accessibility" | "console"
  >("accessibility");
  const [announceValue, setAnnounceValue] = useState('"Save changes, button"');
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashColor, setFlashColor] = useState<string>("inherit");

  const flash = (color: string) => {
    setIsFlashing(true);
    setFlashColor(color);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsFlashing(false);
        setFlashColor("var(--ink)");
      });
    });
  };

  const handleRealBtnClick = () => {
    setAnnounceValue('"Save changes, button"');
    flash("#065f46");
  };

  return (
    <div className="devtools-window">
      <div className="window-chrome">
        <div className="window-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="window-url">inspector — localhost/playground</span>
      </div>
      <div
        className="tab-strip"
        role="tablist"
        aria-label="Devtools panel (illustrative)"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "elements"}
          onClick={() => setActiveTab("elements")}
        >
          Elements
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "accessibility"}
          data-active={activeTab === "accessibility" ? "true" : undefined}
          onClick={() => setActiveTab("accessibility")}
        >
          Accessibility
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "console"}
          onClick={() => setActiveTab("console")}
        >
          Console
        </button>
      </div>
      <div className="window-body">
        <div className="compare-grid">
          <div className="element-card" data-kind="bad">
            <div className="element-card-head">
              <span className="selector">div.fake-btn</span>
              <span className="tag tag-bad">anti-pattern</span>
            </div>
            <div className="demo-target fake-btn" id="fakeBtn" tabIndex={-1}>
              Save changes
            </div>
            <dl className="readout">
              <div className="readout-row">
                <dt>Role</dt>
                <dd>none</dd>
              </div>
              <div className="readout-row">
                <dt>Accessible name</dt>
                <dd>— not exposed</dd>
              </div>
              <div className="readout-row">
                <dt>Reachable by Tab</dt>
                <dd>no</dd>
              </div>
              <div className="readout-row">
                <dt>Enter / Space</dt>
                <dd>does nothing</dd>
              </div>
            </dl>
          </div>

          <div className="element-card" data-kind="good">
            <div className="element-card-head">
              <span className="selector">button</span>
              <span className="tag tag-good">accessible</span>
            </div>
            <button
              type="button"
              className="demo-target real-btn"
              id="realBtn"
              onClick={handleRealBtnClick}
            >
              Save changes
            </button>
            <dl className="readout">
              <div className="readout-row">
                <dt>Role</dt>
                <dd>button</dd>
              </div>
              <div className="readout-row">
                <dt>Accessible name</dt>
                <dd>&quot;Save changes&quot;</dd>
              </div>
              <div className="readout-row">
                <dt>Reachable by Tab</dt>
                <dd>yes</dd>
              </div>
              <div className="readout-row">
                <dt>Enter / Space</dt>
                <dd>activates</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="announce-strip">
          <span className="label">Screen reader hears</span>
          <span
            className="value"
            id="announceValue"
            style={{
              color: flashColor,
              transition: isFlashing ? "none" : "color 1.4s ease",
            }}
          >
            {announceValue}
          </span>
        </div>
      </div>
    </div>
  );
}
