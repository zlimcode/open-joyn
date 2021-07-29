import PartBase from "./PartBase";

import Construction from "./Construction";
import Meta from "./Meta";
import Parameter from "./Parameter";
import Step from "./Step";

import Bar from "./Bar";
import { BarHole } from "./Bar";

import Panel from "./Panel";
import Marker from "./Marker";
import { Connector, ButtConnector, OverlapConnector } from "./Connector";

import Factory from "./Factory";

import type { vec2, vec3 } from "./PartBase";

import { TypedJSON } from "typedjson";

import * as THREE from "three";


TypedJSON.mapType(THREE.Vector3, {
    deserializer: json => json == null ? json : (new THREE.Vector3()).fromArray(json),
    serializer: value => value == null ? value : value.toArray(),
});


TypedJSON.mapType(THREE.Quaternion, {
    deserializer: json => json == null ? json : (new THREE.Quaternion()).fromArray(json),
    serializer: value => value == null ? value : value.toArray(),
});


export { Construction, Meta, Parameter, Factory, Step };
export { PartBase, Connector, ButtConnector, OverlapConnector, Marker, Bar, Panel };
export { BarHole };

export { log, map, mapConstrain, constrain } from "./helpers";
export type { vec2, vec3 };