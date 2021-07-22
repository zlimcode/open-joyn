import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";




@jsonObject
export class JointInstance {
    @jsonMember(String)
    template: string = "";

    @jsonMember(Number)
    position: number = 0;  // mm

    @jsonMember(Number)
    rotation: number = 0;  // degrees

    @jsonMember(Number)
    side: number = 0;

    @jsonMember(String)
    jointSide: string = "a";
}


@jsonObject
export class Part {
    // @jsonMember()
    @jsonMember(String)
    name: string = "empty";

    @jsonArrayMember(Number)
    stock: [number, number] = [34.0, 34.0];

    @jsonMember(Number)
    skeletonLength: number = 100.0;

    @jsonArrayMember(JointInstance)
    joints: JointInstance[] = [];
}


@jsonObject
export class Construction {
    @jsonMember(String)
    name: string = "";

    @jsonMember(String)
    description: string = "";

    @jsonMember(String)
    style: string = "";

    @jsonArrayMember(Part)
    parts: Part[] = [];
}


