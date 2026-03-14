import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WikiScreenContainer } from "../../src/app/containers/WikiScreenContainer";

describe("WikiScreenContainer", () => {
    it("renders list-detail wiki content and lets the player switch sections", () => {
        const onChangeRoute = vi.fn();
        render(
            <WikiScreenContainer
                route={{ section: "skills", entryId: null }}
                onChangeRoute={onChangeRoute}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByRole("heading", { name: "Wiki" })).toBeTruthy();
        expect(screen.getByText("Learn what each skill is for, how fast it loops, and where it fits in your overall roster plan.")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Recipes" }));
        expect(onChangeRoute).toHaveBeenCalledWith({
            section: "recipes",
            entryId: null
        });
    });

    it("shows lightweight item filters in the shared items section", () => {
        render(
            <WikiScreenContainer
                route={{ section: "items", entryId: null }}
                onChangeRoute={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: "All items" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Equipment" })).toBeTruthy();
    });
});
