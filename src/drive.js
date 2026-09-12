import {
  emptyProgress,
  mergeProgress,
  validateProgress,
  newId,
} from "./engine.js";
const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
let token = "",
  expires = 0;
export const isConnected = () => Boolean(token && Date.now() < expires);
export function disconnect() {
  token = "";
  expires = 0;
}
let loading;
export function loadGoogle() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!loading)
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(
          new Error(
            "Google could not load. Check your internet connection and try again.",
          ),
        );
      };
      document.head.appendChild(script);
    });
  return loading;
}
export function connect(clientId) {
  if (!clientId?.endsWith(".apps.googleusercontent.com"))
    return Promise.reject(
      new Error(
        "Add your Google OAuth client ID first. Setup instructions are in the README.",
      ),
    );
  if (!window.google?.accounts?.oauth2)
    return Promise.reject(
      new Error("Google is still loading. Please try Connect again."),
    );
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (r) => {
        if (r.error || !r.access_token)
          return reject(
            new Error(
              r.error_description ||
                r.error ||
                "Google did not provide access.",
            ),
          );
        if (!window.google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE))
          return reject(
            new Error(
              "Please allow access to Labukas app data to sync progress.",
            ),
          );
        token = r.access_token;
        expires = Date.now() + Number(r.expires_in) * 1000;
        resolve();
      },
      error_callback: (r) =>
        reject(
          new Error(
            r.type === "popup_closed"
              ? "Connection cancelled. Your progress is still saved on this device."
              : "Google could not open. Allow popups and try again.",
          ),
        ),
    });
    client.requestAccessToken();
  });
}
async function request(url, options = {}) {
  if (!isConnected())
    throw new Error(
      "Reconnect Google Drive to sync. Your progress is saved on this device.",
    );
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) {
    if (response.status === 401) disconnect();
    throw new Error(
      response.status === 401
        ? "Your Google connection expired. Reconnect to sync."
        : `Drive sync failed (${response.status}). Your local progress is safe; try again.`,
    );
  }
  return response.json();
}
let chain = Promise.resolve();
export function syncDrive(local) {
  // Immutable batches avoid last-write-wins data loss when two devices sync together.
  const run = async () => {
    let cloud = emptyProgress(),
      page = "";
    do {
      const query = new URLSearchParams({
        spaces: "appDataFolder",
        q: "trashed = false and name contains 'labukas-v1-'",
        fields: "nextPageToken,files(id)",
        pageSize: "100",
        ...(page ? { pageToken: page } : {}),
      });
      const result = await request(
        `https://www.googleapis.com/drive/v3/files?${query}`,
      );
      for (let start = 0; start < (result.files || []).length; start += 6) {
        const chunk = await Promise.all(
          result.files
            .slice(start, start + 6)
            .map((f) =>
              request(
                `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(f.id)}?alt=media`,
              ),
            ),
        );
        cloud = mergeProgress(cloud, ...chunk.map(validateProgress));
      }
      page = result.nextPageToken;
    } while (page);
    const merged = mergeProgress(cloud, local);
    const known = new Set(cloud.events.map((e) => e.id));
    const pending = local.events.filter((e) => !known.has(e.id));
    if (pending.length) {
      const boundary = `labukas_${newId()}`;
      const metadata = {
        name: `labukas-v1-${newId()}.json`,
        parents: ["appDataFolder"],
        mimeType: "application/json",
      };
      const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({ version: 1, events: pending })}\r\n--${boundary}--`;
      await request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        {
          method: "POST",
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        },
      );
    }
    return merged;
  };
  const result = chain.then(run, run);
  chain = result.catch(() => {});
  return result;
}
