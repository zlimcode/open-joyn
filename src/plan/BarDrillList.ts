import type { Bar } from "openjoyn/model";
import type { Plan } from "./Plan";

import { groupByPredicate, naturalCompare, groupByEqual } from "./helpers";
import type { BarHole } from "openjoyn/model/Bar";

type BarDrillListBarGroup = {
    template: Bar;
    bars: Bar[];
};

type BarDrillListItem = {
    template: Bar;
    holesSide0Start: BarHole[],
    holesSide0End: BarHole[],
    holesSide1Start: BarHole[],
    holesSide1End: BarHole[],

    bars: Bar[],
    barsGroups: BarDrillListBarGroup[]
};


class BarDrillList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    items(): BarDrillListItem[] {
        let construction = this.plan.construction;
        let barsWithHoles = construction.bars().filter((bar) => bar.holes.length > 0);

        barsWithHoles.sort((a, b) => naturalCompare(a.name, b.name));

        const equalBars = groupByEqual(barsWithHoles, (a, b) => a.equals(b));

        let items = equalBars.map((bars) => {
            const templateBar = bars[0];

            const holesSide0 = templateBar.holesOnSide(0);
            const holesSide1 = templateBar.holesOnSide(1);

            const holesSide0Start = holesSide0.filter((hole) => hole.position <= templateBar.length / 2);
            const holesSide0End = holesSide0.filter((hole) => hole.position > templateBar.length / 2);
            const holesSide1Start = holesSide1.filter((hole) => hole.position <= templateBar.length / 2);
            const holesSide1End = holesSide1.filter((hole) => hole.position > templateBar.length / 2);

            const barsByName = groupByPredicate(bars, (bar) => bar.name);
            let grouped: BarDrillListBarGroup[] = [...barsByName.entries()].map(([_name, groupBars]) => { 
                return {template: groupBars[0], bars: groupBars}
            });

            return {
                template: templateBar,
                holesSide0Start: holesSide0Start,          // TODO: Consider the two other sides.
                holesSide0End: holesSide0End,          // TODO: Consider the two other sides.
                holesSide1Start: holesSide1Start,          // TODO: Consider the two other sides.
                holesSide1End: holesSide1End,          // TODO: Consider the two other sides.
                barsGroups: grouped,
                bars: bars
            };
        });

        return items;
    }
}

export { BarDrillList };
export type { BarDrillListItem, BarDrillListBarGroup };