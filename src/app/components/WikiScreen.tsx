import { memo, useMemo } from "react";
import type { WikiEntry, WikiRouteState, WikiSectionId } from "../wiki/wikiModel";

type WikiScreenProps = {
    route: WikiRouteState;
    entries: WikiEntry[];
    sectionIntro: string;
    filters?: string[];
    activeFilter?: string;
    onSelectFilter?: (filter: string) => void;
    onSelectSection: (section: WikiSectionId) => void;
    onSelectEntry: (entryId: string) => void;
};

const SECTION_LABELS: Record<WikiSectionId, string> = {
    skills: "Skills",
    recipes: "Recipes",
    items: "Items",
    dungeons: "Dungeons"
};

export const WikiScreen = memo(({
    route,
    entries,
    sectionIntro,
    filters = [],
    activeFilter = "all",
    onSelectFilter,
    onSelectSection,
    onSelectEntry
}: WikiScreenProps) => {
    const groups = useMemo(() => {
        const grouped = new Map<string, WikiEntry[]>();
        entries.forEach((entry) => {
            const bucket = grouped.get(entry.group);
            if (bucket) {
                bucket.push(entry);
                return;
            }
            grouped.set(entry.group, [entry]);
        });
        return Array.from(grouped.entries()).map(([group, groupedEntries]) => ({
            group,
            entries: groupedEntries
        }));
    }, [entries]);

    const activeEntry = entries.find((entry) => entry.id === route.entryId) ?? entries[0] ?? null;

    return (
        <section className="generic-panel ts-panel ts-wiki-panel">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Wiki</h2>
                    <span className="ts-panel-counter">{SECTION_LABELS[route.section]}</span>
                </div>
            </div>
            <div className="ts-wiki-body">
                <div className="ts-wiki-toolbar">
                    {(Object.keys(SECTION_LABELS) as WikiSectionId[]).map((sectionId) => (
                        <button
                            key={sectionId}
                            type="button"
                            className={`ts-chip ts-focusable ts-wiki-section-chip${route.section === sectionId ? " is-active" : ""}`}
                            onClick={() => onSelectSection(sectionId)}
                            title={SECTION_LABELS[sectionId]}
                        >
                            {SECTION_LABELS[sectionId]}
                        </button>
                    ))}
                </div>
                <div className="ts-wiki-intro">{sectionIntro}</div>
                {filters.length > 0 ? (
                    <div className="ts-wiki-toolbar">
                        <button
                            type="button"
                            className={`ts-chip ts-focusable ts-wiki-section-chip${activeFilter === "all" ? " is-active" : ""}`}
                            onClick={() => onSelectFilter?.("all")}
                            title="All items"
                        >
                            All items
                        </button>
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={`ts-chip ts-focusable ts-wiki-section-chip${activeFilter === filter ? " is-active" : ""}`}
                                onClick={() => onSelectFilter?.(filter)}
                                title={filter}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                ) : null}
                <div className="ts-wiki-layout">
                    <aside className="ts-wiki-list" aria-label={`${SECTION_LABELS[route.section]} list`}>
                        {groups.map((group) => (
                            <div key={group.group} className="ts-wiki-group">
                                <div className="ts-wiki-group-title">{group.group}</div>
                                <div className="ts-wiki-group-list">
                                    {group.entries.map((entry) => (
                                        <button
                                            key={entry.id}
                                            type="button"
                                            className={`ts-wiki-entry-button ts-focusable${activeEntry?.id === entry.id ? " is-active" : ""}`}
                                            onClick={() => onSelectEntry(entry.id)}
                                            title={`${entry.title} - ${entry.subtitle}`}
                                        >
                                            <span className="ts-wiki-entry-title">{entry.title}</span>
                                            <span className="ts-wiki-entry-subtitle">{entry.subtitle}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </aside>
                    <div className="ts-wiki-detail">
                        {activeEntry ? (
                            <>
                                <div className="ts-wiki-detail-header">
                                    <div>
                                        <div className="ts-wiki-detail-kicker">{SECTION_LABELS[activeEntry.section]}</div>
                                        <h3 className="ts-wiki-detail-title">{activeEntry.title}</h3>
                                        <p className="ts-wiki-detail-subtitle">{activeEntry.subtitle}</p>
                                    </div>
                                    <div className="ts-wiki-tag-list">
                                        {activeEntry.tags.map((tag) => (
                                            <span key={tag} className="ts-chip ts-wiki-tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="ts-wiki-detail-copy">{activeEntry.description}</p>
                                <div className="ts-wiki-facts">
                                    {activeEntry.facts.map((fact) => (
                                        <div key={`${activeEntry.id}-${fact.label}`} className="ts-wiki-fact">
                                            <div className="ts-wiki-fact-label">{fact.label}</div>
                                            <div className="ts-wiki-fact-value">{fact.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="ts-system-helper">No wiki entry available for this section.</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
});

WikiScreen.displayName = "WikiScreen";
