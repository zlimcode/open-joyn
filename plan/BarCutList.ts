import type { Bar, vec2 } from "openjoyn/model";
import type Plan from "./Plan";

import { groupByPredicate, fixedPrecision } from "./helpers";

type BarCutPosition = {
    size: vec2;
    pieces: BarCutPositionPieces[];
};

type BarCutPositionPieces = {
    length: number,
    bars: Bar[];
};

class BarCutList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    groupByLength(bars: Bar[]) {
        bars.sort((a, b) => a.length - b.length);

        const barsByLength = groupByPredicate(bars, (bar) => fixedPrecision(bar.length, this.plan.style.precision));
        return [...barsByLength.values()];
    }

    groupBySize(bars: Bar[]) {
        bars.sort((a, b) => a.size[0] - b.size[0]);

        const sizePredicateFn = (bar: Bar) => `${fixedPrecision(bar.size[0], this.plan.style.precision)}x${fixedPrecision(bar.size[1], this.plan.style.precision)}`;
        const barsBySize = groupByPredicate(bars, sizePredicateFn);
        return [...barsBySize.values()];
    }

    positions(): BarCutPosition[] {
        let bars = this.plan.construction.bars();
        let sizeGroups = this.groupBySize(bars);

        let out = sizeGroups.map((groupBars) => {
            let size = groupBars[0].size;

            let pieces = this.groupByLength(groupBars);

            let position: BarCutPosition = {
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

export default BarCutList;
export type { BarCutPosition };