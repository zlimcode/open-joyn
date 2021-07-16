import Construction from "./Construction";
// import { NumberParameter, ParameterBase } from "./Parameter";

import Bar from "./Bar";
import Panel from "./Panel";

import * as THREE from "three";
import type PartBase from "./PartBase";
import Marker from "./Marker";


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
 * Options to create a new @see{@link PartBase}
 */
interface PartOptions {
    name?: string,
    position?: [number, number, number],
    length?: number,
};


/**
 * Options to create a new @see{@link Bar}
 */
interface BarOptions extends PartOptions {
    length?: number,
    size?: [number, number];
};


/**
 * Options to create a new @see{@link Panel}
 */
interface PanelOptions extends PartOptions {
    thickness?: number,
    size?: [number, number];
};


/**
 * Options to create a new @see{@link Marker}
 */
 interface MarkerOptions extends PartOptions {
    radius?: number,
};

/**
 * A convenience construction factory, mainly used by the user API
 */
class Factory {
    construction: Construction;
    protected matrixStack: THREE.Matrix4[];
    protected grid = [40, 40, 40];
    protected groupName = "";

    // group = "default";

    constructor() {
        this.construction = new Construction();
        this.matrixStack = [new THREE.Matrix4()];
    }

    currentMatrix(): THREE.Matrix4 {
        return this.matrixStack.slice(-1)[0];
    }

    push() {
        let currentMatrix = this.currentMatrix();
        let newMatrix = currentMatrix.clone();
        this.matrixStack.push(newMatrix);
    }

    pop() {
        // TODO: check for empty (popped too often)
        this.matrixStack.pop();
    }


    setGrid(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        this.grid = [x, y, z];
    }

    /**
     * Move the coordinate system by x, y, z world units
     * @param x 
     * @param y 
     * @param z 
     */
    move(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        let tM = new THREE.Matrix4();
        tM.makeTranslation(x, y, z);
        this.currentMatrix().multiply(tM);
    }

    /**
     * Move the coordinate system by x, y, z grid units 
     * @see {@link makeGrid}
     * @param x 
     * @param y 
     * @param z 
     */
    moveGrid(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        let gx = x * this.grid[0];
        let gy = y * this.grid[1];
        let gz = z * this.grid[2];

        this.move(gx, gy, gz);
    }

    /**
     * Create a new group (if it does not exist).
     * All created parts will be assigned to this group, until a new group is defined.
     * @param name The name of the group
     */
    group(name: string) {
        this.groupName = name;
    }

    private finalizeAndAddPart(part: PartBase, options: PartOptions) {
        // TODO: from default style
        // TODO: orientation
        // TODO: unify pos, rot
        // TODO: use typedjson to validate??

        if (options.name) {
            part.name = options.name;
        }

        let pos = options.position ?? [0.0, 0.0, 0.0];

        let transPos = new THREE.Vector3(...pos);
        transPos.applyMatrix4(this.currentMatrix());
        part.pos = transPos;

        this.construction.addPart(part, this.groupName);
    }

    marker(options: MarkerOptions) {
        let defaultRadius = 10;  // TODO: somewhere

        let marker = new Marker(options.radius ?? defaultRadius);

        this.finalizeAndAddPart(marker, options);
        return marker;
    }

    panel(options: PanelOptions) {
        let defaultThickness = 12;  // TODO: somewhere
        let defaultSize: [number, number] = [100, 100];

        let panel = new Panel(options.thickness ?? defaultThickness, options.size ?? defaultSize);
        this.finalizeAndAddPart(panel, options);
        return panel;
    }


    bar(options: BarOptions) {
        let defaultLength = 500;  // TODO: somewhere
        let defaultSize: [number, number] = [40, 40];

        let bar = new Bar(options.length ?? defaultLength, options.size ?? defaultSize);
        this.finalizeAndAddPart(bar, options);
        return bar;
    }
}


export default Factory;