var myApp = angular.module('makeHub', [
    'makeHub.controllers', 
    'ngSanitize',
    'ngRoute',
    'flash']);
    
myApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/project/:projectUser/:projectId', {
        templateUrl: 'partials/project.html',
        controller: 'ProjectCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);