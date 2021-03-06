var trainingMgt = angular.module('aroeTrainingMgt', []);


trainingMgt.controller('TrainingCtrl', ['$scope', '$http', '$modal', 
                                function($scope, $http, $modal) {
    $scope.training = null;
    $scope.document_type = 'file';

    $scope.$watch('training.document', function(newValue, oldValue)
    {
      if(newValue)
      {
        $scope.get_download_url(newValue);
        $scope.document_type = 'file';
      } else {
        $scope.document_url = "";
      }
    });

    $scope.$watch('training.page', function(newValue, oldValue)
    {
      if(newValue)
      {
        $scope.document_type= 'page';
      }
    });

    $scope.updateTraining = function(training, callback)
    {
      var data = angular.copy(training);
      // The api does not manage time. We have to put only date and ISO formatted.
      data.start = training.start.stripTime().format();
      data.end = training.end?training.end.stripTime().format():training.end;

      $http.put('/api/trainings/'+data.id, data).success(function(result)
        {
          $scope.training.document_detail = result.document_detail;
          $scope.training.page_detail = result.page_detail;

          if(callback)
          {
            callback();
          }
        });
    }


    $scope.saveTraining = function(training)
    {
      $scope.updateTraining(training, function() {
        $('#calendar').fullCalendar('updateEvent', training );
      });
      return training;
    };

    $scope.delete = function(training)
    {
    	$http.delete('/api/trainings/'+training.id).success(function() {
        	$('#calendar').fullCalendar('removeEvents', training.id );
        	$scope.training = null;
      });
    };

    $scope.addNewTraining = function(start, end) {
    	var modalInstance = $modal.open({
			templateUrl: 'modalTrainingNew.html',
			controller : ModalTrainingNewCtrl,
			size : 'sm',
			resolve : {
				start : function() { 
					return start;
				},
				end : function() {
					return end;
				}
			}
		});

  		return modalInstance.result.then(function (localTitle){
	 		 return localTitle;
	   	})
    };


    $scope.associateDocument = function(training)
    {
      var t = ModalWorkflow({
        url: window.chooserUrls.documentChooser,
        responses: {
          documentChosen: function(docData) {
            training.document = docData.id;
            if (training.page)
            {
              training.page = null;
            }
            $scope.updateTraining(training);
          }
        },
      });
    };

    $scope.disassociateDocument = function(training) 
    {
      $scope.training.document = null;
      $scope.updateTraining($scope.training);
    }

    $scope.get_download_url = function(document_id)
    {
      if(document_id)
      {
        $scope.document_url = $http.get('/api/v1/documents/'+document_id+"/").success(function(result)
        {
          $scope.document_url = result.meta.download_url;
        });
      } else {
        $scope.document_url = "";
      }
    }

    $scope.associatePage = function(training)
    {
      var t = ModalWorkflow({
        url: window.chooserUrls.pageChooser,
        responses: {
          pageChosen: function(pageData) {
            training.page = pageData.id;
            if(training.document)
            {
              training.document = null;
            }
            $scope.updateTraining(training);
          }
        },
      });
    };

    $scope.disassociatePage = function(training) 
    {
      $scope.training.page = null;
      $scope.updateTraining($scope.training);
    }

}
]);


var ModalTrainingNewCtrl = function($scope, $modalInstance, start, end) {

    $scope.newTraining = {
    	start : start?start.format():start,
    	end : end?end.format():end,
    	title : null
    }
    $scope.ok = function()
    {
    	$modalInstance.close($scope.newTraining.title);
    }

    $scope.cancel = function()
    {
    	$modalInstance.dismiss('cancel');
    }
};



/* Front End controller */


var trainings = angular.module('aroeTrainings', []);

members.controller('TrainingCtrl', ['$scope', '$filter', '$http', 
                                function($scope, $filter, $http) {

  $scope.training = null;

    $scope.$watch('training.document', function (newValue, oldValue)
    {
      if(newValue)
      {
        $scope.get_download_url(newValue, 'file');
        $scope.document_title = $scope.training.document_detail.title;
      }
    });

    $scope.$watch('training.page', function (newValue, oldValue)
    {
      if(newValue)
      {
        $scope.get_download_url(newValue, 'page');
        $scope.document_title = $scope.training.page_detail.title;
      }
    });

    $scope.get_download_url = function(document_id, type)
    {
      if(document_id)
      {
        if(type=='file'){
          $scope.document_url = $http.get('/api/v1/documents/'+document_id+"/").success(function(result)
          {
            $scope.document_url = result.meta.download_url;
          });
        } else {
          $scope.document_url = $scope.training.page_detail.url;
        }
      } else {
        $scope.document_url = "";
        
      }
    }
}]);