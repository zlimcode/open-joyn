import { jsonObject, jsonMember } from "typedjson";

enum ErrorType {
    Empty = "empty",
    Commit = "commit",
    Generate = "generate",
    Unknown = "unknown"
}

@jsonObject
class CodeLocation {
    @jsonMember(String)
    fileName?: string

    @jsonMember(Number)
    line?: number

    @jsonMember(Number)
    column?: number

    @jsonMember(String)
    stack?: string
}

@jsonObject
class ExecutionError {
    @jsonMember(String)
    type: ErrorType

    @jsonMember(String)
    message: string

    @jsonMember(CodeLocation)
    location?: CodeLocation

    constructor(type: ErrorType, msg: string, location?: CodeLocation) {
        this.type = type;
        this.message = msg;
        this.location = location;
    }
}

export { ExecutionError, ErrorType, CodeLocation };

