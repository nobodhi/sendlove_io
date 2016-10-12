var markers = [];
// latitude and longitude are express locals

function initMap() {
  
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 36.0907578, lng: -119.5948303 },
    zoom: 4
  });
  deleteMarkers();
  var geocoder = new google.maps.Geocoder();

  
  // click submit button
  document.getElementById('submit').addEventListener('click', function() { 
  
    deleteMarkers();
    geocodeAddress(geocoder, map);
  });

//   // press enter -- doesn't work properly in pug.
//   document.getElementById('address').addEventListener('keypress', function(e) {
//     var key = e.which || e.keyCode;
//     if (key === 13) { // 13 is enter
//       deleteMarkers();
//       geocodeAddress(geocoder, map);
//     }
//   });
//   
  // Sets the map on all markers in the array.
  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }
  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    setMapOnAll(null);
  }
  // Deletes all markers in the array by removing references to them.
  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }
      
  
}

function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {

    if (status === 'OK') {
          
      resultsMap.setCenter(results[0].geometry.location);
      resultsMap.setZoom(16);
      
      // ok to here
      var marker  = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location,
        title:  'put something here',
        icon: {
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAjCAIAAABpW9/5AAAABnRSTlMAAAAAAABupgeRAAAACXBIWXMAARxbAAEcWwEUN6FaAAACMElEQVRYw8XXS0hVURTG8d89V4uiMEWwib0GlgVqYGJlgyQsKsJJkyCoYeYsgwZBRYMG2aShCRHUrBcR5UAIkuhB5ZN0koNASCsqDEsra2DJTb2Pc1PvNzrsvdb+7732Y60T8a8iVLGXMpaDt3RwjzbGJdEaaiijgIBBurjP62mWkSluZymNM2gfZ+iO01vIcarj9LZyjsGYlujkVyXNFMZfTT61vKN3WtcOmihKGIl9vIxh/wEXc4nFySIZsJ0hXsU07uE8C5L5LmInD/kwGeqF3GCVVPWDw7SDEq6QnbJvP/sZnVjxQXYLoYByrpNFM3lhfHP5QgfRKI0sEU45DFPKLqFVxFWyKiiQjg4RpOWYz2aytkpT+dLXFoL1MqANBCsyAS4kyMsEOJcgOxPgLIJvmQB/JRjIBPgNQXsmwC8IWjIBvkvwjJ75pT6mayJJ9FGb7vsXViPU83kCPMQw2+ae+pMGOmMLgW7GqZhL6ndO0Dq99HnOIFWxTbOn99TTNmPNhV4eUc6yWaU+oG5aoTl1eUPcJJuS2ThuHznNRUYSl7exWstJNqaL/MVtLvApjkEkcW1VyzFyQlIHOMWThDbRxLPu5Q4rWZ0ytYU6+pOZRVO58i0MU5ls18dppJGxFOaX6t3popPq+IX7KA3cSjkwkVCbV0wTuTPl13qehhkqEva4ruMyS2NaxjgSkpqmNtFODz10UzOfqe3AX/DRec7kEZq4NjcPe/JfoNL/cP8N53lwp5gXjtsAAAAASUVORK5CYII=',
          scaledSize: new google.maps.Size(22, 20),
        },        
        draggable: true        
      });
      // listener runs every time marker is dropped
      google.maps.event.addListener(marker, 'dragend', function(event) {
        latitude = marker.position.lat() ;
        longitude = marker.position.lng() ;
        console.log( 'Lat: ' + latitude  + ', lng: ' + longitude);
      });      
      // lat/lng are set when function is called
      markers.push (marker);
      latitude = marker.position.lat() ;
      longitude = marker.position.lng() ;
      console.log( 'Lat: ' + latitude + ', lng:' + longitude);     
    } else {
      console.log('Location was not successful for the following reason: ' + status);
    }
  });
 
}

function modifyInputs() {
  var latitudeInput = document.getElementById("latitude");
  var longitudeInput = document.getElementById("longitude");
  latitudeInput.value = latitude;
  longitudeInput.value = longitude;
  //alert('final latitude = ' + latitude.toString() + ', longitude = ' + longitude.toString());
}
