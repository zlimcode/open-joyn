import type Style from "./Style";
import MilzStyle from "./MilzStyle";
import FlatheadStyle from "./FlatheadStyle";


let styles = new Map<string, Style>([
    ["default", MilzStyle],
    ["milz", MilzStyle],
    ["flathead", FlatheadStyle]
]);


function getStyle(styleName: string) {
    const style = styles.get(styleName);

    if (style) {
        return JSON.parse(JSON.stringify(style)) as Style;       // deep copy
    }
}    

export { getStyle };
export type { Style };