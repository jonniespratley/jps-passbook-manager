'use strict';

jpsPassbookManagerApp.controller('ManageCtrl', function($scope, $rootScope, user, $http) {
  $scope.user = user;
  $scope.passTypeIdentifiers = user.passTypeIdentifiers;
  $scope.formData = {};

  function sendUploadRequest(obj) {
    console.warn('Sending', obj);
    var xhr = new XMLHttpRequest();
    var data = new FormData();

    //data.append('passTypeIdentifier', obj.passTypeIdentifier);
    data.append('passphrase', obj.passphrase);
    data.append('file', obj.file);

    xhr.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        console.log('readystatechange', this.readyState, this.responseText);
      }
    });

    xhr.open('POST', '/api/v1/admin/identifiers/' + obj.passTypeIdentifier);
    xhr.send(data);
  }

  function handleFileChange(e) {
    console.warn('file changed', e);
    var file,
      i = 0,
      files = e.target.files,
      len = files.length;
    for (i; i < len; i++) {
      file = files[i];
      console.warn('processing', file);
      $scope.formData['file'] = file;
    }
  }

  $('input[type=file]').bind('change', function(e) {
    handleFileChange(e);
  });

  $scope.handleFormSubmit = function(data) {
    console.log('Send form data', data);
    $scope.formData.passphrase = data.passphrase;
    $scope.formData.passTypeIdentifier = data.passTypeIdentifier;

    sendUploadRequest($scope.formData);
  };
});
