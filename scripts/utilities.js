import _ from "lodash/fp";

const stripByteOrderMark = data => {
    if (data.length >= 3 && data.readUIntBE(0, 3) === 0xEFBBBF) {
        return data.slice(3);
    }
    return data;
};

const parseLine = _.flow(
    _.split("#"),
    _.head,
    _.split(" "),
    _.over([
        _.head,
        _.flow(_.tail, _.join(" "))
    ]),
    _.map(_.trim)
);

export const dataToObject = _.cond([
    [
        _.isBuffer,
        _.flow(
            stripByteOrderMark,
            _.toString,
            _.split("\n"),
            _.map(parseLine),
            _.fromPairs,
            _.pickBy(_.nthArg(1))
        )
    ],
    [
        _.stubTrue,
        _.identity
    ]
]);

const baseFormOnly = new Set([
    "201",
    "666",
    "676",
    "25",
    "669",
    "670",
    "671",
    "585",
    "586",
    "172",
    "422",
    "423",
    "550",
    "716"
]);

const exceptions = new Set([
    "670:5"
]);

const isAesthetic = id => {
    const [num, form] = id.split(":");
    return form !== "0"
        && !exceptions.has(id)
        && baseFormOnly.has(num);
};

export const removeAestheticPokes = _.omitBy.convert({cap: false})(
    _.flow(_.nthArg(1), isAesthetic)
);

export const simplifyPokeIds = _.mapKeys(_.flow(
    _.split(":"),
    _.take(2),
    _.join(":")
));

const berryToItem = _.flow(_.toNumber, _.add(8000));

export const combineItemsAndBerries = _.curry((items, berries) => ({
    ...items,
    ..._.mapKeys(berryToItem, berries)
}));
