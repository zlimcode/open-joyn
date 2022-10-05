import type Style from "./Style";

let FlatheadStyle: Style = {
    experimental: true,

    bars: {
        stock: "spruce_quadratic",
        stockLength: 3000.0,
        stockCutExtra: 5.0,
        keepHoleSide: true,
    },

    panels: {
        stock: "birch_multiplex",
        ignoreCutDirection: true
    },

    connections: {
        stock: "m8"
    },

    joynExport: {
        constructionStyle: "10_scarf",
        jointTemplate: "34x34_flathead"
    },

    precision: 0
};

export default FlatheadStyle;