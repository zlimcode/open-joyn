import PartBase, { vec2, vec3 } from "./PartBase";
import { pairs } from "./helpers";
import { closestPointsOnSegmentToSegment } from "./math";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import * as THREE from "three";
import { Vector3 } from "three";

// type BarSide = 0 | 1 | 2 | 3;

enum BarSide {
    N = 0,
    E = 1,
    S = 2,
    W = 3,
};


const SideUnitNormals = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, -1, 0),
];


let Epsilon = 0.001; // TODO: move out epsilon



/**
 * A long object with a rectangular cross-section
 * @category Parts
 */
@jsonObject
class Bar extends PartBase {
    @jsonMember(Number)
    length: number;

    @jsonArrayMember(Number)
    size: vec2;

    constructor(length: number, size: vec2) {
        super();

        this.length = length;
        this.size = size;
    }


    /**
     * Calculate a point on the bar that has a given distance from the start of the Bar.
     * @param l distance from start of the bar
     * @returns the point
     */
    pointFromStart(l: number): vec3 {
        let v = new THREE.Vector3(0, 0, l);
        v.applyQuaternion(this.rot);
        v.add(this.pos);

        // TODO: cache?

        return v.toArray();
    }

    /**
     * Calculate a point on the bar that has a given distance from the end of the Bar.
     * @param l distance from end of the bar
     * @returns the point
     */
    pointFromEnd(l: number): vec3 {
        let v = new THREE.Vector3(0, 0, this.length - l);
        v.applyQuaternion(this.rot);
        v.add(this.pos);

        // TODO: cache?

        return v.toArray();
    }

    /**
     * Start point of the Bar
     * @returns the start point
     */
    start(): vec3 {
        return this.pos.toArray();
    }

    /**
     * End point of the Bar
     * @returns the end point
     */
    end(): vec3 {
        return this.pointFromEnd(0);
    }

    /**
     * @ignore
     * Compute axis-aligned bounding box with the maximum size added to each side.
     * Not very precise, but helpful for spatial optimization
     * @returns 
     */
    boundingBox() {
        const start = this.pos.clone();
        const end = new THREE.Vector3(0, 0, this.length).applyQuaternion(this.rot).add(this.pos);

        const minVec = start.clone().min(end);
        const maxVec = start.clone().max(end);

        const extra = Math.max(this.size[0], this.size[1]) * 0.5;
        const extraVec = new THREE.Vector3(extra, extra, extra);
        minVec.sub(extraVec);
        maxVec.add(extraVec);

        return new THREE.Box3(minVec, maxVec);
    }

    /**
     * @ignore
     * Normalized normal vector a given side
     * @param side 
     * @returns
     */
    sideNormal(side: BarSide): THREE.Vector3 {
        // TODO: cache?
        let baseNormal = SideUnitNormals[side].clone();
        return baseNormal.applyQuaternion(this.rot);
    }

    /**
     * @ignore
     * Line on a side of a Bar
     * @returns a line from start to end
     */
    lineOnSide(side: BarSide): THREE.Line3 {
        let sideVector = SideUnitNormals[side].clone();
        sideVector.multiply(new THREE.Vector3(this.size[0], this.size[1], 0).multiplyScalar(0.5));

        let start = sideVector.clone();
        start.applyQuaternion(this.rot);
        start.add(this.pos);

        let end = sideVector.clone();
        end.z = this.length;
        end.applyQuaternion(this.rot);
        end.add(this.pos);

        // TODO: cache?

        let line = new THREE.Line3(start, end);
        return line;
    }

    /**
     * @ignore
     * Center line of a Bar
     * @returns a line from start to end
     */
    centerLine(): THREE.Line3 {
        let end = new THREE.Vector3(0, 0, this.length);
        end.applyQuaternion(this.rot);
        end.add(this.pos);

        // TODO: cache?

        return new THREE.Line3(this.pos, end);
    }

    /**
     * @ignore
     * @param from 
     * @param to 
     * @param size 
     * @returns 
     */
    static betweenTwoPoints(from: vec3, to: vec3, size: vec2) {
        const fromV = new THREE.Vector3().fromArray(from);
        const toV = new THREE.Vector3().fromArray(to);

        const diffV = toV.clone().sub(fromV);

        const length = diffV.length();

        var axis = new THREE.Vector3(0, 0, 1);
        const quat = new THREE.Quaternion().setFromUnitVectors(axis, diffV.clone().normalize());

        let bar = new Bar(length, size);

        bar.pos.copy(fromV);
        bar.rot.copy(quat);

        return bar;
    }

    /**
     * Find pairs of bars that are possibly touching and could be in connection.
     * @param bars the bars to check.
     * @returns pairs
     * @category Expert
     */
    static findCandidatePairs(bars: Bar[]) {
        const barPairs = pairs(bars);

        // Only consider pairs where bounding boxes intersect
        const boxes = bars.map((bar) => [bar, bar.boundingBox()] as [Bar, THREE.Box3]);
        const bBoxes = new Map<Bar, THREE.Box3>(boxes);

        const candidatePairs = barPairs.filter(([a, b]) => {
            const boxA = bBoxes.get(a)!;
            const boxB = bBoxes.get(b)!;
            return boxA.intersectsBox(boxB);
        });

        return candidatePairs;
    }

    /**
     * Does the end (or start) of Bar A rest on one sides of Bar B.
     * Additionally it has to be perpendicular to the plane of the side.
     * 
     * @param barA the bar with the ends being checked
     * @param barB the bar with the sides being checked
     * @return the point where it happens (or undefined if no butt is found)  // TODO: return side!
     * @category Expert
     */
    static findButtConnection(barA: Bar, barB: Bar): THREE.Vector3 | undefined {
        const barACenterLine = barA.centerLine();

        const barADirection = barACenterLine.delta(new Vector3());
        barADirection.normalize();

        // TODO: maybe abort earlier? No need to check all sides if the two bars are not perpendicular in general

        for (let i = 0; i < 4; i++) {
            const line = barB.lineOnSide(i);
            const sideNormal = barB.sideNormal(i);


            if (sideNormal.manhattanDistanceTo(barADirection) < Epsilon) { // start of A on this side
                let buttPoint = line.closestPointToPoint(barACenterLine.start, true, new Vector3());

                if (buttPoint.distanceToSquared(barACenterLine.start) < Epsilon) {
                    return barACenterLine.start;
                }
                return undefined;
            }

            sideNormal.multiplyScalar(-1);

            if (sideNormal.manhattanDistanceTo(barADirection) < Epsilon) { // end of A on this side
                let buttPoint = line.closestPointToPoint(barACenterLine.end, true, new Vector3());

                if (buttPoint.distanceToSquared(barACenterLine.end) < Epsilon) {
                    return barACenterLine.end;
                }
                return undefined;
            }
        }

        return undefined;
    }

    static findOverlapConnection(barA: Bar, barB: Bar) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const lineA = barA.lineOnSide(i);
                const lineB = barB.lineOnSide(j);

                // TODO: catch points outside segments

                let result = closestPointsOnSegmentToSegment(lineA.start, lineA.end, lineB.start, lineB.end);

                let [pointA, pointB] = result;
                let dist = pointA.distanceToSquared(pointB);
                if (dist < (0.1 * 0.1)) {   // TODO: to config
                    // this.marker({ radius: 5.0, color: 0x00ff00, position: pointA.toArray() });
                    // this.marker({ radius:  5.0, color: 0xff0000, position: pointB.toArray() });
                }
            }
        }
    }
}




export default Bar;
