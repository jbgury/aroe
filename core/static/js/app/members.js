var membersMgt = angular.module('aroeMembersMgt', ['ngFileUpload']);

membersMgt.controller('MembersRowCtrl', ['$scope', '$filter', '$http', 'Upload', 'growl', 
                                function($scope, $filter, $http, Upload, growl) {

  
  $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

  $scope.reloadUsers = function()
  {
    $http.get('/api/members').success(function(data)
    {
      $scope.users = data;
    })
  }

  $scope.loaduser = function(id)
  {
    $http.get('/api/members/'+id).success(function(data)
    {
      $scope.selecteduser = data;
    });
  }

  $scope.reloadUsers();

  $scope.saveUser = function(data) {
    var user = angular.copy(data);
    // Do not send the url of the photo.
    delete user.photo;

    if (user.id)
    {
      //$scope.user not updated yet
      $http.put('/api/members/'+user.id, user).success(function(result)
        {
          $scope.reloadUsers();
          $scope.selecteduser = result;
        });
      return user;
    } else {
      $http.post('/api/members', user).success(function(result) {
        $scope.reloadUsers();
        $scope.selecteduser = result;
      });
      return user;
    }
  };

  // remove user
  $scope.delete = function(user) {
      $http.delete('/api/members/'+user.id).success(function() {
        $scope.reloadUsers();
        $scope.selecteduser = null;
      });
  };

  // add user
  $scope.addUser = function() {
    $scope.inserted = {
      family_name: '',
      firstname : '',
      address : '',
      zipcode : '',
      city : '',
      phone : '',
      email : '',
      photo:null
    };
    $scope.selecteduser = $scope.inserted;
    $scope.editableForm.$show();
  };

  $scope.selectUser = function(user){
    $scope.selecteduser = user;
  }

  $scope.upload = function (file) {
    $scope.file = file;
    if (file && !file.$error)
      Upload.upload({
        url: '/api/avatars/'+$scope.selecteduser.id,
        file: file,
        fileFormDataName: 'photo',
        method : 'PUT',
      }).progress(function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        file.progress = progressPercentage;
      }).success(
        function (data, status, headers, config) {
          $scope.selecteduser.photo = data.photo;
          $scope.users.find(function (element, index, array) {
          if (element.id == $scope.selecteduser.id){
            return true;
          }
        }).photo = data.photo;
        $scope.file = null;
      }).error(function(result)
        {
          if (result.photo[0]) {
            growl.addErrorMessage(result.photo[0]);
          } else {
            growl.addErrorMessage(result);
          }
        });
    };

    $scope.clearAvatar = function(){
      var data = {
        photo : null,
      }
      $http.put('/api/avatars/'+$scope.selecteduser.id, data).success(function(result)
        {
          $scope.reloadUsers();
          $scope.selecteduser.photo = result.photo;
        });
    }

}]);











/* Front End controller */


var members = angular.module('aroeMembers', []);

members.controller('MembersDisplayCtrl', ['$scope', '$filter', '$http', 
                                function($scope, $filter, $http) {

  $scope.reloadMembers = function()
  {
    $http.get('/api/members').success(function(data)
    {
      $scope.members = data;
    })
  }

  $scope.reloadMembers();

}]);