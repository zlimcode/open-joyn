import PartBase from "./PartBase";

import Construction from "./Construction";
import Meta from "./Meta";
import Parameter from "./Parameter";

import Bar from "./Bar";
import Panel from "./Panel";

import Factory from "./Factory";

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



export { Construction, Meta, Parameter, PartBase, Bar, Panel, Factory };