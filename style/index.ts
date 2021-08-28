import type Style from "./Style";
import MilzStyle from "./MilzStyle";

let styles = new Map<string, Style>([
    ["default", MilzStyle],
    ["milz", MilzStyle]
]);


function getStyle(styleName: string) {
    const style = styles.get(styleName);
    return JSON.parse(JSON.stringify(style)) as Style;       // deep copy
}

export { getStyle };
export type { Style };