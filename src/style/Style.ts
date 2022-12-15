
interface Style {
    experimental: boolean,

    panels: {
        stock: string;

        /** Allow panels with `[w, h] = [h, w]` to be considered the same panels for cutting */
        ignoreCutDirection: boolean;
    };

    bars: {
        stock: string;

        /* Length of bar stock, mm */
        stockLength: number;

        /* Material for each cut, mm */
        stockCutExtra: number;

        /* Do not allow reordering of holes on opposite sides */
        keepHoleSide: boolean;
    };

    connections: {
        stock: string;

    };

    joynExport: {
        constructionStyle: string;
        jointTemplate: string;
    };

    /** Precision for display and grouping. -1 = centimeters, 0 = whole millimeters, 1 = tenth of a millimeter */
    precision: number;
}


export default Style;

