'use strict';

describe('Controller: ManageCtrl', function() {

  // load the controller's module
  beforeEach(module('jpsPassbookManagerApp'));

  var ManageCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    ManageCtrl = $controller('ManageCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
