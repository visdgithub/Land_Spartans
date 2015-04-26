var app = angular.module('LandCom', ['ui.router', 'google-maps']);



//app.config(function($stateProvider, $urlRouterProvider){
//	$stateProvider.state('home',{
//		url:'/home',
//		templateUrl: '/home.html',
//		controller: 'MapCtrl'
//		
//	});
//	
//	$stateProvider.state('map', {
//		url:'/map',
//		templateUrl: '/map.html',
//		controller: 'MapCtrl'
//	});
//	
//	$urlRouterProvider.otherwise('home');
//	
//});

app.factory('BuildersList', function(){
	return [
	        {
	        	name: "Purvankara",
	        	id: "lb1"
	        },{
	        	name: "Mantri",
	        	id: "lb2"
	        }, {
	        	name: "Salapuria",
	        	id: "lb3"
	        }
	] 
	
});

app.factory('recommendationData', function(){
	return [
			{
				heatMapArea: [
			   {
				   lati: "12.921847",
				   longi: "77.628434"
			   },
			   {
				   lati: "12.901847",
				   longi: "77.642"
			   },
			   {
				   lati: "12.581",
				   longi: "77.352"
			   }
			],
			actualPoint:{
				lati: "12.911847",
				longi: "77.638434"
			},
			areaTitle: "HSR Layout",
			icon: ""
			},{
		
			heatMapArea: [
			   {
				   lati: "12.976496",
				   longi: "77.631733"
			   },
			   {
				   lati: "12.956496",
				   longi: "77.651733"
			   },
			   {
				   lati: "12.571",
				   longi: "77.362"
			   }
			],
			actualPoint:{
				lati: "12.966496",
				longi: "77.641733"
			},
			areaTitle: "Indiranagar",
			icon: ""
			},{
			heatMapArea: [
			   {
				   lati: "12.943776",
				   longi: "77.608766"
			   },
			   {
				   lati: "12.923776",
				   longi: "77.628766"
			   },
			   {
				   lati: "12.581",
				   longi: "77.352"
			   }
			],
			actualPoint:{
				lati: "12.933776",
				longi: "77.618766"
			},
			areaTitle: "Koramangala",
			icon: ""
			}
		]	
	
	
});


app.factory('MarkerCreatorService', function () {

    var markerId = 0;

    function create(latitude, longitude) {
        var marker = {
            options: {
                animation: 1,
                labelAnchor: "28 -5",
                labelClass: 'markerlabel'    
            },
            latitude: latitude,
            longitude: longitude,
            id: ++markerId          
        };
        return marker;        
    }

    function invokeSuccessCallback(successCallback, marker) {
        if (typeof successCallback === 'function') {
            successCallback(marker);
        }
    }

 

    function createByAddress(address, successCallback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address' : address}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var firstAddress = results[0];
                var latitude = firstAddress.geometry.location.lat();
                var longitude = firstAddress.geometry.location.lng();
                var marker = create(latitude, longitude);
                invokeSuccessCallback(successCallback, marker);
            } else {
                alert("Unknown address: " + address);
            }
        });
    }

    function createByCurrentLocation(successCallback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var marker = create(position.coords.latitude, position.coords.longitude);
                invokeSuccessCallback(successCallback, marker);
            });
        } else {
            alert('Unable to locate current position');
        }
    }

    function createByCoords(latitude, longitude, successCallback) {
        var marker = create(latitude, longitude);
        invokeSuccessCallback(successCallback, marker);
    }
    
    return {
        createByCoords: createByCoords,
        createByAddress: createByAddress,
        createByCurrentLocation: createByCurrentLocation
    };

});

