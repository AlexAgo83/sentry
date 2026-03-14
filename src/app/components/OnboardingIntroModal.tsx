import { memo } from "react";
import { ModalShell } from "./ModalShell";

type OnboardingIntroModalProps = {
    title: string;
    body: string;
    primaryLabel: string;
    secondaryLabel: string;
    onAdvance: () => void;
    onSkip: () => void;
};

export const OnboardingIntroModal = memo(({
    title,
    body,
    primaryLabel,
    secondaryLabel,
    onAdvance,
    onSkip
}: OnboardingIntroModalProps) => {
    return (
        <ModalShell
            kicker="First minutes"
            title={title}
            onClose={onSkip}
            closeLabel={secondaryLabel}
            onBackdropClick={() => undefined}
            onEscape={onSkip}
        >
            <div className="ts-onboarding-intro">
                <p className="ts-system-helper">{body}</p>
                <div className="ts-action-row ts-system-actions">
                    <button
                        type="button"
                        className="generic-field button ts-devtools-button ts-focusable"
                        onClick={onAdvance}
                    >
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
});

OnboardingIntroModal.displayName = "OnboardingIntroModal";
