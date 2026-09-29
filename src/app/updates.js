let busy = true;
let pending = false;
let reloading = false;
function applyUpdate() {
  if (
    pending &&
    !busy &&
    !reloading &&
    document.visibilityState === "visible"
  ) {
    reloading = true;
    window.location.reload();
  }
}
export function setUpdateBusy(value) {
  busy = value;
  applyUpdate();
}
export function installAppUpdates() {
  const loadedVersion = document.querySelector(
    'meta[name="app-version"]',
  )?.content;
  const checkVersion = async () => {
    if (!loadedVersion || document.visibilityState !== "visible") return;
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const { version } = await response.json();
      if (version && version !== loadedVersion) {
        pending = true;
        applyUpdate();
      }
    } catch {
      /* Offline: keep the current session. */
    }
  };
  window.addEventListener("pageshow", checkVersion);
  window.addEventListener("online", checkVersion);
  document.addEventListener("visibilitychange", checkVersion);
  setInterval(checkVersion, 60000);
  checkVersion();
  if (!("serviceWorker" in navigator)) return;
  let controlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (controlled) {
      pending = true;
      applyUpdate();
    }
    controlled = true;
  });
  navigator.serviceWorker
    .register("/sw.js", { updateViaCache: "none" })
    .then((registration) => {
      const check = () => {
        if (document.visibilityState === "visible") {
          registration.update().catch(() => {});
          applyUpdate();
        }
      };
      window.addEventListener("online", check);
      document.addEventListener("visibilitychange", check);
      setInterval(check, 5 * 60 * 1000);
      check();
    })
    .catch(() => {
      /* Local progress and online use remain available. */
    });
}
