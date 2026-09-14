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
