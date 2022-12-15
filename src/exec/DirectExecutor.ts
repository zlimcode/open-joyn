import { Construction, Factory } from "openjoyn/model";
// import type { ExecutionError } from "./Error";

type GenerateFnType = (factory: Factory, parameters: object, preview: boolean) => Construction;


class DirectExecutor {

    buildFn: GenerateFnType;

    constructor(code: string) {
        const cfn = new Function(code);

        const [meta, build] = cfn();
        this.buildFn = build;
    }

    generate(values: object, preview: boolean) {
        let factory = new Factory();

        this.buildFn(factory, values, preview);

        return factory.construction;
    }
};

export default DirectExecutor;