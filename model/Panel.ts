import PartBase from "./PartBase";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";

@jsonObject
class Panel extends PartBase {
    @jsonMember(Number)
    thickness: number;

    @jsonArrayMember(Number)
    size: [number, number];

    constructor(thickness: number, size: [number, number]) {
        super();

        this.thickness = thickness;
        this.size = size;
    }
}



export default Panel