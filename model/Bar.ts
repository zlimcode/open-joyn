import PartBase, { vec2, vec3 } from "./PartBase";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import * as THREE from "three";



/**
 * A long object with a rectangular cross-section
 * @category Parts
 */
@jsonObject
class Bar extends PartBase {
    @jsonMember(Number)
    length: number;

    @jsonArrayMember(Number)
    size: vec2;

    constructor(length: number, size: vec2) {
        super();

        this.length = length;
        this.size = size;
    }

    /**
     * Calculate a point on the bar that has a given distance from the start of the Bar.
     * @param l distance from start of the bar
     * @returns the point
     */
    pointFromStart(l: number): vec3 {
        let v = new THREE.Vector3(0, 0, l);
        v.applyQuaternion(this.rot);
        v.add(this.pos);

        return v.toArray();
    }

    /**
     * Calculate a point on the bar that has a given distance from the end of the Bar.
     * @param l distance from end of the bar
     * @returns the point
     */
    pointFromEnd(l: number): vec3 {
        let v = new THREE.Vector3(0, 0, this.length - l);
        v.applyQuaternion(this.rot);
        v.add(this.pos);

        return v.toArray();
    }


    /**
     * @ignore
     * @param side 
     * @returns 
     */
    lineOnSide(side: number): THREE.Line3 {
        let x = this.size[0] * 0.5;
        let y = this.size[1] * 0.5;

        // TODO: make array with side vectors

        switch(side) {
            case 0:
                y = 0;
                break;
            case 1:
                x = 0;
                break
            case 2:
                x = -x;
                y = 0;
                break
            case 3:
                x = 0;
                y = -y;
                break
            default:
                console.warn("Unknown side", side);
            
        }

        let start = new THREE.Vector3(x, y, 0);
        start.applyQuaternion(this.rot);
        start.add(this.pos);

        let end = new THREE.Vector3(x, y, this.length);
        end.applyQuaternion(this.rot);
        end.add(this.pos);

        let line = new THREE.Line3(start, end);
        return line;

    }

    /**
     * @ignore
     * @param from 
     * @param to 
     * @param size 
     * @returns 
     */
    static betweenTwoPoints(from: vec3, to: vec3, size: vec2) {
        const fromV = new THREE.Vector3().fromArray(from);
        const toV = new THREE.Vector3().fromArray(to);

        const diffV = toV.clone().sub(fromV);

        const length = diffV.length();

        var axis = new THREE.Vector3(0, 0, 1);
        const quat = new THREE.Quaternion().setFromUnitVectors(axis, diffV.clone().normalize());

        let bar = new Bar(length, size);

        bar.pos.copy(fromV);
        bar.rot.copy(quat);

        return bar;
    }
}


export default Bar;