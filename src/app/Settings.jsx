import { useState, useRef, useEffect } from "react";
import { Icon, Button } from "../components/Controls.jsx";
export default function Settings({
  onClose,
  notice,
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
    ref.current?.focus({ preventScroll: true });
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
      prev?.focus({ preventScroll: true });
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
        {notice && <p role="status">{notice}</p>}
        <div className="settings-section">
          <h3>
            <Icon name="Sprout" size={20} />
            Your daily goal
          </h3>
          <p>A gentle nudge to show up.</p>
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
            Sign in with the same Sakyk account on your phone and computer. Your
            private progress stays available on every device.
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
