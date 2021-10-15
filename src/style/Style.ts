
interface Style {
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
    };

    connections: {
        stock: string;



    };

    /** Precision for display and grouping. -1 = centimeters, 0 = whole millimeters, 1 = tenth of a millimeter */
    precision: number;
}


export default Style;

