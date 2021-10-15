import { Construction, Factory } from "openjoyn/model";
// import type { ExecutionError } from "./Error";

type GenerateFnType = (factory: Factory, parameters: object) => Construction;


class DirectExecutor {

    buildFn: GenerateFnType;

    constructor(code: string) {
        const cfn = new Function(code);

        const [meta, build] = cfn();
        this.buildFn = build;
    }

    generate(values: object) {
        let factory = new Factory();

        this.buildFn(factory, values);

        return factory.construction;
    }
};

export default DirectExecutor;