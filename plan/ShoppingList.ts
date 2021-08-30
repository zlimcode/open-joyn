import type { Plan } from "./Plan";
import type { Bar, Panel } from "openjoyn/model";



const BarTemplate: ShoppingListItem = {
    amount: 0,
    label: "Holzlatte",
    properties: "",
    description: "z.B. Rahmenholz Kiefer",

    suppliers: [
        { label: "Obi", url: "https://www.obi.de/hobelware/rahmenholz-fichte-tanne-gehobelt-gefast-34-mm-x-34-mm-x-2500-mm/p/3260965" },
        { label: "Bauhaus", url: "https://www.bauhaus.info/latten-rahmen/rahmenholz/p/20832575" },
        { label: "Hagebau", url: "https://www.hagebau.de/p/klenk-holz-rahmenholz-fichte-tanne-bxh-34-x-34-cm-glatt-anP7000120700/" }
    ]
};


const PanelTemplate: ShoppingListItem = {
    amount: 0,
    label: "Platte",
    properties: "",

    description: "z.B. Multiplexplatte Birke",

    suppliers: [
    ]
};


const NutTemplate: ShoppingListItem = {
    amount: 0,
    label: "Hülsenmutter",
    properties: "M8 x 16 mm",

    description: "Stahl verzinkt, schwarz, Kopf-Ø: 19 mm, Kopfdicke: 2,5 mm, Innengewinde: M8, Schaft-Ø: 10 mm, Innensechskant: 5 mm",

    suppliers: [
        { label: "eBay", url: "https://www.ebay.de/itm/264698428718?var=564854020829" },
        { label: "eBay", url: "https://www.ebay.de/itm/313544526680?var=612372723962" }
    ]

};


const RodTemplate: ShoppingListItem = {
    amount: 0,
    label: "Gewindebolzen",
    properties: "",

    description: "M8, Stahl verzinkt",

    suppliers: [
        { label: "eBay", url: "https://www.ebay.de/itm/124092120957?var=424919687383" },
        { label: "eBay", url: "https://www.ebay.de/itm/124092120957" },
        { label: "Stabilo", url: "https://www.stabilo-sanitaer.de/search/?query=gewindestift+m8" }
    ]

};


function fixedLocale(value: number, n: number) {
    return value.toLocaleString("de", {
        minimumFractionDigits: n,
        maximumFractionDigits: n
    });

}


type Supplier = {
    label: string,
    url: string;
};

type ShoppingListItem = {
    amount: number | string;
    unit?: string;

    label: string;
    properties: string;
    description: string;

    suppliers: Supplier[];
};



function calculateLength(bars: Bar[]) {
    let l = 0.0;

    for (const bar of bars) {
        l += bar.length;
    }

    return l;
}


function calculateArea(panels: Panel[]) {
    let a = 0.0;

    for (const panel of panels) {
        a += panel.size[0] * panel.size[1];
    }

    return a;
}


class ShoppingList {
    private plan: Plan;

    constructor(plan: Plan) {
        this.plan = plan;
    }

    barItems(): ShoppingListItem[] {
        const bars = this.plan.construction.bars();
        const barsBySize = this.plan.groupBarsBySize(bars);

        let items = [];

        for (const sizeBars of barsBySize) {
            const templateBar = sizeBars[0];

            const stockL = this.plan.style.bars.stockLength;
            const stockLm = (stockL / 1000.0);

            const l = calculateLength(sizeBars);
            const stocks = Math.ceil(l / stockL);

            let item = Object.assign({}, BarTemplate);
            item.amount = stocks;
            item.properties = `${templateBar.size[0]} × ${templateBar.size[1]} mm, ${fixedLocale(stockLm, 1)} m`;

            items.push(item);
        }
        return items;
    }

    panelItems(): ShoppingListItem[] {
        const panels = this.plan.construction.panels();
        const panelsByThickness = this.plan.groupPanelsByThickness(panels);

        let items = [];

        for (const thicknessPanels of panelsByThickness) {
            const templatePanel = thicknessPanels[0];

            const area = calculateArea(thicknessPanels) / (1000 * 1000);

            let item = Object.assign({}, PanelTemplate);
            item.amount = `${fixedLocale(area, 2)}`;
            item.unit = "m²";
            item.properties = `${fixedLocale(templatePanel.thickness, 0)} mm`;

            items.push(item);
        }

        return items;
    }

    connectorItems(): ShoppingListItem[] {
        const connectors = this.plan.construction.connectors();

        let nutItem = Object.assign({}, NutTemplate);
        nutItem.amount = connectors.length * 2;

        const connectorsByLength = this.plan.groupConnectorsByLength(connectors);

        let rodItems: ShoppingListItem[] = [];

        for (const lengthConnector of connectorsByLength) {
            const templateConnector = lengthConnector[0];
            const l = templateConnector.length;
            const rodL = l - 10.0;
            const roundedL = Math.floor(rodL / 10.0) * 10;  // TODO: from style

            let rodItem = Object.assign({}, RodTemplate);
            rodItem.amount = lengthConnector.length;
            rodItem.properties = `${fixedLocale(roundedL, 0)} mm lang`;

            rodItems.push(rodItem);
        }

        let items = [nutItem, ...rodItems];

        return items;
    }

    extraItems(): ShoppingListItem[] {
        return [];
    }

    items(): ShoppingListItem[] {
        return [...this.barItems(), ...this.panelItems(), ...this.connectorItems(), ...this.extraItems()];
    }
}

export { ShoppingList };
export type { ShoppingListItem };