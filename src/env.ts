import "dotenv/config";

const NOSTR_SECRET_KEY = process.env.NOSTR_SECRET_KEY as string;
if (!NOSTR_SECRET_KEY) throw new Error("Missing NOSTR_SECRET_KEY");

// nostr
const NOSTR_RELAYS = process.env.NOSTR_RELAYS as string;
if (!NOSTR_RELAYS) throw new Error("Missing NOSTR_RELAYS");

const DB_CONNECT_STRING = process.env.DB_CONNECT_STRING || "DB_CONNECT_URL";

export { NOSTR_SECRET_KEY, NOSTR_RELAYS, DB_CONNECT_STRING };
