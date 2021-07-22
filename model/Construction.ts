import PartBase from "./PartBase";
import type Connector from "./Connector";
import Bar from "./Bar";
import Panel from "./Panel";
import Marker from "./Marker";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";


const PartsTypes = [Bar, Panel, Marker]


function partGroupsFromKeys<T extends PartBase>(groups: string[], arr: T[]) {
    let grouped = groups.map((groupName) => [groupName, arr.filter((part)=> part.group == groupName)] as [string, T[]]);
    return new Map(grouped);
}

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

    groupNames() {
        let partsGroups = this.parts.map((p) => p.group);
        return new Set(partsGroups);
    }

    bars() {
        return this.parts.filter((p) => p instanceof Bar) as Bar[];
    }

    barsByGroups(groups: string[]) {
        let bars = this.bars();
        return partGroupsFromKeys(groups, bars);
    }

    panels() {
        return this.parts.filter((p) => p instanceof Panel) as Panel[];
    }

    panelsByGroups(groups: string[]) {
        let panels = this.panels();
        return partGroupsFromKeys(groups, panels);
    }

    partsByGroups(groups?: string[]) {
        let parts = this.parts;
        return partGroupsFromKeys(groups, parts);
    }

    addPart(part: PartBase) {
        this.parts.push(part);
    }
};

export default Construction;