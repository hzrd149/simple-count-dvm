import type { Event } from "nostr-tools";
import type { Filter } from "paravel";
import { Tags, createEvent, Subscription, now } from "paravel";
import { seconds } from "hurdak";
import type { DVM } from "../dvm";
import { getInputParams, getInputValue } from "../util";

type CountWithProgressOpts = {
  dvm: DVM;
  event: Event;
  filters: Filter[];
  init: (sub: Subscription) => void;
  getResult: () => string;
};

const getGroupKey = (group: string, e: Event) => {
  if (["content", "pubkey"].includes(group)) {
    return (e as any)[group];
  }

  if (group === "reply") {
    return Tags.from(e).getReply().getValue();
  }

  if (group === "root") {
    return Tags.from(e).getRoot().getValue();
  }

  if (group.match(/^created_at\/\d+$/)) {
    return Math.floor(e.created_at / parseInt(group.split("/").slice(-1)[0]));
  }

  return Tags.from(e).type(group).getValue() || "";
};

async function* countWithProgress({ dvm, event, filters, init, getResult }: CountWithProgressOpts) {
  console.log("Opening sub to", getInputParams(event, "relay"));

  const sub = new Subscription({
    filters,
    timeout: 30000,
    closeOnEose: true,
    executor: dvm.getExecutor(getInputParams(event, "relay")),
  });

  init(sub);

  let done = false;
  let prev = "0";

  sub.on("close", () => {
    done = true;
  });

  while (!done) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cur = getResult();

    if (cur !== prev) {
      yield createEvent(7000, {
        content: cur,
        tags: [["expiration", String(now() + seconds(1, "minute"))]],
      });
    }

    prev = cur;
  }

  yield createEvent(event.kind + 1000, {
    content: getResult(),
    tags: [["expiration", String(now() + seconds(1, "hour"))]],
  });
}

export async function* handleCount(dvm: DVM, event: Event) {
  const groups = getInputParams(event, "group");
  const filters = JSON.parse(getInputValue(event)!) as Filter | Filter[];

  let result = groups.length > 0 ? {} : 0;

  yield* countWithProgress({
    dvm,
    event,
    filters: Array.isArray(filters) ? filters : [filters],
    getResult: () => JSON.stringify(result),
    init: (sub: Subscription) => {
      sub.on("event", (e: Event) => {
        if (groups.length === 0) {
          (result as number)++;
        } else {
          let data: any = result;

          groups.forEach((group, i) => {
            const key = getGroupKey(group, e);

            if (i < groups.length - 1) {
              if (!data[key]) {
                data[key] = {};
              }

              data = data[key];
            } else {
              if (!data[key]) {
                data[key] = 0;
              }

              data[key] += 1;
            }
          });
        }
      });
    },
  });
}

export default {
  "5400": handleCount,
};
