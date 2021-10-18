import { jsonObject, jsonMember, jsonArrayMember, AnyT } from "typedjson";

/**
 * Options for defining a build step
 * 
 * @category Meta
 */
interface StepOptions {
    /** Name of the parameter. Must not contain whitespaces and special characters. Cannot start with a number! */
    groupName: string;

    /** Prefix Name. Can be used to prefix grouped parts with a specific prefix (e.g. A, B, C...) instead of the group name */
    prefix?: string

    /** Label to display in the UI. */
    label?: string;

    /** Description of what to do. */
    description?: string;
}

/**
 * Parameter options
 * @category Meta
 */
@jsonObject
class Step implements StepOptions {
    @jsonMember(String)
    groupName: string;

    @jsonMember(String)
    prefix?: string;

    @jsonMember(String)
    label?: string;

    @jsonMember(String)
    description?: string;

    constructor(p: StepOptions) {
        Object.assign(this, p);
    }

    labelOrGroup(): string {
        return this.label ?? this.groupName;
    }

    prefixOrGroup(): string {
        return this.prefix ?? this.groupName;
    }
}

export default Step;
export type { StepOptions };