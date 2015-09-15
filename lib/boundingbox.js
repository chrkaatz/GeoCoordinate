var GeoCoordinate = require("./coordinate");

/** returns the signed smallest distance between a and b assuming their 
domain is circular (repeating) each -range/2 and range/2 */
function smallestCircularDistance(range, a, b) {
    //categoryA and categoryB are integer in the range of -0.5 to 0.5
    var halfRange = range/2,
        categoryA = Math.round(a/halfRange) / 2,
        categoryB = Math.round(b/halfRange) / 2,
        normalizeAmount = Math.floor(categoryA - categoryB);
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
}

GeoBoundingBox.prototype.mergeBox = function(box) {
    this.pushCoordinate(box.topLeftLatitude, box.topLeftLongitude);
    this.pushCoordinate(box.bottomRightLatitude, box.bottomRightLongitude);
};

GeoBoundingBox.prototype.containCircle = function(centrePoint, radius) {
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 0));
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 90));
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 180));
    this.pushCoordinate(centrePoint.pointAtDistance(radius, 270));
};

GeoBoundingBox.prototype.setData = function(key, value) {
    this.data[key] = value;
};

GeoBoundingBox.prototype.removeData = function(key) {
    delete this.data[key];
};

GeoBoundingBox.prototype.pushCoordinate = function(latitude, longitude) {
    if(latitude instanceof GeoCoordinate) {
        this.latitude.value = latitude.latitude();
        this.longitude.value = latitude.longitude();
    } else {
        this.latitude.value = latitude;
        this.longitude.value = longitude;
    }
    
    this.axes.forEach(function(axis) {
        if(isNaN(axis.min) || isNaN(axis.max)) {
            axis.min = axis.value;
            axis.max = axis.value;
            return;
        }
        
        var distanceFromMin = smallestCircularDistance(axis.range, axis.min, axis.value),
            distanceFromMax = smallestCircularDistance(axis.range, axis.max, axis.value);
            
        //distance 0 means it lies on one of the boundaries of the box, which we consider to be inside
        if(distanceFromMin === 0 || distanceFromMax === 0) {
            return;
        }
        //lies within min and max since distances from min and max
        //have a different sign (different direction from the points)
        if((distanceFromMin/distanceFromMax) < 0) {
            return;
        }
        //value is smaller then min, so decrease min
        if(distanceFromMin < 0) {
            axis.min = axis.value;
        }
        //value is bigger then max, so increase max
        if(distanceFromMax > 0) {
            axis.max = axis.value;
        }
    });
};

GeoBoundingBox.prototype.contains = function(latitude, longitude) {
    if(latitude instanceof GeoCoordinate) {
        this.latitude.value = latitude.latitude();
        this.longitude.value = latitude.longitude();
    } else {
        this.latitude.value = latitude;
        this.longitude.value = longitude;
    }
    
    var doesNotContain = this.axes.some(function(axis) {
        if(isNaN(axis.min) || isNaN(axis.max)) {
            return true;
        }
        
        var distanceFromMin = smallestCircularDistance(axis.range, axis.min, axis.value),
            distanceFromMax = smallestCircularDistance(axis.range, axis.max, axis.value);
        
        //distance 0 means it lies on one of the boundaries of the box, which we consider to be inside
        if(distanceFromMin === 0 || distanceFromMax === 0) {
            return false;
        }
        //lies not within min and max since distances from min and max
        //have the same sign (same direction from the points)
        return (distanceFromMin/distanceFromMax) >= 0;
    });
    return !doesNotContain;
};

GeoBoundingBox.prototype.box = function() {
    return {
        topLeftLatitude: this.latitude.max,
        topLeftLongitude: this.longitude.min,
        bottomRightLatitude: this.latitude.min,
        bottomRightLongitude: this.longitude.max
    };
};

GeoBoundingBox.prototype.values = function() {
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
    var boxes = [];
    var targetBoxes = [];
    if(this.hasCoordinates && typeof splits === "number") {
        var center = this.center();
        var values = this.box();
        var outerBounds = [
            [values.topLeftLatitude, values.topLeftLongitude],
            [values.topLeftLatitude, values.bottomRightLongitude],
            [values.bottomRightLatitude, values.topLeftLongitude],
            [values.bottomRightLatitude, values.bottomRightLongitude]
        ];
        for (var i = 0; i < 4; i++) {
            var bbox = new GeoBoundingBox();
            bbox.pushCoordinate(center.latitude, center.longitude);
            bbox.pushCoordinate(outerBounds[i][0], outerBounds[i][1]);
            boxes.push(bbox);
        }
        for (var splitIndex = 1; splitIndex < splits; splitIndex++ ) {
            boxes = boxes.map(function(box) {
                return box.getMatrix(splits-1);
            });
        }
    }
    return boxes;
};

module.exports = GeoBoundingBox;