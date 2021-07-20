import PartBase from "./PartBase";
import type Connector from "./Connector";
import Bar from "./Bar";
import Panel from "./Panel";
import Marker from "./Marker";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";


const PartsTypes = [Bar, Panel, Marker]

@jsonObject({
    knownTypes: PartsTypes
})
class Construction {
    @jsonArrayMember(PartBase)
    parts: PartBase[] = [];

    // @jsonArrayMember(Connector)
    connections: Connector[] = [];

    constructor() {
        this.parts = [];
        this.connections = [];
    }

    get bars() {
        return this.parts.filter((p) => p instanceof Bar) as Bar[];
    }

    addPart(part: PartBase, group?: string) {
        this.parts.push(part);
        // TODO: implement groups
    }
};

export default Construction;