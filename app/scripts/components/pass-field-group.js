'use strict';
jpsPassbookManagerApp.directive('passFieldGroup', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: false,
    scope: {
      label: '@',
      fields: '='
    },
    templateUrl: 'views/_pass-field-group.html',
    link: function($scope, $element, $attrs) {

      $scope.removeField = function(index) {
        console.log('removeField', index);
      };

      $scope.addField = function(obj) {
        obj = obj || {
          key: 'key',
          label: 'label',
          value: 'value'
        };
        fields.push(obj);

        console.log('addField', obj);
      };

      console.log('passFieldGroup - linked');
    }
  };
});
