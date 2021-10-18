import { PartBase } from "openjoyn/model";

/**
 * Group an array of items by a given predicate. The predicate needs to be hashable
 * 
 * Each collection of each group will keep the same relative order as in the input collection.
 * 
 * @param arr array of items
 * @param predicateFn function returning the grouping predicate from the item
 * @returns a Map of groups of items. Key is the predicate
 */
function groupByPredicate<T, TP>(arr: T[], predicateFn: ((item: T) => TP)) {
    let map = arr.reduce((acc: Map<any, T[]>, item) => {
        const predicate = predicateFn(item);
        if (acc.has(predicate)) {
            acc.get(predicate)!.push(item);
        } else {
            acc.set(predicate, [item]);
        }

        return acc;
    }, new Map<TP, T[]>());

    return map as Map<TP, T[]>;
}

/**
 * Group an array of items by comparing equality.
 * 
 * Each array of each group will keep the same relative order as in the input collection.
 * 
 * @param arr array of items
 * @param equalityFn function returning equality for two items
 * @returns array of arrays of equal items
 */
function groupByEqual<T>(arr: T[], equalityFn: ((a: T, b: T) => boolean)): T[][] {
    let groups: T[][] = [];
    for (const item of arr) {
        let matched = false;
        for (const group of groups) {
            const groupFirst = group[0];

            if (equalityFn(groupFirst, item)) {
                group.push(item);
                matched = true;
                break;
            }
        }

        if (!matched) {
            groups.push([item]);
        }
    }

    return groups;
}


function fixedPrecision(v: number, precision: number) {
    let m = 10 ^ precision;
    let n = v / m;
    let p = Math.round(n) * m;
    return p.toFixed(0);
}


function naturalCompare(a: string, b: string) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
};

export { groupByPredicate, groupByEqual, naturalCompare, fixedPrecision };