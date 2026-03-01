import { memo, useId, useRef } from "react";
import { useDialogFocusManagement } from "../hooks/useDialogFocusManagement";

type StartupSplashScreenProps = {
    isReady: boolean;
    stageLabel?: string;
    progressPct?: number;
    detail?: string | null;
    onContinue: () => void;
};

export const StartupSplashScreen = memo(({
    isReady,
    stageLabel,
    progressPct = 0,
    detail = null,
    onContinue
}: StartupSplashScreenProps) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const continueButtonRef = useRef<HTMLButtonElement | null>(null);
    const titleId = useId();
    const statusId = useId();
    const progressId = useId();
    const clampedProgress = Math.max(0, Math.min(100, Number(progressPct) || 0));

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
                    {isReady ? "Ready to continue." : "Preparing your save and assets..."}
                </p>
                {!isReady ? (
                    <>
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
            </div>
        </div>
    );
});

StartupSplashScreen.displayName = "StartupSplashScreen";
