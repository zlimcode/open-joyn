import Construction from "./Construction";
import type PartBase from "./PartBase";

import type { vec2, vec3 } from "./PartBase";
import Panel from "./Panel";
import Marker from "./Marker";
import Bar from "./Bar";
import { ButtConnector, OverlapConnector } from "./Connector";

import type { OverlapConnectionResult, ButtConnectionResult } from "./Bar";

import * as THREE from "three";
import { toVector3 } from "./helpers";

/**
 * Valid letters for an axis
 */
type Axis = "x" | "y" | "z" | "+x" | "+y" | "+z" | "-x" | "-y" | "-z";


/**
 * Options for joinign parts
 * @category Factory
 */
interface JoinOptions {
    /** Hole diameter for overlapping connections */
    overlapHoleDia?: number;


    // TODO: butts!

    /** Draw the part highlighted in the preview */
    debug?: boolean;
};

/**
 * Common options for creating parts
 * @category Factory
 */
interface PartOptions {
    // /** An optional name */
    // name?: string,

    /** Position of the origin as `[x, y, z]` */
    position?: vec3,

    /** Alignment of the main axis of the part.
     * For your convenience: `["x", "y", "z"] = ["+x", "+y", "+z"]`
     */
    axis?: Axis,

    /** Draw the part highlighted in the preview */
    debug?: boolean;
};


/**
 * Options for creating Bars with [[Factory.bar]]
 * @category Factory
 */
interface BarOptions extends PartOptions {
    /** Total length of the Bar. A negative length will have the Bar pointing in the opposite direction. */
    length?: number,
    /** Will ignore length and try to generate a Bar between [[position]] and [[to]] */
    to?: vec3;
    /** `[width, height]` of the Bar cross-section */
    size?: vec2;
    /** Extend the bar by `[atStart, atEnd]` */
    extend?: vec2;
};


/**
 * Options for creating Panels with [[Factory.panel]]
 * @category Factory
 */
interface PanelOptions extends PartOptions {
    /** Thickness of the panel. A negative thickness will have the Panel pointing in the opposite direction */
    thickness?: number,

    /** `[width, height]` of the panel */
    size?: vec2;
};


/**
 * Options for creating Markers with [[Factory.marker]]
 * @see [[Factory.marker]]
 * @category Factory
 */
interface MarkerOptions extends PartOptions {
    /** Radius */
    radius?: number,

    /** Color as hex number. e.g. `0xff00ff` */
    color?: number;
};


function negateAxis(axis: Axis): Axis {
    if (axis.length == 1) {
        return ("-" + axis) as Axis;
    }

    if (axis.startsWith("+")) {
        return ("-" + axis[1]) as Axis;
    }

    if (axis.startsWith("-")) {
        return ("+" + axis[1]) as Axis;
    }

    return axis;
}


const DefaultDefaults = {
    bar: {
        size: [40, 40],
        length: 100,
        axis: "z"
    } as BarOptions,
    panel: {
        size: [100, 100],
        thickness: 12,
        axis: "z"
    } as PanelOptions,
    marker: {
        radius: 5.0,
        axis: "z"
    } as MarkerOptions,
    join: {
        overlapHoleDia: 10.0,
    } as JoinOptions
};


/**
 * A convenience construction factory, mainly used by the user API.
 * This is usually automatically created for you.
 * 
 * @category Factory
 */
class Factory {
    /**
     * @ignore
     */
    construction: Construction;
    private matrixStack: THREE.Matrix4[];
    private grid = [40, 40, 40];
    private currentGroup = "default";

    private defaults = DefaultDefaults;

    // group = "default";


    /**
     * Make a new factory.
     */
    constructor() {
        this.construction = new Construction();
        this.resetMatrix();
    }

    private currentMatrix(): THREE.Matrix4 {
        return this.matrixStack.slice(-1)[0];
    }

    /**
     * Save the current state of transformations. It can be restored with [[pop]].
     * @category Transformation
     */
    push() {
        let currentMatrix = this.currentMatrix();
        let newMatrix = currentMatrix.clone();
        this.matrixStack.push(newMatrix);

        if (this.matrixStack.length > 15) {
            throw new Error("push() called too often. Is it possible that you forgot a pop()?");
        }
    }

