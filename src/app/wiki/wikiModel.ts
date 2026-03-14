export type WikiSectionId = "skills" | "recipes" | "items" | "dungeons";

export type WikiRouteState = {
    section: WikiSectionId;
    entryId: string | null;
};

export type WikiFact = {
    label: string;
    value: string;
};

export type WikiEntry = {
    id: string;
    section: WikiSectionId;
    group: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    facts: WikiFact[];
};

export const DEFAULT_WIKI_ROUTE: WikiRouteState = {
    section: "skills",
    entryId: null
};

const WIKI_SECTIONS: WikiSectionId[] = ["skills", "recipes", "items", "dungeons"];

const normalizeBasePath = (rawBase: string) => {
    const trimmed = rawBase.trim();
    if (!trimmed || trimmed === "/") {
        return "";
    }
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const getAppRootPath = () => {
    const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
    return basePath || "/";
};

const isValidWikiSection = (value: string | null): value is WikiSectionId => {
    return Boolean(value && WIKI_SECTIONS.includes(value as WikiSectionId));
};

export const buildWikiUrl = (route: WikiRouteState) => {
    const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
    const params = new URLSearchParams();
    params.set("section", route.section);
    if (route.entryId) {
        params.set("entry", route.entryId);
    }
    const query = params.toString();
    return `${basePath}/wiki${query ? `?${query}` : ""}`;
};

export const parseWikiLocation = (locationLike: Pick<Location, "pathname" | "search">) => {
    const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
    const trimmedPath = locationLike.pathname.endsWith("/") && locationLike.pathname !== "/"
        ? locationLike.pathname.slice(0, -1)
        : locationLike.pathname;
    const wikiPath = `${basePath}/wiki` || "/wiki";
    const isWiki = trimmedPath === wikiPath;
    const params = new URLSearchParams(locationLike.search);
    const sectionParam = params.get("section");
    const section = isValidWikiSection(sectionParam) ? sectionParam : DEFAULT_WIKI_ROUTE.section;
    const entryId = params.get("entry");
    return {
        isWiki,
        route: {
            section,
            entryId: entryId && entryId.trim().length > 0 ? entryId : null
        } satisfies WikiRouteState
    };
};
