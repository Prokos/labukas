import { createClient } from "@supabase/supabase-js";
import { emptyProgress, mergeProgress, validateProgress } from "./engine.js";

const environment = import.meta.env || {};
// Supabase publishable keys identify a frontend project; authorization is
// enforced by the database's row-level security policies.
const url =
  environment.VITE_SUPABASE_URL || "https://kgwrvokfngprnefhfqmr.supabase.co";
const publishableKey =
  environment.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_lfzMIk2iOwMs_I5Fve0jng_iCLeqS4L";
const configured = Boolean(url && publishableKey);
const supabase = configured
  ? createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

let session = null;
let chain = Promise.resolve();

export const isConfigured = () => configured;
export const isConnected = () => Boolean(session?.user);
export const currentUser = () => session?.user || null;

function requireClient() {
  if (!supabase)
    throw new Error(
      "Cloud sync is not configured yet. Add the Supabase project settings and redeploy.",
    );
  return supabase;
}

export async function initialize(onChange) {
  const client = requireClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  session = data.session;
  onChange?.(currentUser());
  const { data: listener } = client.auth.onAuthStateChange((_event, next) => {
    session = next;
    onChange?.(currentUser());
  });
  return () => listener.subscription.unsubscribe();
}

export async function signIn(email, password) {
  const { data, error } = await requireClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  session = data.session;
  return data.user;
}

export async function signUp(email, password) {
  const { data, error } = await requireClient().auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  session = data.session;
  return {
    user: data.user,
    signedIn: Boolean(data.session),
  };
}

export async function disconnect() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  session = null;
}

async function readCloud(client) {
  const events = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("progress_events")
      .select("event")
      .order("created_at", { ascending: true })
      .order("event_id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    events.push(...data.map((row) => row.event));
    if (data.length < pageSize) break;
  }
  return validateProgress({ version: 1, events });
}

export function planSync(local, cloud) {
  const localProgress = validateProgress(local);
  const cloudProgress = validateProgress(cloud);
  const known = new Set(cloudProgress.events.map((item) => item.id));
  return {
    pending: localProgress.events.filter((item) => !known.has(item.id)),
    merged: mergeProgress(emptyProgress(), cloudProgress, localProgress),
  };
}

export function syncCloud(local) {
  const run = async () => {
    const client = requireClient();
    if (!session?.user)
      throw new Error(
        "Sign in to sync. Your progress is still saved on this device.",
      );
    const cloud = await readCloud(client);
    const { pending, merged } = planSync(local, cloud);
    for (let start = 0; start < pending.length; start += 500) {
      const rows = pending.slice(start, start + 500).map((item) => ({
        user_id: session.user.id,
        event_id: item.id,
        event: item,
      }));
      const { error } = await client.from("progress_events").upsert(rows, {
        onConflict: "user_id,event_id",
        ignoreDuplicates: true,
      });
      if (error) throw error;
    }
    return merged;
  };
  const result = chain.then(run, run).catch((error) => {
    throw new Error(
      `${error.message || "Cloud sync failed"}. Your local progress is safe; try again.`,
    );
  });
  chain = result.catch(() => {});
  return result;
}
