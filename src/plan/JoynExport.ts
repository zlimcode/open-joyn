import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from "typedjson";
import type { Plan } from "./Plan";

import { groupByPredicate } from "./helpers";



@jsonObject
class JoynJointInstance {
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
class JoynPart {
    // @jsonMember()
    @jsonMember(String)
    name: string = "empty";

    @jsonArrayMember(Number)
    stock: [number, number] = [34.0, 34.0];

    @jsonMember(Number)
    skeletonLength: number = 100.0;

    @jsonArrayMember(JoynJointInstance)
    joints: JoynJointInstance[] = [];
}


@jsonObject
class JoynConstruction {
    @jsonMember(String)
    name: string = "";

    @jsonMember(String)
    description: string = "";

    @jsonMember(String)
    style: string = "";

    @jsonArrayMember(JoynPart)
    parts: JoynPart[] = [];
}


class JoynExport {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    generate() {
        const construction = this.plan.construction;
        const meta = this.plan.meta;

        const bars = construction.bars();

        bars.sort((a, b) => a.name.localeCompare(b.name));
        const barsByName = groupByPredicate(bars, (bar) => bar.name);

        const jmConstruction = new JoynConstruction();

        jmConstruction.name = meta.name;

        if (meta.description) {
            jmConstruction.description = meta.description;
        }

        for (const group of barsByName.values()) {
            for (let barIdx = 0; barIdx < group.length; barIdx++) {
                const bar = group[barIdx];
                const name = `${bar.name}_${barIdx + 1}`;

                let jmPart = new JoynPart();
                jmPart.name = name;
                jmPart.stock = bar.size;
                jmPart.skeletonLength = bar.length;

                for (const hole of bar.holes) {
                    let joint = new JoynJointInstance();

                    joint.template = "34x34_fullpeg";  // TODO: to config

                    joint.side = hole.side;
                    joint.position = -hole.position;
                    // joint.rotation

                    jmPart.joints.push(joint);
                }

                jmConstruction.parts.push(jmPart);
            }
        }

        return jmConstruction;
    }


    json() {
        const jmConstruction = this.generate();
        let serde = new TypedJSON(JoynConstruction);

        return serde.toPlainJson(jmConstruction);
    }
}

export { JoynExport };
