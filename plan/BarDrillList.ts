import type { Construction, Bar } from "openjoyn/model";
import type Plan from "./Plan";

import { groupByPredicate } from "./helpers";

class BarDrillListItem {
    template: Bar;

    bars: Bar[];

    constructor(first: Bar, bars: Bar[]) {
        this.template = first;
        this.bars = bars;
    }
}


class BarDrillList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    items(): BarDrillListItem[] {
        let construction = this.plan.construction;
        let bars = construction.bars();
        // bars.sort((a, b) => a.sizeMax() - b.sizeMax());
        // bars.sort((a, b) => a.length - b.length);

        bars.sort((a, b) => a.name.localeCompare(b.name));

        const barsByName = groupByPredicate(bars, (bar) => bar.name);

        let items = [...barsByName.entries()].map(([_name, bars]) => {
            return new BarDrillListItem(bars[0], bars);
        });

        return items;
    }
}

export { BarDrillList, BarDrillListItem };