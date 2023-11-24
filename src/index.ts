import dayjs from "dayjs";
import { appDebug } from "./debug.js";
import { RELAYS, pool } from "./pool.js";
import { DMV_COUNT_JOB_KIND } from "./const.js";
import { simpleCount, canAcceptJob } from "./handler.js";

const jobsSub = pool.sub(RELAYS, [{ kinds: [DMV_COUNT_JOB_KIND], since: dayjs().unix() }]);
jobsSub.on("event", async (event) => {
  if (event.kind === DMV_COUNT_JOB_KIND) {
    try {
      const context = await canAcceptJob(event);
      try {
        await simpleCount(context);
      } catch (e) {
        if (e instanceof Error) {
          appDebug(`Failed to handle request ${event.id} because`, e.message);
          console.log(e);
        }
      }
    } catch (e) {
      if (e instanceof Error) appDebug(`Skipped request ${event.id} because`, e.message);
    }
  }
});

// graceful shutdown
async function shutdown() {
  process.exit();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.once("SIGUSR2", shutdown);
