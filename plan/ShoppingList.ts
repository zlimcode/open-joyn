import type { Plan } from "./Plan";


type ShoppingListItem = {
    amount: number;
    unit: string;

    label: string;
    description: string;
};

class ShoppingList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }



    items(): ShoppingListItem[] {
        // let bars = this.plan.construction.bars();
        // let sizeGroups = this.plan.groupBarsBySize(bars);

        // let out = sizeGroups.map((groupBars) => {
        //     let size = groupBars[0].size;

        //     let pieces = this.plan.groupBarsByLength(groupBars);

        //     let position: BarCutListItem = {
        //         size: size,
        //         pieces: pieces.map((p) => {
        //             return {
        //                 length: p[0].length,
        //                 bars: p
        //             };
        //         })
        //     };

        //     return position;
        // });

        // return out;

        return [];
    }
}

export { ShoppingList };
export type { ShoppingListItem };