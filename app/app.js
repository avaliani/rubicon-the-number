'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'myApp.config',
    'myApp.security',  // Defines $routeProvider.whenAuthenticated

    'myApp.account',
    'myApp.chat',
    'myApp.course',
    'myApp.login',

    'ngSanitize',
    'ui.bootstrap'
  ])

  .config([
    '$routeProvider', 'defaultPath',
    function ($routeProvider, defaultPath) {
    $routeProvider.otherwise({
      redirectTo: defaultPath
    });
  }])

;
