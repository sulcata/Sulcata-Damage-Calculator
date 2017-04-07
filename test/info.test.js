import * as info from "../src/info";
import {Stats} from "../src/utilities";

describe("info", () => {
    test(".natureName()", () => {
        expect(info.natureName(0)).toEqual("Hardy");
        expect(info.natureName(3)).toEqual("Adamant");
        expect(info.natureName("toString")).toBeUndefined();
        expect(info.natureName(-1)).toBeUndefined();
        expect(info.natureName(1.5)).toBeUndefined();
    });

    test(".natureId()", () => {
        expect(info.natureId("  adamant ")).toEqual(3);
        expect(info.natureId("Hardy")).toEqual(0);
        expect(info.natureId("  HAsTy")).toEqual(11);
        expect(info.natureId("toString")).toBeUndefined();
    });

    test(".natures()", () => {
        const natures = info.natures();
        expect(natures).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
            14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
        ]);
    });

    test(".natureMultiplier()", () => {
        const adamantStatMultipliers = [0, 1, 0, -1, 0, 0];
        for (let i = 0; i < 6; i++) {
            expect(info.natureMultiplier(3, i))
                .toEqual(adamantStatMultipliers[i]);
        }

        for (let i = 0; i < 6; i++) {
            expect(info.natureMultiplier(0, i)).toEqual(0);
        }
    });

    test(".natureStats()", () => {
        expect(info.natureStats(3)).toEqual([Stats.ATK, Stats.SATK]);
        expect(info.natureStats(0)).toEqual([-1, -1]);
    });
});
