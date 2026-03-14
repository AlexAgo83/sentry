import { useMemo } from "react";
import { ShopPanel } from "../components/ShopPanel";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { useGameStore } from "../hooks/useGameStore";
import { gameStore } from "../game";
import { getRosterSlotCost } from "../../core/economy";
import { getEffectiveRosterLimit, resolveMetaProgressionEffects } from "../../core/metaProgression";
import { MAX_ROSTER_LIMIT } from "../../core/constants";

export const ShopPanelContainer = () => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("shop", false);
    const gold = useGameStore((state) => state.inventory.items.gold ?? 0);
    const purchasedRosterLimit = useGameStore((state) => state.rosterLimit);
    const rosterLimit = useGameStore((state) => getEffectiveRosterLimit(state));
    const metaProgression = useGameStore((state) => state.metaProgression);
    const metaEffects = useMemo(
        () => resolveMetaProgressionEffects(metaProgression),
        [metaProgression]
    );
    const rosterSlotDiscountPct = metaEffects.rosterSlotDiscountPct;
    const rosterSlotPrice = getRosterSlotCost(purchasedRosterLimit, rosterSlotDiscountPct);
    const effectiveMaxRosterLimit = MAX_ROSTER_LIMIT + metaEffects.freeRosterSlots;
    const isRosterMaxed = purchasedRosterLimit >= MAX_ROSTER_LIMIT;
    const rosterSlotUpcomingCosts = isRosterMaxed
        ? []
        : [1, 2, 3].map((offset) => getRosterSlotCost(purchasedRosterLimit + offset, rosterSlotDiscountPct));

    return (
        <ShopPanel
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            gold={gold}
            rosterLimit={rosterLimit}
            maxRosterLimit={effectiveMaxRosterLimit}
            rosterSlotPrice={rosterSlotPrice}
            rosterSlotUpcomingCosts={rosterSlotUpcomingCosts}
            rosterSlotDiscountPct={rosterSlotDiscountPct}
            isRosterMaxed={isRosterMaxed}
            onBuyRosterSlot={() => gameStore.dispatch({ type: "purchaseRosterSlot" })}
        />
    );
};
