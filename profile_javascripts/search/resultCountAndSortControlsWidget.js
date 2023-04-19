define(function(require) {
  var $ = require('jquery');
  
  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    var $sortSelect;
    
    function initialize() {
      $sortSelect = $('#profile-search-sort-by');
      registerChangeListener();
    }
    initialize();
    
    function registerChangeListener() {
      $sortSelect.change(function(event) {
        invokeSortChangeCallback();
      });
    }
    
    function invokeSortChangeCallback() {
      if(spec.callbacks && spec.callbacks.sortChange) {
        spec.callbacks.sortChange();
      }
    }
    
    function getSort() {
      return $sortSelect.val();
    }
    
    that.getSort = getSort;
    
    return that;
  }
  
});