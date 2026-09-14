import {
  alphabet,
  caseColumns,
  nounForms,
  pluralForms,
  pronounForms,
  verbPeople,
  verbForms,
  skillNotes,
  numeralForms,
} from "./content/reference.js";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight as IconArrowRight,
  ArrowUpRight as IconArrowUpRight,
  Archive as IconArchive,
  BookOpen as IconBookOpen,
  Brain as IconBrain,
  Check as IconCheck,
  CheckCheck as IconCheckCheck,
  ChevronDown as IconChevronDown,
  ChevronRight as IconChevronRight,
  ChevronUp as IconChevronUp,
  CircleCheck as IconCircleCheck,
  CirclePlay as IconCirclePlay,
  Clock3 as IconClock3,
  Cloud as IconCloud,
  Cloud as IconCloudCheck,
  CloudSun as IconCloudSun,
  Coffee as IconCoffee,
  Download as IconDownload,
  Dumbbell as IconDumbbell,
  Ellipsis as IconEllipsis,
  Flag as IconFlag,
  Flame as IconFlame,
  Flower2 as IconFlower2,
  GraduationCap as IconGraduationCap,
  HardDrive as IconHardDrive,
  HeartPulse as IconHeartPulse,
  House as IconHouse,
  Info as IconInfo,
  Lightbulb as IconLightbulb,
  MapPin as IconMapPin,
  MessageCircle as IconMessageCircle,
  MessagesSquare as IconMessagesSquare,
  PartyPopper as IconPartyPopper,
  PencilLine as IconPencilLine,
  Puzzle as IconPuzzle,
  RefreshCw as IconRefreshCw,
  Route as IconRoute,
  Search as IconSearch,
  Settings as IconSettings,
  Sparkles as IconSparkles,
  Sprout as IconSprout,
  Star as IconStar,
  Sun as IconSun,
  Target as IconTarget,
  Ticket as IconTicket,
  Upload as IconUpload,
  UserRound as IconUserRound,
  Users as IconUsers,
  X as IconX,
} from "lucide-react";
const I = {
  ArrowRight: IconArrowRight,
  ArrowUpRight: IconArrowUpRight,
  Archive: IconArchive,
  BookOpen: IconBookOpen,
  Brain: IconBrain,
  Check: IconCheck,
  CheckCheck: IconCheckCheck,
  ChevronDown: IconChevronDown,
  ChevronRight: IconChevronRight,
  ChevronUp: IconChevronUp,
  CircleCheck: IconCircleCheck,
  CirclePlay: IconCirclePlay,
  Clock3: IconClock3,
  Cloud: IconCloud,
  CloudCheck: IconCloudCheck,
  CloudSun: IconCloudSun,
  Coffee: IconCoffee,
  Download: IconDownload,
  Dumbbell: IconDumbbell,
  Ellipsis: IconEllipsis,
  Flag: IconFlag,
  Flame: IconFlame,
  Flower2: IconFlower2,
  GraduationCap: IconGraduationCap,
  HardDrive: IconHardDrive,
  HeartPulse: IconHeartPulse,
  House: IconHouse,
  Info: IconInfo,
  Lightbulb: IconLightbulb,
  MapPin: IconMapPin,
  MessageCircle: IconMessageCircle,
  MessagesSquare: IconMessagesSquare,
  PartyPopper: IconPartyPopper,
  PencilLine: IconPencilLine,
  Puzzle: IconPuzzle,
  RefreshCw: IconRefreshCw,
  Route: IconRoute,
  Search: IconSearch,
  Settings: IconSettings,
  Sparkles: IconSparkles,
  Sprout: IconSprout,
  Star: IconStar,
  Sun: IconSun,
  Target: IconTarget,
  Ticket: IconTicket,
  Upload: IconUpload,
  UserRound: IconUserRound,
  Users: IconUsers,
  X: IconX,
};
import {
  chapters,
  lessons,
  items,
  skills,
  courseSteps,
  classSteps,
  phaseNames,
} from "./curriculum";
import {
  STORAGE_KEY,
  readProgress,
  mergeProgress,
  event,
  stats,
  exerciseFor,
  reinforcement,
  sessionOutcome,
  sessionItems,
  newId,
  isCorrect,
  practiceItems,
  validateProgress,
  localDay,
} from "./engine";
import {
  practiceGroups,
  practiceSets,
  wordPracticeSet,
  practiceSession,
  dailyWord,
} from "./practice";
import * as cloud from "./cloud";
import { WindowMark, TownArt } from "./Art";
import "./styles.css";
const Icon = ({ name, size = 20, ...props }) => {
  const C = I[name] || I.BookOpen;
  return <C size={size} strokeWidth={1.8} {...props} />;
};
const Button = ({ children, onClick, secondary = false, ...rest }) => (
  <button
    onClick={onClick}
    className={`button ${secondary ? "secondary" : ""}`}
    {...rest}
  >
    {children}
  </button>
);
function App() {
  const [progress, setProgress] = useState(readProgress),
    [page, setPage] = useState("today"),
    [session, setSession] = useState(null),
    [settings, setSettings] = useState(false),
    [syncStatus, setSyncStatus] = useState("Saved on this device"),
    [syncing, setSyncing] = useState(false),
    [toast, setToast] = useState(""),
    [user, setUser] = useState(null);
  const progressRef = useRef(progress),
    syncRef = useRef(false),
    timer = useRef(),
    toastTimer = useRef();
  const s = stats(progress),
    support = reinforcement(progress),
    todayWord = dailyWord();
  const chapterSteps = courseSteps.filter(
    (step) => step.chapter === (s.nextStep?.chapter ?? 9),
  );
  const chapterDone = chapterSteps.filter((step) =>
    s.passedSteps.has(step.id),
  ).length;
  function notify(text) {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 6000);
  }
  function persist(next) {
    const merged = mergeProgress(progressRef.current, next, readProgress());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      notify(
        "Device storage is full or unavailable. Export a backup in Settings to keep your progress.",
      );
    }
    progressRef.current = merged;
    setProgress(merged);
    return merged;
  }
  function addEvent(type, data) {
    persist({ version: 1, events: [event(type, data)] });
    if (cloud.isConnected()) {
      setSyncStatus("Changes waiting to sync");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => sync(), 10000);
    } else setSyncStatus("Saved on this device");
  }
  async function sync() {
    if (syncRef.current) return;
    syncRef.current = true;
    setSyncing(true);
    setSyncStatus("Syncing…");
    try {
      const snapshot = progressRef.current;
      const merged = await cloud.syncCloud(snapshot);
      persist(merged);
      const pending = progressRef.current.events.some(
        (e) => !merged.events.some((x) => x.id === e.id),
      );
      setSyncStatus(
        pending ? "Changes waiting to sync" : "All progress synced",
      );
      if (pending) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => sync(), 1000);
      }
    } catch (e) {
      setSyncStatus("Sync needs attention");
      notify(e.message);
    } finally {
      syncRef.current = false;
      setSyncing(false);
    }
  }
  async function connect(email, password, createAccount = false) {
    try {
      if (createAccount) {
        const result = await cloud.signUp(email.trim(), password);
        if (!result.signedIn) {
          notify("Check your email to confirm your account, then sign in.");
          return false;
        }
      } else await cloud.signIn(email.trim(), password);
      setUser(cloud.currentUser());
      await sync();
      return true;
    } catch (e) {
      notify(e.message);
      return false;
    }
  }
  async function resendConfirmation(email) {
    try {
      if (!email.trim()) throw new Error("Enter your email address first.");
      await cloud.resendConfirmation(email.trim());
      notify("A fresh verification email is on its way.");
    } catch (e) {
      notify(e.message);
    }
  }
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) persist(readProgress());
    };
    const onOnline = () => {
      if (cloud.isConnected()) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("online", onOnline);
    window.addEventListener("focus", onOnline);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("focus", onOnline);
    };
  }, []);
  useEffect(() => {
    if (!cloud.isConfigured()) return;
    let unsubscribe;
    cloud
      .initialize((nextUser) => {
        setUser(nextUser);
        setSyncStatus(
          nextUser ? "Changes waiting to sync" : "Saved on this device",
        );
        if (nextUser) setTimeout(() => sync(), 0);
      })
      .then((stop) => {
        unsubscribe = stop;
      })
      .catch((e) => notify(e.message));
    return () => unsubscribe?.();
  }, []);
  const startLesson = (l, requestedStep) => {
    const current = stats(progressRef.current);
    const step =
      requestedStep ||
      classSteps(l.id).find((step) => !current.passedSteps.has(step.id)) ||
      classSteps(l.id)[0];
    if (
      step.phase === "checkpoint" &&
      courseSteps.some(
        (s) =>
          s.chapter === step.chapter &&
          s.phase !== "checkpoint" &&
          !current.passedSteps.has(s.id),
      )
    ) {
      notify("Finish the chapter’s learning sessions before taking its check.");
      return;
    }
    setSession({
      id: newId(),
      mode: "lesson",
      lesson: l,
      step,
      queue: sessionItems(progressRef.current, step),
    });
  };
  const startPractice = (selection = "all") => {
    const config = practiceSession(progressRef.current, selection);
    if (!config.queue.length) {
      notify("Choose a topic to start learning.");
      setPage("practice");
      return;
    }
    setSession({ id: newId(), ...config });
  };
  function continueCourse() {
    const current = stats(progressRef.current);
    if (current.nextStep) startLesson(current.next, current.nextStep);
    else {
      setSession(null);
      setPage("course");
    }
  }
  function startReview() {
    const current = stats(progressRef.current),
      support = reinforcement(progressRef.current);
    if (support)
      setSession({
        id: newId(),
        mode: "review",
        lesson: support.lesson,
        queue: [...support.items, ...support.items],
      });
    else if (current.due.length > 0)
      setSession({
        id: newId(),
        mode: "review",
        skill: "all",
        queue: practiceItems(progressRef.current).filter(
          (i) => current.records[i.id]?.due <= Date.now(),
        ),
      });
    else startPractice();
  }
  const nav = [
    ["today", "House", "Today"],
    ["course", "Route", "Your course"],
    ["practice", "Dumbbell", "Practice"],
    ["words", "BookOpen", "My words"],
    ["reference", "Search", "Reference"],
  ];
  return (
    <>
      <aside className="sidebar" inert={Boolean(session || settings)}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("today");
          }}
        >
          <WindowMark />
          <span>
            labukas<span className="brand-dot">.</span>
          </span>
        </a>
        <nav>
          {nav.map(([id, icon, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => setPage(id)}
            >
              <Icon name={icon} />
              {label}
              {id === "practice" && s.due.length > 0 && (
                <span className="nav-count">{s.due.length}</span>
              )}
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
              Your little journey<small>Lithuanian · A1–A1+</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="app-shell" inert={Boolean(session || settings)}>
        <header className="topbar">
          <span className="breadcrumb">
            Your Lithuanian journey <span>/</span>{" "}
            {nav.find((n) => n[0] === page)?.[2]}
          </span>
          <span className="mobile-brand">
            <WindowMark />
            labukas.
          </span>
          <div className="top-stats">
            <span title="Consecutive days studied">
              <Icon name="Flame" size={19} />
              <b>{s.streak}</b>
              <span className="stat-label">day streak</span>
            </span>
            <span title="Experience earned">
              <Icon name="Sparkles" size={19} />
              <b>{s.xp}</b>
              <span className="stat-label">XP</span>
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
          {page === "today" && (
            <>
              <div className="page-heading">
                <h1>
                  {s.xp ? "Welcome back." : "Labas, new beginnings."}{" "}
                  <span className="hello-wave">✳</span>
                </h1>
              </div>
              <div className="dashboard-grid">
                <div className="main-column">
                  <section
                    className="course-resume"
                    aria-label="Continue your curriculum"
                  >
                    <div className="resume-copy">
                      <span className="eyebrow">
                        {s.nextStep
                          ? `CHAPTER ${s.nextStep.chapter + 1} · ${chapters[s.nextStep.chapter].title.toUpperCase()}`
                          : "YOUR COURSE"}
                      </span>
                      <h2>
                        {s.nextStep?.phase === "checkpoint"
                          ? "Chapter check"
                          : s.next?.title || "Your course is complete."}
                      </h2>
                      <p>
                        {s.nextStep
                          ? `${s.nextStep.title} · Lesson ${chapterSteps.findIndex((step) => step.id === s.nextStep.id) + 1} of ${chapterSteps.length}`
                          : "Every chapter is finished. Revisit any lesson from your course."}
                      </p>
                      <Button onClick={continueCourse}>
                        {s.nextStep
                          ? s.passedSteps.size || s.xp
                            ? "Continue course"
                            : "Start course"
                          : "View completed course"}
                        <Icon name="ArrowRight" size={18} />
                      </Button>
                    </div>
                    <TownArt />
                    <div className="resume-progress">
                      <span>
                        {chapterDone} of {chapterSteps.length} chapter lessons
                        complete
                      </span>
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label="Chapter progress"
                        aria-valuemin={0}
                        aria-valuemax={chapterSteps.length}
                        aria-valuenow={chapterDone}
                      >
                        <div
                          style={{
                            width: `${(chapterDone / chapterSteps.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </section>
                  <LearningPath
                    chapterIndex={s.next?.chapter ?? 9}
                    s={s}
                    onStart={startLesson}
                  />
                  <p className="curriculum-foot">
                    <Icon name="BookOpen" size={14} /> Thoughtfully following{" "}
                    <em>Your Lithuanian course</em> <span>·</span> 10 chapters,
                    one clear path
                  </p>
                </div>
                <aside className="right-column">
                  <DailyGoal s={s} setSettings={setSettings} />
                  <section className="card optional-practice">
                    <div className="card-title">
                      <h3>A little extra practice</h3>
                      <Icon name="Dumbbell" size={19} />
                    </div>
                    <p>
                      {support
                        ? `${support.items.length} words or patterns could use another look.`
                        : s.due.length
                          ? `${s.due.length} familiar words and patterns are due for review.`
                          : "Revisit familiar words or focus on a specific case."}
                    </p>
                    <button className="text-link" onClick={startReview}>
                      {support
                        ? "Review weak spots"
                        : s.due.length
                          ? `Review ${s.due.length} due`
                          : "Start practice"}
                      <Icon name="ArrowRight" size={15} />
                    </button>
                    <button
                      className="text-link topic-link"
                      onClick={() => setPage("practice")}
                    >
                      Choose a topic
                      <Icon name="ArrowUpRight" size={15} />
                    </button>
                  </section>
                  <section className="word-card">
                    <span className="eyebrow">
                      A LITTLE WORD TO TAKE WITH YOU
                    </span>
                    <div className="word-of-day" lang="lt">
                      {todayWord.lt}
                    </div>
                    <p>{todayWord.en}</p>
                    <div className="word-divider" />
                    <span>Small words. New connections.</span>
                    <Icon name="Flower2" className="flower" size={54} />
                  </section>
                  <button
                    className="save-status"
                    onClick={() => setSettings(true)}
                  >
                    <Icon
                      name={cloud.isConnected() ? "CloudCheck" : "HardDrive"}
                      size={16}
                    />
                    <span>
                      {syncStatus}
                      <small>
                        {cloud.isConnected()
                          ? "Your journey, across devices"
                          : "Sign in to take it with you"}
                      </small>
                    </span>
                    <Icon name="ChevronRight" size={14} />
                  </button>
                </aside>
              </div>
            </>
          )}
          {page === "course" && (
            <>
              <PageHeading
                eyebrow="YOUR ROADMAP"
                title="One chapter at a time."
                subtitle="From your first labas to everyday conversations. Follow the path, or revisit a familiar place."
              />
              <div className="course-intro">
                <Icon name="BookOpen" />
                <div>
                  <strong>Learn Lithuanian, step by step</strong>
                  <p>
                    10 chapters · {lessons.length} focused classes ·{" "}
                    {courseSteps.length} short lessons · English explanations
                    throughout
                  </p>
                </div>
                <span className="pill">
                  {
                    courseSteps.filter((step) => s.passedSteps.has(step.id))
                      .length
                  }{" "}
                  / {courseSteps.length} lessons complete
                </span>
              </div>
              <div className="course-list">
                {chapters.map((ch, i) => (
                  <CourseChapter
                    key={i}
                    chapter={ch}
                    index={i}
                    s={s}
                    onStart={startLesson}
                  />
                ))}
              </div>
            </>
          )}
          {page === "practice" && (
            <PracticeBrowser s={s} onStart={startPractice} />
          )}
          {page === "reference" && <StudyReference />}
          {page === "words" && (
            <WordCollection s={s} onPractice={startPractice} />
          )}
        </main>
        <footer className="footer">
          <span>Made for your own little Lithuanian adventure.</span>
          <span>
            Po truputį, kasdien. <Icon name="Sprout" size={15} />
          </span>
        </footer>
      </div>
      <nav className="mobile-nav" inert={Boolean(session || settings)}>
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
      {session && (
        <Session
          key={session.id}
          config={session}
          progressRef={progressRef}
          onEvent={addEvent}
          onContinue={continueCourse}
          onClose={() => {
            setSession(null);
            if (cloud.isConnected()) sync();
          }}
        />
      )}
      {settings && (
        <Settings
          onClose={() => setSettings(false)}
          s={s}
          user={user}
          configured={cloud.isConfigured()}
          connect={connect}
          resendConfirmation={resendConfirmation}
          syncing={syncing}
          sync={sync}
          syncStatus={syncStatus}
          disconnect={async () => {
            try {
              await cloud.disconnect();
              setUser(null);
              setSyncStatus("Saved on this device");
            } catch (e) {
              notify(e.message);
            }
          }}
          onGoal={(value) => addEvent("goal", { value })}
          onExport={() => {
            const blob = new Blob(
                [JSON.stringify(progressRef.current, null, 2)],
                { type: "application/json" },
              ),
              url = URL.createObjectURL(blob),
              a = document.createElement("a");
            a.href = url;
            a.download = `labukas-${localDay()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          onImport={async (file) => {
            try {
              persist(validateProgress(JSON.parse(await file.text())));
              notify("Backup imported. Your progress has been combined.");
              if (cloud.isConnected()) sync();
            } catch (e) {
              notify(e.message);
            }
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="Info" size={19} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
    </>
  );
}
function PageHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
function DailyGoal({ s, setSettings }) {
  const percent = Math.min(100, Math.round((s.today / s.goal) * 100));
  return (
    <section className="card daily-card">
      <div className="card-title">
        <h3>Your daily moment</h3>
        <button
          className="icon-button"
          aria-label="Change daily goal"
          onClick={setSettings.bind(null, true)}
        >
          <Icon name="Ellipsis" />
        </button>
      </div>
      <div className="goal-body">
        <div className="goal-ring" style={{ "--progress": `${percent}%` }}>
          <span>
            <Icon name={percent === 100 ? "Check" : "Sprout"} size={28} />
          </span>
        </div>
        <div>
          <strong>
            {s.today} <span>/ {s.goal}</span>
          </strong>
          <p>exercises today</p>
        </div>
      </div>
      <div className="week">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(),
            day = (d.getDay() + 6) % 7;
          d.setDate(d.getDate() - day + i);
          const done = s.days.has(localDay(d));
          return (
            <div key={i}>
              <span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
              <span
                className={`day-dot ${done ? "done" : ""} ${localDay(d) === localDay() ? "current" : ""}`}
              >
                {done ? (
                  <Icon name="Check" size={12} />
                ) : localDay(d) === localDay() ? (
                  <span />
                ) : (
                  "·"
                )}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function LearningPath({ chapterIndex, s, onStart }) {
  const ch = chapters[chapterIndex],
    steps = courseSteps.filter((step) => step.chapter === chapterIndex);
  const next = Math.max(
    0,
    steps.findIndex((step) => !s.passedSteps.has(step.id)),
  );
  const visible = steps.slice(Math.max(0, next - 1), next + 5);
  return (
    <section className="path-card">
      <div className="path-heading">
        <span className="chapter-label">
          CHAPTER {String(chapterIndex + 1).padStart(2, "0")}
        </span>
        <span className="level-label">
          {steps.filter((step) => s.passedSteps.has(step.id)).length} /{" "}
          {steps.length} LESSONS
        </span>
        <h3>{ch.title}</h3>
        <p>{ch.subtitle}</p>
      </div>
      <div className="lesson-path">
        {visible.map((step) => {
          const l = lessons.find((l) => l.id === step.classId),
            done = s.passedSteps.has(step.id),
            current = s.nextStep?.id === step.id;
          return (
            <button
              key={step.id}
              className={`lesson-row ${current ? "current" : ""} ${done ? "completed" : ""}`}
              onClick={() => onStart(l, step)}
            >
              <span className="path-node">
                <Icon
                  name={
                    done
                      ? "Check"
                      : step.phase === "checkpoint"
                        ? "Star"
                        : step.phase === "discover"
                          ? "BookOpen"
                          : step.phase === "guided"
                            ? "Puzzle"
                            : step.phase === "recall"
                              ? "Brain"
                              : "MessagesSquare"
                  }
                />
              </span>
              <span className="lesson-copy">
                <span className="lesson-overline">
                  LESSON {steps.indexOf(step) + 1}
                  {done ? " · COMPLETED" : current ? " · UP NEXT" : ""}
                </span>
                <strong>
                  {step.phase === "checkpoint" ? "Chapter check" : l.title}
                </strong>
                <small>{step.title} · ~5–8 min</small>
              </span>
              {current ? (
                <span className="start-tag">
                  Continue <Icon name="ArrowRight" size={14} />
                </span>
              ) : (
                <Icon name="ChevronRight" size={18} />
              )}
            </button>
          );
        })}
      </div>
      <p className="path-continuation">
        {steps.length} short lessons · Each class returns for guided practice,
        recall, and use.
      </p>
    </section>
  );
}
function PracticeBrowser({ s, onStart }) {
  const [group, setGroup] = useState("words"),
    [chapter, setChapter] = useState(s.nextStep?.chapter ?? 0);
  const sets = practiceSets.filter(
    (set) => set.group === group && set.chapter === chapter,
  );
  return (
    <>
      <PageHeading
        eyebrow="PRACTICE"
        title="Choose a small set."
        subtitle="Each set has a fixed scope and a finish. New words are introduced before you practise them."
      />
      <section className="practice-hero">
        <div>
          <span className="pill">FAMILIAR MATERIAL</span>
          <h2>Your review</h2>
          <p>
            Up to eight targets, chosen from your weak spots and earlier
            learning.
          </p>
          <Button onClick={() => onStart()}>
            Start practicing <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
        <Icon name="Sprout" size={90} strokeWidth={1} />
      </section>
      <div className="word-controls">
        <select
          aria-label="Practice category"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          {practiceGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <select
          aria-label="Practice chapter"
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
        >
          {chapters.map((ch, n) => (
            <option key={n} value={n}>
              Chapter {n + 1} · {ch.title}
            </option>
          ))}
        </select>
      </div>
      <div className="skills-grid">
        {sets.map((set) => {
          const seen = set.items.filter((i) => s.records[i.id]).length;
          return (
            <button
              className="skill-card"
              key={set.id}
              onClick={() => onStart(set)}
            >
              <h3>{set.title}</h3>
              <p>
                {set.items.length}{" "}
                {set.lesson.kind === "writing" ? "writing task" : "targets"} ·{" "}
                {seen} familiar
              </p>
              <div>
                <span>
                  {set.lesson.kind === "writing"
                    ? "Write and self-review"
                    : "Learn and practise this set"}
                </span>
                <Icon name="ArrowRight" size={17} />
              </div>
            </button>
          );
        })}
      </div>
      {!sets.length && (
        <p className="empty-state">
          No sets in this category for this chapter. Choose another chapter or
          category.
        </p>
      )}
    </>
  );
}
function StudyReference() {
  const [query, setQuery] = useState("");
  const sections = [
    {
      title: "Alphabet & spelling",
      note: "Č sounds like ch, š like sh, ž like the s in measure. I and u are short; į/y and ų/ū are long. I can also mark a soft consonant before another vowel.",
      headers: ["Capital", "Lowercase", "Letter name"],
      rows: alphabet,
    },
    {
      title: "Noun cases · singular",
      note: "Compare the same noun across the columns. For example: namas → name (in a house).",
      headers: caseColumns,
      rows: nounForms,
    },
    {
      title: "Noun cases · plural",
      note: "Use these alongside the singular forms to compare how endings change.",
      headers: caseColumns,
      rows: pluralForms,
    },
    {
      title: "Personal pronouns",
      note: "For example: aš (I), man (to me), mane (me). Choose the form for the role in the sentence.",
      headers: caseColumns.slice(0, 6),
      rows: pronounForms,
    },
    {
      title: "Verb forms across people",
      note: "Read across a row to compare people; compare rows to look up a tense.",
      headers: ["Verb / tense", ...verbPeople],
      rows: verbForms,
    },
    {
      title: "Numbers & agreement",
      note: "Compare counting, order, and plural numeral forms: vienas, pirmas, vieni.",
      headers: ["Number", "Cardinal", "Ordinal", "Plural numeral"],
      rows: numeralForms,
    },
  ];
  const needle = query.trim().toLocaleLowerCase("lt");
  const visible = sections
    .map((section) => ({
      ...section,
      rows:
        !needle ||
        (section.title + " " + section.headers.join(" "))
          .toLocaleLowerCase("lt")
          .includes(needle)
          ? section.rows
          : section.rows.filter((row) =>
              row.join(" ").toLocaleLowerCase("lt").includes(needle),
            ),
    }))
    .filter((section) => section.rows.length);
  return (
    <>
      <PageHeading
        eyebrow="REFERENCE"
        title="Spelling & grammar"
        subtitle="Find a topic or look up a Lithuanian form."
      />
      <div className="search">
        <Icon name="Search" />
        <input
          aria-label="Search reference"
          placeholder="Try genitive, pronouns, or a word…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="reference-topics">
        {visible.map((section, n) => (
          <details
            key={section.title}
            className="study-reference"
            open={needle ? true : undefined}
          >
            <summary>{section.title}</summary>
            <p>{section.note}</p>
            <div className="reference-scroll">
              <table>
                <thead>
                  <tr>
                    {section.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c} lang="lt">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
      {!visible.length && (
        <p>No matching forms. Try a topic name or another spelling.</p>
      )}
    </>
  );
}
function CourseChapter({ chapter, index, s, onStart }) {
  const [open, setOpen] = useState(s.next?.chapter === index),
    cls = lessons.filter((l) => l.chapter === index),
    steps = courseSteps.filter((step) => step.chapter === index),
    count = steps.filter((step) => s.passedSteps.has(step.id)).length;
  const checkpoints = steps.filter((step) => step.phase === "checkpoint");
  return (
    <section className="course-chapter">
      <button
        className="chapter-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="chapter-number">
          {count === steps.length ? (
            <Icon name="Check" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </span>
        <span>
          <strong>{chapter.title}</strong>
          <small lang="lt">{chapter.lt}</small>
        </span>
        <span className="chapter-progress">
          {cls.length} classes · {count}/{steps.length} lessons
        </span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={20} />
      </button>
      {open && (
        <div className="chapter-open">
          {cls.map((l) => {
            const sessions = classSteps(l.id),
              passed = sessions.filter((step) =>
                s.passedSteps.has(step.id),
              ).length;
            return (
              <details
                key={l.id}
                className="class-block"
                open={s.next?.id === l.id}
              >
                <summary>
                  <span>
                    <strong>{l.title}</strong>
                    <small>
                      {passed}/{sessions.length} lessons ·{" "}
                      {l.optional
                        ? "Optional appendix practice"
                        : l.kind === "writing"
                          ? "Write and self-review"
                          : l.kind === "reading"
                            ? "Read and respond"
                            : l.kind === "pattern"
                              ? "Grammar through examples"
                              : l.kind === "conversation"
                                ? "Language for a situation"
                                : "Vocabulary in use"}
                    </small>
                  </span>
                  <Icon name="ChevronDown" size={17} />
                </summary>
                <div>
                  {sessions.map((step, n) => (
                    <button key={step.id} onClick={() => onStart(l, step)}>
                      <Icon
                        name={
                          s.passedSteps.has(step.id)
                            ? "CircleCheck"
                            : "CirclePlay"
                        }
                        size={20}
                      />
                      <span>
                        <strong>
                          {n + 1}. {step.title}
                        </strong>
                        <small>
                          {step.phase === "discover"
                            ? `${step.items.length} targets, used in several ways`
                            : step.phase === "recall"
                              ? "Retrieve with less support"
                              : step.phase === "apply"
                                ? "Combine and use what you know"
                                : "Build, choose, and practise"}
                        </small>
                      </span>
                      <Icon name="ArrowRight" size={16} />
                    </button>
                  ))}
                </div>
              </details>
            );
          })}
          {checkpoints.map((checkpoint) => (
            <button
              key={checkpoint.id}
              onClick={() =>
                onStart(
                  lessons.find((l) => l.id === checkpoint.classId),
                  checkpoint,
                )
              }
            >
              <Icon
                name={s.passedSteps.has(checkpoint.id) ? "CircleCheck" : "Star"}
              />
              <span>
                <strong>{checkpoint.title}</strong>
                <small>A short mixed check · 80% first-attempt goal</small>
              </span>
              <Icon name="ArrowRight" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
function WordCollection({ s, onPractice }) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("learned");
  const collection = items.filter(
    (i) =>
      (filter === "all" || Boolean(s.records[i.id])) &&
      (filter !== "weak" || s.records[i.id]?.streak < 2) &&
      `${i.lt} ${i.en} ${skills[i.skill]}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="YOUR GROWING COLLECTION"
        title="Words that open doors."
        subtitle="Every word and pattern you meet has a place here. See what’s sticking and what needs another look."
      />
      <div className="word-controls">
        <div className="search">
          <Icon name="Search" size={19} />
          <input
            aria-label="Search words"
            placeholder="Find a word, meaning, or case…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter words"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="learned">Encountered words</option>
          <option value="weak">Needs practice</option>
          <option value="all">Full course collection</option>
        </select>
      </div>
      {collection.length ? (
        <div className="word-table">
          <div className="word-table-head">
            <span>LITHUANIAN / ENGLISH</span>
            <span>FOCUS</span>
            <span>FAMILIARITY</span>
          </div>
          {collection.map((i) => {
            const r = s.records[i.id];
            return (
              <button
                key={i.id}
                className="word-table-row"
                onClick={() => onPractice(wordPracticeSet(i))}
              >
                <span>
                  <strong lang="lt">{i.lt}</strong>
                  <small>{i.en}</small>
                </span>
                <span className="skill-tag">{skills[i.skill]}</span>
                <span
                  className="familiarity"
                  title={
                    r
                      ? `${r.correct} of ${r.seen} correct`
                      : "Not practiced yet"
                  }
                >
                  {[1, 2, 3, 4].map((n) => (
                    <i key={n} className={r?.streak >= n ? "filled" : ""} />
                  ))}
                  <small>
                    {r ? (r.streak >= 3 ? "Settling in" : "Growing") : "New"}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="Sprout" size={48} />
          <h2>
            {query ? "No words found" : "Your collection starts with a labas."}
          </h2>
          <p>
            {query
              ? "Try a different spelling or change the filter."
              : "Words will appear here as you learn. You can also explore the full course collection above."}
          </p>
          <Button onClick={() => onPractice()}>
            Practice a little <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      )}
    </>
  );
}
function Session({ config, progressRef, onEvent, onClose, onContinue }) {
  const [intro, setIntro] = useState(Boolean(config.lesson)),
    [introduced, setIntroduced] = useState(null),
    [selfChecked, setSelfChecked] = useState(false),
    [attempts, setAttempts] = useState([]),
    [paused, setPaused] = useState(false),
    [queue, setQueue] = useState(config.queue),
    [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(() =>
      config.queue[0]?.activity === "writing"
        ? [...progressRef.current.events]
            .sort((a, b) => b.at - a.at)
            .find((e) => e.item === config.queue[0].id && e.selfAssessed)
            ?.draft || ""
        : "",
    ),
    [selected, setSelected] = useState([]),
    [feedback, setFeedback] = useState(null),
    [hint, setHint] = useState(false),
    [usedHint, setUsedHint] = useState(false),
    [done, setDone] = useState(false),
    [exit, setExit] = useState(false),
    [results, setResults] = useState([]),
    [left, setLeft] = useState(null),
    [matched, setMatched] = useState([]),
    [mismatch, setMismatch] = useState(false),
    [matchError, setMatchError] = useState("");
  const inputRef = useRef(),
    sessionRef = useRef();
  const item = queue[index];
  const ex = React.useMemo(
    () =>
      item
        ? exerciseFor(item, stats(progressRef.current).records[item.id] || {})
        : null,
    [item, index],
  );
  useEffect(() => {
    const prev = document.activeElement;
    document.body.style.overflow = "hidden";
    sessionRef.current?.querySelector("button")?.focus();
    function trap(e) {
      if (e.key !== "Tab") return;
      const root =
        sessionRef.current?.querySelector("[role=alertdialog]") ||
        sessionRef.current;
      const els = [
        ...root.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary",
        ),
      ];
      const first = els[0],
        last = els.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", trap);
      prev?.focus();
    };
  }, []);
  useEffect(() => {
    sessionRef.current?.scrollTo(0, 0);
    sessionRef.current?.querySelector(".session-content")?.scrollTo(0, 0);
  }, [index, intro, done]);
  useEffect(() => {
    if (!intro && !done && ["type", "cloze"].includes(ex?.type))
      inputRef.current?.focus();
  }, [index, intro, done]);
  function reset() {
    setAnswer("");
    setSelfChecked(false);
    setSelected([]);
    setFeedback(null);
    setHint(false);
    setUsedHint(false);
    setLeft(null);
    setMatched([]);
    setMismatch(false);
    setMatchError("");
  }
  function check(e) {
    e?.preventDefault();
    if (feedback) {
      if (feedback.writing && !selfChecked) return;
      next();
      return;
    }
    if (!canCheck) return;
    if (ex.type === "writing") {
      onEvent("answer", {
        item: item.id,
        correct: true,
        stage: 0,
        selfAssessed: true,
        draft: answer,
        ...(config.step ? { step: config.step.id } : {}),
      });
      setAttempts((a) => [
        ...a,
        { item: item.id, correct: true, stage: 0, targetStage: 0 },
      ]);
      setResults((r) => [...r, true]);
      setFeedback({ writing: true, correct: true, mastered: false });
      return;
    }
    const correct =
      ex.type === "match"
        ? !mismatch
        : isCorrect(
            ex.type === "order"
              ? selected.map((t) => t.text).join(" ")
              : answer,
            ex,
          );
    const mastered = correct && !usedHint;
    onEvent("answer", {
      item: item.id,
      correct: mastered,
      stage: ex.stage,
      ...(config.step ? { step: config.step.id, taskId: item.taskId } : {}),
    });
    setAttempts((a) => [
      ...a,
      {
        item: item.id,
        correct: mastered,
        stage: ex.stage,
        targetStage: item.taskStage ?? ex.stage,
      },
    ]);
    setResults((r) => [...r, mastered]);
    setFeedback({ correct, mastered });
    if (
      !mastered ||
      (item.taskStage !== undefined && ex.stage < item.taskStage)
    )
      setQueue((q) => [...q, item]);
  }
  function next() {
    reset();
    if (
      index + 1 >= Math.max(24, config.queue.length + 6) &&
      index + 1 < queue.length
    ) {
      setPaused(true);
      setDone(true);
      return;
    }
    if (index + 1 >= queue.length) {
      if (config.step) {
        const outcome = sessionOutcome(config.step, attempts);
        if (outcome.passed)
          onEvent("lessonPass", {
            lesson: config.lesson.id,
            step: config.step.id,
            ...outcome,
          });
        else setPaused(true);
      }
      setDone(true);
    } else setIndex((i) => i + 1);
  }
  function match(id) {
    if (!left) return;
    if (id === left) {
      setMatched((a) => [...a, id]);
      setLeft(null);
      setMatchError("");
    } else {
      setMismatch(true);
      setMatchError("Not quite — try another meaning.");
      setLeft(null);
    }
  }
  function letter(c) {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? answer.length,
      end = input.selectionEnd ?? answer.length;
    setAnswer(answer.slice(0, start) + c + answer.slice(end));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    });
  }
  const canCheck =
    ex?.type === "match"
      ? matched.length === ex.pairs.length
      : ex?.type === "order"
        ? selected.length > 0
        : answer.trim().length > 0;
  const source = lessons.find((l) => l.id === item?.lesson);
  const successful = results.filter(Boolean).length;
  const title =
    config.title ||
    (config.lesson
      ? config.mode === "review"
        ? `A little more practice: ${config.lesson.title}`
        : config.lesson.title
      : config.skill === "all"
        ? "Your daily mix"
        : `${skills[config.skill]} practice`);
  const classSessions = config.lesson ? classSteps(config.lesson.id) : [];
  const classPosition = config.step
    ? classSessions.findIndex((s) => s.id === config.step.id) + 1
    : 0;
  const chapterTitle = config.lesson
    ? `Chapter ${config.lesson.chapter + 1} · ${chapters[config.lesson.chapter].title}`
    : "Practice · Your review";
  const headerLabel = config.step
    ? `Chapter ${config.lesson.chapter + 1} - ${config.step.phase === "checkpoint" ? config.step.title : `Lesson ${classPosition} of ${classSessions.length}`}`
    : "Practice";
  const firstLessonVisit =
    config.lesson &&
    !config.lesson.items.some((i) => stats(progressRef.current).records[i.id]);
  useEffect(() => {
    function advance(e) {
      if (
        e.key !== "Enter" ||
        e.repeat ||
        e.isComposing ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        exit
      )
        return;
      if (e.target.closest("textarea, select, summary, a, [role=alertdialog]"))
        return;
      e.preventDefault();
      if (done) {
        (config.mode === "practice" ? onClose : onContinue)();
        return;
      }
      if (intro) {
        setIntro(false);
        return;
      }
      if (
        !["reading", "writing"].includes(item?.activity) &&
        !stats(progressRef.current).records[item.id]?.seen &&
        introduced !== index
      ) {
        setIntroduced(index);
        return;
      }
      check();
    }
    document.addEventListener("keydown", advance);
    return () => document.removeEventListener("keydown", advance);
  });
  useEffect(() => {
    const viewport = window.visualViewport;
    function resize() {
      sessionRef.current?.style.setProperty(
        "--session-height",
        `${viewport?.height || window.innerHeight}px`,
      );
      sessionRef.current?.style.setProperty(
        "--session-top",
        `${viewport?.offsetTop || 0}px`,
      );
    }
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
    };
  }, []);
  return (
    <div
      className="session"
      ref={sessionRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-session-mode={config.mode}
      data-course-step={config.step?.id}
    >
      <div className="session-top">
        <button
          className="icon-button"
          aria-label="Close lesson"
          onClick={() => (results.length && !done ? setExit(true) : onClose())}
        >
          <Icon name="X" size={25} />
        </button>
        <div className="session-top-middle">
          <span>{headerLabel}</span>
          <div className="progress-track">
            <div
              style={{
                width: `${done ? 100 : intro ? 0 : (index / queue.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <span className="session-count">
          {intro
            ? `${config.queue.length} exercises`
            : done
              ? paused
                ? "Saved"
                : "Complete"
              : `${index + 1} / ${queue.length}`}
        </span>
      </div>
      {done ? (
        <div className="session-content summary">
          <span className="celebration">
            <Icon name="PartyPopper" size={54} />
          </span>
          <span className="eyebrow">
            {paused
              ? "LET’S TAKE A SMALLER STEP"
              : config.mode === "lesson"
                ? "LESSON COMPLETE"
                : "A LITTLE STRONGER THAN BEFORE"}
          </span>
          <h1>
            {paused
              ? "Progress saved."
              : config.step
                ? `${config.step.title} complete.`
                : "Practice complete."}
          </h1>
          <p>
            {config.lesson?.kind === "writing"
              ? "Your draft and self-review are saved. This workshop does not award an automatic grammar score."
              : paused
                ? "Your progress is saved. We’ll revisit this lesson with more support before moving on."
                : config.mode === "lesson" &&
                    sessionOutcome(config.step, attempts).reinforce.length
                  ? "Some of this was tricky. We’ve saved the weak spots for review; you can continue your course."
                  : config.mode === "lesson"
                    ? `You finished ${config.step.title.toLowerCase()}.`
                    : `${config.targets || new Set(config.queue.map((i) => i.id)).size} targets practised in ${results.length} exercises.`}
          </p>
          <div className="summary-stats">
            <div>
              <Icon name="Sparkles" />
              <strong>
                {successful * 10 + (results.length - successful) * 2}
              </strong>
              <span>XP earned</span>
            </div>
            <div>
              <Icon name="Target" />
              <strong>
                {results.length
                  ? config.lesson?.kind === "writing"
                    ? "✓"
                    : Math.round((successful / results.length) * 100)
                  : 0}
                {config.lesson?.kind === "writing" ? "" : "%"}
              </strong>
              <span>
                {config.lesson?.kind === "writing"
                  ? "self-reviewed, not graded"
                  : "without help"}
              </span>
            </div>
            <div>
              <Icon name="CheckCheck" />
              <strong>{results.length}</strong>
              <span>exercises</span>
            </div>
          </div>
          {config.step && (
            <p className="subtle">
              {title} ·{" "}
              {
                classSessions.filter((step) =>
                  stats(progressRef.current).passedSteps.has(step.id),
                ).length
              }{" "}
              of {classSessions.length} lessons complete
            </p>
          )}
          {config.mode !== "practice" && (
            <p className="next-course-preview">
              {stats(progressRef.current).nextStep
                ? `Next in your course: ${stats(progressRef.current).next.title} · ${stats(progressRef.current).nextStep.title}`
                : "You’ve finished every course lesson."}
            </p>
          )}
          <Button onClick={config.mode === "practice" ? onClose : onContinue}>
            {config.mode === "practice"
              ? "Back to your journey"
              : stats(progressRef.current).nextStep
                ? "Continue course"
                : "View completed course"}
            <Icon name="ArrowRight" size={18} />
          </Button>
          {config.mode !== "practice" && (
            <Button secondary onClick={onClose}>
              Back to your journey
            </Button>
          )}
          {config.mode === "practice" && (
            <Button
              secondary
              onClick={() => {
                reset();
                setQueue(
                  practiceSession(
                    progressRef.current,
                    config.practiceSet || "all",
                  ).queue,
                );
                setAttempts([]);
                setPaused(false);
                setIndex(0);
                setResults([]);
                setDone(false);
              }}
            >
              Practise another round
            </Button>
          )}
        </div>
      ) : intro ? (
        <div className="session-content lesson-intro">
          <span className="card-icon green">
            <Icon name="BookOpen" size={27} />
          </span>
          <span className="eyebrow">{chapterTitle}</span>
          <h1>{title}</h1>
          {config.step && (
            <div className="session-phase">
              <strong>{config.step.title}</strong>
              <span>
                {config.step.phase === "checkpoint"
                  ? "Use what you have learned across this chapter. Aim for 80% on your first attempts."
                  : `Session ${classSteps(config.lesson.id).findIndex((s) => s.id === config.step.id) + 1} of ${classSteps(config.lesson.id).length} in this class`}
              </span>
            </div>
          )}
          {firstLessonVisit && config.step?.phase !== "checkpoint" && (
            <div className="rule-box">
              <Icon name="Lightbulb" size={23} />
              <p>{config.lesson.rule}</p>
            </div>
          )}
          {!["reading", "writing"].includes(config.lesson.kind) &&
            !["recall", "checkpoint"].includes(config.step?.phase) &&
            (config.step?.phase !== "apply" ||
              config.step.items.some((i) => i.role === "context")) && (
              <>
                <h3>
                  {config.step?.phase === "discover"
                    ? "A small set to learn and use"
                    : "Bring these words back"}
                </h3>
                <div className="intro-words">
                  {(config.step?.phase === "apply"
                    ? config.step.items.filter((i) => i.role === "context")
                    : config.practiceSet?.items ||
                      config.step?.items ||
                      config.lesson.items
                  ).map((i) => (
                    <div key={i.id}>
                      <strong lang="lt">{i.lt}</strong>
                      <span>{i.en}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          <Button onClick={() => setIntro(false)}>
            Let’s try it
            <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      ) : !["reading", "writing"].includes(item.activity) &&
        !stats(progressRef.current).records[item.id]?.seen &&
        introduced !== index ? (
        <div className="session-content lesson-intro first-look">
          <span className="eyebrow">
            {source.kind === "pattern"
              ? "A WORKED EXAMPLE"
              : source.kind === "conversation"
                ? "SOMETHING TO SAY"
                : "MEET A NEW WORD OR PHRASE"}
          </span>
          {source.kind !== "vocabulary" && (
            <p className="first-look-context">{source.rule}</p>
          )}
          <h1 lang="lt">{item.lt}</h1>
          <p>{item.en}</p>
          <Button onClick={() => setIntroduced(index)}>
            Try it <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      ) : (
        <>
          <form
            className="session-content exercise"
            data-item-id={item.id}
            data-stage={ex.stage}
            data-exercise-type={ex.type}
            onSubmit={check}
          >
            <div className="exercise-eyebrow">
              <span className="eyebrow">
                {item.activity === "writing"
                  ? "WRITE AND REVIEW"
                  : item.activity === "reading"
                    ? "READ AND RESPOND"
                    : ex.type === "choice"
                      ? "CHOOSE THE TRANSLATION"
                      : ex.type === "order"
                        ? "BUILD THE SENTENCE"
                        : ex.type === "match"
                          ? "FIND THE PAIRS"
                          : ex.type === "cloze"
                            ? "COMPLETE THE SENTENCE"
                            : "WRITE IN LITHUANIAN"}
              </span>
              <span className="skill-tag">
                {config.step && !config.step.items.some((i) => i.id === item.id)
                  ? "Earlier review"
                  : skills[item.skill]}
              </span>
            </div>
            <h1>
              {item.activity === "writing"
                ? "Write your own message."
                : item.activity === "reading"
                  ? "Use the information in the text."
                  : ex.isGap
                    ? "Which form fits here?"
                    : ex.type === "match"
                      ? "Match the words and meanings."
                      : ex.type === "cloze"
                        ? "Find the missing word."
                        : ex.type === "order"
                          ? "Put the words in order."
                          : ex.reverse
                            ? "What does this mean?"
                            : "How would you say this?"}
            </h1>
            {ex.passage && (
              <div className="reading-passage" lang="lt">
                <span className="eyebrow">SKAITYK · READ</span>
                <p>{ex.passage}</p>
              </div>
            )}
            {ex.type !== "match" && (
              <div className="question-bubble">
                <span className="question-avatar">
                  <WindowMark />
                </span>
                <div>
                  <small>
                    {ex.type === "cloze" || ex.isGap
                      ? "COMPLETE IN LITHUANIAN"
                      : ex.reverse
                        ? "LITHUANIAN · CHOOSE THE ENGLISH MEANING"
                        : "ENGLISH"}
                  </small>
                  <p
                    lang={
                      ex.type === "cloze" || ex.isGap || ex.reverse
                        ? "lt"
                        : "en"
                    }
                  >
                    {ex.type === "cloze" ? item.cloze : ex.prompt}
                  </p>
                  {(ex.type === "cloze" || ex.isGap) && <span>{item.en}</span>}
                </div>
              </div>
            )}
            {ex.type === "choice" && (
              <div className="answer-options">
                {ex.options.map((option, i) => (
                  <button
                    type="button"
                    disabled={Boolean(feedback)}
                    key={option}
                    className={answer === option ? "selected" : ""}
                    onClick={() => setAnswer(option)}
                  >
                    <span>{i + 1}</span>
                    <strong lang={ex.reverse ? "en" : "lt"}>{option}</strong>
                    {answer === option && <Icon name="CircleCheck" size={21} />}
                  </button>
                ))}
              </div>
            )}
            {ex.type === "writing" && (
              <>
                <label className="answer-label" htmlFor="answer">
                  Your message ·{" "}
                  {answer.trim().split(/\s+/).filter(Boolean).length} words
                </label>
                <textarea
                  id="answer"
                  ref={inputRef}
                  className="typed-answer writing-answer"
                  rows={7}
                  maxLength={5000}
                  value={answer}
                  disabled={Boolean(feedback)}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write in Lithuanian…"
                />
                <div className="letter-keys" aria-label="Lithuanian letters">
                  {"ąčęėįšųūž".split("").map((c) => (
                    <button
                      type="button"
                      key={c}
                      disabled={Boolean(feedback)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => letter(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <ul className="writing-rubric">
                  {item.rubric.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {feedback && (
                  <div className="reading-passage">
                    <span className="eyebrow">ONE POSSIBLE EXAMPLE</span>
                    <p lang="lt">{item.lt}</p>
                    <label>
                      <input
                        type="checkbox"
                        checked={selfChecked}
                        onChange={(e) => setSelfChecked(e.target.checked)}
                      />{" "}
                      I compared my draft with the checklist and example.
                    </label>
                  </div>
                )}
              </>
            )}
            {["type", "cloze"].includes(ex.type) && (
              <>
                <label className="answer-label" htmlFor="answer">
                  {ex.type === "cloze"
                    ? "The missing word"
                    : item.activity === "reading"
                      ? "Your short answer"
                      : "Your translation"}
                </label>
                <input
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  id="answer"
                  ref={inputRef}
                  className="typed-answer"
                  disabled={Boolean(feedback)}
                  placeholder="Type in Lithuanian…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="letter-keys" aria-label="Lithuanian letters">
                  {"ąčęėįšųūž".split("").map((c) => (
                    <button
                      type="button"
                      key={c}
                      disabled={Boolean(feedback)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => letter(c)}
                    >
                      {c}
                    </button>
                  ))}
                  <span>Lietuviškos raidės</span>
                </div>
              </>
            )}
            {ex.type === "order" && (
              <>
                <div className="sentence-slots" aria-label="Your sentence">
                  {selected.length ? (
                    selected.map((t) => (
                      <button
                        type="button"
                        disabled={Boolean(feedback)}
                        key={t.id}
                        onClick={() =>
                          setSelected((s) => s.filter((x) => x.id !== t.id))
                        }
                      >
                        {t.text}
                        <Icon name="X" size={12} />
                      </button>
                    ))
                  ) : (
                    <span>Tap the words below to build a sentence</span>
                  )}
                </div>
                <div className="word-tiles">
                  {ex.tokens.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      disabled={
                        Boolean(feedback) || selected.some((x) => x.id === t.id)
                      }
                      onClick={() => setSelected((s) => [...s, t])}
                      lang="lt"
                    >
                      {t.text}
                    </button>
                  ))}
                </div>
              </>
            )}
            {ex.type === "match" && (
              <>
                <div className="matching-grid">
                  <div>
                    {ex.pairs.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={
                          matched.includes(p.id)
                            ? "matched"
                            : left === p.id
                              ? "selected"
                              : ""
                        }
                        disabled={Boolean(feedback) || matched.includes(p.id)}
                        onClick={() => {
                          setLeft(p.id);
                          setMatchError("");
                        }}
                        lang="lt"
                      >
                        {p.lt}
                        {matched.includes(p.id) && (
                          <Icon name="Check" size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                  <div>
                    {ex.right.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={matched.includes(p.id) ? "matched" : ""}
                        disabled={Boolean(feedback) || matched.includes(p.id)}
                        onClick={() => match(p.id)}
                      >
                        {p.en}
                      </button>
                    ))}
                  </div>
                </div>
                <p role="status" className="match-message">
                  {matchError}
                </p>
              </>
            )}
            {!feedback && ex.type !== "writing" && (
              <button
                type="button"
                className="hint-button"
                onClick={() => {
                  setHint(!hint);
                  setUsedHint(true);
                }}
              >
                <Icon name="Lightbulb" size={16} />
                {hint ? "Hide explanation" : "A little help?"}
              </button>
            )}
            {hint && (
              <div className="exercise-hint">
                <p>{source.rule}</p>
                {skillNotes[item.skill] && <p>{skillNotes[item.skill]}</p>}
                <strong lang="lt">{item.lt}</strong>
                <span>We’ll revisit this without a hint to help it stick.</span>
              </div>
            )}
            <div
              className={`answer-footer ${feedback ? (feedback.mastered ? "correct" : "retry") : ""}`}
            >
              <div>
                {feedback ? (
                  <>
                    <strong>
                      <Icon
                        name={feedback.mastered ? "CircleCheck" : "Lightbulb"}
                        size={24}
                      />
                      {feedback.writing
                        ? "Draft saved. Review your message above."
                        : feedback.mastered
                          ? [
                              "Puikiai! Excellent.",
                              "Taip! That’s right.",
                              "Nicely done.",
                            ][index % 3]
                          : feedback.correct
                            ? "You’ve got it — let’s try without help later."
                            : "A small mistake. A useful lesson."}
                    </strong>
                    {!feedback.mastered && !feedback.writing && (
                      <>
                        <p>
                          Answer: <b lang="lt">{ex.answer}</b>
                          {ex.type === "match"
                            ? " · We’ll revisit these pairs."
                            : ""}
                        </p>
                        {item.explanation && (
                          <p className="feedback-explanation">
                            {item.explanation}
                          </p>
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </div>
              <Button
                type="submit"
                disabled={
                  (!feedback && !canCheck) ||
                  (feedback?.writing && !selfChecked)
                }
              >
                {feedback
                  ? "Continue"
                  : ex.type === "writing"
                    ? "Compare my draft"
                    : "Check answer"}
                <Icon name="ArrowRight" size={18} />
              </Button>
            </div>
          </form>
        </>
      )}
      {exit && (
        <div className="modal-backdrop">
          <div
            className="modal small-modal"
            role="alertdialog"
            aria-label="Leave this lesson?"
          >
            <h2>Pause for now?</h2>
            <p>
              Your answers are saved. This lesson will start from the beginning
              when you return.
            </p>
            <Button onClick={() => setExit(false)}>Keep learning</Button>
            <Button secondary onClick={onClose}>
              Save & leave
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
function Settings({
  onClose,
  s,
  user,
  configured,
  connect,
  resendConfirmation,
  syncing,
  sync,
  syncStatus,
  disconnect,
  onGoal,
  onExport,
  onImport,
}) {
  const ref = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    function key(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = ref.current.querySelectorAll("button,input,select,a[href]"),
          first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal settings-modal"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-heading">
          <h2 id="settings-title">Make yourself at home.</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            <Icon name="X" />
          </button>
        </div>
        <p>Your pace. Your progress. Your devices.</p>
        <div className="settings-section">
          <h3>
            <Icon name="Sprout" size={20} />
            Your daily goal
          </h3>
          <p>A gentle nudge to show up, with no lost hearts or limits.</p>
          <div className="goal-options">
            {[5, 10, 15, 20].map((v) => (
              <button
                key={v}
                className={s.goal === v ? "selected" : ""}
                onClick={() => onGoal(v)}
              >
                {v}
                <small>exercises</small>
              </button>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <h3>
            <Icon name="Cloud" size={21} />
            Take your progress with you
          </h3>
          <p>
            Sign in with the same Labukas account on your phone and computer.
            Your private progress stays available on every device.
          </p>
          <div className="sync-info">
            <span className="green-dot" />
            {syncStatus}
          </div>
          {!configured ? (
            <p className="subtle">
              Cloud sync will become available after this deployment is linked
              to its database.
            </p>
          ) : !user ? (
            <form
              className="cloud-login"
              onSubmit={async (e) => {
                e.preventDefault();
                const connected = await connect(email, password, creating);
                if (connected) setPassword("");
              }}
            >
              <label htmlFor="account-email">Email</label>
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="account-password">Password</label>
              <input
                id="account-password"
                type="password"
                autoComplete={creating ? "new-password" : "current-password"}
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" disabled={syncing}>
                <Icon name="Cloud" size={18} />
                {syncing
                  ? "Connecting…"
                  : creating
                    ? "Create account"
                    : "Sign in & sync"}
              </Button>
              <button
                type="button"
                className="text-button"
                onClick={() => setCreating((value) => !value)}
              >
                {creating
                  ? "Already have an account? Sign in"
                  : "First time here? Create an account"}
              </button>
              {creating && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => resendConfirmation(email)}
                >
                  Resend verification email
                </button>
              )}
            </form>
          ) : (
            <>
              <p className="subtle">Signed in as {user.email}</p>
              <div className="button-row">
                <Button disabled={syncing} onClick={sync}>
                  <Icon name="RefreshCw" size={17} />
                  {syncing ? "Syncing…" : "Sync now"}
                </Button>
                <Button secondary onClick={disconnect}>
                  Sign out
                </Button>
              </div>
            </>
          )}
          <p className="subtle">
            Progress also saves on this device after every answer, including
            while you are offline.
          </p>
        </div>
        <div className="settings-section">
          <h3>
            <Icon name="Archive" size={19} />A copy for safekeeping
          </h3>
          <p>Export a backup, or combine one with your current progress.</p>
          <div className="button-row">
            <Button secondary onClick={onExport}>
              <Icon name="Download" size={16} />
              Export backup
            </Button>
            <label className="button secondary import-button">
              <Icon name="Upload" size={16} />
              Import backup
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  if (e.target.files?.[0]) onImport(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* Online use and local saving remain available. */
    }),
  );
}
