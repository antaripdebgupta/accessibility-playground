"use client";

import React from "react";
import Link from "next/link";
import { CHALLENGES, type Challenge } from "@/data/challenges";
import { loadAllChallengeProgress, type ChallengeProgress } from "@/lib/challenge-progress";
import {
  Trophy,
  ChevronRight,
  Image,
  MousePointer2,
  FormInput,
  Heading,
  Palette,
  AppWindow,
  Keyboard,
  ChevronsDownUp,
  Radio,
  SkipForward,
} from "lucide-react";

const CHALLENGE_ICONS: Record<string, React.ElementType> = {
  "image-alt": Image,
  "empty-button": MousePointer2,
  "form-labels": FormInput,
  "heading-order": Heading,
  "color-contrast": Palette,
  "modal-dialog": AppWindow,
  "tabs-keyboard": Keyboard,
  "accordion": ChevronsDownUp,
  "live-status": Radio,
  "skip-link": SkipForward,
};

const DIFFICULTY_STYLES: Record<
  Challenge["difficulty"],
  { color: string; bg: string; border: string }
> = {
  beginner: { color: "#065f46", bg: "#ecfdf5", border: "#bfe6d4" },
  intermediate: { color: "#92400e", bg: "#fff7e8", border: "#f0d9a8" },
  advanced: { color: "#b91c1c", bg: "#fef2f2", border: "#f3c6c6" },
};

export function ChallengesClient() {
  const [progressMap] = React.useState<Map<string, ChallengeProgress>>(
    () => {
      if (typeof window === "undefined") return new Map();
      const ids = CHALLENGES.map((c) => c.id);
      return loadAllChallengeProgress(ids);
    }
  );

  const completedCount = Array.from(progressMap.values()).filter((p) => p.completed).length;

  return (
    <div className="challenges-page">
      <div className="wrap">
        {/* Hero */}
        <section className="challenges-hero">
          <h1>Accessibility Challenges</h1>
          <p>
            Fix real-world accessibility issues in interactive code exercises.
            Each challenge starts with broken HTML — your job is to make it accessible.
          </p>
          {completedCount > 0 && (
            <div className="challenges-progress-summary" role="status">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              <span>
                {completedCount} of {CHALLENGES.length} completed
              </span>
            </div>
          )}
        </section>

        {/* Difficulty sections */}
        {(["beginner", "intermediate", "advanced"] as const).map((difficulty) => {
          const group = CHALLENGES.filter((c) => c.difficulty === difficulty);
          if (group.length === 0) return null;
          return (
            <section key={difficulty} className="challenges-section" aria-label={`${difficulty} challenges`}>
              <h2 className="challenges-section-title">
                <span
                  className="difficulty-badge"
                  style={{
                    color: DIFFICULTY_STYLES[difficulty].color,
                    background: DIFFICULTY_STYLES[difficulty].bg,
                    borderColor: DIFFICULTY_STYLES[difficulty].border,
                  }}
                >
                  {difficulty}
                </span>
              </h2>
              <ul className="challenges-grid">
                {group.map((challenge) => {
                  const progress = progressMap.get(challenge.id);
                  const Icon = CHALLENGE_ICONS[challenge.id] ?? MousePointer2;
                  return (
                    <li key={challenge.id}>
                      <Link
                        href={`/playground?challenge=${challenge.id}`}
                        className="challenge-card"
                        aria-label={`${challenge.title}${progress?.completed ? " (completed)" : ""}`}
                      >
                        <div className="challenge-card-icon">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="challenge-card-content">
                          <div className="challenge-card-header">
                            <h3 className="challenge-card-title">{challenge.title}</h3>
                            {progress?.completed && (
                              <Trophy
                                className="h-4 w-4"
                                style={{ color: "#065f46", flexShrink: 0 }}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="challenge-card-summary">{challenge.summary}</p>
                          <div className="challenge-card-meta">
                            <span>{challenge.objectives.length} objectives</span>
                            <span>·</span>
                            <span>{challenge.hints.length} hints</span>
                          </div>
                        </div>
                        <ChevronRight
                          className="challenge-card-arrow h-4 w-4"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {/* Footer note */}
        <p className="challenges-footer-note">
          Progress is stored locally in your browser. No accounts or server storage.
        </p>
      </div>

      <style>{`
        .challenges-page {
          padding: 2rem 0 4rem;
        }
        .challenges-hero {
          max-width: 600px;
          margin-bottom: 2.5rem;
        }
        .challenges-hero h1 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        .challenges-hero p {
          color: var(--ink-soft);
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
        }
        .challenges-progress-summary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 1rem;
          padding: 6px 14px;
          background: var(--green-bg);
          color: var(--green);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
        }
        .challenges-section {
          margin-bottom: 2rem;
        }
        .challenges-section-title {
          margin: 0 0 0.75rem;
        }
        .difficulty-badge {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 12px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .challenge-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--paper-raised);
          text-decoration: none;
          color: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .challenge-card:hover {
          border-color: var(--focus);
          box-shadow: 0 0 0 1px var(--focus);
        }
        .challenge-card:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }
        .challenge-card-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--focus-dim);
          color: var(--focus);
          flex-shrink: 0;
        }
        .challenge-card-content {
          flex: 1;
          min-width: 0;
        }
        .challenge-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }
        .challenge-card-title {
          font-size: 0.9375rem;
          font-weight: 600;
          margin: 0;
          color: var(--ink);
        }
        .challenge-card-summary {
          font-size: 0.8125rem;
          color: var(--ink-soft);
          margin: 0 0 6px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .challenge-card-meta {
          display: flex;
          gap: 6px;
          font-size: 0.6875rem;
          color: var(--ink-faint);
        }
        .challenge-card-arrow {
          color: var(--ink-faint);
          flex-shrink: 0;
          margin-top: 8px;
          transition: transform 0.15s;
        }
        .challenge-card:hover .challenge-card-arrow {
          transform: translateX(2px);
          color: var(--focus);
        }
        .challenges-footer-note {
          margin-top: 2rem;
          font-size: 0.8125rem;
          color: var(--ink-faint);
          text-align: center;
        }
        @media (max-width: 480px) {
          .challenges-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
