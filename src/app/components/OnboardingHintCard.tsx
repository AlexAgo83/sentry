import { memo } from "react";

type OnboardingHintCardProps = {
    title: string;
    body: string;
    onDismiss: () => void;
};

export const OnboardingHintCard = memo(({ title, body, onDismiss }: OnboardingHintCardProps) => {
    return (
        <aside className="ts-onboarding-hint" role="status" aria-live="polite">
            <div className="ts-onboarding-hint-header">
                <span className="ts-onboarding-hint-kicker">Guide</span>
                <button
                    type="button"
                    className="ts-chip ts-focusable ts-onboarding-hint-close"
                    onClick={onDismiss}
                >
                    Got it
                </button>
            </div>
            <div className="ts-onboarding-hint-title">{title}</div>
            <p className="ts-onboarding-hint-body">{body}</p>
        </aside>
    );
});

OnboardingHintCard.displayName = "OnboardingHintCard";
