import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";
import Parameter from "./Parameter";


@jsonObject({
})
class Meta {
    @jsonMember(String)
    name: string;

    @jsonMember(String)
    description?: string;

    @jsonMember(String)
    author?: string;

    @jsonArrayMember(Parameter)
    parameters: Parameter[] = [];

    // @jsonArrayMember(Connector)

    constructor(p: Partial<Meta>) {
        Object.assign(this, p);
    }
};

export default Meta;