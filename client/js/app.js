var app = angular.module('makeHub', [
    'ngCookies',
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
    }).preferredLanguage('en');
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


app.controller('ViewController', ['$scope','$cookieStore','$translate', function ($scope,$cookieStore,$translate) {
    var cookiesLocale = $cookieStore.get('locale');
    if(cookiesLocale!==undefined){
      $translate.use(cookiesLocale);
    }
}]);