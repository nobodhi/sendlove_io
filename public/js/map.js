    var map;
    var mapLocations = [
      {
        location: 'RONS Club',
        latitude: 33.487569,
        longitude: -112.095390
        ,targetUrl: '/api/workout'
      }
      ,{
        location: 'Belltown',
        latitude: 47.613138,
        longitude: -122.345858
        ,targetUrl: '/api/workout'
      }
      ,{
        location: 'Hilo',
        latitude: 19.720818,
        longitude: -155.078030
        ,targetUrl: '/api/workout'
      }
    ];

   
    
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 36.0907578, lng: -119.5948303 },
        zoom: 4
      });


      // NB: this same function is repeated in workout.js:
      mapLocations.forEach(function(loc) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(loc.latitude, loc.longitude),
          icon: {
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAjCAIAAABpW9/5AAAABnRSTlMAAAAAAABupgeRAAAACXBIWXMAARxbAAEcWwEUN6FaAAACMElEQVRYw8XXS0hVURTG8d89V4uiMEWwib0GlgVqYGJlgyQsKsJJkyCoYeYsgwZBRYMG2aShCRHUrBcR5UAIkuhB5ZN0koNASCsqDEsra2DJTb2Pc1PvNzrsvdb+7732Y60T8a8iVLGXMpaDt3RwjzbGJdEaaiijgIBBurjP62mWkSluZymNM2gfZ+iO01vIcarj9LZyjsGYlujkVyXNFMZfTT61vKN3WtcOmihKGIl9vIxh/wEXc4nFySIZsJ0hXsU07uE8C5L5LmInD/kwGeqF3GCVVPWDw7SDEq6QnbJvP/sZnVjxQXYLoYByrpNFM3lhfHP5QgfRKI0sEU45DFPKLqFVxFWyKiiQjg4RpOWYz2aytkpT+dLXFoL1MqANBCsyAS4kyMsEOJcgOxPgLIJvmQB/JRjIBPgNQXsmwC8IWjIBvkvwjJ75pT6mayJJ9FGb7vsXViPU83kCPMQw2+ae+pMGOmMLgW7GqZhL6ndO0Dq99HnOIFWxTbOn99TTNmPNhV4eUc6yWaU+oG5aoTl1eUPcJJuS2ThuHznNRUYSl7exWstJNqaL/MVtLvApjkEkcW1VyzFyQlIHOMWThDbRxLPu5Q4rWZ0ytYU6+pOZRVO58i0MU5ls18dppJGxFOaX6t3popPq+IX7KA3cSjkwkVCbV0wTuTPl13qehhkqEva4ruMyS2NaxjgSkpqmNtFODz10UzOfqe3AX/DRec7kEZq4NjcPe/JfoNL/cP8N53lwp5gXjtsAAAAASUVORK5CYII=',
            scaledSize: new google.maps.Size(16, 14),
          },
          map: map,
          title: loc.location,
          targetUrl: loc.targetUrl,
          animation: google.maps.Animation.DROP,
          draggable: false
        });

        window.google.maps.event.addListener(marker, 'click', function() {
            window.location.href =  marker.targetUrl;
        });

      });

      
    }
