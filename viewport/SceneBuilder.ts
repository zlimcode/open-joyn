import { Bar, Panel, Construction, Connector, PartBase, Marker, OverlapConnector } from "openjoyn/model";
import { makeBevelBoxGeometry } from "./helpers";

import * as THREE from "three";

const bevelDefault = 2;
const debugColor = new THREE.Color(0xff4500);


function applyPartPosRotToObj(part: PartBase, obj: THREE.Object3D) {
    obj.position.copy(part.pos);
    obj.quaternion.copy(part.rot);
}

function makeDebugLine(from: THREE.Vector3, to: THREE.Vector3, color?: string) {
    let lineMat = new THREE.LineBasicMaterial({ color: color });
    // let lineMat = new THREE.LineDashedMaterial({ 	linewidth: 50, color: color, gapSize: 4, dashSize: 5, scale: 100 });

    const lineGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(lineGeo, lineMat);

    return line;
}


class SceneBuilder {
    construction: Construction;
    barStandardMaterial: THREE.Material;
    barDebugMaterial: THREE.Material;

    connectorStandardMaterial: THREE.Material;
    connectorDebugMaterial: THREE.Material;

    panelStandardMaterial: THREE.Material;
    panelDebugMaterial: THREE.Material;

    constructor(construction: Construction) {
        this.construction = construction;

        this.barStandardMaterial = new THREE.MeshStandardMaterial(
            {
                color: 0xebe49f,
                // polygonOffset: true,
                // polygonOffsetUnits: 1,
                // polygonOffsetFactor: 1
            });


        this.barDebugMaterial = new THREE.MeshStandardMaterial(
            {
                color: debugColor,
                opacity: 0.25,
                transparent: true,
                side: THREE.DoubleSide

            });


        this.panelStandardMaterial = new THREE.MeshStandardMaterial(
            {
                roughness: 0.25,
                color: 0x222222,
            });


        this.panelDebugMaterial = new THREE.MeshStandardMaterial(
            {
                color: debugColor,
                opacity: 0.25,
                transparent: true,
                side: THREE.DoubleSide

            });


        this.connectorStandardMaterial = new THREE.MeshStandardMaterial(
            {
                roughness: 0.1,
                color: 0x222222,
            });


        this.connectorDebugMaterial = new THREE.MeshStandardMaterial(
            {
                color: debugColor,
                opacity: 0.25,
                transparent: true,
                side: THREE.DoubleSide

            });
    }

