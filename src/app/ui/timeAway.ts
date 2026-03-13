export const formatTimeAway = (durationMs: number): string => {
    const safeSeconds = Math.max(0, Math.floor(durationMs / 1000));
    if (safeSeconds < 60) {
        return `${safeSeconds}s`;
    }
    if (safeSeconds < 3600) {
        const minutes = Math.floor(safeSeconds / 60);
        const remainderSeconds = safeSeconds % 60;
        return `${minutes}m ${remainderSeconds}s`;
    }
    if (safeSeconds < 86400) {
        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    return `${days}d ${hours}h`;
};
