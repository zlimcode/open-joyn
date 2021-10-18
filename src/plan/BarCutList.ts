import type { Bar, vec2 } from "openjoyn/model";
import type { Plan } from "./Plan";


type BarCutListItem = {
    size: vec2;
    pieces: BarCutListItemPieces[];
};

type BarCutListItemPieces = {
    length: number,
    bars: Bar[];
};

class BarCutList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

 
    items(): BarCutListItem[] {
        let bars = this.plan.construction.bars();
        let sizeGroups = this.plan.groupBarsBySize(bars);

        let out = sizeGroups.map((groupBars) => {
            let size = groupBars[0].size;

            let pieces = this.plan.groupBarsByLength(groupBars);

            let position: BarCutListItem = {
                size: size,
                pieces: pieces.map((p) => {
                    return {
                        length: p[0].length,
                        bars: p
                    };
                })
            };

            return position;
        });

        return out;
    }
}

export { BarCutList };
export type { BarCutListItem };