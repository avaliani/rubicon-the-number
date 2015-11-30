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
  '$scope', 'authInfo', 'CourseTask', 'CourseConstants',
  function($scope, authInfo, CourseTask, CONSTANTS) {
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
    $routeProvider.whenAuthenticated('/course', {
      templateUrl: 'course/course.html',
      controller: 'CourseCtrl'
    })
  }])

;
