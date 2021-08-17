import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import type { ParameterOptions } from "./Parameter";
import Parameter from "./Parameter";
import type { StepOptions } from "./Step";
import Step from "./Step";


/**
 * Description of a construction 
 * @category Meta
 */
interface MetaOptions {
    /** Name of the construction. */
    name: string;

    /** Human-readable description. */
    description?: string;

    /** Author, or list of authors. */
    author?: string;

    /** Array of parameters as desribed in [[ParameterOptions]]. */
    parameters: ParameterOptions[];

    /** Specifies the steps for assembly and their associated group */
    steps?: StepOptions[];

    /** Name of the style referenced. Will be used for choice of materials and connections. */
    style?: string;

    /** How difficult? */
    difficulty?: number;
};


/**
 * Description of a construction
 * @category Meta
 */
@jsonObject({
})
class Meta implements MetaOptions {
    @jsonMember(String)
    name: string;

    @jsonMember(String)
    description?: string;

    @jsonMember(String)
    author?: string;

    @jsonArrayMember(Parameter)
    parameters: Parameter[] = [];

    @jsonArrayMember(Step)
    steps: Step[] = [];

    @jsonMember(String)
    style: string = "default";

    @jsonMember(Number)
    difficulty?: number;

    constructor(p: Partial<Meta>) {
        Object.assign(this, p);
    }
};


export default Meta;
export type { MetaOptions };