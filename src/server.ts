import "dotenv/config";

import { DVM } from "./dvm";
import countHandlers from "./handlers/count";
import { getPublicKey, nip19 } from "nostr-tools";

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
  });

const sk = process.env.DVM_SK as string;
const relays = process.env.DVM_RELAYS as string;

export const dvm = new DVM({
  sk,
  relays: relays.split(","),
  handlers: {
    ...countHandlers,
  },
});

if (process.env.DVM_ENABLE_LOGGING) {
  console.info(
    `Started dvm (${nip19.npubEncode(getPublicKey(sk))}) with ${Object.keys(dvm.opts.handlers).length} handlers`,
  );
}
