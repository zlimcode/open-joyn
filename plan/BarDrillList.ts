import type { Construction, Bar } from "openjoyn/model";
import type Plan from "./Plan";

import { groupByPredicate } from "./helpers";
import type { BarHole } from "openjoyn/model/Bar";

type BarDrillListItem = {
    template: Bar;
    holesSide0Start: BarHole[],
    holesSide0End: BarHole[],
    holesSide1Start: BarHole[],
    holesSide1End: BarHole[],

    bars: Bar[];
};


class BarDrillList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    items(): BarDrillListItem[] {
        let construction = this.plan.construction;
        let barsWithHoles = construction.bars().filter((bar) => bar.holes.length > 0);
        // bars.sort((a, b) => a.sizeMax() - b.sizeMax());
        // bars.sort((a, b) => a.length - b.length);

        barsWithHoles.sort((a, b) => a.name.localeCompare(b.name));

        const barsByName = groupByPredicate(barsWithHoles, (bar) => bar.name);

        let items = [...barsByName.entries()].map(([_name, bars]) => {
            const templateBar = bars[0];

            const holesSide0 = templateBar.holesOnSide(0);
            const holesSide1 = templateBar.holesOnSide(1);

            const holesSide0Start = holesSide0.filter((hole) => hole.position <= templateBar.length / 2);
            const holesSide0End = holesSide0.filter((hole) => hole.position > templateBar.length / 2);
            const holesSide1Start = holesSide1.filter((hole) => hole.position <= templateBar.length / 2);
            const holesSide1End = holesSide1.filter((hole) => hole.position > templateBar.length / 2);

            return {
                template: templateBar,
                holesSide0Start: holesSide0Start,          // TODO: Consider the two other sides.
                holesSide0End: holesSide0End,          // TODO: Consider the two other sides.
                holesSide1Start: holesSide1Start,          // TODO: Consider the two other sides.
                holesSide1End: holesSide1End,          // TODO: Consider the two other sides.
                bars: bars,
            };
        });

        return items;
    }
}

export { BarDrillList };
export type { BarDrillListItem };