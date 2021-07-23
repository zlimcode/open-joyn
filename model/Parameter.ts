import { jsonObject, jsonMember, jsonArrayMember, AnyT } from "typedjson";

/**
 * Parameter options.
 * 
 * Depending on the given [[value]], the logic will figure out the respective widget to display.
 * 
 * If [[min]] and [[max]] are set for a numeric value, a slider will be displayed.
 * Defining [[options]] will display a dropdown menu.
 * #### Examples
 * @example 
 * { name: "width", label: "Width", value: 600, min: 300, max: 1500, step: 100, unit: "mm" }
 * @example
 * { name: "barSize", label: "Bar Stock", value: 30, options: [["30x30", 30], ["40x40", 40], ["60x60", 60]], unit: "mm" }
 * 
 * @category Meta
 */
interface ParameterOptions {
    /** Name of the parameter. Must not contain whitespaces and special characters. Cannot start with a number! */
    name: string;

    /** Default value. Also determines type. */
    value: any;

    /** Label to display in the UI. */
    label?: string;

    /** Minimum value for numbers. */
    min?: number;

    /** Maximum value for numbers. */
    max?: number;

    /** Step size for numbers. */
    step?: number;

    /** List of options. Can either be a plain array of the same type as [[value]], or an array of pairs like `["Label", 123]` */
    options?: any[] | [string, any][];

    /** Unit to display. */
    unit?: string;

    /** Classes for styling. */
    class?: string;
}



/**
 * Parameter options
 * @category Meta
 */
@jsonObject
class Parameter implements ParameterOptions {
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
    unit?: string;

    @jsonMember(String)
    class?: string

    constructor(p: ParameterOptions) {
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

    hasOptions() {
        return this.options;
    }

    normalizedOptions(): [any, any][] {
        let out = this.options.map((o) => {
            if (Array.isArray(o)) {
                return o;
            }

            return [o, o];
        });

        return out as [any, any][];
    }
}

export default Parameter;
export type { ParameterOptions };