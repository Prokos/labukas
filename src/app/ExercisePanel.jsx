import React from "react";
import { ArrowRight, Check, X, Lightbulb, Eye } from "lucide-react";
import Conversation from "../components/Conversation.jsx";
import TownMap from "../components/TownMap.jsx";
import { hintForStep, supportChoices } from "../learning/support.js";
export default function ExercisePanel({
  step,
  run,
  submit,
  title,
  input,
  wordSupport,
  textInput,
  letters,
  updateRun,
  choose,
  isTyping,
  pickWord,
  isBank,
  runtime,
  setState,
  help,
  reference,
  nextButton,
  canCheck,
  messages,
}) {
  return (
    <form
      className="session-content exercise lesson-exercise"
      data-step={step.id}
      data-kind={step.kind}
      onSubmit={submit}
    >
      <div className="exercise-body lesson-task">
        {step.kind === "model" ? (
          <>
            <h1 className="lesson-model-title" ref={title} tabIndex={-1}>
              {step.title}
            </h1>
            <div className="lesson-model-pairs">
              {step.pairs.map(([lt, en], i) => (
                <div key={lt}>
                  <p lang="lt">
                    {step.focus
                      ? lt.split(step.focus[i]).map((part, n) => (
                          <React.Fragment key={n}>
                            {n > 0 && <mark>{step.focus[i]}</mark>}
                            {part}
                          </React.Fragment>
                        ))
                      : lt}
                  </p>
                  <span>{en}</span>
                </div>
              ))}
            </div>
            <p className="lesson-model-note">{step.note}</p>
          </>
        ) : (
          <>
            {step.teaching && (
              <div className="lesson-repair-cue">
                <Lightbulb size={18} />
                <p>{step.teaching}</p>
              </div>
            )}
            {step.menu && (
              <section
                className="chapter-menu"
                aria-label={step.menuTitle || "Menu"}
              >
                <h2 lang="lt">{step.menuTitle || "Valgiaraštis"}</h2>
                <table>
                  <tbody>
                    {step.menu.map(([dish, price]) => (
                      <tr key={dish}>
                        <th scope="row" lang="lt">
                          {dish}
                        </th>
                        <td lang="lt">{price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
            {step.passage && (
              <div className="chapter-passage">
                <p lang="lt">{step.passage}</p>
                {step.glossary && (
                  <dl>
                    {step.glossary.map(([lt, en]) => (
                      <div key={lt}>
                        <dt lang="lt">{lt}</dt>
                        <dd>{en}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}
            {step.map && <TownMap map={step.map} />}
            {step.thread ? (
              <>
                <h1 className="lesson-chat-title" ref={title} tabIndex={-1}>
                  {step.speaker}
                </h1>
                <Conversation
                  key={step.id}
                  messages={messages}
                  live
                  answered={!!run.feedback}
                  onHistoryOpen={() => help("conversation-history")}
                />
              </>
            ) : step.messages ? (
              <Conversation messages={messages} />
            ) : null}
            {!step.thread && (
              <h1
                className={`lesson-source ${step.messages ? "lesson-reading-question" : ""}`}
                ref={title}
                tabIndex={-1}
              >
                {["gap", "gap-type"].includes(step.kind) ? (
                  <span className="lesson-gap" lang="lt">
                    {step.source.split("___")[0]}
                    {step.kind === "gap-type" && !wordSupport ? (
                      textInput
                    ) : (
                      <span
                        className={`lesson-gap-slot ${run.answer ? "filled" : ""}`}
                      >
                        {run.answer || "…"}
                      </span>
                    )}
                    {step.source.split("___")[1]}
                  </span>
                ) : (
                  step.source
                )}
              </h1>
            )}
            {step.translation && (
              <p className="lesson-translation">{step.translation}</p>
            )}
            {!(step.thread && run.feedback) && (
              <p className="lesson-instruction" id="lesson-instruction">
                {wordSupport ? "Choose the answer." : step.instruction}
              </p>
            )}
            {step.kind === "writing" && (
              <div className="chapter-writing">
                <label htmlFor="lesson-writing">Your message</label>
                <textarea
                  id="lesson-writing"
                  ref={input}
                  value={run.answer}
                  maxLength={3000}
                  lang="lt"
                  readOnly={!!run.feedback}
                  onChange={(e) =>
                    updateRun({ answer: e.target.value, checked: [] })
                  }
                />
                {run.reviewing && (
                  <div className="chapter-self-review">
                    <h2>Review your message</h2>
                    <p>
                      This is one example. Your own message can be different.
                    </p>
                    <p lang="lt" className="chapter-writing-example">
                      {step.sample}
                    </p>
                    {step.checklist.map((text, i) => (
                      <label key={text}>
                        <input
                          type="checkbox"
                          disabled={!!run.feedback}
                          checked={run.checked?.includes(i) || false}
                          onChange={() =>
                            updateRun({
                              checked: run.checked?.includes(i)
                                ? run.checked.filter((n) => n !== i)
                                : [...(run.checked || []), i],
                            })
                          }
                        />
                        {text}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            {step.options && !(step.thread && run.feedback) && (
              <div
                className="lesson-options"
                role="group"
                aria-labelledby="lesson-instruction"
              >
                {step.options.map((option, i) => (
                  <button
                    type="button"
                    key={option}
                    disabled={!!run.feedback}
                    className={
                      run.answer === option
                        ? `selected ${run.feedback?.status || ""}`
                        : ""
                    }
                    aria-pressed={run.answer === option}
                    onClick={() => choose(option)}
                  >
                    <span className="lesson-option-index" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>{option}</span>
                    {run.answer === option &&
                      run.feedback &&
                      (run.feedback.status === "correct" ? (
                        <Check size={19} />
                      ) : (
                        <X size={19} />
                      ))}
                  </button>
                ))}
              </div>
            )}
            {isBank && !(step.thread && run.feedback) && (
              <div className="lesson-bank">
                <div
                  className="lesson-built"
                  aria-label="Your sentence"
                  aria-live="polite"
                >
                  {run.selected.length ? (
                    run.selected.map((i) => (
                      <button
                        type="button"
                        disabled={!!run.feedback}
                        aria-label={`Remove ${step.words[i]}`}
                        key={i}
                        onClick={() => pickWord(i)}
                      >
                        {step.words[i]}
                        <X size={14} />
                      </button>
                    ))
                  ) : (
                    <span>Choose words below</span>
                  )}
                </div>
                <div className="lesson-tiles">
                  {step.words.map((word, i) => (
                    <button
                      type="button"
                      key={i}
                      disabled={!!run.feedback || run.selected.includes(i)}
                      onClick={() => pickWord(i)}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isTyping && (
              <div className="lesson-write">
                {!wordSupport && (
                  <>
                    {step.kind === "type" && textInput}
                    {letters}
                  </>
                )}
                {!run.feedback &&
                  (wordSupport ? (
                    <div className="lesson-support-words">
                      {(run.supportChoices || supportChoices(step)).map((w) => (
                        <button
                          type="button"
                          key={w}
                          className={run.answer === w ? "selected" : ""}
                          onClick={() => choose(w)}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  ) : null)}
              </div>
            )}
            {step.kind === "match" && (
              <>
                <div className="lesson-match">
                  <div aria-label="Lithuanian words">
                    {step.pairs.map(([lt], i) => (
                      <button
                        key={lt}
                        type="button"
                        disabled={run.matched.includes(i) || !!run.feedback}
                        className={
                          run.matched.includes(i)
                            ? "matched"
                            : run.pending === i
                              ? "selected"
                              : ""
                        }
                        onClick={() =>
                          setState((s) => runtime.selectPair(s, "left", i))
                        }
                      >
                        {lt}
                        {run.matched.includes(i) && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                  <div aria-label="English meanings">
                    {(
                      step.pairOrder ||
                      [...step.pairs.keys()]
                        .slice(-1)
                        .concat([...step.pairs.keys()].slice(0, -1))
                    ).map((i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={run.matched.includes(i) || !!run.feedback}
                        className={
                          run.matched.includes(i)
                            ? "matched"
                            : run.pendingRight === i
                              ? "selected"
                              : ""
                        }
                        onClick={() =>
                          setState((s) => runtime.selectPair(s, "right", i))
                        }
                      >
                        {step.pairs[i][1]}
                        {run.matched.includes(i) && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                </div>
                {run.pairError && (
                  <p role="status" className="lesson-pair-error">
                    {run.pairError}
                  </p>
                )}
              </>
            )}
            {step.kind === "edit" && (
              <div className="lesson-edit">
                <div aria-label="Sentence to fix">
                  {step.tokens.map((token, i) => (
                    <button
                      type="button"
                      key={i}
                      disabled={!!run.feedback}
                      aria-pressed={run.editIndex === i}
                      className={run.editIndex === i ? "selected" : ""}
                      onClick={() => updateRun({ editIndex: i, answer: "" })}
                    >
                      {run.editIndex === i && run.answer ? run.answer : token}
                    </button>
                  ))}
                </div>
                {run.editIndex !== null && (
                  <div
                    className="lesson-replacements"
                    aria-label="Replacement words"
                  >
                    <span>Replace with</span>
                    {step.replacements[run.editIndex].map((w) => (
                      <button
                        type="button"
                        key={w}
                        disabled={!!run.feedback}
                        onClick={() => choose(w)}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!run.feedback && (
              <div className="lesson-help">
                <div className="lesson-help-actions">
                  <button
                    type="button"
                    aria-expanded={!!run.helpOpen || run.help.includes("hint")}
                    onClick={() => help("hint")}
                  >
                    <Lightbulb size={16} />
                    Help
                  </button>
                </div>
                {(run.helpOpen || run.help.includes("hint")) && (
                  <div className="lesson-help-panel">
                    {hintForStep(step) && (
                      <p className="lesson-hint">{hintForStep(step)}</p>
                    )}
                    <div className="lesson-help-actions">
                      {isTyping &&
                        !wordSupport &&
                        supportChoices(step).length > 1 &&
                        !run.help.includes("reveal") && (
                          <button type="button" onClick={() => help("words")}>
                            Show choices
                          </button>
                        )}
                      {!run.help.includes("reveal") && (
                        <button type="button" onClick={() => help("reveal")}>
                          <Eye size={16} />{" "}
                          {step.kind === "writing"
                            ? "Show example"
                            : "Show answer"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {run.help.includes("reference") && (
                  <dl className="lesson-reference">
                    {reference.map((row) => (
                      <div key={`${row.lt}:${row.en}`}>
                        <dt lang="lt">{row.lt}</dt>
                        <dd>{row.en}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {run.help.includes("reveal") && (
                  <p className="lesson-hint">
                    {step.kind === "match" ? (
                      "The matching pairs are shown."
                    ) : (
                      <>
                        {step.kind === "writing" ? "Example:" : "Answer:"}{" "}
                        <strong>{step.sample || step.answers[0]}</strong>
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="answer-footer lesson-actions">
        {run.feedback && (
          <div
            role="status"
            className={`lesson-feedback ${run.feedback.status}`}
          >
            <strong>
              {run.feedback.status === "correct" ? (
                <Check size={20} />
              ) : run.feedback.status === "incorrect" ? (
                <X size={20} />
              ) : null}
              {run.feedback.message}
            </strong>
            {run.feedback.detail && <p>{run.feedback.detail}</p>}
          </div>
        )}
        <button
          ref={nextButton}
          className="button"
          type="submit"
          disabled={step.kind !== "model" && !run.feedback && !canCheck}
        >
          {run.feedback || step.kind === "model"
            ? "Continue"
            : step.kind === "writing"
              ? run.reviewing
                ? "Save my writing"
                : "Review my writing"
              : "Check answer"}
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
