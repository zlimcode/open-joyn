import type * as THREE from "three";


function pairs<T>(arr: T[]): [T, T][] {
    let res: [T, T][] = [];

    for (let i = 0; i < arr.length - 1; i++) {
        const a = arr[i];

        for (let j = i + 1; j < arr.length; j++) {
            const b = arr[j];

            res.push([a, b]);
        }
    }

    return res;
}




function closestToSegment(point: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
    let ba = b.clone().sub(a);
    let t = point.clone().sub(a).dot(ba) / ba.lengthSq();
    return a.clone().lerp(b, Math.min(Math.max(t, 0), 1));
};

function closestPointOnSegmentToLine(segA: THREE.Vector3, segB: THREE.Vector3, lineA: THREE.Vector3, lineB: THREE.Vector3) {
    let lineBAAxis = lineB.clone().sub(lineA).normalize();
    let inPlaneA = segA.clone().sub(lineA).projectOnPlane(lineBAAxis).add(lineA);
    let inPlaneB = segB.clone().sub(lineA).projectOnPlane(lineBAAxis).add(lineA);
    let inPlaneBA = inPlaneB.clone().sub(inPlaneA);
    let t = lineA.clone().sub(inPlaneA).dot(inPlaneBA) / inPlaneBA.lengthSq();
    // let tB = segA.clone().sub(inPlaneA).dot(inPlaneBA) / inPlaneBA.lengthSq();

    // this.planarC.position.copy(inPlaneA); // These two lines aren't necessary
    // this.planarD.position.copy(inPlaneB); // But are nice for visualization

    let pA = segA.clone().lerp(segB, Math.min(Math.max(t, 0), 1));
    // let pB = segA.clone().lerp(segB, Math.min(Math.max(tB, 0), 1));
    return pA;

};

function closestPointOnSegmentToSegment(segA: THREE.Vector3, segB: THREE.Vector3, segC: THREE.Vector3, segD: THREE.Vector3, pointAB: THREE.Vector3, pointCD: THREE.Vector3) {
    let rayPoint = closestPointOnSegmentToLine(segA, segB, segC, segD);
    pointCD.copy(closestToSegment(rayPoint, segC, segD));
    pointAB.copy(closestToSegment(pointCD, segA, segB));
};


// Lifted from: https://zalo.github.io/blog/closest-point-between-segments/

export { pairs, closestToSegment, closestPointOnSegmentToLine, closestPointOnSegmentToSegment };