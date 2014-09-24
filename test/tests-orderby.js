var should = require('chai').should();
var expect = require('chai').expect;
var QueryBuilder = require('../lib/query_builder.js');
var qb = new QueryBuilder();

describe('order_by()', function() {
	it('should exist', function() {
		should.exist(qb.order_by);
	});
	it('should be a function', function() {
		qb.order_by.should.be.a('function');
	});
	it('should have an array to put fields into', function() {
		qb.should.have.property('order_by_array');
	});
	it('should have an empty array to put fields into at the beginning', function() {
		qb.order_by_array.should.be.empty;
	});
	it('should require non-empty string or array as first param unless random is provided as second parameter', function() {
		expect(function() { qb.order_by(); 		}, 'nothing provided').to.throw(Error);
		expect(function() { qb.order_by(null); 	}, 'null provided').to.throw(Error);
		expect(function() { qb.order_by(false); }, 'false provided').to.throw(Error);
		expect(function() { qb.order_by(true); 	}, 'true provided').to.throw(Error);
		expect(function() { qb.order_by({}); 	}, 'empty object provided').to.throw(Error);
		expect(function() { qb.order_by(3); 	}, 'integer provided').to.throw(Error);
		expect(function() { qb.order_by(3.5); 	}, 'float provided').to.throw(Error);
		expect(function() { qb.order_by([]); 	}, 'empty array provided').to.throw(Error);
		expect(function() { qb.order_by(''); 	}, 'empty string provided').to.throw(Error);
		// If random
		expect(function() { qb.order_by('','rand'); }, 'empty string and random direction provided').to.not.throw(Error);
		expect(function() { qb.order_by(undefined,'rand'); }, 'undefined and random direction provided').to.not.throw(Error);
		expect(function() { qb.order_by(null,'rand'); }, 'null and random direction provided').to.not.throw(Error);
		expect(function() { qb.order_by(false,'rand'); }, 'false and random direction provided').to.not.throw(Error);
		expect(function() { qb.order_by([],'rand'); }, 'empty array and random direction provided').to.not.throw(Error);
	});
	it('should accept a field and direction separated by a space as first parameter and escape the field', function() {
		qb.reset_query();
		qb.order_by('planet_position asc');
		qb.order_by_array.should.eql(['`planet_position` ASC']);
	});
	it('should accept a field and direction as seperate parameters and escape the field', function() {
		qb.reset_query();
		qb.order_by('planet_position', 'asc');
		qb.order_by_array.should.eql(['`planet_position` ASC']);
	});
	it('should add additional order_by calls to teh order by array', function() {
		qb.reset_query();
		qb.order_by('planet_position', 'asc');
		qb.order_by('planet_size', 'desc');
		qb.order_by_array.should.eql(['`planet_position` ASC', '`planet_size` DESC']);
	});
	it('should be chainable', function() {
		qb.reset_query();
		qb.order_by('planet_position', 'asc').order_by('planet_size', 'desc');
		qb.order_by_array.should.eql(['`planet_position` ASC', '`planet_size` DESC']);
	});
	it('should assume ASC when no direction is provided', function() {
		qb.reset_query();
		qb.order_by('planet_position');
		qb.order_by_array.should.eql(['`planet_position` ASC']);
	});
	it('should only accept valid ordering directions (ASC, DESC, random)', function() {
		qb.reset_query();
		expect(function() { qb.order_by('planet_position'); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position','ASC'); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position','DESC'); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position','random'); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',null); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',undefined); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',false); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',3); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',true); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',[]); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',{}); }).to.not.throw(Error);
		expect(function() { qb.order_by('planet_position',''); }).to.not.throw(Error);
		
		// Only an invalid string will throw an error
		expect(function() { qb.order_by('planet_position','FAKE'); }).to.throw(Error);
	});
	it('should accept a comma-separated list of fields to order by with a single direction at the end', function() {
		qb.reset_query();
		qb.order_by('planet_position, planet_size asc');
		qb.order_by_array.should.eql(['`planet_position` ASC', '`planet_size` ASC']);
	});
	it('should accept a comma-separated list of field + direction pairs', function() {
		qb.reset_query();
		qb.order_by('planet_position desc, planet_size asc');
		qb.order_by_array.should.eql(['`planet_position` DESC', '`planet_size` ASC']);
	});
	it('should accept a random direction in three forms: "random", "RAND", "RAND()" (case-insensitively) and remove field(s) from statement', function() {
		qb.reset_query();
		qb.order_by('planet_position', 'random');
		qb.order_by_array.should.eql(['RAND()']);
		
		qb.reset_query();
		qb.order_by('planet_size', 'RAND');
		qb.order_by_array.should.eql(['RAND()']);
		
		qb.reset_query();
		qb.order_by('planet_position, planet_size', 'rand');
		qb.order_by_array.should.eql(['RAND()']);
		
		qb.reset_query();
		qb.order_by(null, 'RAND()');
		qb.order_by_array.should.eql(['RAND()']);
		
		qb.reset_query();
		qb.order_by('', 'rand');
		qb.order_by_array.should.eql(['RAND()']);
	});
	it('should accept an array of field + direction pairs', function() {
		qb.reset_query();
		qb.order_by(['planet_position DESC', 'planet_size ASC']);
		qb.order_by_array.should.eql(['`planet_position` DESC', '`planet_size` ASC']);
	});
	it('should use direction parameter as default when an array of field + direction pairs is provided (when a pair does not contain a direction)', function() {
		qb.reset_query();
		qb.order_by(['planet_position', 'planet_size'], 'desc');
		qb.order_by_array.should.eql(['`planet_position` DESC', '`planet_size` DESC']);
		
		qb.reset_query();
		qb.order_by(['planet_position DESC', 'planet_size'], 'desc');
		qb.order_by_array.should.eql(['`planet_position` DESC', '`planet_size` DESC']);
	});
	it('should accept a simple array of fields as first param and default to ASC for the direction if none is provided', function() {
		qb.reset_query();
		qb.order_by(['planet_position', 'planet_size']);
		qb.order_by_array.should.eql(['`planet_position` ASC', '`planet_size` ASC']);

	});
});