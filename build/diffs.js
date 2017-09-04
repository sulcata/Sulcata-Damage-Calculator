"use strict";
const _ = require("lodash/fp");

const changes = _.rest(
    _.flow(
        _.reverse,
        _.map(_.toPairs),
        _.spread(_.differenceWith(_.isEqual)),
        _.fromPairs
    )
);

const deletions = _.overArgs(
    _.rest(
        _.flow(
            _.map(_.keys),
            _.spread(_.difference),
            _.invert,
            _.mapValues(() => null)
        )
    ),
    [_.omitBy(_.isNull), _.identity]
);

const diffs = _.flow(
    _.over([changes, deletions]),
    _.mergeAll
);

const reduceByDiffs = _.flow(
    _.over([
        _.flow(_.dropRight(1), _.concat({})),
        _.identity
    ]),
    _.unzip,
    _.map(_.spread(diffs))
);

module.exports = {
    changes,
    deletions,
    diffs,
    reduceByDiffs
};
