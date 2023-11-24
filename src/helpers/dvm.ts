import type { Event } from "nostr-tools";

export function getInputTag(e: Event) {
  const tag = e.tags.find((t) => t[0] === "i");
  if (!tag) throw new Error("Missing input tag");
  return tag;
}

export function getInput(e: Event) {
  const tag = getInputTag(e);
  let [_, value, type, relay, marker] = tag;

  if (!value) throw new Error("Missing input value");
  if (!type) throw new Error("Missing input type");
  return { value, type, relay, marker };
}
export function getRelays(event: Event) {
  return event.tags.find((t) => t[0] === "relays")?.slice(1) ?? [];
}
export function getOutputType(event: Event): string | undefined {
  return event.tags.find((t) => t[0] === "output")?.[1];
}

export function getInputParams(e: Event, k: string) {
  return e.tags.filter((t) => t[0] === "param" && t[1] === k).map((t) => t[2]);
}

export function getInputParam(e: Event, name: string, required: true): string;
export function getInputParam(e: Event, name: string, required: false): string | undefined;
export function getInputParam(e: Event, name: string, required?: boolean): string | undefined {
  const value: string | undefined = getInputParams(e, name)[0];
  if (required !== false && value === undefined) throw new Error(`Missing ${name} param`);
  return value;
}
