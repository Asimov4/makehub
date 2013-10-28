var myApp = angular.module('makeHub', [
    'makeHub.controllers',
    'ngSanitize',
    'ngRoute',
    'flash']);

myApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/project/:projectId', {
        templateUrl: 'partials/project.html',
        controller: 'ProjectCtrl'
      })
      .when('/create', {
        templateUrl: 'partials/create.html',
        controller: 'CreateCtrl'
      }).
      when('/search', {
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl'
      }).
      when('/home', {
        templateUrl: 'partials/home.html'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);