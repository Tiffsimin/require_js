define(function(require) {
  var $ = require('jquery');
  var defaultModal = require('app/kui/modal/defaultModal');
  var formUtil = require('app/util/formUtil');
  
  var GLOBAL_ERROR_MESSAGE_TARGET = 'global-error-message';
  
  return function(spec) {
    spec = spec || {};
    spec.id = spec.id || 'modal-delete-single-availability';
    
    var my = {};
    
    var that = defaultModal(spec, my);
    
    var availabilityToDelete = null;
    
    var $modal = my.modal;
    var $deleteYesButton = $modal.find('#button-delete-yes');
    var $deleteNoButton = $modal.find('#button-delete-no');
    
    function initialize() {
      addButtonListeners();
    }
    initialize();
    
    function addButtonListeners() {
      $deleteYesButton.click(onDeleteYesButtonClick);
      $deleteNoButton.click(onDeleteNoButtonClick);
    }
    
    function setAvailability(availability) {
      availabilityToDelete = availability;
    }
    
    function onDeleteYesButtonClick(event) {
      event.preventDefault();
      invokeDeleteYesClickCallback();
    }
    
    function invokeDeleteYesClickCallback() {
      if(spec.callbacks && spec.callbacks.deleteYesClick) {
        spec.callbacks.deleteYesClick(availabilityToDelete);
      }
    }
    
    function onDeleteNoButtonClick(event) {
      event.preventDefault();
      invokeDeleteNoClickCallback();
    }
    
    function invokeDeleteNoClickCallback() {
      if(spec.callbacks && spec.callbacks.deleteNoClick) {
        spec.callbacks.deleteNoClick();
      }
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors('modal-delete-single-availability');
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