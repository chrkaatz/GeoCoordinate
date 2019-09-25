'use strict';

const GeoBoundingBox = require('../lib/').BoundingBox;
const GeoCoordinate = require('../lib/coordinate');

describe('bounding box', () => {
  test('test bounding box taking smallest possible box around 180th meridian', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(39.1, 178.3);
    bb.pushCoordinate(34.9, 166.8);
    bb.pushCoordinate(40.8, -175.7);
    bb.pushCoordinate(36.9, -170.8);
    bb.pushCoordinate(42.4, 179.6);
    bb.pushCoordinate(-4.4, 179.4);

    const expectedBox = {
      topLeftLatitude: 42.4,
      topLeftLongitude: 166.8,
      bottomRightLatitude: -4.4,
      bottomRightLongitude: -170.8
    };
    const box = bb.box();

    expect(expectedBox.topLeftLatitude).toEqual(
      box.topLeftLatitude,
      'topLeftLatitude not as expected'
    );
    expect(expectedBox.topLeftLongitude).toEqual(
      box.topLeftLongitude,
      'topLeftLongitude not as expected'
    );
    expect(expectedBox.bottomRightLatitude).toEqual(
      box.bottomRightLatitude,
      'bottomRightLatitude not as expected'
    );
    expect(expectedBox.bottomRightLongitude).toEqual(
      box.bottomRightLongitude,
      'bottomRightLongitude not as expected'
    );

    expect(bb.contains(37.1, 179.5)).toBe(
      true,
      'bounding box should contain coordinate'
    );
    expect(bb.contains(box.topLeftLatitude, box.topLeftLongitude)).toBe(
      true,
      'bounding box should contain boundary coordinate'
    );
    expect(bb.contains(26.9, 154.8)).toBe(
      false,
      'bounding box should not contain coordinate'
    );
  });
  test('bounding box crossing prime meridian', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(39.1, 18.3);
    bb.pushCoordinate(36.9, -17.8);

    const expectedBox = {
      topLeftLatitude: 39.1,
      topLeftLongitude: -17.8,
      bottomRightLatitude: 36.9,
      bottomRightLongitude: 18.3
    };
    const box = bb.box();

    expect(expectedBox.topLeftLatitude).toEqual(
      box.topLeftLatitude,
      'topLeftLatitude not as expected'
    );
    expect(expectedBox.topLeftLongitude).toEqual(
      box.topLeftLongitude,
      'topLeftLongitude not as expected'
    );
    expect(expectedBox.bottomRightLatitude).toEqual(
      box.bottomRightLatitude,
      'bottomRightLatitude not as expected'
    );
    expect(expectedBox.bottomRightLongitude).toEqual(
      box.bottomRightLongitude,
      'bottomRightLongitude not as expected'
    );
  });
  test('test mergeBox', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(1, 1);
    bb.pushCoordinate(2, 2);
    let box = bb.box();
    const expectedBox = {
      topLeftLatitude: 2,
      topLeftLongitude: 1,
      bottomRightLatitude: 1,
      bottomRightLongitude: 2
    };
    expect(expectedBox.topLeftLatitude).toEqual(
      box.topLeftLatitude,
      'topLeftLatitude not as expected'
    );
    expect(expectedBox.topLeftLongitude).toEqual(
      box.topLeftLongitude,
      'topLeftLongitude not as expected'
    );
    expect(expectedBox.bottomRightLatitude).toEqual(
      box.bottomRightLatitude,
      'bottomRightLatitude not as expected'
    );
    expect(expectedBox.bottomRightLongitude).toEqual(
      box.bottomRightLongitude,
      'bottomRightLongitude not as expected'
    );

    const bb2 = new GeoBoundingBox();
    bb2.pushCoordinate(1, 1);
    bb2.pushCoordinate(3, 3);
    const box2 = bb2.box();
    bb.mergeBox(box2);
    box = bb.box();

    const expectedNewBox = {
      topLeftLatitude: 3,
      topLeftLongitude: 1,
      bottomRightLatitude: 1,
      bottomRightLongitude: 3
    };

    expect(expectedNewBox.topLeftLatitude).toEqual(
      box.topLeftLatitude,
      'topLeftLatitude not as expected'
    );
    expect(expectedNewBox.topLeftLongitude).toEqual(
      box.topLeftLongitude,
      'topLeftLongitude not as expected'
    );
    expect(expectedNewBox.bottomRightLatitude).toEqual(
      box.bottomRightLatitude,
      'bottomRightLatitude not as expected'
    );
    expect(expectedNewBox.bottomRightLongitude).toEqual(
      box.bottomRightLongitude,
      'bottomRightLongitude not as expected'
    );
  });
  test('test box containing a point', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(-1, 1);
    bb.pushCoordinate(2, 2);

    expect(bb.contains(1.5, 1.5)).toBeTruthy();
    expect(bb.contains(0.5, 0.5)).toBeFalsy();
    expect(bb.contains(-1, 1)).toBeTruthy();
    expect(bb.contains(2, 2)).toBeTruthy();
    expect(bb.contains(-1.01, 1)).toBeFalsy();
  });
  test('test box getting center', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(-1, 1);
    bb.pushCoordinate(2, 2);
    expect(bb.centerLatitude()).toBe(0.5, 'should get the correct latitude');
    expect(bb.centerLongitude()).toBe(1.5, 'should get the correct latitude');
    expect(bb.center()).toEqual(
      { latitude: 0.5, longitude: 1.5 },
      'should get the proper center'
    );
  });
  test('test box containing circle', () => {
    const bb = new GeoBoundingBox();
    const centrePoint = new GeoCoordinate(-1, 1);
    bb.containCircle(centrePoint, 1000);
    expect(bb.contains(centrePoint.pointAtDistance(250, 0))).toBe(
      true,
      'should contain a point 250 metres from the centre'
    );
    expect(bb.contains(centrePoint.pointAtDistance(750, 180))).toBe(
      true,
      'should contain a point 750 metres from the centre'
    );
    expect(bb.contains(centrePoint.pointAtDistance(1750, 180))).toBe(
      false,
      'should not contain a point 1750 metres from the centre'
    );
  });
  test('test box matrix 2x2', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(0, 0);
    bb.pushCoordinate(2, 2);
    const boxes = bb.getMatrix(1);
    expect(boxes.length).toBe(4, 'should generate a box of 4');
  });
  test('test box matrix 4x4', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(-1, -1);
    bb.pushCoordinate(2, 2);
    const boxes = bb.getMatrix(2);
    const resBoxes = [];
    boxes.forEach(function(box) {
      if (box.length && box.length > 0) {
        box.forEach(function(b) {
          if (!b.length) {
            resBoxes.push(b);
          }
        });
      } else {
        resBoxes.push(box);
      }
    });
    expect(resBoxes.length).toBe(16, 'should generate a box of 16');
    expect(boxes.length).toBe(4, 'should generate a box of 4');
  });
  test('test box can store arbitrary data', () => {
    const bb = new GeoBoundingBox();
    bb.pushCoordinate(-1, -1);
    bb.pushCoordinate(2, 2);
    bb.setData('Prop', 'is set');
    expect(bb.data).toHaveProperty('Prop', 'is set');
    bb.removeData('Prop');
    expect(bb.data).toEqual({}, 'should not contain data');
  });
  test('create bounding box from coordinates', () => {
    expect(() => {
      GeoBoundingBox.fromCoordinates([-1, -1]);
    }).toThrow();
    const bb = GeoBoundingBox.fromCoordinates([-1, -1], [2, 2]);
    expect(() => {
      bb.pushCoordinate([1, 1]);
    }).toThrow();
    expect(bb.values()).toEqual([2, -1, -1, 2]);
    expect(bb.hasCoordinates()).toBeTruthy();
  });
  test('test box for #3', () => {
    const bb = new GeoBoundingBox();
    const coords = {
      nw_corner_longitude: -115.9936056,
      nw_corner_latitude: 39.9033762,
      se_corner_longitude: -89.7567399,
      se_corner_latitude: 26.2237111
    };
    bb.pushCoordinate(coords.nw_corner_latitude, coords.se_corner_longitude);
    bb.pushCoordinate(coords.se_corner_latitude, coords.nw_corner_longitude);

    // returns true when it should return false.  The longitude is outside the bounds.
    expect(bb.contains(35.5459732, -78.6398736)).toBe(
      false,
      'point should be outside the bbox'
    );
  });
});
