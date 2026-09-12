import test from "node:test";
import assert from "node:assert/strict";
import { connect, disconnect, syncDrive, isConnected } from "../src/drive.js";
import { items } from "../src/curriculum.js";
const a = {
  id: "device-a",
  at: 1,
  type: "answer",
  item: items[0].id,
  correct: true,
};
const b = {
  id: "device-b",
  at: 2,
  type: "answer",
  item: items[1].id,
  correct: false,
};
const payload = (events) => ({ version: 1, events });
const json = (x) =>
  new Response(JSON.stringify(x), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
function googleMock(granted = true) {
  globalThis.window = {
    google: {
      accounts: {
        oauth2: {
          hasGrantedAllScopes: () => granted,
          initTokenClient: (options) => ({
            requestAccessToken: () =>
              options.callback({
                access_token: "test-token",
                expires_in: 3600,
              }),
          }),
        },
      },
    },
  };
}
test("Drive merges cloud progress and uploads only new events in an immutable batch", async () => {
  googleMock();
  await connect("test.apps.googleusercontent.com");
  let upload;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer test-token");
    if (url.includes("uploadType=multipart")) {
      upload = options;
      return json({ id: "new-file" });
    }
    if (url.includes("alt=media")) return json(payload([a]));
    return json({ files: [{ id: "existing-file" }] });
  };
  const result = await syncDrive(payload([a, b]));
  assert.equal(result.events.length, 2);
  assert.ok(upload.body.includes("appDataFolder"));
  assert.ok(upload.body.includes("device-b"));
  assert.ok(!upload.body.includes("device-a"));
  assert.ok(
    upload.headers["Content-Type"].startsWith("multipart/related; boundary="),
  );
  disconnect();
});
test("a repeated sync does not upload already saved events", async () => {
  googleMock();
  await connect("test.apps.googleusercontent.com");
  let writes = 0;
  globalThis.fetch = async (url) => {
    if (url.includes("uploadType")) writes++;
    return json(
      url.includes("alt=media") ? payload([a, b]) : { files: [{ id: "file" }] },
    );
  };
  await syncDrive(payload([a, b]));
  assert.equal(writes, 0);
  disconnect();
});
test("Drive pagination reads every batch before merging", async () => {
  googleMock();
  await connect("test.apps.googleusercontent.com");
  globalThis.fetch = async (url) => {
    if (url.includes("/first?")) return json(payload([a]));
    if (url.includes("/second?")) return json(payload([b]));
    if (url.includes("pageToken=next"))
      return json({ files: [{ id: "second" }] });
    return json({ files: [{ id: "first" }], nextPageToken: "next" });
  };
  const merged = await syncDrive(payload([]));
  assert.equal(merged.events.length, 2);
  disconnect();
});
test("authorization failures require reconnection and retain local input", async () => {
  googleMock();
  await connect("test.apps.googleusercontent.com");
  const local = payload([b]);
  globalThis.fetch = async () => new Response("", { status: 401 });
  await assert.rejects(syncDrive(local), /expired/);
  assert.equal(isConnected(), false);
  assert.deepEqual(local, payload([b]));
});
test("malformed cloud progress is not silently overwritten", async () => {
  googleMock();
  await connect("test.apps.googleusercontent.com");
  let writes = 0;
  globalThis.fetch = async (url) => {
    if (url.includes("uploadType")) writes++;
    return json(
      url.includes("alt=media")
        ? { garbage: true }
        : { files: [{ id: "broken" }] },
    );
  };
  await assert.rejects(syncDrive(payload([a])), /not a Labukas/);
  assert.equal(writes, 0);
  disconnect();
});
test("missing app-data consent is handled without granting a connection", async () => {
  googleMock(false);
  await assert.rejects(
    connect("test.apps.googleusercontent.com"),
    /allow access/,
  );
  assert.equal(isConnected(), false);
});
