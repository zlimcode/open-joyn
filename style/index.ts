import type Style from "./Style";
import MilzStyle from "./MilzStyle";

let styles = new Map<string, Style>([
    ["default", MilzStyle],
    ["milz", MilzStyle]
]);


function getStyle(styleName: string) {
    return styles.get(styleName);
}

export { getStyle };
export type { Style };