var map, heatmap;
// leaflet? 

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4, // 13 is close
    // center: {lat: 47.614262, lng: -122.323794}, // seattle. 
    center: {lat: 37.775, lng: -122.434}, // SF
    // center: { lat: 36.0907578, lng: -119.5948303 }, // LA
    mapTypeId: 'roadmap' // satellite terrain roadmap hybrid
  });

/*
//   TODO: center on user's location or on first object returned.. ONlY WORKS ON HTTPS
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
*/
  
  
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),  // uses locals.locations
    map: map
  });
  
  // NB: this same function is repeated in intention.js:
  locations.forEach(function(loc) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(loc.latitude, loc.longitude),
      icon: {
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAjCAIAAABpW9/5AAAABnRSTlMAAAAAAABupgeRAAAACXBIWXMAARxbAAEcWwEUN6FaAAACMElEQVRYw8XXS0hVURTG8d89V4uiMEWwib0GlgVqYGJlgyQsKsJJkyCoYeYsgwZBRYMG2aShCRHUrBcR5UAIkuhB5ZN0koNASCsqDEsra2DJTb2Pc1PvNzrsvdb+7732Y60T8a8iVLGXMpaDt3RwjzbGJdEaaiijgIBBurjP62mWkSluZymNM2gfZ+iO01vIcarj9LZyjsGYlujkVyXNFMZfTT61vKN3WtcOmihKGIl9vIxh/wEXc4nFySIZsJ0hXsU07uE8C5L5LmInD/kwGeqF3GCVVPWDw7SDEq6QnbJvP/sZnVjxQXYLoYByrpNFM3lhfHP5QgfRKI0sEU45DFPKLqFVxFWyKiiQjg4RpOWYz2aytkpT+dLXFoL1MqANBCsyAS4kyMsEOJcgOxPgLIJvmQB/JRjIBPgNQXsmwC8IWjIBvkvwjJ75pT6mayJJ9FGb7vsXViPU83kCPMQw2+ae+pMGOmMLgW7GqZhL6ndO0Dq99HnOIFWxTbOn99TTNmPNhV4eUc6yWaU+oG5aoTl1eUPcJJuS2ThuHznNRUYSl7exWstJNqaL/MVtLvApjkEkcW1VyzFyQlIHOMWThDbRxLPu5Q4rWZ0ytYU6+pOZRVO58i0MU5ls18dppJGxFOaX6t3popPq+IX7KA3cSjkwkVCbV0wTuTPl13qehhkqEva4ruMyS2NaxjgSkpqmNtFODz10UzOfqe3AX/DRec7kEZq4NjcPe/JfoNL/cP8N53lwp5gXjtsAAAAASUVORK5CYII=',
        scaledSize: new google.maps.Size(10, 8),
      },
      map: map,
      title: loc.name,
      targetUrl: '/api/intention/' + loc._id.toString(),
      animation: google.maps.Animation.DROP,
      draggable: false
    });

    window.google.maps.event.addListener(marker, 'click', function() {
        window.location.href =  marker.targetUrl;
    });

  });  
  

  
  // if there are not very many markers, make them bigger:
  
  if (locations.length < 10000) {
    changeOpacity() ;
  }
  if (locations.length < 1000) {  
    changeGradient() ;
  }
  if (locations.length < 100) {  
    changeRadius() ;
  }


} // initMap


function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
  var gradient = [
    'rgba(0, 0, 0, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ]
  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
  heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null :  10 );
}

// use locals.locations to create heatmap's 'data' array
function getPoints() {
  var mapPoints=[];
  var weight=1;
  for (var i in locations){
    if (locations.hasOwnProperty(i)) { // ensures that the object exists

      // TODO if there are not many markers nearby, increase weight accordingly
      mapPoints.push( {location: new google.maps.LatLng(locations[i].latitude, locations[i].longitude), weight:weight} );
      // console.log("name: " + locations[i].name + ", lat: " + locations[i].latitude + ", lng: " + locations[i].longitude);
     }
  }
  return mapPoints;
}



function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  if (!browserHasGeolocation) {
    console.log('geolocation error');
  }
}

