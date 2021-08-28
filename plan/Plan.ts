import type { Connector, Construction, Meta } from "openjoyn/model";
import { Step } from "openjoyn/model";

import type { Style } from "openjoyn/style";
import { getStyle } from "openjoyn/style";
import { groupByEqual, groupByPredicate, fixedPrecision } from "./helpers";

import type { Bar, Panel } from "openjoyn/model";



type PlanOptions = {
    name: string,
    barStockLength?: number;
};


class Plan {
    meta: Meta;
    construction: Construction;
    style: Style;
    steps: Step[];
    options: PlanOptions;

    constructor(meta: Meta, construction: Construction, options: PlanOptions, style: Style, steps: Step[]) {
        this.meta = meta;
        this.construction = construction;
        this.style = style;
        this.steps = steps;
        this.options = options;
    }

    hasBars() {
        return this.construction.bars().length > 0;
    }

    hasPanels() {
        return this.construction.panels().length > 0;
    }


    groupPanelsByThickness(panels: Panel[]) {
        panels.sort((a, b) => a.thickness - b.thickness);

        const barsByLength = groupByPredicate(panels, (panel) => fixedPrecision(panel.thickness, this.style.precision));
        return [...barsByLength.values()];
    }

    groupPanelsBySize(panels: Panel[]) {
        panels.sort((a, b) => a.size[0] - b.size[0]);

        const sizePredicateFn = (panel: Panel) => `${fixedPrecision(panel.size[0], this.style.precision)}x${fixedPrecision(panel.size[1], this.style.precision)}`;

        const panelsBySize = groupByPredicate(panels, sizePredicateFn);
        return [...panelsBySize.values()];
    }

    groupBarsByLength(bars: Bar[]) {
        bars.sort((a, b) => a.length - b.length);

        const barsByLength = groupByPredicate(bars, (bar) => fixedPrecision(bar.length, this.style.precision));
        return [...barsByLength.values()];
    }

    groupBarsBySize(bars: Bar[]) {
        bars.sort((a, b) => a.size[0] - b.size[0]);

        const sizePredicateFn = (bar: Bar) => `${fixedPrecision(bar.size[0], this.style.precision)}x${fixedPrecision(bar.size[1], this.style.precision)}`;
        const barsBySize = groupByPredicate(bars, sizePredicateFn);
        return [...barsBySize.values()];
    }


    groupConnectorsByLength(connectors: Connector[]) {
        connectors.sort((a, b) => a.length - b.length);

        const connectorsByLength = groupByPredicate(connectors, (connector) => fixedPrecision(connector.length, 10));       // TODO: connector configurable
        return [...connectorsByLength.values()];    
    }



    static make(meta: Meta, construction: Construction, options: PlanOptions) {
        if (!meta.style) {
            console.warn("No style set. Choosing default");
        }

        let style = meta.style ? getStyle(meta.style) : getStyle("default");

        if (!style) {
            throw new Error(`Could not find style ${meta.style}`);
        }

        if (options.barStockLength) {
            style.bars.stockLength = options.barStockLength;
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

        return new Plan(meta, construction, options, style, steps);
    }
};


export { Plan };
export type { PlanOptions };