'use strict';

describe('Controller: PassesCtrl', function() {

  // load the controller's module
  beforeEach(module('jpsPassbookManagerApp'));

  var PassesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    PassesCtrl = $controller('PassesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
	  //expect(scope.awesomeThings.length).toBe(3);
  });
});