    /**
     * Restore the previously saved transformation state ([[push]]). 
     * 
     * **Warning**: Make sure to match each call to [[push]] with one to [[pop]]. Otherwise strange things will happen.
     * @category Transformation
     */
    pop() {
        if (this.matrixStack.length == 1) {
            throw new Error("pop() called too often. Is it possible that you forgot a push()?");
        }

        this.matrixStack.pop();
    }

    /**
     * Resets all currently applied transformations.
     * @category Transformation
     */
    resetMatrix() {
        this.matrixStack = [new THREE.Matrix4()];
    }

    /**
     * Sets the grid distances for [[moveGrid]]. This is essentially just a multiplier. 
     * @param x 
     * @param y 
     * @param z 
     * @category Transformation
     */
    setGrid(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        this.grid = [x, y, z];
    }

    /**
     * Move the coordinate system by `[x, y, z]` world units
     * @param x 
     * @param y 
     * @param z
     * @category Transformation
     */
    move(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        let tM = new THREE.Matrix4();
        tM.makeTranslation(x, y, z);
        this.currentMatrix().multiply(tM);
    }

    /**
     * Move the coordinate system by `[x, y, z]` grid units 
     * @see [[setGrid]]
     * @param x 
     * @param y 
     * @param z
     * @category Transformation
     */
    moveGrid(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        let gx = x * this.grid[0];
        let gy = y * this.grid[1];
        let gz = z * this.grid[2];

        this.move(gx, gy, gz);
    }

    /**
     * Create a new group (if it does not exist), otherwise use an existing group.
     * All created parts will be assigned to this group, until a new group is defined.
     * @param name name of the group
     */
    group(name: string) {
        this.currentGroup = name;
    }


    /**
     * Creates a marker. This will be visible in the 3D viewport
     * @param options options that define the marker
     */
    marker(options: MarkerOptions) {
        let opts = { ...this.defaults.marker, ...options };

        let marker = new Marker(opts.radius!, opts.color);

        this.finalizeAndAddPart(marker, opts);
        return marker;
    }

    /**
     * Set default options for all Markers created after this.
     * Setting the same option when calling `marker()` will overwrite this option.
     * @param options options to apply to defaults
     * @returns the currently set defaults
     * @category Building
     */
    defaultsMarker(options: MarkerOptions) {
        this.defaults.marker = { ...this.defaults.marker, ...options };
        return this.defaults.marker;
    }

    /**
     * Set default options for all Bars created after this.
     * Setting the same option when calling `bar()` will overwrite this option.
     * @param options options to apply to defaults
     * @returns the currently set defaults
     * @category Building
     */
    defaultsBar(options: BarOptions) {
        this.defaults.bar = { ...this.defaults.bar, ...options };
        return this.defaults.bar;
    }

    /**
     * Set default options for all Bars created after this.
     * Setting the same option when calling `panel()` will overwrite this option.
     * @param options options to apply to defaults
     * @returns the currently set defaults
     * @category Building
     */
    defaultsPanel(options: PanelOptions) {
        this.defaults.panel = { ...this.defaults.panel, ...options };
        return this.defaults.panel;
    }

    /**
     * Make a new Panel and add it to the construction.
     * In addition to the supplied options, the options from [[defaultsPanel]] are used.
     * @param options 
     * @returns the created Panel
     * @category Building
     */
    panel(options: PanelOptions) {
        let opts = { ...this.defaults.panel, ...options };

        if (opts.thickness! < 0.0) {
            opts.axis = negateAxis(opts.axis!);
        }

        let thickness = Math.abs(opts.thickness!);

        let panel = new Panel(thickness, opts.size!);
        this.finalizeAndAddPart(panel, opts);
        return panel;
    }

    /**
     * Make a new [[Bar]] and add it to the construction.
     * In addition to the supplied options, the options from [[defaultsPanel]] are used.
     * @param options options that define the Bar
     * @returns the created Bar
     * 
     * @example
     * f.bar({ position: [0, 100, 0], length: 600 });
     * 
     * @category Building
     */
    bar(options: BarOptions) {
        let opts = { ...this.defaults.bar, ...options };

        if (opts.length! < 0.0) {
            opts.axis = negateAxis(opts.axis!);
        }

        let length = Math.abs(opts.length!);
        let bar = new Bar(length, opts.size!);

        if (opts.to) {
            let pos = opts.position ?? [0, 0, 0];
            let to = opts.to;

            bar = Bar.betweenTwoPoints(pos, to, opts.size!);
        }

        this.finalizeAndAddPart(bar, opts);

        if (opts.extend) {
            bar.length = bar.length + opts.extend[0] + opts.extend[1];
            bar.pos.set(...bar.pointFromStart(-opts.extend[0]));
        }

        return bar;
    }

