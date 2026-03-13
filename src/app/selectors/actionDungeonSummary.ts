import { getDungeonDefinition } from "../../data/dungeons";
import { getActiveDungeonRuns } from "../../core/dungeon";
import type { DungeonRunPartyMemberState, DungeonRunState, GameState, PlayerId } from "../../core/types";

export type ActionDungeonSummaryRow = {
    label: string;
    value: string;
};

export type ActionDungeonSummary = {
    rows: ActionDungeonSummaryRow[];
};

const resolveRunForPlayer = (
    playerId: PlayerId | null,
    state: GameState
): DungeonRunState | null => {
    if (!playerId) {
        return null;
    }
    return getActiveDungeonRuns(state.dungeon).find((run) => (
        run.party.some((member) => member.playerId === playerId)
    )) ?? null;
};

const resolveRunStatusLabel = (
    run: DungeonRunState,
    currentMember: DungeonRunPartyMemberState | null
): string => {
    const currentEnemy = run.enemies.find((enemy) => enemy.id === run.targetEnemyId && enemy.hp > 0) ?? null;
    if (run.restartAt !== null) {
        return run.status === "victory" ? "Restarting soon" : "Recovering";
    }
    if (run.floorPauseMs && run.floorPauseMs > 0) {
        return "Advancing to next floor";
    }
    if (currentEnemy) {
        const prefix = currentEnemy.isBoss ? "Boss fight" : "In combat";
        return `${prefix}: ${currentEnemy.name}`;
    }
    if (currentMember && currentMember.hp <= 0) {
        return "Downed in combat";
    }
    return "Exploring";
};

const resolveHeroStatusLabel = (
    run: DungeonRunState,
    member: DungeonRunPartyMemberState | null
): string => {
    if (!member) {
        return "Unknown";
    }
    if (member.hp <= 0) {
        return "Downed";
    }
    if (member.stunnedUntilMs && member.stunnedUntilMs > run.elapsedMs) {
        return "Stunned";
    }
    if (member.tauntUntilMs && member.tauntUntilMs > run.elapsedMs) {
        return "Holding aggro";
    }
    if (member.hp < member.hpMax) {
        return "Wounded";
    }
    return "Ready";
};

const buildActionDungeonSummary = (
    run: DungeonRunState | null,
    activePlayerId: PlayerId | null
): ActionDungeonSummary | null => {
    if (!run || !activePlayerId) {
        return null;
    }
    const definition = getDungeonDefinition(run.dungeonId);
    const member = run.party.find((partyMember) => partyMember.playerId === activePlayerId) ?? null;
    return {
        rows: [
            {
                label: "Dungeon",
                value: definition?.name ?? run.dungeonId
            },
            {
                label: "Floor",
                value: `${Math.max(1, run.floor)} / ${Math.max(1, run.floorCount)}`
            },
            {
                label: "Status",
                value: resolveRunStatusLabel(run, member)
            },
            {
                label: "Hero",
                value: resolveHeroStatusLabel(run, member)
            }
        ]
    };
};

export const selectActivePlayerDungeonSummary = (() => {
    let lastDungeon: GameState["dungeon"] | null = null;
    let lastActivePlayerId: GameState["activePlayerId"] | null = null;
    let lastResult: ActionDungeonSummary | null = null;
    return (state: GameState): ActionDungeonSummary | null => {
        if (state.dungeon === lastDungeon && state.activePlayerId === lastActivePlayerId) {
            return lastResult;
        }
        lastDungeon = state.dungeon;
        lastActivePlayerId = state.activePlayerId;
        lastResult = buildActionDungeonSummary(
            resolveRunForPlayer(state.activePlayerId, state),
            state.activePlayerId
        );
        return lastResult;
    };
})();

export const selectActionDungeonSummaryFromState = (
    state: GameState
): ActionDungeonSummary | null => {
    return buildActionDungeonSummary(
        resolveRunForPlayer(state.activePlayerId, state),
        state.activePlayerId
    );
};
