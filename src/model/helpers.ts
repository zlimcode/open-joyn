import type { vec2, vec3 } from "./PartBase";
import * as THREE from "three";

function pairs<T>(arr: T[]): [T, T][] {
    let res: [T, T][] = [];

    for (let i = 0; i < arr.length - 1; i++) {
        const a = arr[i];

        for (let j = i + 1; j < arr.length; j++) {
            const b = arr[j];

            res.push([a, b]);
        }
    }

    return res;
}


/**
 * Maps a value from range to another range
 * @param n value to map
 * @param start1 lower bound of the input range
 * @param stop1 upper bound of the input range
 * @param start2 lower bound of the output range
 * @param stop2 upper bound of the output range
 * @returns mapped value
 */
function map(n: number, start1: number, stop1: number, start2: number, stop2: number) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

/**
 * Maps a value from range to another range. Compared to [[map]],
 * this will also constrain the value to the output range.
 * @param n value to map
 * @param start1 lower bound of the input range
 * @param stop1 upper bound of the input range
 * @param start2 lower bound of the output range
 * @param stop2 upper bound of the output range
 * @returns mapped and constrained value
 */
function mapConstrain(v: number, start1: number, stop1: number, start2: number, stop2: number) {
    const newVal = map(v, start1, stop1, start2, stop2);

    if (start2 < stop2) {
        return this.constrain(newVal, start2, stop2);
    } else {
        return this.constrain(newVal, stop2, start2);
    }
}

/**
 * Constrains the given value between the minum and maximum value
 * @param v value to constrain
 * @param min minimum value
 * @param max maximum value
 * @returns constrained value
 */
function constrain(v: number, min: number, max: number) {
    return Math.max(Math.min(v, max), min);
};

/**
 * Convert value from radians to degrees
 * @param v angle in radians
 * @returns angle in degrees
 */
function degrees(v: number) {
    return v / Math.PI * 180.0;
}

/**
 * Convert value from degrees to radians
 * @param v angle in degrees
 * @returns angle in radians
 */
function radians(v: number) {
    return v / 180.0 * Math.PI;
}

/**
 * For now just a wrapper around `console.log` to print messages to the development console
 * @param args 
 */
function log(...args: any[]) {
    console.log("build():", args);
}


function toVector3(v: vec3): THREE.Vector3 {
    return new THREE.Vector3().fromArray(v);
}


function toVector2(v: vec2): THREE.Vector2 {
    return new THREE.Vector2().fromArray(v);
}


// let validateDefined = (name: string, v: any) => {
//     if (v === undefined) {
//         throw new Error("Parameter must be defined");
//     }
// };

// let validatePosition3 = (name: string, v: any) => {
//     validateDefined(name, v);
//     validateTuple(name, v, 3);
// };


// let validateNumber = (_name: string, v: any) => {

// };

// let validateTuple = (name: string, v: any, elementCount: number) => {
//     if (v.length != elementCount) {
//         throw new Error("Argument must have " + elementCount + " elements");
//     }
// };


export { log, pairs, map, mapConstrain, constrain, radians, degrees, toVector2, toVector3 };