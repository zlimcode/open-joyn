import PartBase from "./PartBase";

import { jsonObject, jsonMember } from "typedjson";

/**
 * A round marker to mark things :)
 * @category Parts
 */
@jsonObject
class Marker extends PartBase {
    @jsonMember(Number)
    radius: number;

    @jsonMember(Number)
    color?: number;

    constructor(radius: number, color?: number) {
        super();
        this.radius = radius;
        this.color = color;
    }
}

export default Marker;