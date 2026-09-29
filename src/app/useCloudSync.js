import { useState, useEffect, useCallback, useRef } from "react";
import * as cloud from "../progress/cloud.js";
import * as progress from "../progress/store.js";
export function useCloudSync(ready, active) {
  const [user, setUser] = useState(null),
    [syncing, setSyncing] = useState(false),
    [syncStatus, setSyncStatus] = useState("Saved on this device");
  const busy = useRef(false);
  const sync = useCallback(async () => {
    if (!cloud.isConnected() || busy.current) return;
    busy.current = true;
    setSyncing(true);
    setSyncStatus("Syncing…");
    try {
      await progress.flush();
      await progress.applySync(
        await cloud.syncCloud(progress.exportProgress()),
      );
      setSyncStatus("Progress synced");
    } catch (e) {
      setSyncStatus(e.message);
    } finally {
      busy.current = false;
      setSyncing(false);
    }
  }, []);
  useEffect(() => {
    let dispose,
      cancelled = false;
    cloud
      .initialize((next) => {
        if (!cancelled) setUser(next);
      })
      .then((fn) => {
        if (cancelled) fn();
        else dispose = fn;
      })
      .catch((e) => setSyncStatus(e.message));
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);
  useEffect(() => {
    if (!ready || !user || active) return;
    sync();
    const onOnline = () => sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [ready, user, active, sync]);
  async function connect(email, password, creating) {
    setSyncing(true);
    try {
      if (creating) {
        const result = await cloud.signUp(email, password);
        if (!result.signedIn) {
          setSyncStatus(
            "Check your email to confirm your account, then sign in.",
          );
          return false;
        }
      } else await cloud.signIn(email, password);
      setUser(cloud.currentUser());
      await sync();
      return true;
    } catch (e) {
      setSyncStatus(e.message);
      return false;
    } finally {
      setSyncing(false);
    }
  }
  return {
    user,
    syncing,
    syncStatus,
    sync,
    connect,
    configured: cloud.isConfigured(),
    resendConfirmation: async (email) => {
      try {
        await cloud.resendConfirmation(email);
        setSyncStatus("Verification email sent.");
      } catch (e) {
        setSyncStatus(e.message);
      }
    },
    disconnect: async () => {
      try {
        await cloud.disconnect();
        setUser(null);
        setSyncStatus("Saved on this device");
      } catch (e) {
        setSyncStatus(e.message);
      }
    },
  };
}
