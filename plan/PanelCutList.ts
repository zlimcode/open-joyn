import type { Panel, vec2 } from "openjoyn/model";
import type { Plan } from "./Plan";


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

    items(): PanelCutListItem[] {
        const panels = this.plan.construction.panels();
        const thicknessGroups = this.plan.groupPanelsByThickness(panels);

        let items = thicknessGroups.map((groupPanels) => {
            let thicknessGroupTemplate = groupPanels[0];

            const piecesBySize = this.plan.groupPanelsBySize(groupPanels);

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