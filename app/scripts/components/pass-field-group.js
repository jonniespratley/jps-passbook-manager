'use strict';
jpsPassbookManagerApp
  .directive('passFileGroup', function(Api) {
    return {
      restrict: 'E',
      replace: true,
      transclude: false,
      scope: {
        passId: '@',
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
          var data = new FormData();
          data.append('_id', $scope.passId);
          data.append("files", f);

          var xhr = new XMLHttpRequest();
          xhr.addEventListener("readystatechange", function() {
            if (this.readyState === 4) {
              console.log(this.responseText);
            }
          });

          xhr.open("POST", "/api/v1/upload");
          xhr.send(data);
          /*
                    Api.request({
                      method: 'POST',
                      url: $scope.url || '/api/v1/upload',
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      },
                      data: f
                    }).then(function(resp) {
                      console.warn('Upload response', resp);
                    }).catch(function(err) {
                      console.error('Upload error', err);
                    })*/

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
        'add': '&onAdd',
        'remove': '&onRemove',
        fields: '='
      },
      templateUrl: 'views/_pass-field-group.html',
      link: function($scope, $element, $attrs) {

        if (!$scope.fields) {
          $scope.fields = [];
        }

        $scope.$on('$destroy', function() {
          $element.remove();
        });

        $scope.remove = function(e) {
          console.warn('remove', e);
          //  $element.find('[data-index=' + e + ']').fadeOut();
          $scope.fields.splice(e, 1);

        };

        $scope.add = function(e) {
          console.warn('add', e);
          $scope.fields.push({
            key: 'key',
            label: 'label',
            value: 'value'
          });
        };



        console.log('passFieldGroup - linked', $scope);
      }
    };
  });
