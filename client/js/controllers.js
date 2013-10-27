angular.module('makeHub.controllers', ['flash']).
  controller('ChatController', ['$scope', 'flash', function($scope, flash) {
        $scope.messages = [];
        $scope.projects = [];
        $scope.selectedProject = {};
        $scope.rawProject = '';
        $scope.newProject = {};
        $scope.newProject.title = '';
        $scope.newProject.body = '';

        $scope.my_projects = function my_projects() {
            $.ajax({
                url: "/my_projects",
                type: "POST",
                dataType: "json",
                data: "{}",
                contentType: "application/json",
                cache: false,
                timeout: 5000,
                complete: function() {
                  //called when complete
                  console.log('process complete');
                },

                success: function(data) {
                    $scope.$apply( function () {
                      console.log(data);
                      $scope.projects = data.projects;
                      console.log('process sucess');
                    });
                },

                error: function() {
                  console.log('process error');
                  flash('error', 'Something went wrong with your request. Are you logged in?');
                },
            });
        }

  }])
  .controller('ProjectCtrl', ['$scope', 'flash', '$routeParams', '$http', '$route',
  function($scope, flash, $routeParams, $http, $route) {
        $scope.projectId = $routeParams.projectId;
        var projectUrl = ['project', $routeParams.projectId].join('/');
        $http.get(projectUrl).success(function(data) {
          console.log(data)
          if (data.error) {
            flash('error', data.error);
          } else {
            $scope.project = data;
          }
        });

        $scope.modify = function () {
          var projectUrl = ['project', $scope.project.id].join('/');
          $.ajax({
              url: projectUrl,
              type: "POST",
              data: $scope.project,
              success: function(data) {
                if (data.error) {
                  flash(data.error);
                } else {
                  flash('Saved');
                  $scope.project = data;
                }
              },
              error: function() {
                console.log('process error');
              },
          });
        };

  }])
  .controller('CreateCtrl', ['$scope', 'flash', '$routeParams', '$http', '$route',
  function($scope, flash, $routeParams, $http, $route) {
    $scope.create = function() {
      var project = {
        'content': $scope.content,
        'description': $scope.description
      };
      $.ajax({
          url: "/create",
          type: "POST",
          data: project,
          success: function(data) {
            if (data.error) {
              flash(data.error);
            } else {
              flash('Saved');
              window.location.hash = '/project/' + data.id;
            }
          },
          error: function() {
            console.log('process error');
          },
      });

    };

  }])
  .controller('SearchCtrl', ['$scope', 'flash', '$routeParams', '$http', '$route',
  function($scope, flash, $routeParams, $http, $route) {
    $scope.search = function() {


    };

  }]);