import type { Construction, Bar } from "openjoyn/model";
import type Plan from "./Plan";

import { groupByPredicate } from "./helpers";

class BarDrillList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    pieces(): Map<number, Bar[]> {
        let construction = this.plan.construction;
        let bars = construction.bars();
        bars.sort((a, b) => a.length - b.length);

        const barsByLength = groupByPredicate(bars, (bar) => Math.round(bar.length));

        return barsByLength;
    }
}

export default BarDrillList;