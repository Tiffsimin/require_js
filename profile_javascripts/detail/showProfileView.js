define(function(require) {
  var $ = require('jquery');
  var mapView = require('app/kui/location/mapView');

  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    var map;
    
    function initialize() {
      createMap();
      registerCalendarClickListeners();
      registerRequestTutorClickListener();
    }
    initialize();
    
    function createMap() {
      var $mapCanvas = $('#tutor-profile-map');
      var longitude = $mapCanvas.data("knbLongitude");
      var latitude = $mapCanvas.data("knbLatitude");
      map = mapView({
        mapCanvasId: $mapCanvas.attr('id'),
        initialPosition: {
          lng: longitude,
          lat: latitude
        },
        setMarkerAtInitialPosition: true,
        useFuzzyMarker: true
      });
    }
    
    function registerCalendarClickListeners() {
      $('.calendar-compact .meta-date').click(function(event) {
        event.preventDefault();
        
        var date = $(this).data("knbDate");
        invokeCompactCalendarDateClickCallback(date);
      });
    }
    
    function registerRequestTutorClickListener() {
      $('.action-request-tutor').click(function(event) {
        event.preventDefault();
        var tutorId = $('#tutor-profile-main').data('knbTutorId');
        invokeRequestTutorClickCallback(tutorId);
      });
    }
    
    function invokeCompactCalendarDateClickCallback(date) {
      if(spec.callbacks && spec.callbacks.compactCalendarDateClick) {
        spec.callbacks.compactCalendarDateClick(date);
      }
    }
    
    function invokeRequestTutorClickCallback(tutorId) {
      if(spec.callbacks && spec.callbacks.requestTutorClick) {
        spec.callbacks.requestTutorClick(tutorId);
      }
    }
    
    //that.update = update;
    
    return that;
  }
  
});