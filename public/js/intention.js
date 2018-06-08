
var map, heatmap;
/*
  NOTE:
  Mongoose cannot apply cursor methods to the result of findOne() because a single document is returned. You have access to the document directly
  mapLocations therefore is a single record, while likes is an array, of length 1.
*/

function getExif() {

    var img2 = document.getElementById("theImage");
    EXIF.getData(img2, function() {
      var allMetaData = EXIF.getAllTags(this);
      delete allMetaData['MakerNote'];
      delete allMetaData['UserComment'];
      delete allMetaData['CFAPattern'];
      delete allMetaData['SubjectArea'];
      var allMetaDataSpan = document.getElementById("allMetaDataSpan");
      allMetaDataSpan.innerHTML = JSON.stringify(allMetaData, null, "\t");
    });
}

// jquery function toggles like button
$(function() {
  $('.like-button').click(function() {
    //event.preventDefault();

    if (typeof user != "undefined") {
      // handle ui
      var obj = $(this);
      var img = obj.find('img');
      var pObj = document.getElementById('counter'); // best way to find something is to put in div
      // console.log(pObj);
      var pVal = pObj.firstChild.innerHTML;
      // console.log(pVal);

      var imgSrcVal = img.attr('src');
      if (imgSrcVal == 'http://sendloveio.imgix.net/heart_40_35_gray.gif') {
        obj.data('liked', false);
        img.attr('src','http://sendloveio.imgix.net/heart_40_35.gif');
        img.attr('title','liked!');
        pVal = parseFloat(pVal) + 1;
      } else {
        obj.data('liked', true);
        img.attr('src','http://sendloveio.imgix.net/heart_40_35_gray.gif');
        img.attr('title','like!');
        pVal = parseFloat(pVal) - 1;
      }

      pObj.firstChild.innerHTML = pVal;

      var nValue;
      if (!obj.data('liked')) {
        nValue = 1;
      }
      else {
        nValue = -1;
      }
      // handle post
      var data = {};
      data.thingId = locations[0]._id;
      data.personId = user;
      data.partType = "like";
      data.nValue = nValue;
      $.ajaxSetup({
        headers: {
          'X-CSRF-Token': csrf
        }
      });
      $.ajax({
        type: 'POST',
        url: '/api/detail/',
        data: data,
        dataType: 'application/json',
        success: function(data) {
          console.log('success');
          console.log(data);
        }
      });

    }
    else {
      alert('login to like!');
    }
    return false; // shorthand for event.preventDefault(); event.stopPropagation();
    /*
      TODO "return false" prevents a post action and allows multiple likes
    */
  });
});

$(function() {
  $('.reply-button').click(function() {

    if (typeof user != "undefined") {
      // ok
    }
    else {
      alert('login to reply!');
      return false;
    }
  });
});

function initMap() {

latitude = locations[0].latitude;
longitude = locations[0].longitude;

if (latitude === undefined || longitude === undefined) {
  console.log('no location');
}
else {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11, // 13 is close
    center: {lat: locations[0].latitude, lng: locations[0].longitude},
    mapTypeId: 'roadmap' // satellite terrain roadmap hybrid
  });


  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),  // uses locals.locations
    map: map
  });

  // use locals.locations to drop markers

  // TODO: "DetailSets"

  var marker = new google.maps.Marker({
  position: new google.maps.LatLng(locations[0].latitude, locations[0].longitude),
  icon: {
    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAjCAIAAABpW9/5AAAABnRSTlMAAAAAAABupgeRAAAACXBIWXMAARxbAAEcWwEUN6FaAAACMElEQVRYw8XXS0hVURTG8d89V4uiMEWwib0GlgVqYGJlgyQsKsJJkyCoYeYsgwZBRYMG2aShCRHUrBcR5UAIkuhB5ZN0koNASCsqDEsra2DJTb2Pc1PvNzrsvdb+7732Y60T8a8iVLGXMpaDt3RwjzbGJdEaaiijgIBBurjP62mWkSluZymNM2gfZ+iO01vIcarj9LZyjsGYlujkVyXNFMZfTT61vKN3WtcOmihKGIl9vIxh/wEXc4nFySIZsJ0hXsU07uE8C5L5LmInD/kwGeqF3GCVVPWDw7SDEq6QnbJvP/sZnVjxQXYLoYByrpNFM3lhfHP5QgfRKI0sEU45DFPKLqFVxFWyKiiQjg4RpOWYz2aytkpT+dLXFoL1MqANBCsyAS4kyMsEOJcgOxPgLIJvmQB/JRjIBPgNQXsmwC8IWjIBvkvwjJ75pT6mayJJ9FGb7vsXViPU83kCPMQw2+ae+pMGOmMLgW7GqZhL6ndO0Dq99HnOIFWxTbOn99TTNmPNhV4eUc6yWaU+oG5aoTl1eUPcJJuS2ThuHznNRUYSl7exWstJNqaL/MVtLvApjkEkcW1VyzFyQlIHOMWThDbRxLPu5Q4rWZ0ytYU6+pOZRVO58i0MU5ls18dppJGxFOaX6t3popPq+IX7KA3cSjkwkVCbV0wTuTPl13qehhkqEva4ruMyS2NaxjgSkpqmNtFODz10UzOfqe3AX/DRec7kEZq4NjcPe/JfoNL/cP8N53lwp5gXjtsAAAAASUVORK5CYII=',
    scaledSize: new google.maps.Size(10, 8),
  },
  map: map,
  title: locations[0].name,
  targetUrl: '/api/intention/' + locations[0]._id.toString(),
  animation: google.maps.Animation.DROP,
  draggable: false
  });

//   window.google.maps.event.addListener(marker, 'click', function() {
//     window.location.href =  marker.targetUrl;
//   });
  marker.addListener('click', toggleBounce);

  function toggleBounce() {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);

      }
  }


  // testing recenter
  //   var pos = {
  //     lat: locations[0].latitude,
  //     lng: locations[0].longitude
  //   };
  // map.setCenter(pos);
  // map.setZoom(4);

  // if there are not very many markers, make them bigger:

  if (locations.length < 1000) {
    changeOpacity() ;
    changeGradient() ;
    changeRadius() ;
  }

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
