import PartBase, { vec2, vec3 } from "./PartBase";
import { pairs } from "./helpers";
import { closestPointsOnSegmentToSegment } from "./math";

import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import * as THREE from "three";

/**
 * Valid indices for the sides of a Bar
 */
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


type ConnectionResult = {
    position: THREE.Vector3;

    a: Bar,
    b: Bar;

    posA: number;
    posB: number;
};


type ButtConnectionResult = ConnectionResult & {
    atStart: boolean;
    sideB: BarSide;
};

type OverlapConnectionResult = ConnectionResult & {
    sideA: BarSide;
    sideB: BarSide;
};

const Epsilon = 0.001; // TODO: move out epsilon
const EpsilonSq = Epsilon * Epsilon;


function nearlyEqual(a: number, b: number) {
    return (Math.abs(a - b) < Epsilon);
};

@jsonObject
class BarHole {
    @jsonMember(Number)
    position: number;

    @jsonMember(Number)
    side: BarSide;

    @jsonMember(Number)
    diameter: number;

    @jsonMember(Number)
    depth?: number;

    constructor(position: number, side: BarSide, diameter: number, depth?: number) {
        this.position = position;
        this.side = side;
        this.diameter = diameter;
        this.depth = depth;
    }

    equals(other: BarHole) {
        if (!nearlyEqual(this.position, other.position)) {
            return false;
        }

        if (this.side != other.side) {
            return false;
        }

        if (!nearlyEqual(this.diameter, other.diameter)) {
            return false;
        }

        if (this.depth && other.depth) {
            if (!nearlyEqual(this.depth, other.depth)) {
                return false;
            }
        } else {
            if (this.depth || other.depth) {
                return false;
            }
        }

        return true;
    }
}


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

    @jsonArrayMember(BarHole)
    holes: BarHole[];


    constructor(length: number, size: vec2) {
        super();

        this.length = length;
        this.size = size;

        this.holes = [];
    }

    addHole(position: number, side: BarSide, diameter: number, depth?: number) {
        const hole = new BarHole(position, side, diameter, depth);

        this.holes.push(hole);
    }

    /**
     * Calculate a point on one of the Bars sides that has a given distance from the start of this side
     * @param side side
     * @param l distance from start of the side
     * @returns the point
     */
    pointOnSide(side: BarSide, l: number) {
        const line = this.lineOnSide(side);
        const pos = line.start.clone().lerp(line.end, l / this.length);
        return pos.toArray();
    }

    /**
     * Calculate a point on the Bar that has a given distance from the start of the Bar.
     * @param l distance from start of the Bar
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
     * @param l distance from end of the Bar
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


    sizeMin(): number {
        return Math.min(this.size[0], this.size[1]);
    }


    sizeMax(): number {
        return Math.max(this.size[0], this.size[1]);
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
     * Normalized normal vector of a given side
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
     * 
     * @param side 
     * @returns
     */
    sideLocal(side: BarSide): THREE.Vector3 {
        const sideVec = SideUnitNormals[side].clone();
        sideVec.multiply(new THREE.Vector3(this.size[0] * 0.5, this.size[1] * 0.5, 0));
        return sideVec;
    }

    /**
     * @ignore
     * Line on a side of a Bar
     * @returns a line from start to end
     */
    lineOnSide(side: BarSide): THREE.Line3 {
        const sideVec = this.sideLocal(side);

        const start = sideVec.clone();
        start.applyQuaternion(this.rot);
        start.add(this.pos);

        const end = sideVec.clone();
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
     * Are both sizes equal?
     * @returns 
     */
    isSquare(): boolean {
        return nearlyEqual(this.size[0], this.size[1]);
    }

    normalize() {
        // TODO: reverse or not

        // let newHoles = this.holes.map((hole) => {
        //     return new BarHole(hole.position, hole.side, hole.diameter, hole.depth);
        // });
        let holes = this.holes;
        holes.sort((a, b) => a.position - b.position);

        let firstHoleSide = holes.length > 0 ? holes[0].side : 0;

        if (this.isSquare()) {
            holes.forEach((hole) => {
                hole.side = (hole.side + firstHoleSide) % 4;
            });
        }

        holes.forEach((hole) => {
            if (hole.depth == undefined && hole.side > 1) {  // flip side of hole, if it's a through hole
                hole.side = (hole.side + 2) % 4;
            }
        });


        // FIXME: general handling of holes that are not flipped to one of the first two sides...

        this.holes = holes;
    }

    holesOnSide(side: BarSide) {
        return this.holes.filter((hole) => hole.side == side);
    }

    equals(other: Bar) {
        if (!nearlyEqual(this.length, other.length)) {
            return false;
        }

        if (!nearlyEqual(this.size[0], other.size[0])) {
            return false;
        }

        if (!nearlyEqual(this.size[1], other.size[1])) {
            return false;
        }

        if (this.holes.length != other.holes.length) {
            return false;
        }

        for (let holeIdx = 0; holeIdx < this.holes.length; holeIdx++) {
            const thisHole = this.holes[holeIdx];
            const otherHole = other.holes[holeIdx];

            if (!thisHole.equals(otherHole)) {
                return false;
            }
        }

        return true;
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
    static findButtConnection(barA: Bar, barB: Bar): ButtConnectionResult | undefined {
        const centerLineA = barA.centerLine();

        const dirA = centerLineA.delta(new THREE.Vector3());
        dirA.normalize();

        // TODO: maybe abort earlier? No need to check all sides if the two bars are not perpendicular in general

        for (let sideB = 0; sideB < 4; sideB++) {
            const sideLineB = barB.lineOnSide(sideB);
            const sideNormalB = barB.sideNormal(sideB);

            if (sideNormalB.manhattanDistanceTo(dirA) < Epsilon) { // start of A on this side?
                let buttPoint = sideLineB.closestPointToPoint(centerLineA.start, true, new THREE.Vector3());

                if (buttPoint.distanceToSquared(centerLineA.start) < EpsilonSq) {
                    const barPosA = 0;
                    const barPosB = sideLineB.start.distanceTo(centerLineA.start);
                    let butt = { position: centerLineA.start, atStart: true, posA: barPosA, a: barA, posB: barPosB, b: barB, sideB: sideB };
                    return butt;
                }
            }

            sideNormalB.multiplyScalar(-1);

            if (sideNormalB.manhattanDistanceTo(dirA) < Epsilon) { // end of A on this side?
                let buttPoint = sideLineB.closestPointToPoint(centerLineA.end, true, new THREE.Vector3());

                if (buttPoint.distanceToSquared(centerLineA.end) < EpsilonSq) {
                    const barPosA = barA.length;
                    const barPosB = sideLineB.start.distanceTo(centerLineA.end);

                    let butt = { position: centerLineA.end, atStart: false, posA: barPosA, a: barA, posB: barPosB, b: barB, sideB: sideB };
                    return butt;
                }
            }
        }

        return undefined;
    }

    static findOverlapConnection(barA: Bar, barB: Bar): OverlapConnectionResult | undefined {
        for (let sideA = 0; sideA < 4; sideA++) {
            const lineA = barA.lineOnSide(sideA);
            const invNormalA = barA.sideNormal(sideA);
            invNormalA.multiplyScalar(-1);

            for (let sideB = 0; sideB < 4; sideB++) {
                const normalB = barB.sideNormal(sideB);

                if (invNormalA.manhattanDistanceTo(normalB) > Epsilon) {        // Sides are not facing each other
                    continue;
                }

                const lineB = barB.lineOnSide(sideB);

                let result = closestPointsOnSegmentToSegment(lineA.start, lineA.end, lineB.start, lineB.end);

                let [pointA, pointB] = result;

                if (result && pointA.distanceToSquared(pointB) < EpsilonSq) {
                    const posA = pointA.distanceTo(lineA.start);
                    const posB = pointB.distanceTo(lineB.start);

                    return { position: pointA, a: barA, b: barB, sideA: sideA, sideB: sideB, posA: posA, posB: posB };
                }
            }
        }
    }
}




export default Bar;
export { BarSide, BarHole };
export type { OverlapConnectionResult, ButtConnectionResult };
