"use strict";

angular.module('myApp.course', ['ngRoute'])

.constant('CourseConstants', {
  levels: [
    {
      id: 1,
      label: 'Level One',
    },
    {
      id: 2,
      label: 'Level Two',
    },
    {
      id: 3,
      label: 'Level Three',
    }
  ]
})

.controller('CourseCtrl', [
  '$scope', 'user', 'CourseTask', 'CourseConstants',
  function($scope, user, CourseTask, CONSTANTS) {
    $scope.CONSTANTS = CONSTANTS;

    function init() {
      CourseTask.query()
        .then(function (tasksPerLevel) {
          $scope.tasksPerLevel = tasksPerLevel;
        });
    }

    init();
  }
])

.factory('CourseTask', [
  '$http',
  function($http) {
    function CourseTask(raw) {
      _.extend(this, raw);
    }

    CourseTask.query = function () {
      return $http.get('data/tasks.json')
        .then(function (response) {
          var tasksGroupedByLevel = response.data,
              tasksPerLevel = {};

          _.each(tasksGroupedByLevel, function(levelTasks) {
            tasksPerLevel[levelTasks.level] =
              _.map(levelTasks.tasks, function (t) { return new CourseTask(t); });
          });

          return tasksPerLevel;
        });
    }

    return CourseTask;
  }
])

.config([
  '$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/course', {
      templateUrl: 'course/course.html',
      controller: 'CourseCtrl',
      resolve: {
        // forces the page to wait for this promise to resolve before controller is loaded
        // the controller can then inject `user` as a dependency. This could also be done
        // in the controller, but this makes things cleaner (controller doesn't need to worry
        // about auth status or timing of accessing data or displaying elements)
        user: ['Auth', function (Auth) {
          return Auth.$waitForAuth();
        }]
      }
    });

    // The call below uses Auth.$requireAuth() whereas the above does Auth.$waitForAuth. So the user
    // promise is not rejected in the above. TODO(avaliani) Re-eval auth scheme.
    //
    // $routeProvider.whenAuthenticated('/course', {
    //   templateUrl: 'course/course.html',
    //   controller: 'CourseCtrl'
    // })
  }])

;
