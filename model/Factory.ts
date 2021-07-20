import Construction from "./Construction";
import type PartBase from "./PartBase";
import type { vec2, vec3 } from "./PartBase";
import Bar from "./Bar";
import Panel from "./Panel";
import Marker from "./Marker";

import * as THREE from "three";


import { closestPointOnSegmentToSegment, pairs } from "./helpers";


let validateDefined = (v: any) => {
    if (v === undefined) {
        throw new Error("Parameter must be defined");
    }
};

let validatePosition3 = (v: any) => {
    validateDefined(v);

    validateTuple(v, 3);
};


let validateNumber = (v: any) => {

};

let validateTuple = (v: any, elementCount: number) => {
    if (v.length != elementCount) {
        throw new Error("Parameter must have " + elementCount + " elements");
    }
};



/**
 * Common options for creating parts
 * 
 */
interface PartOptions {
    /** An optional name */
    name?: string,

    /** Position of the origin as `[x, y, z]` */
    position?: vec3,

    /** Alignment of the main axis of the part. */
    axis?: "x" | "y" | "z",

    /** Draw the part highlighted in the preview */
    debug?: boolean;
};


/**
 * Options for creating bars with [[Factory.bar]]
 * @category Factory
 */
interface BarOptions extends PartOptions {
    /** Total length of the bar */
    length?: number,
    /** Will ignore length and try to generate a Bar between [[position]] and [[to]] */
    to?: vec3;
    /** `[width, height]` of the bar cross-section */
    size?: vec2;
};


/**
 * Options for creating panels with [[Factory.panel]]
 * @category Factory
 */
interface PanelOptions extends PartOptions {
    /** Thickness of the panel */
    thickness?: number,

    /** `[width, height]` of the panel */
    size?: vec2;
};


/**
 * Options for creating markers with [[Factory.marker]]
 * @see [[Factory.marker]]
 * @category Factory
 */
interface MarkerOptions extends PartOptions {
    radius?: number,
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
    private groupName = "";

    private defaults = {
        bar: {
            size: [40, 40],
            length: 100
        } as BarOptions,
        panel: {
            size: [100, 100],
            thickness: 12
        } as PanelOptions,
    };

    // group = "default";


    /**
     * Make a new factory.
     */
    constructor() {
        this.construction = new Construction();
        this.matrixStack = [new THREE.Matrix4()];
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
    }

    /**
     * Restore the previously saved transformation state ([[push]]). 
     * 
     * **Warning**: Make sure to match each call to [[push]] with one to [[pop]]. Otherwise strange things will happen.
     * @category Transformation
     */
    pop() {
        // TODO: check for empty (popped too often)
        this.matrixStack.pop();
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
     * @alpha Bla bla bla
     */
    group(name: string) {
        this.groupName = name;
    }


    /**
     * Creates a marker. This will be visible in the 3D viewport
     * @param options options that define the marker
     */
    marker(options: MarkerOptions) {
        let defaultRadius = 10;  // TODO: somewhere

        let marker = new Marker(options.radius ?? defaultRadius);

        this.finalizeAndAddPart(marker, options);
        return marker;
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

        let panel = new Panel(opts.thickness, opts.size);
        this.finalizeAndAddPart(panel, options);
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
        let bar = new Bar(opts.length, opts.size);

        if (opts.to) {
            let pos = opts.position ?? [0, 0, 0];
            bar = Bar.betweenTwoPoints(pos, options.to, opts.size);
        }

        this.finalizeAndAddPart(bar, opts);
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
     * Join all Bars that have been generated so far.
     * @category Connecting
     */
    joinAll() {
        this.join(this.construction.bars);
    }

    /**
     * Join the given Bars.
     * @param bars an array of Bars
     * @category Connecting
     */
    join(bars: Bar[]) {
        const barPairs = pairs(bars);

        barPairs.forEach((barPair) => {
            const barA = barPair[0];
            const barB = barPair[1];

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const lineA = barA.lineOnSide(i);
                    const lineB = barB.lineOnSide(j);

                    const pointA = new THREE.Vector3();
                    const pointB = new THREE.Vector3();

                    // TODO: catch points outside segments

                    closestPointOnSegmentToSegment(lineA.start, lineA.end, lineB.start, lineB.end, pointA, pointB);

                    let dist = pointA.distanceToSquared(pointB);
                    if (dist < (0.1 * 0.1)) {   // TODO: to config
                        this.marker({ radius: 5.0, position: pointA.toArray() });
                        this.marker({ radius: 5.0, position: pointB.toArray() });
                    }
                }
            }

        });
    }

    private finalizeAndAddPart(part: PartBase, options: PartOptions) {
        // TODO: from default style
        // TODO: use typedjson to validate??

        if (options.name) {
            part.name = options.name;
        }

        if (options.debug) {
            part.debug = options.debug;
        }

        let axis = options.axis ?? "z";

        switch (axis.toLocaleLowerCase()) {
            case "x":
                part.rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.5);
                break;

            case "y":
                part.rot.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * 0.5);
                break;

            case "z":
                break;

            default:
                throw new Error(`Unkown axis ${axis}`);
        }


        // TODO: take rotation of global matrix into account

        let pos = options.position ?? [0.0, 0.0, 0.0];

        let transPos = new THREE.Vector3(...pos);
        transPos.applyMatrix4(this.currentMatrix());
        part.pos = transPos;

        this.construction.addPart(part, this.groupName);
    }

}


export default Factory;
export type { Factory, BarOptions, PanelOptions, MarkerOptions };
