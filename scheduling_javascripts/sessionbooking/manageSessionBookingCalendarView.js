define(function(require) {
  var $ = require('jquery');

  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    
    function initialize() {
      addCellEntryListeners();
    }
    initialize();
    
    function addCellEntryListeners() {
      $('.state-default .meta-entry').click(onMetaEntryClick);
    }
    
    function invokeDateCellClickCallback(date) {
      if(spec.callbacks && spec.callbacks.dateCellClick) {
        spec.callbacks.dateCellClick(date);
      }
    }
    
    function invokeEntryClickCallback(date, start, end, tutorId) {
      if(spec.callbacks && spec.callbacks.entryClick) {
        spec.callbacks.entryClick(date, start, end, tutorId);
      }
    }
    
    function onMetaEntryClick(event) {
      event.preventDefault();
      $entry = $(this);
      var date = $entry.siblings('.meta-date').data('knbDate');
      var start = $entry.data('knbSessionStart');
      var end = $entry.data('knbSessionEnd');
      var tutorId = $entry.data('knbSessionTutorId');
      invokeEntryClickCallback(date, start, end, tutorId);
    }

    return that;
  }
  
});