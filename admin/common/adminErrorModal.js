define(function(require) {
  var $ = require('jquery');

  return function create() {
    var that = $({});
    
    var $modal;
    var $messageField;
    
    function initialize() {
      $modal = $('#modal-admin-error');
      $messageField = $modal.find('.field-message');
    }
    
    $(document).ready(function() {
      initialize();
    });
    
    function show(message) {
      $messageField.html(message);
      $modal.modal('show');
    }
    
    function hide() {
      $modal.modal('hide');
    }
    
    that.show = show;
    that.hide = hide;

    return that;
  }();
  
});