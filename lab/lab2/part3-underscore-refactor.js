(function(){

  var map = L.map('map', {
    center: [39.9522, -75.1639],
    zoom: 14
  });
  var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map);

  /* =====================

  # Lab 2, Part 4 — (Optional, stretch goal)

  ## Introduction

    You've already seen this file organized and refactored. In this lab, you will
    try to refactor this code to be cleaner and clearer - you should use the
    utilities and functions provided by underscore.js. Eliminate loops where possible.

  ===================== */

  // Mock user input
  // Filter out according to these zip codes:
  var acceptedZipcodes = [19106, 19107, 19124, 19111, 19118];
  // Filter according to enrollment that is greater than this variable:
  var minEnrollment = 300;

  //cleaning the zipcodes in the data
  var split = function(x) {
      if (_.isString(x.ZIPCODE)) {
        split = x.ZIPCODE.split(' ');
        normalized_zip = parseInt(split);
        x.ZIPCODE = normalized_zip;
      }
    };

  var types = function (arr) {
    if (_.isNumber(arr.GRADE_ORG)) {  // if number
      arr.HAS_KINDERGARTEN = arr.GRADE_LEVEL < 1;
      arr.HAS_ELEMENTARY = 1 < arr.GRADE_LEVEL < 6;
      arr.HAS_MIDDLE_SCHOOL = 5 < arr.GRADE_LEVEL < 9;
      arr.HAS_HIGH_SCHOOL = 8 < arr.GRADE_LEVEL < 13;
    } else {  // otherwise (in case of string)
      arr.HAS_KINDERGARTEN = arr.GRADE_LEVEL.toUpperCase().indexOf('K') >= 0;
      arr.HAS_ELEMENTARY = arr.GRADE_LEVEL.toUpperCase().indexOf('ELEM') >= 0;
      arr.HAS_MIDDLE_SCHOOL = arr.GRADE_LEVEL.toUpperCase().indexOf('MID') >= 0;
      arr.HAS_HIGH_SCHOOL = arr.GRADE_LEVEL.toUpperCase().indexOf('HIGH') >= 0;
    }
  };

  var pushing = function(x, newD, oldD, obj) {
    if(x) {
      newD.push(obj);
    } else {
      oldD.push(obj);
    }
  };

  var filtered_data = [];
  var filtered_out = [];
  var filtering = function (object) {
    isOpen = object.ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (object.TYPE.toUpperCase() !== 'CHARTER' ||
                object.TYPE.toUpperCase() !== 'PRIVATE');
    isSchool = (object.HAS_KINDERGARTEN ||
                object.HAS_ELEMENTARY ||
                object.HAS_MIDDLE_SCHOOL ||
                object.HAS_HIGH_SCHOOL);
    meetsMinimumEnrollment = object.ENROLLMENT > minEnrollment;
    meetsZipCondition = acceptedZipcodes.indexOf(object.ZIPCODE) >= 0;
    filter_condition = (isOpen &&
                        isSchool &&
                        meetsMinimumEnrollment &&
                        !meetsZipCondition);

    pushing(filter_condition,filtered_data, filtered_out, object);
  };

  var logging = function(data, text) {
    console.log(text + ':', data.length);
  };

  var color;
  var mapping = function(data) {
    if (data.HAS_HIGH_SCHOOL){
      color = '#0000FF';
    } else if (data.HAS_MIDDLE_SCHOOL) {
      color = '#00FF00';
    } else {
      color = '##FF0000';
    }

    var pathOpts = {'radius': data.ENROLLMENT/2,
                    'fillColor': color};
    L.circle([data.Y, data.X], pathOpts)
      .bindPopup(data.FACILNAME_LABEL)
      .addTo(map);
  };

  var attempt = _.each(schools, split);
  var schTypes = _.each(attempt, types);

  var filteredData = _.each(schTypes, filtering);
  logging(filtered_data, 'Included');
  logging(filtered_out, 'Excluded');

  var dataMapped = _.each(filtered_data, mapping);

  /* =====================
  //OLD CODE:

  // clean data
  for (var i = 0; i < schools.length - 1; i++) {
    // If we have '19104 - 1234', splitting and taking the first (0th) element
    // as an integer should yield a zip in the format above
    if (typeof schools[i].ZIPCODE === 'string') {
      split = schools[i].ZIPCODE.split(' ');
      normalized_zip = parseInt(split[0]);
      schools[i].ZIPCODE = normalized_zip;
    }

    // Check out the use of typeof here — this was not a contrived example.
    // Someone actually messed up the data entry
    if (typeof schools[i].GRADE_ORG === 'number') {  // if number
      schools[i].HAS_KINDERGARTEN = schools[i].GRADE_LEVEL < 1;
      schools[i].HAS_ELEMENTARY = 1 < schools[i].GRADE_LEVEL < 6;
      schools[i].HAS_MIDDLE_SCHOOL = 5 < schools[i].GRADE_LEVEL < 9;
      schools[i].HAS_HIGH_SCHOOL = 8 < schools[i].GRADE_LEVEL < 13;
    } else {  // otherwise (in case of string)
      schools[i].HAS_KINDERGARTEN = schools[i].GRADE_LEVEL.toUpperCase().indexOf('K') >= 0;
      schools[i].HAS_ELEMENTARY = schools[i].GRADE_LEVEL.toUpperCase().indexOf('ELEM') >= 0;
      schools[i].HAS_MIDDLE_SCHOOL = schools[i].GRADE_LEVEL.toUpperCase().indexOf('MID') >= 0;
      schools[i].HAS_HIGH_SCHOOL = schools[i].GRADE_LEVEL.toUpperCase().indexOf('HIGH') >= 0;
    }
  }

  // filter data
  var filtered_data = [];
  var filtered_out = [];
  for (var j = 0; j < schools.length - 1; j++) {
    isOpen = schools[j].ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (schools[j].TYPE.toUpperCase() !== 'CHARTER' ||
                schools[j].TYPE.toUpperCase() !== 'PRIVATE');
    isSchool = (schools[j].HAS_KINDERGARTEN ||
                schools[j].HAS_ELEMENTARY ||
                schools[j].HAS_MIDDLE_SCHOOL ||
                schools[j].HAS_HIGH_SCHOOL);
    meetsMinimumEnrollment = schools[j].ENROLLMENT > minEnrollment;
    meetsZipCondition = acceptedZipcodes.indexOf(schools[j].ZIPCODE) >= 0;
    filter_condition = (isOpen &&
                        isSchool &&
                        meetsMinimumEnrollment &&
                        !meetsZipCondition);

    if (filter_condition) {
      filtered_data.push(schools[j]);
    } else {
      filtered_out.push(schools[j]);
    }
  }
  console.log('Included:', filtered_data.length);
  console.log('Excluded:', filtered_out.length);

  // main loop
  var color;
  for (var k = 0; k < filtered_data.length - 1; k++) {
    isOpen = filtered_data[k].ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (filtered_data[k].TYPE.toUpperCase() !== 'CHARTER' ||
                filtered_data[k].TYPE.toUpperCase() !== 'PRIVATE');
    meetsMinimumEnrollment = filtered_data[k].ENROLLMENT > minEnrollment;

    // Constructing the styling  options for our map
    if (filtered_data[k].HAS_HIGH_SCHOOL){
      color = '#0000FF';
    } else if (filtered_data[k].HAS_MIDDLE_SCHOOL) {
      color = '#00FF00';
    } else {
      color = '##FF0000';
    }
    // The style options
    var pathOpts = {'radius': filtered_data[k].ENROLLMENT / 30,
                    'fillColor': color};
    L.circleMarker([filtered_data[k].Y, filtered_data[k].X], pathOpts)
      .bindPopup(filtered_data[k].FACILNAME_LABEL)
      .addTo(map);
  }
  ===================== */

})();
