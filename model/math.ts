import type * as THREE from "three";


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


    let pA = segA.clone().lerp(segB, Math.min(Math.max(t, 0), 1));
    return pA;
};


function closestPointsOnSegmentToSegment(segA: THREE.Vector3, segB: THREE.Vector3, segC: THREE.Vector3, segD: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
    let rayPoint = closestPointOnSegmentToLine(segA, segB, segC, segD);
    let pointCD = closestToSegment(rayPoint, segC, segD);
    let pointAB = closestToSegment(pointCD, segA, segB);

    return [pointAB, pointCD];
};


export { closestToSegment, closestPointOnSegmentToLine, closestPointsOnSegmentToSegment };