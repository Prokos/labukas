import { useEffect, useState, useSyncExternalStore } from "react";
import { chapters, loadCourse } from "../curriculum/catalog.js";
import * as progress from "../progress/store.js";
import { SakykMark, Wordmark, BrandArt } from "../components/Brand.jsx";
import { Icon, Button, PageHeading } from "../components/Controls.jsx";
import CourseView from "./CourseView.jsx";
import Reference from "./Reference.jsx";
import Settings from "./Settings.jsx";
import { useCloudSync } from "./useCloudSync.js";
import { setUpdateBusy } from "./updates.js";
const nav = [
  ["today", "House", "Today"],
  ["course", "Route", "Your course"],
  ["practice", "Dumbbell", "Practice"],
  ["reference", "Search", "Reference"],
];
function requestedChapter() {
  const query = new URLSearchParams(location.search);
  const number = Number(
    query.get("chapter") || query.get("preview")?.match(/^chapter(\d+)$/)?.[1],
  );
  return number >= 1 && number <= 10 ? number : null;
}
export default function App() {
  const snapshot = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
  );
  const [page, setPage] = useState(requestedChapter() ? "course" : "today");
  const [course, setCourse] = useState(null),
    [loadError, setLoadError] = useState("");
  const [active, setActive] = useState(false),
    [settings, setSettings] = useState(false),
    [message, setMessage] = useState("");
  const number = requestedChapter() || snapshot.preferences.chapter;
  const account = useCloudSync(snapshot.ready, active);
  useEffect(() => {
    progress.initialize();
  }, []);
  useEffect(() => {
    if (!snapshot.ready) return;
    let cancelled = false;
    setCourse(null);
    setLoadError("");
    loadCourse(number)
      .then((value) => {
        if (!cancelled) setCourse(value);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot.ready, number]);
  useEffect(() => {
    if (active || settings || !snapshot.ready) {
      setUpdateBusy(true);
      return;
    }
    let cancelled = false;
    progress
      .flush()
      .then(() => {
        if (!cancelled) setUpdateBusy(false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active, settings, snapshot.ready]);
  function selectChapter(value) {
    const url = new URL(location.href);
    url.searchParams.delete("preview");
    url.searchParams.set("chapter", value);
    history.replaceState(null, "", url);
    progress.setPreferences({ chapter: Number(value) }).catch(() => {});
    setPage("course");
  }
  async function backup() {
    if (!snapshot.ready) {
      setMessage(
        "Progress could not be opened. Your device records have been kept. Reload to try again.",
      );
      setSettings(false);
      return;
    }
    const blob = new Blob(
      [JSON.stringify(progress.exportProgress(), null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `sakyk-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const state = course && snapshot.courses[course.key];
  const completed =
    course?.lessons.filter((l) => state?.completed.includes(l.id)).length || 0;
  const next = course?.lessons.find((l) => !state?.completed.includes(l.id));
  const events = [
    ...snapshot.events,
    ...Object.values(snapshot.courses).flatMap((s) => s.events),
  ];
  const today = new Date().toLocaleDateString();
  const responses = events.filter(
    (e) => e.type === "answer" && new Date(e.at).toLocaleDateString() === today,
  ).length;
  const hidden = active || settings;
  return (
    <>
      <aside className="sidebar" inert={hidden}>
        <a
          className="brand"
          aria-label="Sakyk home"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("today");
          }}
        >
          <SakykMark />
          <Wordmark />
        </a>
        <p className="brand-tagline">Learn Lithuanian naturally.</p>
        <nav>
          {nav.map(([id, icon, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => setPage(id)}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="settings-link" onClick={() => setSettings(true)}>
            <Icon name="Settings" />
            Settings & sync
          </button>
          <div className="profile">
            <span className="avatar">L</span>
            <span>
              Speak. Learn. Belong.<small>Lithuanian · A1–A1+</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="app-shell" inert={hidden}>
        <header className="topbar">
          <span className="breadcrumb">
            Your Lithuanian journey <span>/</span>{" "}
            {nav.find((n) => n[0] === page)?.[2]}
          </span>
          <span className="mobile-brand">
            <SakykMark />
            <Wordmark />
          </span>
          <div className="top-stats">
            <span>
              {responses} / {snapshot.preferences.goal} today
            </span>
            <button
              className="top-avatar"
              aria-label="Open settings"
              onClick={() => setSettings(true)}
            >
              L
            </button>
          </div>
        </header>
        <main>
          {message && <p role="status">{message}</p>}
          {snapshot.error && (
            <p role="alert">
              Your progress could not be saved: {snapshot.error}. Keep this tab
              open and export a backup in Settings.
            </p>
          )}
          {!snapshot.ready ? (
            <p role="status">Opening your course…</p>
          ) : loadError ? (
            <p role="alert">{loadError}</p>
          ) : page === "reference" ? (
            <Reference />
          ) : !course ? (
            <p role="status">Loading chapter…</p>
          ) : (
            <>
              <label className="chapter-picker">
                Chapter{" "}
                <select
                  aria-label="Choose chapter"
                  value={number}
                  onChange={(e) => selectChapter(e.target.value)}
                >
                  {chapters.map((c) => (
                    <option key={c.number} value={c.number}>
                      Chapter {c.number}
                    </option>
                  ))}
                </select>
              </label>
              {page === "today" ? (
                <>
                  <PageHeading
                    eyebrow="YOUR LITHUANIAN JOURNEY"
                    title="A little Lithuanian, every day."
                    subtitle="Continue your course, then return to words that need practice."
                  />
                  <section className="lesson-next">
                    <div>
                      <span className="eyebrow">CHAPTER {course.number}</span>
                      <h2>{course.title}</h2>
                      <p>
                        {completed} of {course.lessons.length} lessons complete
                      </p>
                      <p>{next?.title || course.completeTitle}</p>
                      <Button onClick={() => setPage("course")}>
                        Continue course <Icon name="ArrowRight" />
                      </Button>
                    </div>
                    <BrandArt />
                  </section>
                </>
              ) : (
                <CourseView
                  key={number}
                  course={course}
                  view={page}
                  onActiveChange={setActive}
                  onCourse={() => setPage("course")}
                />
              )}
            </>
          )}
        </main>
      </div>
      <nav className="mobile-nav" inert={hidden}>
        {nav.map(([id, icon, label]) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {settings && (
        <Settings
          notice={message}
          onClose={() => setSettings(false)}
          s={{ goal: snapshot.preferences.goal }}
          {...account}
          onGoal={(goal) => progress.setPreferences({ goal }).catch(() => {})}
          onExport={backup}
          onImport={async (file) => {
            try {
              await progress.importProgress(JSON.parse(await file.text()));
              setMessage("Backup combined with your progress.");
              setSettings(false);
            } catch (e) {
              setMessage(e.message);
            }
          }}
        />
      )}
    </>
  );
}
