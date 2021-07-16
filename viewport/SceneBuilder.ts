import { Bar, Panel, Construction, PartBase } from "openjoyn/model";
import { makeBevelBoxGeometry } from "./helpers";

import * as THREE from "three";
import { Object3D } from "three";
import Marker from "openjoyn/model/Marker";

const bevelDefault = 2;


class SceneBuilder {
    construction: Construction;

    constructor(construction: Construction) {
        this.construction = construction;
    }

    makeMarkerObj(marker: Marker): THREE.Object3D {
        const geo = new THREE.SphereGeometry(marker.radius, 16, 12);

        const mat = new THREE.MeshLambertMaterial({
            color: 0xff4500,
            depthWrite: true,
        });

        const mesh = new THREE.Mesh(geo, mat);

        mesh.castShadow = false;

        const obj = new Object3D();
        obj.add(mesh);
        obj.position.copy(marker.pos);

        return obj;
    }

    makeBarObj(bar: Bar): THREE.Object3D {
        const geo = makeBevelBoxGeometry(bar.size, bar.length, bevelDefault);

        const mat = new THREE.MeshLambertMaterial({
            color: 0xaa9988,
            depthWrite: true,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, bar.length * 0.5);
        mesh.castShadow = true;

        const obj = new Object3D();
        obj.add(mesh);
        obj.position.copy(bar.pos);

        return obj;
    }

    makePanelObj(plate: Panel): THREE.Object3D {
        const geo = makeBevelBoxGeometry(plate.size, plate.thickness, bevelDefault, bevelDefault);
        const mat = new THREE.MeshPhongMaterial({
            color: 0x333333,
            depthWrite: true,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, plate.thickness * 0.5);
        mesh.castShadow = true;

        const obj = new Object3D();
        obj.add(mesh);
        obj.position.copy(plate.pos);

        return obj;
    }

    makeSceneObj(part: PartBase): THREE.Object3D {
        if (part instanceof Bar) {
            return this.makeBarObj(part);
        } else if (part instanceof Panel) {
            return this.makePanelObj(part);
        } else if (part instanceof Marker) {
            return this.makeMarkerObj(part);
        }

        console.warn("Unhandled part", part);

        return null;
    }

    makeGroup(): THREE.Group {
        let group = new THREE.Group();
        let parts = this.construction.parts;
        parts.forEach(part => {
            let sceneObj = this.makeSceneObj(part);

            if (sceneObj) {
                group.add(sceneObj);
            }
        });

        group.scale.set(0.1, 0.1, 0.1);

        return group;
    }
}


export default SceneBuilder;