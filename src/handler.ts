import { Event, Filter, finishEvent } from "nostr-tools";
import dayjs from "dayjs";

import { getInput, getInputParam, getInputParams, getInputTag, getRelays } from "./helpers/dvm.js";
import { appDebug } from "./debug.js";
import { RELAYS, pool } from "./pool.js";
import { NOSTR_SECRET_KEY } from "./env.js";
import { DMV_COUNT_RESULT_KIND } from "./const.js";
import { unique } from "./helpers/array.js";

type SimpleCountContext = {
  request: Event<number>;
  input: string;
  filters: Filter[];
  relays: string[];
};

export async function canAcceptJob(request: Event<5400>): Promise<SimpleCountContext> {
  const input = getInput(request);
  const relays = getInputParams(request, "relay");
  const group = getInputParam(request, "group", false);

  if (group !== undefined) throw new Error("Cant handle group counts yet");
  if (relays.length === 0) throw new Error("No relays specified");

  if (input.type === "text") {
    const filter = JSON.parse(input.value) as Filter | Filter[];
    const filters = Array.isArray(filter) ? filter : [filter];

    return { input: input.value, request, filters, relays };
  } else throw new Error(`Unknown input type ${input.type}`);
}

export function simpleCount(context: SimpleCountContext) {
  return new Promise<void>((res) => {
    appDebug(`Starting work for ${context.request.id}`);

    let count = 0;
    const sub = pool.sub(context.relays, context.filters, { eoseSubTimeout: 1000 });

    sub.on("event", (e) => {
      count++;
    });
    sub.on("eose", async () => {
      const result = finishEvent(
        {
          kind: DMV_COUNT_RESULT_KIND,
          content: String(count),
          created_at: dayjs().unix(),
          tags: [
            ["request", JSON.stringify(context.request)],
            ["e", context.request.id],
            ["p", context.request.pubkey],
            getInputTag(context.request),
          ],
        },
        NOSTR_SECRET_KEY,
      );

      const publishRelays = unique([...getRelays(context.request), ...RELAYS]);
      await Promise.all(pool.publish(publishRelays, result).map((p) => p.catch((e) => {})));

      appDebug(`Finished work for ${context.request.id}`);

      res();
    });
  });
}