    /**
     * Make a [[Bar]] aligned to the **x**-axis 
     * @param options options that define the Bar
     * @returns the created Bar
     * @see [[bar]]
     * @category Building
     */
    barX(options: BarOptions) {
        options.axis = "x";
        return this.bar(options);
    }

    /**
     * Make a [[Bar]] aligned to the **y**-axis 
     * @param options 
     * @returns the created Bar
     * @see [[bar]]
     * @category Building
     */
    barY(options: BarOptions) {
        options.axis = "y";
        return this.bar(options);
    }

    /**
     * Make a [[Bar]] aligned to the **z**-axis 
     * @param options 
     * @returns the created Bar
     * @see [[bar]]
     * @category Building
     */
    barZ(options: BarOptions) {
        options.axis = "z";
        return this.bar(options);
    }

    /**
     * Generate some Fritten
     * @category Building
     */
    fritten() {
        let nR = () => Math.random() * 2 - 1;
        let count = 5 + Math.random() * 5;
        for (let i = 0; i < count; i++) {
            let posLower: vec3 = [nR() * 40, nR() * 40, 0];
            let posUpper: vec3 = [nR() * 400, nR() * 400, 1000];

            this.bar({ position: posLower, to: posUpper });
        }
    }

    /**
     * Set default options used for joining Bars.
     * Setting the same option when calling `join()` or `joinAll()` will overwrite this option.
     * @param options options to apply to defaults
     * @returns the currently set defaults
     * @category Connecting
     */
    defaultsJoin(options: JoinOptions) {
        this.defaults.join = { ...this.defaults.join, ...options };
        return this.defaults.join;
    }

    /**
     * Join all Bars that have been generated so far.
     * @param options
     * @category Connecting
     */
    joinAll(options: JoinOptions) {
        this.join(this.construction.bars(), options);
    }

    /**
     * Join the given Bars.
     * @param bars an array of Bars
     * @param options
     * @category Connecting
     */
    join(bars: Bar[], options: JoinOptions) {
        let opts = { ...this.defaults.join, ...options };

        const candidatePairs = Bar.findCandidatePairs(bars);

        let overlaps: OverlapConnectionResult[] = [];
        let butts: ButtConnectionResult[] = [];

        candidatePairs.forEach((barPair) => {
            const barA = barPair[0];
            const barB = barPair[1];

            let buttA = Bar.findButtConnection(barA, barB);

            if (buttA) {
                butts.push(buttA);
                return;
            }

            let buttB = Bar.findButtConnection(barB, barA);

            if (buttB) {
                butts.push(buttB);
                return;
            }

            let overlap = Bar.findOverlapConnection(barA, barB);

            if (overlap) {
                overlaps.push(overlap);
                return;
            }
        });

        const overlapSituations = this.groupOverlaps(overlaps);

        for (const situation of overlapSituations) {
            const first = situation[0];
            const last = situation[situation.length - 1];

            const posFirst = first.a.pointOnSide((first.sideA + 2) % 4, first.posA);
            const posLast = last.b.pointOnSide((last.sideB + 2) % 4, last.posB);

            // Entry to exit
            const delta = toVector3(posLast).sub(toVector3(posFirst));
            const length = delta.length();

            // Make holes
            for (let i = 0; i < situation.length; i++) {
                const conn = situation[i];

                conn.a.addHole(conn.posA, (conn.sideA + 2) % 4, opts.overlapHoleDia!);

                if (i == situation.length - 1) {
                    conn.b.addHole(conn.posB, conn.sideB, opts.overlapHoleDia!);
                }
            }

            const parts: PartBase[] = [];

            for (let i = 0; i < situation.length; i++) {
                const conn = situation[i];

                parts.push(conn.a);

                if (i == situation.length - 1) {
                    parts.push(conn.b);
                }
            }

            const connector = new OverlapConnector(length, parts);
            this.finalizeAndAddPart(connector, { position: posFirst, debug: opts.debug });
            connector.rot.setFromUnitVectors(new THREE.Vector3(0, 0, 1), delta.normalize());
        }

        for (const butt of butts) {
            const lineFirst = butt.a.centerLine();
            const posSecond = butt.b.pointOnSide((butt.sideB + 2) % 4, butt.posB);

            const length = butt.b.sizeMax() + butt.a.sizeMax();        // TODO: Make it correct. Check!

            // TODO: all this above should be provided by Bar 

            const delta = lineFirst.delta(new THREE.Vector3()).normalize();

            if (!butt.atStart) {
                delta.multiplyScalar(-1);
            }

            const connector = new ButtConnector(length, [butt.a, butt.b]);
            this.finalizeAndAddPart(connector, { position: posSecond, debug: opts.debug });
            connector.rot.setFromUnitVectors(new THREE.Vector3(0, 0, 1), delta.normalize());

            // Make holes (one per bar)

            // TODO: do!
        }

        return;
    }

