import { TypedJSON } from "typedjson";
import { Construction, Meta } from "openjoyn/model";
import { ExecutionError } from "./Error";

class Executor {
    onError = (error: ExecutionError) => {
        console.warn("onError not bound");
    };

    onMeta = (meta: Meta) => {
        console.warn("onMeta not bound");
    };

    onResult = (construction: Construction) => {
        console.warn("onResult not bound");
    };

    private iframeEl: HTMLIFrameElement;

    constructor() {

    }

    commit(userCode: string) {
        this.sendMessage({ cmd: "commit", code: userCode });
    }

    generate(values: any) {
        this.sendMessage({ cmd: "generate", values: values });
    }

    private handleMetaMessage(metaJson: object) {
        let serde = new TypedJSON(Meta);
        let meta = serde.parse(metaJson);
        this.onMeta(meta);
    }

    private handleResultMessage(resultJson: object) {
        let serde = new TypedJSON(Construction);
        let construction = serde.parse(resultJson);
        this.onResult(construction);
    }

    private handleErrorMessage(erorrJson: object) {
        let serde = new TypedJSON(ExecutionError);
        let error = serde.parse(erorrJson);
        this.onError(error);
    }


    private handleMessage(ev: MessageEvent) {
        console.log("Got a message from runner", ev.data);

        let data = ev.data;
        let type = data.type;

        if (type === undefined) {
            return;
        }

        switch (ev.data.type) {
            case "meta": {
                this.handleMetaMessage(data.meta);
                break;
            }

            case "result": {
                this.handleResultMessage(data.result);
                break;
            }

            case "error": {
                this.handleErrorMessage(data.error);
                break;
            }

            default: {
                throw new Error("Unknown result type");
            }
        }
    }

    private bindIframe() {
        let iframe = document.getElementById("iframe_runner") as HTMLIFrameElement;

        window.onmessage = (ev: MessageEvent) => this.handleMessage(ev);

        this.iframeEl = iframe;
    }

    private sendMessage(data: object) {
        if (!this.iframeEl) {
            this.bindIframe();
        }

        let iframe = this.iframeEl;

        let contentWindow = iframe.contentWindow!;
        contentWindow.postMessage(data, "*");        // TODO: specify origin
    }

    // destroy() {
    //     // this.worker.terminate();
    // }

};

export default Executor;