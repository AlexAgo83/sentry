import { useCallback, useEffect, useState } from "react";
import type { AppActiveScreen, AppActiveSidePanel } from "../AppView";
import {
    buildWikiUrl,
    DEFAULT_WIKI_ROUTE,
    getAppRootPath,
    parseWikiLocation,
    type WikiRouteState
} from "../wiki/wikiModel";

type HeroSidePanel = Extract<AppActiveSidePanel, "action" | "stats" | "equipment">;
type ReturnScreen = Exclude<AppActiveScreen, "wiki">;

export const useAppShellUi = () => {
    const [activeSidePanel, setActiveSidePanel] = useState<AppActiveSidePanel>("action");
    const [activeScreen, setActiveScreen] = useState<AppActiveScreen>(() => {
        if (typeof window === "undefined") {
            return "main";
        }
        return parseWikiLocation(window.location).isWiki ? "wiki" : "main";
    });
    const [wikiRoute, setWikiRouteState] = useState<WikiRouteState>(() => {
        if (typeof window === "undefined") {
            return DEFAULT_WIKI_ROUTE;
        }
        return parseWikiLocation(window.location).route;
    });
    const [wikiReturnScreen, setWikiReturnScreen] = useState<ReturnScreen>("main");
    const [wikiReturnSidePanel, setWikiReturnSidePanel] = useState<AppActiveSidePanel>("action");
    const [returnSidePanel, setReturnSidePanel] = useState<AppActiveSidePanel>("action");
    const [lastHeroSidePanel, setLastHeroSidePanel] = useState<HeroSidePanel>("action");
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isDevToolsOpen, setDevToolsOpen] = useState(false);
    const [isLocalSaveOpen, setLocalSaveOpen] = useState(false);
    const [isCloudSaveOpen, setCloudSaveOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handlePopState = () => {
            const parsed = parseWikiLocation(window.location);
            setWikiRouteState(parsed.route);
            if (parsed.isWiki) {
                setActiveScreen("wiki");
                return;
            }
            setActiveScreen((current) => (current === "wiki" ? "main" : current));
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const syncMainRoute = useCallback(() => {
        if (typeof window === "undefined") {
            return;
        }
        const parsed = parseWikiLocation(window.location);
        if (!parsed.isWiki) {
            return;
        }
        window.history.pushState({}, "", getAppRootPath());
    }, []);

    const openWikiScreen = useCallback((route?: Partial<WikiRouteState>) => {
        if (activeScreen !== "wiki") {
            setWikiReturnScreen(activeScreen);
            setWikiReturnSidePanel(activeSidePanel);
        }
        const nextRoute: WikiRouteState = {
            ...wikiRoute,
            ...route,
            section: route?.section ?? wikiRoute.section ?? DEFAULT_WIKI_ROUTE.section,
            entryId: route?.entryId ?? wikiRoute.entryId ?? null
        };
        setActiveScreen("wiki");
        setWikiRouteState(nextRoute);
        if (typeof window !== "undefined") {
            window.history.pushState({}, "", buildWikiUrl(nextRoute));
        }
    }, [activeScreen, activeSidePanel, wikiRoute]);

    const closeWikiScreen = useCallback(() => {
        syncMainRoute();
        setActiveScreen(wikiReturnScreen);
        setActiveSidePanel(wikiReturnSidePanel);
        if (
            wikiReturnSidePanel === "action" ||
            wikiReturnSidePanel === "stats" ||
            wikiReturnSidePanel === "equipment"
        ) {
            setLastHeroSidePanel(wikiReturnSidePanel);
        }
    }, [syncMainRoute, wikiReturnScreen, wikiReturnSidePanel]);

    const setWikiRoute = useCallback((route: WikiRouteState) => {
        setWikiRouteState(route);
        if (typeof window !== "undefined") {
            window.history.pushState({}, "", buildWikiUrl(route));
        }
    }, []);

    const openSystem = useCallback(() => {
        setDevToolsOpen(false);
        setLocalSaveOpen(false);
        setCloudSaveOpen(false);
        setSystemOpen(true);
    }, []);
    const closeSystem = useCallback(() => setSystemOpen(false), []);

    const openDevTools = useCallback(() => {
        if (!import.meta.env.DEV) {
            return;
        }
        setSystemOpen(false);
        setLocalSaveOpen(false);
        setCloudSaveOpen(false);
        setDevToolsOpen(true);
    }, []);
    const closeDevTools = useCallback(() => setDevToolsOpen(false), []);

    const openLocalSave = useCallback(() => {
        setSystemOpen(false);
        setDevToolsOpen(false);
        setCloudSaveOpen(false);
        setLocalSaveOpen(true);
    }, []);
    const closeLocalSave = useCallback(() => setLocalSaveOpen(false), []);

    const openCloudSave = useCallback(() => {
        setSystemOpen(false);
        setDevToolsOpen(false);
        setLocalSaveOpen(false);
        setCloudSaveOpen(true);
    }, []);
    const closeCloudSave = useCallback(() => setCloudSaveOpen(false), []);

    const openActionSelection = useCallback(() => {
        setReturnSidePanel(activeSidePanel);
        setActiveScreen("actionSelection");
    }, [activeSidePanel]);
    const closeActionSelection = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel(returnSidePanel);
        if (returnSidePanel === "action" || returnSidePanel === "stats" || returnSidePanel === "equipment") {
            setLastHeroSidePanel(returnSidePanel);
        }
    }, [returnSidePanel, syncMainRoute]);

    const openDungeonScreen = useCallback(() => {
        syncMainRoute();
        setReturnSidePanel(activeSidePanel);
        setActiveScreen("dungeon");
    }, [activeSidePanel, syncMainRoute]);
    const closeDungeonScreen = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel(returnSidePanel);
        if (returnSidePanel === "action" || returnSidePanel === "stats" || returnSidePanel === "equipment") {
            setLastHeroSidePanel(returnSidePanel);
        }
    }, [returnSidePanel, syncMainRoute]);

    const showActionPanel = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel("action");
        setLastHeroSidePanel("action");
    }, [syncMainRoute]);
    const showStatsPanel = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel("stats");
        setLastHeroSidePanel("stats");
    }, [syncMainRoute]);
    const showRosterScreen = useCallback(() => {
        syncMainRoute();
        setActiveScreen("roster");
    }, [syncMainRoute]);
    const showInventoryPanel = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel("inventory");
    }, [syncMainRoute]);
    const showEquipmentPanel = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel("equipment");
        setLastHeroSidePanel("equipment");
    }, [syncMainRoute]);
    const showLastHeroPanel = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel(lastHeroSidePanel);
    }, [lastHeroSidePanel, syncMainRoute]);
    const showShopPanel = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel("shop");
    }, [syncMainRoute]);
    const showQuestsPanel = useCallback(() => {
        syncMainRoute();
        setActiveScreen("main");
        setActiveSidePanel("quests");
    }, [syncMainRoute]);

    return {
        activeSidePanel,
        activeScreen,
        wikiRoute,
        showActionPanel,
        showLastHeroPanel,
        showStatsPanel,
        showRosterScreen,
        showInventoryPanel,
        showEquipmentPanel,
        showShopPanel,
        showQuestsPanel,
        openWikiScreen,
        closeWikiScreen,
        setWikiRoute,
        isSystemOpen,
        openSystem,
        closeSystem,
        isDevToolsOpen,
        openDevTools,
        closeDevTools,
        isLocalSaveOpen,
        openLocalSave,
        closeLocalSave,
        isCloudSaveOpen,
        openCloudSave,
        closeCloudSave,
        openActionSelection,
        closeActionSelection,
        openDungeonScreen,
        closeDungeonScreen,
    };
};