    private groupOverlaps(overlaps: OverlapConnectionResult[]) {
        let isOtherSide = (sideA: number, sideB: number): boolean => {
            return ((sideA + 2) % 4) == sideB;
        };

        let isConnectedThrough = (sideA: number, posA: number, sideB: number, posB: number): boolean => {
            return (isOtherSide(sideA, sideB) && Math.abs(posA - posB) < 0.001); // TODO: use epsilon
        };

        // TODO: factor out
        // FIXME: find out why this works when kept sorted, fails otherwise...

        // overlaps.sort(() => (Math.random() > .5) ? 1 : -1);
        // overlaps.reverse();

        let overlapSituations = overlaps.reduce((situations, conn) => {
            let matched = false;

            for (let situation of situations) {
                let left = situation[0];
                let right = situation[situation.length - 1];

                if (conn.a == left.a && isConnectedThrough(conn.sideA, conn.posA, left.sideA, left.posA)) {
                    let newC = { position: conn.position, a: conn.b, b: conn.a, posA: conn.posB, posB: conn.posA, sideA: conn.sideB, sideB: conn.sideA };
                    situation.unshift(newC);
                    matched = true;
                } else if (conn.b == left.a && isConnectedThrough(conn.sideB, conn.posB, left.sideA, left.posA)) {
                    situation.unshift(conn);
                    matched = true;
                } else if (conn.a == right.b && isConnectedThrough(conn.sideA, conn.posA, right.sideB, right.posB)) {
                    situation.push(conn);
                    matched = true;
                } else if (conn.b == right.b && isConnectedThrough(conn.sideB, conn.posB, right.sideB, right.posB)) {
                    let newC = { position: conn.position, a: conn.b, b: conn.a, posA: conn.posB, posB: conn.posA, sideA: conn.sideB, sideB: conn.sideA };
                    situation.push(newC);
                    matched = true;
                }

                if (matched) {
                    break;
                }
            }

            if (!matched) {
                situations.push([conn]);
            }

            return situations;
        }, [] as OverlapConnectionResult[][]);

        return overlapSituations;
    }

    private finalizeAndAddPart(part: PartBase, options: PartOptions) {
        // TODO: from default style
        // TODO: use typedjson to validate??

        // if (options.name) {
        //     part.name = options.name;
        // }

        if (options.debug) {
            part.debug = options.debug;
        }

        let axis = options.axis ?? "z";

        switch (axis.toLocaleLowerCase()) {
            case "x":
            case "+x":
                part.rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.5);
                break;

            case "y":
            case "+y":
                part.rot.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * 0.5);
                break;

            case "z":
            case "+z":
                break;

            case "-x":
                part.rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI * 0.5);
                break;

            case "-y":
                part.rot.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), -Math.PI * 0.5);
                break;

            case "-z":
                part.rot.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
                break;

            default:
                throw new Error(`Unkown axis ${axis}`);
        }

        // TODO: take rotation of global matrix into account

        let pos = options.position ?? [0.0, 0.0, 0.0];

        let transPos = new THREE.Vector3(...pos);
        transPos.applyMatrix4(this.currentMatrix());
        part.pos = transPos;
        part.group = this.currentGroup;

        this.construction.addPart(part);
    }
}

export default Factory;
export type { Factory, JoinOptions, BarOptions, PanelOptions, MarkerOptions, Axis };
