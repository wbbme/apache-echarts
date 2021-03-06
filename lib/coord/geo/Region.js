
/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/


/**
 * AUTO-GENERATED FILE. DO NOT MODIFY.
 */

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
import { __extends } from "tslib";
import BoundingRect from 'zrender/lib/core/BoundingRect';
import * as bbox from 'zrender/lib/core/bbox';
import * as vec2 from 'zrender/lib/core/vector';
import * as polygonContain from 'zrender/lib/contain/polygon';
import * as matrix from 'zrender/lib/core/matrix';
var TMP_TRANSFORM = [];

var Region =
/** @class */
function () {
  function Region(name) {
    this.name = name;
  }
  /**
   * Get center point in data unit. That is,
   * for GeoJSONRegion, the unit is lat/lng,
   * for GeoSVGRegion, the unit is SVG local coord.
   */


  Region.prototype.getCenter = function () {
    return;
  };

  return Region;
}();

export { Region };

var GeoJSONRegion =
/** @class */
function (_super) {
  __extends(GeoJSONRegion, _super);

  function GeoJSONRegion(name, geometries, cp) {
    var _this = _super.call(this, name) || this;

    _this.type = 'geoJSON';
    _this.geometries = geometries;

    if (!cp) {
      var rect = _this.getBoundingRect();

      cp = [rect.x + rect.width / 2, rect.y + rect.height / 2];
    } else {
      cp = [cp[0], cp[1]];
    }

    _this._center = cp;
    return _this;
  }

  GeoJSONRegion.prototype.getBoundingRect = function () {
    var rect = this._rect;

    if (rect) {
      return rect;
    }

    var MAX_NUMBER = Number.MAX_VALUE;
    var min = [MAX_NUMBER, MAX_NUMBER];
    var max = [-MAX_NUMBER, -MAX_NUMBER];
    var min2 = [];
    var max2 = [];
    var geometries = this.geometries;
    var i = 0;

    for (; i < geometries.length; i++) {
      // Only support polygon
      if (geometries[i].type !== 'polygon') {
        continue;
      } // Doesn't consider hole


      var exterior = geometries[i].exterior;
      bbox.fromPoints(exterior, min2, max2);
      vec2.min(min, min, min2);
      vec2.max(max, max, max2);
    } // No data


    if (i === 0) {
      min[0] = min[1] = max[0] = max[1] = 0;
    }

    return this._rect = new BoundingRect(min[0], min[1], max[0] - min[0], max[1] - min[1]);
  };

  GeoJSONRegion.prototype.contain = function (coord) {
    var rect = this.getBoundingRect();
    var geometries = this.geometries;

    if (!rect.contain(coord[0], coord[1])) {
      return false;
    }

    loopGeo: for (var i = 0, len = geometries.length; i < len; i++) {
      // Only support polygon.
      if (geometries[i].type !== 'polygon') {
        continue;
      }

      var exterior = geometries[i].exterior;
      var interiors = geometries[i].interiors;

      if (polygonContain.contain(exterior, coord[0], coord[1])) {
        // Not in the region if point is in the hole.
        for (var k = 0; k < (interiors ? interiors.length : 0); k++) {
          if (polygonContain.contain(interiors[k], coord[0], coord[1])) {
            continue loopGeo;
          }
        }

        return true;
      }
    }

    return false;
  };

  GeoJSONRegion.prototype.transformTo = function (x, y, width, height) {
    var rect = this.getBoundingRect();
    var aspect = rect.width / rect.height;

    if (!width) {
      width = aspect * height;
    } else if (!height) {
      height = width / aspect;
    }

    var target = new BoundingRect(x, y, width, height);
    var transform = rect.calculateTransform(target);
    var geometries = this.geometries;

    for (var i = 0; i < geometries.length; i++) {
      // Only support polygon.
      if (geometries[i].type !== 'polygon') {
        continue;
      }

      var exterior = geometries[i].exterior;
      var interiors = geometries[i].interiors;

      for (var p = 0; p < exterior.length; p++) {
        vec2.applyTransform(exterior[p], exterior[p], transform);
      }

      for (var h = 0; h < (interiors ? interiors.length : 0); h++) {
        for (var p = 0; p < interiors[h].length; p++) {
          vec2.applyTransform(interiors[h][p], interiors[h][p], transform);
        }
      }
    }

    rect = this._rect;
    rect.copy(target); // Update center

    this._center = [rect.x + rect.width / 2, rect.y + rect.height / 2];
  };

  GeoJSONRegion.prototype.cloneShallow = function (name) {
    name == null && (name = this.name);
    var newRegion = new GeoJSONRegion(name, this.geometries, this._center);
    newRegion._rect = this._rect;
    newRegion.transformTo = null; // Simply avoid to be called.

    return newRegion;
  };

  GeoJSONRegion.prototype.getCenter = function () {
    return this._center;
  };

  GeoJSONRegion.prototype.setCenter = function (center) {
    this._center = center;
  };

  return GeoJSONRegion;
}(Region);

export { GeoJSONRegion };

var GeoSVGRegion =
/** @class */
function (_super) {
  __extends(GeoSVGRegion, _super);

  function GeoSVGRegion(name, elOnlyForCalculate) {
    var _this = _super.call(this, name) || this;

    _this.type = 'geoSVG';
    _this._elOnlyForCalculate = elOnlyForCalculate;
    return _this;
  }

  GeoSVGRegion.prototype.getCenter = function () {
    var center = this._center;

    if (!center) {
      // In most cases there are no need to calculate this center.
      // So calculate only when called.
      center = this._center = this._calculateCenter();
    }

    return center;
  };

  GeoSVGRegion.prototype._calculateCenter = function () {
    var el = this._elOnlyForCalculate;
    var rect = el.getBoundingRect();
    var center = [rect.x + rect.width / 2, rect.y + rect.height / 2];
    var mat = matrix.identity(TMP_TRANSFORM);
    var target = el;

    while (target && !target.isGeoSVGGraphicRoot) {
      matrix.mul(mat, target.getLocalTransform(), mat);
      target = target.parent;
    }

    matrix.invert(mat, mat);
    vec2.applyTransform(center, center, mat);
    return center;
  };

  return GeoSVGRegion;
}(Region);

export { GeoSVGRegion };