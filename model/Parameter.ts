import { jsonObject, jsonMember, jsonArrayMember, AnyT } from "typedjson";


@jsonObject
class Parameter {
    @jsonMember(String)
    name: string;

    @jsonMember(AnyT)
    value: any;

    @jsonMember(String)
    label?: string;

    @jsonMember(Number)
    min?: number;

    @jsonMember(Number)
    max?: number;

    @jsonMember(Number)
    step?: number;

    @jsonArrayMember(AnyT)
    options?: any[];

    @jsonMember(String)
    unit?: string

    constructor(p: Partial<Parameter>) {
        Object.assign(this, p);
    }

    labelOrName(): string {
        return this.label ?? this.name;
    }

    isNumeric() {
        return typeof this.value == "number";
    }

    isString() {
        return typeof this.value == "string";
    }

    isBoolean() {
        return typeof this.value == "boolean";
    }

    isColorString() {
        return this.isString() && this.value.startsWith("#") && (this.value.length == 7 || this.value.length == 4);
    }

    hasRange() {
        return this.min !== undefined || this.max !== undefined;
    }
}

export default Parameter;