    makeMarkerObj(marker: Marker): THREE.Object3D {
        const geo = new THREE.SphereGeometry(marker.radius, 8, 6);

        const mat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: marker.color ?? 0x0000ff
        });

        const mesh = new THREE.Mesh(geo, mat);

        mesh.castShadow = false;

        const obj = new THREE.Object3D();
        obj.add(mesh);

        applyPartPosRotToObj(marker, obj);

        return obj;
    }

    makeBarObj(bar: Bar): THREE.Object3D {
        const geo = makeBevelBoxGeometry(bar.size, bar.length, bevelDefault);

        let mat = bar.debug ? this.barDebugMaterial : this.barStandardMaterial;

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, bar.length * 0.5);
        // mesh.castShadow = true;

        const obj = new THREE.Object3D();
        obj.add(mesh);

        if (bar.debug) {
            let barSideLocalXStart = bar.sideLocal(0);
            let barSideLocalXEnd = barSideLocalXStart.clone();
            barSideLocalXEnd.z = bar.length;

            let barSideLocalYStart = bar.sideLocal(1);
            let barSideLocalYEnd = barSideLocalYStart.clone();
            barSideLocalYEnd.z = bar.length;
            
            let lineX = makeDebugLine(barSideLocalXStart, barSideLocalXEnd, "#ff0000");
            let lineY = makeDebugLine(barSideLocalYStart, barSideLocalYEnd, "#00ff00");
            
            obj.add(lineX);
            obj.add(lineY);
        }

        if (bar.debug) {
            for (let hole of bar.holes) {
                let sideVec = bar.sideLocal(hole.side);

                let start = sideVec.clone();
                start.z = hole.position;

                let end = new THREE.Vector3();
                end.z = hole.position;
                let lineY = makeDebugLine(start, end, "#ff00ff");
                obj.add(lineY);
            }
        }
   

        // const edges = new THREE.EdgesGeometry(geo);

        // const lineMat2 = new THREE.LineBasicMaterial({
        //     linewidth: 5, // in pixels
        //     color: 0x000000,
        // });
        // const line = new THREE.LineSegments(edges, lineMat2);
        // line.position.copy(mesh.position);

        // line.computeLineDistances();
        // obj.add(line);


        applyPartPosRotToObj(bar, obj);

        // let lSide0 = bar.lineOnSide(0);
        // let lSide1 = bar.lineOnSide(1);
        // let lSide2 = bar.lineOnSide(2);
        // let lSide3 = bar.lineOnSide(3);

        // let lineSide0 = makeDebugLine(lSide0.start, lSide0.end, "#ff0000");
        // let lineSide1 = makeDebugLine(lSide1.start, lSide1.end, "#00ff00");

        // let lineSide2 = makeDebugLine(lSide2.start, lSide2.end, "#ff0000");
        // let lineSide3 = makeDebugLine(lSide3.start, lSide3.end, "#00ff00");

        // let w0 = new THREE.Object3D();
        // w0.add(lineSide0);
        // w0.add(lineSide1);
        // w0.add(lineSide2);
        // w0.add(lineSide3);

        // w0.add(obj);


        return obj;
    }

    makePanelObj(panel: Panel): THREE.Object3D {
        const geo = makeBevelBoxGeometry(panel.size, panel.thickness, bevelDefault, bevelDefault);
        let mat = panel.debug ? this.panelDebugMaterial : this.panelStandardMaterial;

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, panel.thickness * 0.5);
        mesh.castShadow = true;

        const obj = new THREE.Object3D();
        obj.add(mesh);

        applyPartPosRotToObj(panel, obj);

        return obj;
    }

    makeConnectorObj(connector: Connector): THREE.Object3D {
        const mat = connector.debug ? this.connectorDebugMaterial : this.connectorStandardMaterial;

        let throughCylGeo = new THREE.CylinderGeometry(5, 5, connector.length);
        const throughCylMesh = new THREE.Mesh(throughCylGeo, mat);
        throughCylMesh.rotateX(Math.PI * 0.5);
        throughCylMesh.position.set(0, 0, connector.length * 0.5);

        // TODO: define somewhere else
        let headCylStartGeo = new THREE.CylinderGeometry(19/2, 19/2-1, 2, 16);
        const headCylStartMesh = new THREE.Mesh(headCylStartGeo, mat);
        headCylStartMesh.rotateX(Math.PI * 0.5);
        headCylStartMesh.position.set(0, 0, -2/2);

        const obj = new THREE.Object3D();
        obj.add(throughCylMesh);
        obj.add(headCylStartMesh);

        if (connector instanceof OverlapConnector) {
            let headCylEndGeo = new THREE.CylinderGeometry(19/2-1, 19/2, 2, 16);
            const headCylEndMesh = new THREE.Mesh(headCylEndGeo, mat);
            headCylEndMesh.rotateX(Math.PI * 0.5);
            headCylEndMesh.position.set(0, 0, connector.length + 2/2);
            obj.add(headCylEndMesh);
        }

        // const sphereGeo = new THREE.SphereGeometry(6, 8, 6);
        // const sphereMesh = new THREE.Mesh(sphereGeo, mat);


        applyPartPosRotToObj(connector, obj);

        return obj;
    }

    makeSceneObj(part: PartBase): THREE.Object3D | undefined {
        if (part instanceof Bar) {
            return this.makeBarObj(part);
        } else if (part instanceof Panel) {
            return this.makePanelObj(part);
        } else if (part instanceof Marker) {
            return this.makeMarkerObj(part);
        }  else if (part instanceof Connector) {
            return this.makeConnectorObj(part);
        }

        console.warn("Unhandled part", part);
    }

    makeGroup(): THREE.Group {
        let mainGroup = new THREE.Group();
        let parts = this.construction.parts;

        let groupGroups = new Map<string, THREE.Group>();

        this.construction.groupNames().forEach(groupName => {
            const groupGroup = new THREE.Group();
            groupGroup.name = groupName;
            groupGroups.set(groupName, groupGroup);
            mainGroup.add(groupGroup);
        });

        parts.forEach(part => {
            let sceneObj = this.makeSceneObj(part);
            const groupGroup = groupGroups.get(part.group)!;

            if (sceneObj) {
                groupGroup.add(sceneObj);
            }
        });

        mainGroup.scale.set(0.1, 0.1, 0.1);

        return mainGroup;
    }

    makeDebugGroup(): THREE.Group {
        let group = new THREE.Group();

        // let parts = this.construction.parts;
        // parts.forEach(part => {
        //     let debugObj = this.makeDebugObj(part);

        //     if (debugObj) {
        //         group.add(debugObj);
        //     }
        // });

        // group.scale.set(0.1, 0.1, 0.1);

        return group;

    }
}


export default SceneBuilder;