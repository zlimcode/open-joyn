import type { Panel, vec2 } from "openjoyn/model";
import type Plan from "./Plan";

import { groupByPredicate, fixedPrecision } from "./helpers";

type PanelCutListItem = {
    thickness: number;
    pieces: PanelCutListItemPiece[];
};

type PanelCutListItemPiece = {
    size: vec2,
    panels: Panel[];
};

class PanelCutList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    groupByThickness(panels: Panel[]) {
        panels.sort((a, b) => a.thickness - b.thickness);

        const barsByLength = groupByPredicate(panels, (panel) => fixedPrecision(panel.thickness, this.plan.style.precision));
        return [...barsByLength.values()];
    }

    groupBySize(panels: Panel[]) {
        panels.sort((a, b) => a.size[0] - b.size[0]);

        // TODO: precision from style...
        const sizePredicateFn = (panel: Panel) => `${fixedPrecision(panel.size[0], this.plan.style.precision)}x${fixedPrecision(panel.size[1], this.plan.style.precision)}`;

        const panelsBySize = groupByPredicate(panels, sizePredicateFn);
        return [...panelsBySize.values()];
    }

    items(): PanelCutListItem[] {
        const panels = this.plan.construction.panels();
        const thicknessGroups = this.groupByThickness(panels);

        let items = thicknessGroups.map((groupPanels) => {
            let thicknessGroupTemplate = groupPanels[0];

            const piecesBySize = this.groupBySize(groupPanels);

            let item: PanelCutListItem = {
                thickness: thicknessGroupTemplate.thickness,

                pieces: piecesBySize.map((piecePanels) => {

                    return {
                        size: piecePanels[0].size,
                        panels: piecePanels
                    };
                })
            };

            return item;
        });

        return items;
    }
}

export { PanelCutList };
export type { PanelCutListItem };