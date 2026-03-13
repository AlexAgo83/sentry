import { memo, useId, useRef } from "react";
import type { StartupBootstrapOrigin } from "../../core/types";
import { useDialogFocusManagement } from "../hooks/useDialogFocusManagement";
import { formatTimeAway } from "../ui/timeAway";

type StartupSplashScreenProps = {
    isReady: boolean;
    origin?: StartupBootstrapOrigin | null;
    stageLabel?: string;
    progressPct?: number;
    detail?: string | null;
    awayDurationMs?: number | null;
    showContinueButton?: boolean;
    onContinue: () => void;
};

export const StartupSplashScreen = memo(({
    isReady,
    origin = null,
    stageLabel,
    progressPct = 0,
    detail = null,
    awayDurationMs = null,
    showContinueButton = true,
    onContinue
}: StartupSplashScreenProps) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const continueButtonRef = useRef<HTMLButtonElement | null>(null);
    const titleId = useId();
    const statusId = useId();
    const progressId = useId();
    const clampedProgress = Math.max(0, Math.min(100, Number(progressPct) || 0));
    const shouldShowAwayDuration = !isReady && Number.isFinite(awayDurationMs) && (awayDurationMs ?? 0) >= 5000;
    const statusCopy = isReady
        ? "Ready to continue."
        : origin === "cloudLoad"
            ? "Applying your cloud save..."
            : origin === "localImport"
                ? "Applying your imported save..."
                : "Preparing your save and assets...";

    useDialogFocusManagement({
        dialogRef,
        initialFocusRef: continueButtonRef,
        isOpen: true,
        restoreFocus: false
    });

    return (
        <div className="ts-startup-splash">
            <div
                ref={dialogRef}
                className="ts-startup-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={statusId}
                tabIndex={-1}
            >
                <span className="ts-startup-kicker">Sentry</span>
                <h1 id={titleId} className="ts-startup-title">Loading</h1>
                <p id={statusId} className="ts-startup-status" aria-live="polite">
                    {statusCopy}
                </p>
                {!isReady ? (
                    <>
                        {shouldShowAwayDuration ? (
                            <p className="ts-startup-status ts-startup-status-detail">
                                Away for {formatTimeAway(awayDurationMs ?? 0)}
                            </p>
                        ) : null}
                        <div
                            id={progressId}
                            className="ts-startup-progress"
                            role="progressbar"
                            aria-label="Startup progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(clampedProgress)}
                        >
                            <div
                                className="ts-startup-progress-fill"
                                style={{ width: `${clampedProgress}%` }}
                            />
                        </div>
                        <p className="ts-startup-progress-meta" aria-live="polite">
                            {Math.round(clampedProgress)}%{stageLabel ? ` - ${stageLabel}` : ""}
                        </p>
                        {detail ? (
                            <p className="ts-startup-status ts-startup-status-detail">{detail}</p>
                        ) : null}
                    </>
                ) : null}
                {showContinueButton ? (
                    <div className="ts-startup-actions">
                        <button
                            ref={continueButtonRef}
                            type="button"
                            className="generic-field button ts-startup-button ts-focusable"
                            onClick={onContinue}
                            disabled={!isReady}
                        >
                            Continue
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
});

StartupSplashScreen.displayName = "StartupSplashScreen";
