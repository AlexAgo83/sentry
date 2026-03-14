import { describe, expect, it } from "vitest";
import { buildWikiEntries, pickWikiRoute, WIKI_SECTION_INTROS } from "../../src/app/wiki/wikiEntries";

describe("wikiEntries", () => {
    it("builds entries for all core sections", () => {
        const entries = buildWikiEntries();
        expect(entries.some((entry) => entry.section === "skills")).toBe(true);
        expect(entries.some((entry) => entry.section === "recipes")).toBe(true);
        expect(entries.some((entry) => entry.section === "items")).toBe(true);
        expect(entries.some((entry) => entry.section === "dungeons")).toBe(true);
        expect(WIKI_SECTION_INTROS.dungeons).toContain("Dungeon");
    });

    it("falls back to the first section entry when the requested entry is missing", () => {
        const entries = buildWikiEntries();
        const route = pickWikiRoute(entries, {
            section: "recipes",
            entryId: "missing-entry"
        });
        expect(route.section).toBe("recipes");
        expect(route.entryId).toBeTruthy();
    });
});
