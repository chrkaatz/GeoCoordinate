'use strict';
const GeoCoordinate = require("./coordinate");

/** returns the signed smallest distance between a and b assuming their
 domain is circular (repeating) each -range/2 and range/2 */
function smallestCircularDistance(range, a, b) {
    //categoryA and categoryB are integer in the range of -0.5 to 0.5
    const halfRange = range / 2;
    const categoryA = Math.round(a / halfRange) / 2;
    const categoryB = Math.round(b / halfRange) / 2;
    const normalizeAmount = Math.floor(categoryA - categoryB);
    //add -1, 0 or 1 times the range to normalize
    b += normalizeAmount * range;
    //return signed distance
    return b - a;
}

function GeoBoundingBox() {
    this.longitude = {
        range: 360,
        min: NaN,
        max: NaN
    };
    this.latitude = {
        range: 180,
        min: NaN,
        max: NaN
    };
    this.axes = [this.latitude, this.longitude];
    this.data = {};
    this.settled = false;
}

GeoBoundingBox.fromCoordinates = function() {
    if (arguments.length < 2) {
        throw new RangeError('Not enough arguments passed to fromCoordinates');
    }
    const instance = new GeoBoundingBox();
    for(let i = 0; i < arguments.length; i++) {
        instance.pushCoordinate(arguments[i]);
    }
    Object.defineProperty(instance, 'settled', {
        writable: false,
        value: true
    });
    return instance;
};

GeoBoundingBox.prototype.mergeBox = function (box) {
    this.pushCoordinate(box.topLeftLatitude, box.topLeftLongitude);
    this.pushCoordinate(box.bottomRightLatitude, box.bottomRightLongitude);
};

GeoBoundingBox.prototype.containCircle = function (centrePoint, radius) {
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 0));
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 90));
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 180));
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 270));
};

GeoBoundingBox.prototype.setData = function (key, value) {
    this.data[key] = value;
};

GeoBoundingBox.prototype.removeData = function (key) {
    delete this.data[key];
};

// eslint-disable-next-line no-unused-vars
GeoBoundingBox.prototype.pushCoordinate = function (latitude, longitude) {
    if (this.settled) {
        throw new Error('Instances created by static method .fromCoordinates are locked');
    }
    const coord = GeoCoordinate.fromArguments(arguments);
    this.latitude.value = coord.latitude();
    this.longitude.value = coord.longitude();


    this.axes.forEach(function (axis) {
        if (isNaN(axis.min) || isNaN(axis.max)) {
            axis.min = axis.value;
            axis.max = axis.value;
            return;
        }

        const distanceFromMin = smallestCircularDistance(axis.range, axis.min, axis.value);
        const    distanceFromMax = smallestCircularDistance(axis.range, axis.max, axis.value);

        //distance 0 means it lies on one of the boundaries of the box, which we consider to be inside
        if (distanceFromMin === 0 || distanceFromMax === 0) {
            return;
        }
        //lies within min and max since distances from min and max
        //have a different sign (different direction from the points)
        if ((distanceFromMin / distanceFromMax) < 0) {
            return;
        }
        //value is smaller then min, so decrease min
        if (distanceFromMin < 0) {
            axis.min = axis.value;
        }
        //value is bigger then max, so increase max
        if (distanceFromMax > 0) {
            axis.max = axis.value;
        }
    });
};

// eslint-disable-next-line no-unused-vars
GeoBoundingBox.prototype.contains = function (latitude, longitude) {
    const coord = GeoCoordinate.fromArguments(arguments);
    this.latitude.value = coord.latitude();
    this.longitude.value = coord.longitude();



    const doesNotContain = this.axes.some(function (axis) {
        if (isNaN(axis.min) || isNaN(axis.max)) {
            return true;
        }

        const distanceFromMin = smallestCircularDistance(axis.range, axis.min, axis.value);
        const distanceFromMax = smallestCircularDistance(axis.range, axis.max, axis.value);

        //distance 0 means it lies on one of the boundaries of the box, which we consider to be inside
        if (distanceFromMin === 0 || distanceFromMax === 0) {
            return false;
        }
        //lies not within min and max since distances from min and max
        //have the same sign (same direction from the points)
        return (distanceFromMin / distanceFromMax) >= 0;
    });
    return !doesNotContain;
};

GeoBoundingBox.prototype.box = function () {
    return {
        topLeftLatitude: this.latitude.max,
        topLeftLongitude: this.longitude.min,
        bottomRightLatitude: this.latitude.min,
        bottomRightLongitude: this.longitude.max
    };
};

GeoBoundingBox.prototype.values = function () {
    return [this.latitude.max, this.longitude.min, this.latitude.min, this.longitude.max];
};

GeoBoundingBox.prototype.centerLatitude = function () {
    return (this.latitude.min + this.latitude.max) / 2;
};

GeoBoundingBox.prototype.centerLongitude = function () {
    return (this.longitude.min + this.longitude.max) / 2;
};

GeoBoundingBox.prototype.center = function () {
    return {
        latitude: this.centerLatitude(),
        longitude: this.centerLongitude()
    };
};

GeoBoundingBox.prototype.hasCoordinates = function () {
    return this.axes.every(function (axis) {
        return !isNaN(axis.min) && !isNaN(axis.max);
    });
};

GeoBoundingBox.prototype.getMatrix = function (splits) {
    let boxes = [];
    if (this.hasCoordinates && typeof splits === "number") {
        const center = this.center();
        const values = this.box();
        const outerBounds = [
            [values.topLeftLatitude, values.topLeftLongitude],
            [values.topLeftLatitude, values.bottomRightLongitude],
            [values.bottomRightLatitude, values.topLeftLongitude],
            [values.bottomRightLatitude, values.bottomRightLongitude]
        ];
        for (let i = 0; i < 4; i++) {
            const bbox = new GeoBoundingBox();
            bbox.pushCoordinate(center.latitude, center.longitude);
            bbox.pushCoordinate(outerBounds[i][0], outerBounds[i][1]);
            boxes.push(bbox);
        }
        for (let splitIndex = 1; splitIndex < splits; splitIndex++) {
            boxes = boxes.map(function (box) {
                return box.getMatrix(splits - 1);
            });
        }
    }
    return boxes;
};

module.exports = GeoBoundingBox;