window.onload=fixExifOrientation;

//Shorthand for $( document ).ready(). THIS WILL ROTATE AN IMAGE
// $(function() {
//     //console.log( "ready!" );
//     $('img').each(function() {  
//     console.log('in rotation')
//     var deg = 90 ; //$(this).data('rotate') || 0;
//     var cssRotate = 'rotate(90deg)'; //'rotate(' + $(this).data('rotate') + 'deg)';
//     console.log(cssRotate)
//     $(this).css({ 
//         '-webkit-transform': cssRotate,
//         '-moz-transform': cssRotate,
//         '-o-transform': cssRotate,
//         '-ms-transform': cssRotate,
//         'transform': cssRotate // use scaleX to flip
//     });
//   });
// });
// 
function fixExifOrientation() {
  var orientation;
  var rotate;
  var scaleX;
  var cssRotate;
  if (typeof getExif !== 'undefined' && $.isFunction(getExif)) { // so this only runs where it should
    getExif();
  }
  $('img').each(function(thisImg) {
    if ($( this ).attr('src').indexOf("maps.gstatic.com") ==-1 && $( this ).attr('src').indexOf("maps.googleapis.com") ==-1 && $( this ).attr('src').indexOf("gif") ==-1 && $( this ).attr('src').indexOf("base64") ==-1 ){ 
      scaleX = 1;
      rotate = 0;
      orientation = 0;
      cssRotate = 'none';
      $(this).css({ 
          '-webkit-transform': cssRotate,
          '-moz-transform': cssRotate,
          '-o-transform': cssRotate,
          '-ms-transform': cssRotate,
          'transform': cssRotate // use scaleX to flip
      });
      /*
      we are pretty close to rotation now. all we have to do is pass back a "rotate" value and that should do it.
      */
      EXIF.getData(this, function() {
        orientation = EXIF.getTag(this, "Orientation");
        // orientation is a property that is set by EXIF.getData 
        if (orientation != undefined) {
          console.log( thisImg + ": " + $( this ).attr('title') );
          console.log("exif orientation: " + orientation);
          if (orientation == 1 || orientation ==0) {
              //$img.addClass('flip'); break;
              rotate = 0;
              scaleX = 1;
          }
          if (orientation == 2) {
              //$img.addClass('flip'); break;
              rotate = 0;
              scaleX = -1;
          }
          if (orientation == 3) {
              //$img.addClass('rotate-180'); break;
              rotate = 180;
              scaleX = 1;
          }
          if (orientation == 4) {
              //$img.addClass('flip-and-rotate-180'); break;
              scaleX = -1;
              rotate = 180;
          }
          if (orientation == 5) {
              //$img.addClass('flip-and-rotate-270'); break;
              scaleX = -1;
              rotate = 270;
          }
          if (orientation == 6) {
              //$img.addClass('rotate-90'); break;
              rotate = 90;
              scaleX = 1;
          }
          if (orientation == 7) {
              //$img.addClass('flip-and-rotate-90'); break;
              scaleX = -1;
              rotate = 90;
          }
          if (orientation == 8) {
              //$img.addClass('rotate-270'); break;
              rotate = 270;
              scaleX = 1;
          }
        cssRotate = "";
        cssRotate += "rotate(" + rotate.toString() + "deg) "
        cssRotate += "scaleX(" + scaleX.toString() + ") "
        //console.log("scaleX = " + scaleX + ", rotate = " + rotate)
        }
        else {
          //console.log('skipping ' +  $( this ).attr('title'))
          cssRotate = "none";
        }
        $(this).css({ 
            '-webkit-transform': cssRotate,
            '-moz-transform': cssRotate,
            '-o-transform': cssRotate,
            '-ms-transform': cssRotate,
            'transform': cssRotate // use scaleX to flip
        });
      });
    }
  });
}
