define(function(require) {
  var $ = require('jquery');
  var defaultModal = require('app/kui/modal/defaultModal');
  var formUtil = require('app/util/formUtil');
  
  var GLOBAL_ERROR_MESSAGE_TARGET = 'global-error-message';
  
  return function(spec) {
    spec = spec || {};
    spec.id = spec.id || 'modal-delete-availability';
    
    var my = {};
    
    var that = defaultModal(spec, my);
    
    var availabilityToDelete = null;
    
    var $modal = my.modal;
    var $deleteFutureButton = $modal.find('#button-delete-future');
    var $deleteSingleButton = $modal.find('#button-delete-single');
    
    function initialize() {
      addButtonListeners();
    }
    initialize();
    
    function addButtonListeners() {
      $deleteFutureButton.click(onDeleteFutureButtonClick);
      $deleteSingleButton.click(onDeleteSingleButtonClick);
    }
    
    function setAvailability(availability) {
      availabilityToDelete = availability;
    }
    
    function invokeDeleteFutureClickCallback() {
      if(spec.callbacks && spec.callbacks.deleteFutureClick) {
        spec.callbacks.deleteFutureClick(availabilityToDelete);
      }
    }
    
    function invokeDeleteSingleClickCallback() {
      if(spec.callbacks && spec.callbacks.deleteSingleClick) {
        spec.callbacks.deleteSingleClick(availabilityToDelete);
      }
    }
    
    function onDeleteFutureButtonClick(event) {
      event.preventDefault();
      invokeDeleteFutureClickCallback();
    }
    
    function onDeleteSingleButtonClick(event) {
      event.preventDefault();
      invokeDeleteSingleClickCallback();
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors('modal-delete-availability');
      formUtil.replaceWithEmptyDiv(GLOBAL_ERROR_MESSAGE_TARGET);
    }
    
    function showGlobalError(message) {
      formUtil.replaceWithErrorMessage(GLOBAL_ERROR_MESSAGE_TARGET, message)
    }
    
    function showValidationErrors(errors) {
      var globalErrors = '';
      
      errors.forEach(function(error) {    
          if(globalErrors) {
            globalErrors += "<br />";
          }
          globalErrors += error.message;       
      });
      
      if(globalErrors) {
        showGlobalError(globalErrors);
      }
    }
    
    that.setAvailability = setAvailability;
    that.showGlobalError = showGlobalError;
    that.clearAllErrors = clearAllErrors;

    return that;
  }
  
});