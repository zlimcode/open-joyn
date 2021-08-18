import type { Construction, Meta } from "openjoyn/model";
import { Step } from "openjoyn/model";

import type { Style } from "openjoyn/style";
import { getStyle } from "openjoyn/style";
import { groupByEqual, groupByPredicate } from "./helpers";


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

    hasBars() {
        return this.construction.bars().length > 0;
    }

    hasPanels() {
        return this.construction.panels().length > 0;
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

        // TODO: should construction be mutated?
        for (const bar of construction.bars()) {
            bar.normalize();
        }

        let barsByGroups = construction.barsByGroups(steps.map((step) => step.groupName));

        for (const step of steps) {
            let bars = barsByGroups.get(step.groupName)!;

            let sameBars = groupByEqual(bars, (a, b) => a.equals(b));

            for (let i = 0; i < sameBars.length; i++) {
                const same = sameBars[i];

                const name = `${step.prefixOrGroup()}_${i + 1}`;

                for (const bar of same) {
                    bar.name = name;
                }
            }
        }

        return new Plan(meta, construction, style, steps);
    }
};


export default Plan;