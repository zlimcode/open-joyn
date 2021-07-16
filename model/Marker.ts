import PartBase from "./PartBase";

import { jsonObject, jsonMember } from "typedjson";

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