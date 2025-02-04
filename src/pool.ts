import WebSocket from "ws";
import { SimplePool } from "nostr-tools";
import { appDebug } from "./debug.js";
import { NOSTR_RELAYS } from "./env.js";

// @ts-ignore
global.WebSocket = WebSocket;

const log = appDebug.extend("pool");

export const pool = new SimplePool();
export const RELAYS = NOSTR_RELAYS?.split(",") ?? [];

function ensureConnection() {
  return Promise.all(
    RELAYS.map((url) => {
      return pool.ensureRelay(url).then(() => {
        log(`Connected to ${url}`);
      });
    }),
  );
}

await ensureConnection();
