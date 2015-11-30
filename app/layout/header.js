'use strict';

angular.module('myApp.header', [])

.controller('HeaderCtrl', [
  '$scope', 'Auth', '$firebaseObject', 'fbutil',
  function($scope, Auth, $firebaseObject, fbutil) {
    var user;

    Auth.$onAuth(authUpdated);

    function authUpdated(authInfo) {
      if (authInfo) {
        user = $firebaseObject(fbutil.ref('users', authInfo.uid));
        user.$loaded().then(function () {
          $scope.user = user;
        });
      } else {
        if (user) {
          user.$destroy();
        }
        user = $scope.user = null;
      }
    }
  }])

;
