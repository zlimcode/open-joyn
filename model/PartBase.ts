// import "reflect-metadata";

import * as THREE from "three";

import { jsonMember, jsonObject } from "typedjson";

@jsonObject
abstract class PartBase {
    @jsonMember(String)
    public name: string = "";

    @jsonMember(THREE.Vector3)
    public pos: THREE.Vector3;

    @jsonMember(THREE.Quaternion)
    public rot: THREE.Quaternion;

    constructor() {
        this.pos = new THREE.Vector3();
        this.rot = new THREE.Quaternion();
    }
};


export default PartBase

