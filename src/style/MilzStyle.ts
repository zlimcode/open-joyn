import type Style from "./Style";

let MilzStyle: Style = {
    experimental: false,

    bars: {
        stock: "spruce_quadratic",
        stockLength: 3000.0,
        stockCutExtra: 5.0,
        keepHoleSide: false,
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
        jointTemplate: "34x34_fullpeg"
    },

    precision: 0
};

export default MilzStyle;