import PartBase from "./PartBase";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import { Vector3 } from "three";

@jsonObject
class Bar extends PartBase {
    @jsonMember(Number)
    length: number;

    @jsonArrayMember(Number)
    size: [number, number];

    constructor(length: number, size: [number, number]) {
        super();

        this.length = length;
        this.size = size;
    }

    pointFromStart(l: number) {
        let start = this.pos.clone();

        let v = new Vector3(0, 0, l);
        v.applyQuaternion(this.rot);
        v.add(start);

        return v;
    }

    pointFromEnd(l: number) {
        let start = this.pos.clone();

        let v = new Vector3(0, 0, this.length - l);
        v.applyQuaternion(this.rot);
        v.add(start);

        return v;
    }


}


export default Bar;