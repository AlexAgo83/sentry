import { useEffect, useMemo, useState } from "react";
import { WikiScreen } from "../components/WikiScreen";
import { buildWikiEntries, pickWikiRoute, WIKI_SECTION_INTROS } from "../wiki/wikiEntries";
import type { WikiRouteState, WikiSectionId } from "../wiki/wikiModel";

type WikiScreenContainerProps = {
    route: WikiRouteState;
    onChangeRoute: (route: WikiRouteState) => void;
    onClose: () => void;
};

export const WikiScreenContainer = ({ route, onChangeRoute, onClose }: WikiScreenContainerProps) => {
    const entries = useMemo(() => buildWikiEntries(), []);
    const [itemFilter, setItemFilter] = useState("all");
    const resolvedRoute = useMemo(() => pickWikiRoute(entries, route), [entries, route]);
    useEffect(() => {
        if (resolvedRoute.section !== "items" && itemFilter !== "all") {
            setItemFilter("all");
        }
    }, [itemFilter, resolvedRoute.section]);
    const sectionEntries = useMemo(() => {
        const scoped = entries.filter((entry) => entry.section === resolvedRoute.section);
        if (resolvedRoute.section !== "items" || itemFilter === "all") {
            return scoped;
        }
        return scoped.filter((entry) => entry.group === itemFilter);
    }, [entries, itemFilter, resolvedRoute.section]);
    const itemFilters = useMemo(() => {
        if (resolvedRoute.section !== "items") {
            return [];
        }
        return Array.from(new Set(entries.filter((entry) => entry.section === "items").map((entry) => entry.group)));
    }, [entries, resolvedRoute.section]);
    const visibleRoute = useMemo(
        () => pickWikiRoute(sectionEntries, resolvedRoute),
        [resolvedRoute, sectionEntries]
    );

    return (
        <WikiScreen
            route={visibleRoute}
            entries={sectionEntries}
            sectionIntro={WIKI_SECTION_INTROS[resolvedRoute.section]}
            filters={itemFilters}
            activeFilter={itemFilter}
            onSelectFilter={setItemFilter}
            onClose={onClose}
            onSelectSection={(section: WikiSectionId) => {
                onChangeRoute({
                    section,
                    entryId: null
                });
            }}
            onSelectEntry={(entryId: string) => {
                onChangeRoute({
                    section: visibleRoute.section,
                    entryId
                });
            }}
        />
    );
};
