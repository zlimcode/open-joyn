


import { space } from "svelte/internal";
import * as THREE from "three";

function makeBevelBoxGeometry(size: number[], length: number, bevelProfile: number, bevelRim?: number) {
    const h = size[1];
    const w = size[0];

    const shape = new THREE.Shape();


    // shape.moveTo(0, 0);
    // shape.lineTo(w, 0);
    // shape.lineTo(w, h);
    // shape.lineTo(0, h);
    // shape.lineTo(0, 0);

    let b = Math.min(bevelProfile, Math.min(w, h) * 0.5);


    shape.moveTo(0.0 + b, 0);
    shape.lineTo(w - b, 0);
    shape.lineTo(w, 0.0 + b);
    shape.lineTo(w, h - b);
    shape.lineTo(w -b, h);
    shape.lineTo(0.0 + b, h);

    shape.lineTo(0.0, h - b);
    shape.lineTo(0.0, 0.0 + b);
    shape.lineTo(0.0 + b, 0);



    let rimHasBevel = bevelRim !== undefined;

    let extrudeLength = length;

    if (rimHasBevel) {
        extrudeLength = Math.max(0, extrudeLength - bevelRim * 2.0);
    } else {
        bevelRim = 0.0;
    }

    const extrudeSettings = {
        steps: 2,
        depth: extrudeLength,
        bevelEnabled: rimHasBevel,
        bevelThickness: bevelRim,
        bevelSize: bevelRim,
        bevelOffset: -bevelRim,
        bevelSegments: 1
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(-w * 0.5, -h * 0.5, -length * 0.5 + bevelRim);

    return geometry;
}

export { makeBevelBoxGeometry };