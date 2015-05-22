/*jshint evil: false, bitwise:false, strict: false, undef: true, white: false, plusplus:false, node:true */


var GeoBoundingBox = require("../lib/boundingbox");
var testCase = require('nodeunit').testCase;

module.exports = testCase({
    "test bounding box taking smallest possible box around 180th meridian": function(test) {
        var bb = new GeoBoundingBox();
        bb.pushCoordinate(39.1, 178.3);
        bb.pushCoordinate(34.9, 166.8);
        bb.pushCoordinate(40.8, -175.7);
        bb.pushCoordinate(36.9, -170.8);
        bb.pushCoordinate(42.4, 179.6);
        bb.pushCoordinate(-4.4, 179.4);

        var expectedBox = {
            "topLeftLatitude":42.4,
            "topLeftLongitude":166.8,
            "bottomRightLatitude":-4.4,
            "bottomRightLongitude":-170.8
        };
        var box = bb.box();

        test.strictEqual(expectedBox.topLeftLatitude, box.topLeftLatitude, 'topLeftLatitude not as expected');
        test.strictEqual(expectedBox.topLeftLongitude, box.topLeftLongitude, 'topLeftLongitude not as expected');
        test.strictEqual(expectedBox.bottomRightLatitude, box.bottomRightLatitude, 'bottomRightLatitude not as expected');
        test.strictEqual(expectedBox.bottomRightLongitude, box.bottomRightLongitude, 'bottomRightLongitude not as expected');

        test.ok(bb.contains(37.1, 179.5), 'bounding box should contain coordinate');
        test.ok(bb.contains(box.topLeftLatitude, box.topLeftLongitude), 'bounding box should contain boundary coordinate');
        test.ok(!bb.contains(26.9, 154.8), 'bounding box should not contain coordinate');

        test.done();
    },
    "bounding box crossing prime meridian": function(test) {
        var bb = new GeoBoundingBox();
        bb.pushCoordinate(39.1, 18.3);
        bb.pushCoordinate(36.9, -17.8);

        var expectedBox = {
            "topLeftLatitude":39.1,
            "topLeftLongitude":-17.8,
            "bottomRightLatitude":36.9,
            "bottomRightLongitude":18.3
        };
        var box = bb.box();

        test.strictEqual(expectedBox.topLeftLatitude, box.topLeftLatitude, 'topLeftLatitude not as expected');
        test.strictEqual(expectedBox.topLeftLongitude, box.topLeftLongitude, 'topLeftLongitude not as expected');
        test.strictEqual(expectedBox.bottomRightLatitude, box.bottomRightLatitude, 'bottomRightLatitude not as expected');
        test.strictEqual(expectedBox.bottomRightLongitude, box.bottomRightLongitude, 'bottomRightLongitude not as expected');

        test.done();
    },
    "test mergeBox": function(test) {
        var bb = new GeoBoundingBox();
        bb.pushCoordinate(1, 1);
        bb.pushCoordinate(2, 2);
        var box = bb.box();
        var expectedBox = {
            "topLeftLatitude":2,
            "topLeftLongitude":1,
            "bottomRightLatitude":1,
            "bottomRightLongitude":2
        };
        test.strictEqual(expectedBox.topLeftLatitude, box.topLeftLatitude, 'topLeftLatitude not as expected');
        test.strictEqual(expectedBox.topLeftLongitude, box.topLeftLongitude, 'topLeftLongitude not as expected');
        test.strictEqual(expectedBox.bottomRightLatitude, box.bottomRightLatitude, 'bottomRightLatitude not as expected');
        test.strictEqual(expectedBox.bottomRightLongitude, box.bottomRightLongitude, 'bottomRightLongitude not as expected');

        var bb2 = new GeoBoundingBox();
        bb2.pushCoordinate(1, 1);
        bb2.pushCoordinate(3, 3);
        var box2 = bb2.box();
        bb.mergeBox(box2);
        box = bb.box();

         var expectedNewBox = {
            "topLeftLatitude":3,
            "topLeftLongitude":1,
            "bottomRightLatitude":1,
            "bottomRightLongitude":3
        };
        test.strictEqual(expectedNewBox.topLeftLatitude, box.topLeftLatitude, 'topLeftLatitude not as expected');
        test.strictEqual(expectedNewBox.topLeftLongitude, box.topLeftLongitude, 'topLeftLongitude not as expected');
        test.strictEqual(expectedNewBox.bottomRightLatitude, box.bottomRightLatitude, 'bottomRightLatitude not as expected');
        test.strictEqual(expectedNewBox.bottomRightLongitude, box.bottomRightLongitude, 'bottomRightLongitude not as expected');

        test.done();
    },
    "test box containing a point": function(test) {
        var bb = new GeoBoundingBox();
        bb.pushCoordinate(-1, 1);
        bb.pushCoordinate(2, 2);

        test.ok(bb.contains(1.5,1.5), 'point should be withing the bbox');
        test.ok(!bb.contains(0.5,0.5), 'point should not be withing the bbox');
        test.ok(bb.contains(-1,1), 'point should be withing the bbox');
        test.ok(bb.contains(2,2), 'point should be withing the bbox');
        test.ok(!bb.contains(-1.01,1), 'point should not be withing the bbox');

        test.done();
    },
    "test box getting center": function(test) {
        var bb = new GeoBoundingBox();
        bb.pushCoordinate(-1, 1);
        bb.pushCoordinate(2, 2);
        test.ok(bb.centerLatitude() === 0.5, 'should get the correct latitude');
        test.ok(bb.centerLongitude() === 1.5, 'should get the correct longitude');
        test.deepEqual(bb.center(), { latitude: 0.5, longitude: 1.5 }, 'should get the proper center');

        test.done();
    }
});