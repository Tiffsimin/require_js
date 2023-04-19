define(function(require) {
  var $ = require('jquery');
  
  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    var $container;
    
    function initialize() {
      $container = $('#profile-search-active-filters');
      registerClickListeners();
    }
    initialize();
    
    function registerClickListeners() {
      $container.find('.active-filter').click(function(event) {
        var filterName = $(this).data("knbFilterName");
        var filterValue = $(this).data("knbFilterValue");
        invokeFilterClickCallback(filterName, filterValue);
      });
      
      $container.find('.clear-selection').click(function(event) {
        invokeClearClickCallback();
      });
    }
    
    function invokeFilterClickCallback(filterName, filterValue) {
      if(spec.callbacks && spec.callbacks.filterClick) {
        spec.callbacks.filterClick(filterName, filterValue);
      }
    }
    
    function invokeClearClickCallback() {
      if(spec.callbacks && spec.callbacks.clearClick) {
        spec.callbacks.clearClick();
      }
    }
    
    return that;
  }
  
});