"use strict";

angular.module('myApp.login', ['firebase.utils', 'firebase.auth', 'ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'login/login.html',
    resolve: {
      authInfo: ['Auth', function (Auth) {
        return Auth.$waitForAuth();
      }]
    }
  });

}])

.controller('LoginCtrl', [
  '$scope', 'authInfo', 'Auth', '$location', 'fbutil', '$routeParams',
  function($scope, authInfo, Auth, $location, fbutil, $routeParams) {
    function init() {
      if (authInfo) {
        redirectAfterLogin();
      }
    }

    function redirectAfterLogin() {
      var url = $routeParams['url'];
      if (url) {
        $location.url(decodeURIComponent(url));
      } else {
        $location.url('/');
      }
    }

    $scope.login = function(email, pass) {
      $scope.msg = null;
      Auth.$authWithPassword({ email: email, password: pass }, {rememberMe: true})
        .then(function(/* user */) {
          redirectAfterLogin();
        }, function(err) {
          $scope.msg = errMessage(err);
        });
    };

    $scope.resetPassword = function(email) {
      $scope.msg = null;
      Auth.$resetPassword({ email: email })
        .then(function(/* user */) {
          $scope.msg = sucMessage("Password reset email sent successfully");
        }, function(err) {
          $scope.msg = errMessage(err);
        });
    };

    $scope.createAccount = function() {
      $scope.msg = null;
      if( assertValidAccountProps() ) {
        var email = $scope.email;
        var pass = $scope.pass;
        // create user credentials in Firebase auth system
        Auth.$createUser({email: email, password: pass})
          .then(function() {
            // authenticate so we have permission to write to Firebase
            return Auth.$authWithPassword({ email: email, password: pass });
          })
          .then(function(authInfo) {
            // create a user profile in our data store
            var ref = fbutil.ref('users', authInfo.uid);
            return fbutil.handler(function(cb) {
              ref.set({email: email, name: name||firstPartOfEmail(email)}, cb);
            });
          })
          .then(function(/* user */) {
            // redirect to the account page
            $location.path('/account');
          }, function(err) {
            $scope.msg = errMessage(err);
          });
      }
    };

    function assertValidAccountProps() {
      if( !$scope.email ) {
        $scope.msg = errMessage('Please enter an email address');
      }
      else if( !$scope.pass || !$scope.confirm ) {
        $scope.msg = errMessage('Please enter a password');
      }
      else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
        $scope.msg = errMessage('Passwords do not match');
      }
      return !$scope.msg;
    }

    function errMessage(err) {
      return {
        type: 'danger',
        text: angular.isObject(err) && err.code? err.code : err + ''
      }
    }

    function sucMessage(str) {
      return {
        type: 'success',
        text: str
      }
    }

    function firstPartOfEmail(email) {
      return ucfirst(email.substr(0, email.indexOf('@'))||'');
    }

    function ucfirst (str) {
      // inspired by: http://kevin.vanzonneveld.net
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
    }

    init();
  }])

;
