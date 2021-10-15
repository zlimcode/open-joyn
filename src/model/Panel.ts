import PartBase, { vec2 } from "./PartBase";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";

/**
 * Some kind of flat panel, like a wooden board.
 * @category Parts
 */
@jsonObject
class Panel extends PartBase {
    @jsonMember(Number)
    thickness: number;

    @jsonArrayMember(Number)
    size: vec2;

    constructor(thickness: number, size: vec2) {
        super();

        this.thickness = thickness;
        this.size = size;
    }
}



export default Panel;