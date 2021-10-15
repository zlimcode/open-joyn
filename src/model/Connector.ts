import PartBase from "./PartBase";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import Bar from "./Bar";


@jsonObject
abstract class Connector extends PartBase {
    @jsonMember(Number)
    length: number;

    @jsonArrayMember(PartBase)
    parts: PartBase[];

    constructor(length: number, parts: PartBase[]) {
        super();

        this.length = length;
        this.parts = parts;
    }
}


@jsonObject
class ButtConnector extends Connector {

}


@jsonObject
class OverlapConnector extends Connector {

}


export { Connector, ButtConnector, OverlapConnector };