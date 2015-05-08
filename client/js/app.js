var app = angular.module('makeHub', [
    'makeHub.controllers',
    'ngSanitize',
    'ngRoute',
    'angularFileUpload',
    'flash',
    'pascalprecht.translate']);


app.config(['$routeProvider','$translateProvider',
  function($routeProvider,$translateProvider) {
    
    $translateProvider.useStaticFilesLoader({
      prefix:'/js/locales/',
      suffix: '.json'
    }).preferredLanguage('cn');

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
      when('/featured', {
        templateUrl: 'partials/featured.html',
        controller: 'FeaturedCtrl'
      }).
      when('/home', {
        templateUrl: 'partials/home.html'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);

app.controller('ViewController', ['$scope', function ($scope) {

}]);