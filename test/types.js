var _ = require('underscore');
var assert = require('chai').assert;
var should = require('chai').should();
var types = require('../').types;

var BASE_FIELD;


beforeEach(function(done) {
  BASE_FIELD = {
    'constraints': {'required': true},
    'format'     : 'default',
    'name'       : 'Name',
    'type'       : 'string'
  };

  done();
});

describe('StringType', function() {
  it('cast string', function(done, err) {
    assert((new types.StringType(BASE_FIELD)).cast('string'));
    done();
  });

  it('cast empty string if no constraints', function(done, err) {
    BASE_FIELD.constraints.required = false;
    assert((new types.StringType(BASE_FIELD)).cast(''));
    done();
  });

  it('don\'t cast digits', function(done, err) {
    assert.notOk((new types.StringType(BASE_FIELD)).cast(1));
    done();
  });

  it('don\'t cast empty string by default', function(done, err) {
    assert.notOk((new types.StringType(BASE_FIELD)).cast(''));
    done();
  });
});

describe('IntegerType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'integer';
    done();
  });

  it('cast integer', function(done, err) {
    assert((new types.IntegerType(BASE_FIELD)).cast(1));
    done();
  });

  it('cast string "0"', function(done, err) {
    assert((new types.IntegerType(BASE_FIELD)).cast('0'));
    done();
  });

  it('don\'t cast string', function(done, err) {
    assert.notOk((new types.IntegerType(BASE_FIELD)).cast('string'));
    done();
  });
});

describe('NumberType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'number';
    done();
  });

  it('cast float', function(done, err) {
    assert((new types.NumberType(BASE_FIELD)).cast(1.1));
    done();
  });

  it('cast string "0"', function(done, err) {
    assert((new types.NumberType(BASE_FIELD)).cast('0'));
    done();
  });

  it('cast localized numbers', function(done, err) {
    ['10,000.00', '10,000,000.00', '100', '100.23'].forEach(function(V) {
      assert((new types.NumberType(BASE_FIELD)).cast(V));
    });
    BASE_FIELD.decimalChar='#';
    ['10,000#00', '10,000,000#00', '100', '100#23'].forEach(function(V) {
      assert((new types.NumberType(BASE_FIELD)).cast(V));
    });
    BASE_FIELD.groupChar='Q';
    ['10Q000#00', '10Q000Q000#00', '100', '100#23'].forEach(function(V) {
      assert((new types.NumberType(BASE_FIELD)).cast(V));
    });
    done();
  });

  it('don\'t cast string', function(done, err) {
    assert.notOk((new types.NumberType(BASE_FIELD)).cast('string'));
    done();
  });

  it('cast currency', function(done, err) {
    BASE_FIELD.format = 'currency';

    ['10,000.00', '10,000.00', '$10000.00'].forEach(function(V) {
      assert((new types.NumberType(BASE_FIELD)).cast(V));
    });

    BASE_FIELD.groupChar = ' ';
    BASE_FIELD.decimalChar = ',';

    ['10 000 000,00', '10000,00', '10,000 €'].forEach(function(V) {
      if (!(new types.NumberType(BASE_FIELD)).cast(V)) {
        console.log('BBB',BASE_FIELD,V);
      }
      assert((new types.NumberType(BASE_FIELD)).cast(V));
    });

    done();
  });

  it('don\'t cast wrong format currency', function(done, err) {
    BASE_FIELD.format = 'currency';

    ['10,000a.00', '10+000.00', '$10:000.00'].forEach(function(V) {
      assert.notOk((new types.NumberType(BASE_FIELD)).cast(V));
    });

    done();
  });
});

describe('DateType', function() {
  beforeEach(function(done) {
    BASE_FIELD.format = 'default';
    BASE_FIELD.type = 'date';
    done();
  });

  it('cast simple date', function(done, err) {
    assert((new types.DateType(BASE_FIELD)).cast('2019-01-01'));
    done();
  });

  it('cast any date', function(done, err) {
    BASE_FIELD.format = 'any';
    assert((new types.DateType(BASE_FIELD)).cast('10 Jan 1969'));
    done();
  });

  it('cast date with format specified', function(done, err) {
    BASE_FIELD.format = 'fmt:%d/%m/%Y';
    assert((new types.DateType(BASE_FIELD)).cast('10/06/2014'));
    done();
  });

  it('don\'t cast wrong simple date', function(done, err) {
    assert.notOk((new types.DateType(BASE_FIELD)).cast('01-01-2019'));
    done();
  });

  it('don\'t cast wrong date string', function(done, err) {
    assert.notOk((new types.DateType(BASE_FIELD)).cast('10th Jan nineteen sixty nine'));
    done();
  });

  it('don\'t cast date if it do not correspond specified format', function(done, err) {
    BASE_FIELD.format = 'fmt:%d/%m/%Y';
    assert.notOk((new types.DateType(BASE_FIELD)).cast('2014/12/19'));
    done();
  });
});

