import type { Panel } from "openjoyn/model";
import type { vec2 } from "openjoyn/model/PartBase";
import type Plan from "./Plan";


class PanelCutList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    pieces(): Map<vec2, Panel[]> {
        let construction = this.plan.construction;
        let panels = construction.panels();
        panels.sort((a, b) => a.size[0] - b.size[0]);   

        const panelsBySize = panels.reduce((acc: Map<vec2, Panel[]>, panel) => {
            let size = panel.size;  // TODO: round, reorder
            if (!acc.has(size)) {
                acc.set(size, [panel]);
            } else {
                acc.get(size).push(panel);
            }

            return acc;
        }, new Map<vec2, Panel[]>());

        return panelsBySize;
    }
}

export default PanelCutList;