import { describe, expect, test } from "vitest";
import { loadSrdContent } from "./srdDataLoader";

describe("loadSrdContent", () => {
  test("fetches and validates the static SRD data asset", async () => {
    const payload = [
      {
        id: "core_domain_blade",
        name: "Blade",
        type: "domain",
        source: "SRD Core",
        tags: ["domain"],
        text: "Blade domain reference.",
        system: { generated: true },
      },
    ];

    const fetcher = async (url: string) =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const entries = await loadSrdContent(fetcher);

    expect(entries).toEqual(payload);
  });

  test("throws a useful error when the static SRD data asset is invalid", async () => {
    const fetcher = async () =>
      new Response(JSON.stringify([{ id: "missing-required-fields" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    await expect(loadSrdContent(fetcher)).rejects.toThrow("Invalid SRD data");
  });
});
