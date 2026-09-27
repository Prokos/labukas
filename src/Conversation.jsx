import React from "react";

// The same exchange layout for read-only comprehension and live turn-taking.
export default function Conversation({
  messages,
  live = false,
  answered = false,
  onHistoryOpen,
}) {
  const split = live ? Math.max(0, messages.length - (answered ? 3 : 1)) : 0;
  const render = (message, i) => (
    <div
      key={i}
      className={`opening-message ${message.outgoing ? "outgoing" : "incoming"}`}
    >
      <span>{message.speaker}</span>
      <p lang="lt">{message.text}</p>
      {message.gloss && (
        <small className="opening-message-gloss">{message.gloss}</small>
      )}
    </div>
  );
  return (
    <div
      className="opening-conversation"
      role={live ? "log" : "group"}
      aria-label="Conversation"
    >
      {split > 0 && (
        <details
          className="opening-conversation-history"
          onToggle={(e) => {
            if (e.currentTarget.open) onHistoryOpen?.();
          }}
        >
          <summary>Earlier messages ({split})</summary>
          <div>{messages.slice(0, split).map(render)}</div>
        </details>
      )}
      {messages.slice(split).map(render)}
    </div>
  );
}
