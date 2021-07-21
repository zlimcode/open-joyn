import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import Parameter from "./Parameter";


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
    parameters: Parameter[];

    /** Determines how to order the created groups. */
    groupOrder?: string[];

    /** Name of the style referenced. Will be used for choice of materials and connections. */
    style?: string;
}



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

    @jsonArrayMember(String)
    groupOrder: string[] = [];

    @jsonMember(String)
    style: string = "default";

    constructor(p: Partial<Meta>) {
        Object.assign(this, p);
    }
};

export default Meta;
export type { MetaOptions };