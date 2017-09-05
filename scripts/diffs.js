import _ from "lodash/fp";

export const changes = _.rest(
    _.flow(
        _.reverse,
        _.map(_.toPairs),
        _.spread(_.differenceWith(_.isEqual)),
        _.fromPairs
    )
);

export const deletions = _.rest(
    _.flow(
        _.map(_.keys),
        _.spread(_.difference),
        _.invert,
        _.mapValues(() => null)
    )
);

export const diffs = _.flow(
    _.over([changes, deletions]),
    _.mergeAll
);

export const reduceByDiffs = _.flow(
    _.over([
        _.flow(_.dropRight(1), _.concat({})),
        _.identity
    ]),
    _.unzip,
    _.map(_.spread(diffs))
);
