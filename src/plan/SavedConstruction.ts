import type { Plan, PlanOptions } from "./Plan";

type SavedConstruction = {
    hash: string,
    blueprint: string,
    name: string,
    permalink: string,

    data: {
        values: { [key: string]: any },
        planOptions: PlanOptions
    }
};

export type {SavedConstruction};