app.controller('MapCtrl', ['MarkerCreatorService','BuildersList', 'recommendationData', '$scope', '$location', function (MarkerCreatorService, BuildersList, recommendationData, $scope, $location) {

		$scope.builderList = BuildersList;
		$scope.mainActive = {
				show: true
				
		}
	
        MarkerCreatorService.createByCoords(12.921847, 77.6109205, function (marker) {
            marker.options.labelContent = 'Bangalore';
            $scope.bangaloreMarker = marker;
        });
        
        $scope.address = '';

        $scope.map = {
            center: {
                latitude: $scope.bangaloreMarker.latitude,
                longitude: $scope.bangaloreMarker.longitude
            },
            zoom: 12,
            markers: [],
            control: {},
            options: {
                scrollwheel: false
            }
        };
        
       


       // $scope.map.markers.push($scope.bangaloreMarker);

        $scope.addCurrentLocation = function () {
            MarkerCreatorService.createByCurrentLocation(function (marker) {
                marker.options.labelContent = 'You´re here';
                $scope.map.markers.push(marker);
                refresh(marker);
            });
        };
        
        $scope.addAddress = function() {
            var address = $scope.address;
            if (address !== '') {
                MarkerCreatorService.createByAddress(address, function(marker) {
                    $scope.map.markers.push(marker);
                    refresh(marker);
                });
            }
        };

        function refresh(marker) {
            $scope.map.control.refresh({latitude: marker.latitude,
                longitude: marker.longitude});
        }
        
        $scope.getPreferences = function(builderName, pref){
        	dojo.style(dojo.byId('mainActive'), "display", "none");
        	
        	var jsonString = {
        			name: builderName,
        			pref: pref
        	};
        	
     			
     	//after return of ajax call
     	for (var i = 0; i < recommendationData.length; i++){
     		var recommendation = recommendationData[i];
     		
     		if (builderName == "DLF"){
     			if (i == 1){
     				continue;
     			}
     		}
     		if (builderName == "Purvankar"){
     			if (i == 2){
     				continue;
     			}
     		}
     		
     		  MarkerCreatorService.createByCoords(recommendation.actualPoint.lati, recommendation.actualPoint.longi, function (marker) {
     	            marker.options.labelContent = recommendationData[i].areaTitle;
     	            
     	            var myBounds = new google.maps.LatLngBounds();
     	           
             	        var rectangle = new google.maps.Rectangle({
             	            strokeColor: '#FF0000',
             	            strokeOpacity: 0.8,
             	            strokeWeight: 2,
             	            fillColor: '#ffffff',
             	            fillOpacity: 0.35,
             	            id: recommendationData[i].heatMapArea[0].lati+recommendationData[i].heatMapArea[0].longi,
             	            map: $scope.map.control.getGMap(),
             	            bounds: new google.maps.LatLngBounds(
             	            new google.maps.LatLng(recommendationData[i].heatMapArea[0].lati, recommendationData[i].heatMapArea[0].longi),
             	            new google.maps.LatLng(recommendationData[i].heatMapArea[1].lati, recommendationData[i].heatMapArea[1].longi)
             	            )
             	          });
             	        
             	        google.maps.event.addListener(rectangle, 'click', function(evt){
             	        	var winName = "#window";
             	        	if (evt.latLng.lat() > 12.91 && evt.latLng.lat() <12.922){
             	        		//HSR
             	        		winName = winName+'0';
             	        	}else if (evt.latLng.lat() > 12.95 && evt.latLng.lat() <12.977){
             	        		//Indirangar
             	        		winName = winName+'1';
             	        	}else if (evt.latLng.lat() > 12.92 && evt.latLng.lat() <12.944){
             	        		//Koramangala
             	        		winName = winName+'2';
             	        	}
             	        	
             	        	 var window = $(winName);

                              var onClose = function() {
                                 
                              }

                              window.kendoWindow({
                                  width: "615px",
                                  title: "Sentiment Analysis",
                                  content: "../sentiment.html"
                                 
                              });
             	        });
     	           
     	        $scope.map.bounds = myBounds;
     	        
     	     

     	            $scope.map.markers.push(marker);
     	            google.maps.event.addListener(marker, 'click', function(evt){
     	            	alert("dfds");
     	            });
     	        });
     	        
     	}
   
        //	$location.path('/map');
        }
        
      

    }]);


