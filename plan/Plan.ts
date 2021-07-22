import type { Construction, Meta } from "openjoyn/model";
import { Step } from "openjoyn/model";

import type { Style } from "openjoyn/style";
import { getStyle } from "openjoyn/style";


class Plan {
    meta: Meta;
    construction: Construction;
    style: Style;
    steps: Step[];

    constructor(meta: Meta, construction: Construction, style: Style, steps: Step[]) {
        this.meta = meta;
        this.construction = construction;
        this.style = style;
        this.steps = steps;
    }

    static make(meta: Meta, construction: Construction) {
        if (!meta.style) {
            console.warn("No style set. Choosing default");
        }

        let style = meta.style ? getStyle(meta.style) : getStyle("default");

        if (!style) {
            throw new Error(`Could not find style ${meta.style}`);
        }

        let groupNames = construction.groupNames();
        let metaStepGroupNames = new Set(meta.steps.map((s) => s.groupName));

        let missingGroups = new Set<string>();

        for (const groupName of groupNames) {
            if (!metaStepGroupNames.has(groupName)) {
                missingGroups.add(groupName);
            }
        }

        let steps: Step[] = [];

        for (const metaStep of meta.steps) {
            steps.push(metaStep);
        }

        for (const missingGroupName of missingGroups) {
            let step = new Step({ groupName: missingGroupName });
            console.warn("Adding step for group", missingGroupName, "which is missing in steps");
            steps.push(step);
        }

        return new Plan(meta, construction, style, steps);
    }
};


export default Plan;