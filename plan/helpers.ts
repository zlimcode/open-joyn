/**
 * Group an array of items by a given predicate.
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
        if (!acc.has(predicate)) {
            acc.set(predicate, [item]);
        } else {
            acc.get(predicate).push(item);
        }

        return acc;
    }, new Map<TP, T[]>());

    return map as Map<TP, T[]>;
}


function fixedPrecision(v: number, precision: number) {
    let m = 10^precision
    let n = v / m;
    let p = Math.round(n) * m;
    return p.toFixed(0);
}

export { groupByPredicate, fixedPrecision };