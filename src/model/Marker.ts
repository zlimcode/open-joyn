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

    constructor(radius: number) {
        super();
        this.radius = radius;
    }
}

export default Marker;