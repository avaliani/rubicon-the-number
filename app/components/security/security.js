(function (angular) {
  "use strict";

  angular.module('myApp.security', ['ngRoute', 'firebase.auth', 'myApp.config'])

  /**
   * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
   * when called, waits for auth status to be resolved asynchronously, and then fails/redirects
   * if the user is not properly authenticated.
   *
   * The promise either resolves to the authenticated user object and makes it available to
   * dependency injection (see AuthCtrl), or rejects the promise if user is not logged in,
   * forcing a redirect to the /login page
   */
    .config(['$routeProvider', function ($routeProvider) {
      // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
      // unfortunately, a decorator cannot be use here because they are not applied until after
      // the .config calls resolve, so they can't be used during route configuration, so we have
      // to hack it directly onto the $routeProvider object
      $routeProvider.whenAuthenticated = function (path, route) {
        route.resolve = route.resolve || {};
        route.resolve.authInfo = ['Auth', function (Auth) {
          return Auth.$requireAuth();
        }];
        $routeProvider.when(path, route);
        return this;
      }
    }])

    .run(['$rootScope', '$location', 'Auth', 'loginRedirectPath',
      function ($rootScope, $location, Auth, loginRedirectPath) {
        // some of our routes may reject resolve promises with the special {authRequired: true} error
        // this redirects to the login page whenever that is encountered
        $rootScope.$on("$routeChangeError", function (e, next, prev, err) {
          if (err === "AUTH_REQUIRED") {
            var authReqUrl = $location.url();
            $location.url(loginRedirectPath + '?' + 'url=' + encodeURIComponent(authReqUrl));
          }
        });
      }
    ]);

})(angular);
