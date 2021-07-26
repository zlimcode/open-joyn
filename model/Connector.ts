import PartBase from "./PartBase";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";


@jsonObject
abstract class Connector extends PartBase {
    @jsonMember(Number)
    length: number;

    constructor(length: number) {
        super();

        this.length = length;
    }
}


@jsonObject
class ButtConnector extends Connector {

}


@jsonObject
class OverlapConnector extends Connector {

}


export { Connector, ButtConnector, OverlapConnector };