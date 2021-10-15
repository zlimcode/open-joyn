import type { Bar, Panel, Step } from "openjoyn/model";
import { groupByPredicate, naturalCompare } from "./helpers";
import type { Plan } from "./Plan";


type AssembleListItem = {
    index: number;
    label: string;
    description?: string;
    highlightGroups: string[];
    displayGroups: string[];

    bars: AssembleBar[],
    panels: AssemblePanel[],
};


type AssembleBar = {
    template: Bar;
    bars: Bar[];
};


type AssemblePanel = {
    template: Panel;
    panels: Panel[];
};


class AssembleList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    stepBars(step: Step): AssembleBar[] {
        const c = this.plan.construction;
        const groupBars = c.barsOfGroup(step.groupName);

        groupBars.sort((a, b) => naturalCompare(a.name, b.name));

        const barsByName = groupByPredicate(groupBars, (bar) => bar.name);

        let items: AssembleBar[] = [...barsByName.entries()].map(([_name, bars]) => {
            const templateBar: Bar = bars[0];

            return {
                template: templateBar,
                bars: bars,
            };
        });

        return items;
    }


    stepPanels(step: Step): AssemblePanel[] {
        const c = this.plan.construction;
        const groupPanels = c.panelsOfGroup(step.groupName);

        groupPanels.sort((a, b) => naturalCompare(a.name, b.name));

        const panelsByName = groupByPredicate(groupPanels, (panel) => panel.name);

        let items: AssemblePanel[] = [...panelsByName.entries()].map(([_name, panels]) => {
            const templatePanel: Panel = panels[0];

            return {
                template: templatePanel,
                panels: panels,
            };
        });

        return items;
    }


    items(): AssembleListItem[] {
        let result: AssembleListItem[] = [];
        let count = 0;

        for (const step of this.plan.steps) {
            let displayGroups = [];
            for (const planStep of this.plan.steps) {
                displayGroups.push(planStep.groupName);
                if (planStep == step) {
                    break;
                }
            }

            let stepItem: AssembleListItem = {
                index: count,
                label: step.labelOrGroup(),
                description: step.description,
                highlightGroups: [step.groupName],
                displayGroups: displayGroups,
                bars: this.stepBars(step),
                panels: this.stepPanels(step),
            };

            count += 1;

            result.push(stepItem);
        }

        return result;
    }
}

export { AssembleList };
export type { AssembleListItem };