// import "reflect-metadata";

import * as THREE from "three";

import { jsonMember, jsonObject } from "typedjson";

/**
 * Base class to represent parts.
 * @category Parts
 */
@jsonObject
abstract class PartBase {
    @jsonMember(String)
    public name: string = "";

    @jsonMember(THREE.Vector3)
    public pos: THREE.Vector3;

    @jsonMember(THREE.Quaternion)
    public rot: THREE.Quaternion;

    @jsonMember(Boolean)
    public debug: boolean = false;

    constructor() {
        this.pos = new THREE.Vector3();
        this.rot = new THREE.Quaternion();
    }
};

/**
 * A vector of two components. It is just an array of three numbers.
 * 
 * Usually they represent `[x, y, z]`
 */
type vec2 = [number, number];

/**
 * A vector of three components. It is just an array of three numbers.
 * 
 * Usually they represent `[width, height]`
 */
type vec3 = [number, number, number];


export default PartBase;
export type { vec2, vec3 };

