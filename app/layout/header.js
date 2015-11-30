'use strict';

angular.module('myApp.header', [])

.controller('HeaderCtrl', [
  '$scope', 'Auth', '$firebaseObject', 'fbutil', '$window',
  function($scope, Auth, $firebaseObject, fbutil, $window) {
    var user;

    Auth.$onAuth(authUpdated);

    $scope.logout = function() {
      // Difficult to get every view controller / directive to listen for auth changes. Do a hard reset of the app.
      Auth.$unauth();
      $window.location.reload();
    };

    function authUpdated(authInfo) {
      if (authInfo) {
        user = $firebaseObject(fbutil.ref('users', authInfo.uid));
        user.$loaded().then(function () {
          $scope.user = user;
        });
      } else {
        unbindUser();
      }
    }

    function unbindUser() {
      if (user) {
        user.$destroy();
      }
      user = $scope.user = null;
    }
  }])

;
