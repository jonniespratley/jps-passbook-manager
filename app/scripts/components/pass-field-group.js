'use strict';
jpsPassbookManagerApp
  .directive('passFileGroup', function(Api) {
    return {
      restrict: 'E',
      replace: true,
      transclude: false,
      scope: {
        url: '@',
        hint: '@',
        title: '@',
        model: '='
      },
      templateUrl: 'views/_pass-file-group.html',
      link: function($scope, $element, $attrs) {

        var fileInput = $element.find('input[type=file]');
        var file,
          files,
          i = 0,
          len = 0,
          formData = {};

        function sendUploadRequest(f) {
          console.warn('Sending', f);
          Api.request({
            method: 'POST',
            url: $scope.url || '/api/v1/upload',
            headers: {
              'Content-Type': 'application/octestream'
            },
            data: f
          }).then(function(resp) {
            console.warn('Upload response', resp);
          }).catch(function(err) {
            console.error('Upload error', err);
          })

        }

        function handleFileChange(e) {
          console.warn('file changed', e);
          files = e.target.files;
          len = files.length;
          for (i; i < len; i++) {
            file = files[i];
            console.warn('processing', file);

            formData[file.name] = file;
            sendUploadRequest(file);
          }

        }

        fileInput.bind('change', function(e) {

          handleFileChange(e);

        });

        console.log('passFileGroup - linked');
      }
    };
  })
  .directive('passFieldGroup', function() {
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
