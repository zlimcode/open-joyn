import PartBase, { vec2, vec3 } from "./PartBase";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import * as THREE from "three";


@jsonObject
class Connector extends PartBase {
    @jsonMember(Number)
    length: number;

    constructor(length: number) {
        super();

        this.length = length;
    }
}

export default Connector;