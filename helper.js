module.exports.getAverage = arr => {
    if (arr.length < 1) {
        return;
    }
    return arr.reduce((prev, current) => prev + current) / arr.length;
};

module.exports.getRange = arr => {
    if (arr.length < 1) {
        return;
    }
    const min = Math.min.apply(null, arr);
    const max = Math.max.apply(null, arr);
    return max - min;
};