describe('TimeType', function() {
  beforeEach(function(done) {
    BASE_FIELD.format = 'default';
    BASE_FIELD.type = 'time';
    done();
  });

  it('cast simple time', function(done, err) {
    assert((new types.TimeType(BASE_FIELD)).cast('06:00:00'));
    done();
  });

  it('don\'t cast wrong simple time', function(done, err) {
    assert.notOk((new types.TimeType(BASE_FIELD)).cast('3 am'));
    done();
  });
});

describe('DateTimeType', function() {
  beforeEach(function(done) {
    BASE_FIELD.format = 'default';
    BASE_FIELD.type = 'datetime';
    done();
  });

  it('cast simple datetime', function(done, err) {
    assert((new types.DateTimeType(BASE_FIELD)).cast('2014-01-01T06:00:00Z'));
    done();
  });

  it('cast any datetime', function(done, err) {
    BASE_FIELD.format = 'any';
    assert((new types.DateTimeType(BASE_FIELD)).cast('10 Jan 1969 9:00'));
    done();
  });

  it('don\'t cast wrong simple date', function(done, err) {
    assert.notOk((new types.DateTimeType(BASE_FIELD)).cast('10 Jan 1969 9'));
    done();
  });
});

describe('BooleanType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'boolean';
    done();
  });

  it('cast boolean', function(done, err) {
    assert((new types.BooleanType(BASE_FIELD)).cast(true));
    done();
  });

  it('cast simple string as True boolean', function(done, err) {
    assert((new types.BooleanType(BASE_FIELD)).cast('y'));
    done();
  });

  it('cast simple string as False boolean', function(done, err) {
    assert((new types.BooleanType(BASE_FIELD)).cast('n'));
    done();
  });
});

describe('NullType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'null';
    done();
  });

  it('cast simple string as Null', function(done, err) {
    assert((new types.NullType(BASE_FIELD)).cast('null'));
    done();
  });

  it('don\'t cast random string as Null', function(done, err) {
    assert.notOk((new types.NullType(BASE_FIELD)).cast('isnull'));
    done();
  });
});

describe('ArrayType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'array';
    done();
  });

  it('cast array', function(done, err) {
    assert((new types.ArrayType(BASE_FIELD)).cast([1, 2]));
    done();
  });

  it('don\'t cast random string as array', function(done, err) {
    assert.notOk((new types.ArrayType(BASE_FIELD)).cast('string, string'));
    done();
  });
});

describe('ObjectType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'object';
    done();
  });

  it('cast object', function(done, err) {
    assert((new types.ObjectType(BASE_FIELD)).cast({key: 'value'}));
    done();
  });

  it('don\'t cast random array as object', function(done, err) {
    assert.notOk((new types.ObjectType(BASE_FIELD)).cast(['boo', 'ya']));
    done();
  });
});

describe('GeoPointType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'geopoint';
    done();
  });

  it('cast geo point', function(done, err) {
    assert((new types.GeoPointType(BASE_FIELD)).cast('10.0, 21.00'));
    done();
  });

  it('don\'t cast random string as Geopoint', function(done, err) {
    assert.notOk((new types.GeoPointType(BASE_FIELD)).cast('this is not a geopoint'));
    done();
  });
});

describe('GeoJSONType', function() {
  beforeEach(function(done) {
    BASE_FIELD.type = 'geojson';
    done();
  });

  it('cast geo json', function(done, err) {
    assert((new types.GeoJSONType(BASE_FIELD)).cast({type: 'Point'}));
    done();
  });

  it('don\'t cast random string as GeoJSON', function(done, err) {
    assert.notOk((new types.GeoJSONType(BASE_FIELD)).cast(''));
    done();
  });
});
