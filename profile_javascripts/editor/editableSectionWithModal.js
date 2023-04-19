define(function(require) {
  var $ = require('jquery');
  var defaultModal = require('app/kui/modal/defaultModal');
  var validationUtil = require('app/util/validationUtil');
  var formUtil = require('app/util/formUtil');
  
  var SCRIPT_NAME = 'editableSectionWithModal';
  
  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    var currentValues;
    var $sectionContainer;
    var $modal;
    var $modalContainer;
    var $editButton;
    var $cancelButton;
    var $saveButton;
    
    function initialize() {
      validationUtil.checkNotBlank(SCRIPT_NAME, spec, ['sectionId', 'modalId', 'globalErrorMessageTargetId']);
      
      var modalSpec = {
              id: spec.modalId,
              callbacks: {
                hide: onModalHide
              }
      };
      var modalMy = {};
      $modal = defaultModal(modalSpec, modalMy);
      $modalContainer = modalMy.modal;

      $sectionContainer = $('#' + spec.sectionId);
      $editButton = $sectionContainer.find('.button-edit');
      $cancelButton = $modalContainer.find('.action-cancel');
      $saveButton = $modalContainer.find('.action-save');
      registerClickListeners();
    }
    initialize();
    
    function registerClickListeners() {
      $editButton.click(function(event){
        event.preventDefault();
        saveCurrentValues();
        showForm();
      });
      
      $cancelButton.click(function(event){
        event.preventDefault();
        restoreCurrentValues();
        invokeCancelClickCallback();
      });
      
      $saveButton.click(function(event){
        event.preventDefault();
        invokeSaveClickCallback();
      });
    }
    
    function saveCurrentValues() {
      currentValues = {
              checkbox: {}
      };
      
      $modalContainer.find('input[type=checkbox]:checked').each(function(index, element) {
        var $element = $(element);
        var name = $element.attr('name'); 
        if(name.indexOf('[]') == -1) {
          currentValues.checkbox[name] = $element.val();
        } else {
          name = name.substr(0, name.indexOf('[]'));
          if(!currentValues.checkbox[name]) {
            currentValues.checkbox[name] = [];
          }
          currentValues.checkbox[name].push($element.val());
        }
      });
    }
    
    function restoreCurrentValues() {
      if(!currentValues) {
        return;
      }
      
      $modalContainer.find('input[type=checkbox]').each(function(index, element) {
        var $element = $(element);
        var name = $element.attr('name'); 
        if(name.indexOf('[]') == -1) {
          var value = currentValues.checkbox[name];
          $element.icheck($element.attr('value') == value ? 'checked' : 'unchecked');
        } else {
          name = name.substr(0, name.indexOf('[]'));
          var valuesArray = currentValues.checkbox[name];
          var isChecked = valuesArray && $.inArray($element.attr('value'), valuesArray) != -1;
          $element.icheck(isChecked ? 'checked' : 'unchecked'); 
        }
      });
    } 
    
    function clearCurrentValues() {
      currentValues = null;
    }
    
    function showForm() {
      clearAllErrors();
      $(document).on('keyup', null, onDocumentKeyUp);
      $modal.show();
    }
    
    function hideForm() {
      $modal.hide();
      clearCurrentValues();
      $(document).off('keyup', null, onDocumentKeyUp);
    }
    
    function serialize() {
      var result = formUtil.serializeJson($modalContainer.find('input'));
      if($.isEmptyObject(result)) {
        $modalContainer.find('input[type=checkbox]').each(function(index, element) {
          var $element = $(element);
          var name = $element.attr('name'); 
          if(name.indexOf('[]') != -1) {
            name = name.substr(0, name.indexOf('[]'));
            result[name] = null;
          }
        });
      }
      return result;
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors(spec.modalId);
      formUtil.replaceWithEmptyDiv(spec.globalErrorMessageTargetId);
    }
    
    function showValidationErrors(errors) {
      var globalErrors = '';
      
      errors.forEach(function(error) {
        var fieldName = error.field;
        var $field = $modalContainer.find('.field-group [name=' + fieldName + ']');

        if($field.length == 0) {
          fieldName += '[]';
          var $field = $modalContainer.find('.field-group [name="' + fieldName + '"]');
        }
        
        if($field.length) {
          formUtil.addFieldError(fieldName, error.message);
        } else {
          if(globalErrors) {
            globalErrors += "<br />";
          }
          globalErrors += error.message;
        }
      });
      
      if(globalErrors) {
        showGlobalError(globalErrors);
      }
    }
    
    function showGlobalError(message) {
      formUtil.replaceWithErrorMessage(spec.globalErrorMessageTargetId, message)
    }
    
    function invokeSaveClickCallback() {
      if(spec.callbacks && spec.callbacks.saveClick) {
        spec.callbacks.saveClick(that);
      }
    }
    
    function invokeCancelClickCallback() {
      if(spec.callbacks && spec.callbacks.cancelClick) {
        spec.callbacks.cancelClick(that);
      }
    }
    
    function onModalHide(modal) {
      $cancelButton.trigger('click');
    }
    
    //hide the form when hitting the escape key
    function onDocumentKeyUp(event) {
      if (event.keyCode == 27) {
        $cancelButton.trigger('click');
      }
    }
    
    that.showForm = showForm;
    that.hideForm = hideForm;
    that.serialize = serialize;
    that.clearAllErrors = clearAllErrors;
    that.showValidationErrors = showValidationErrors;
    that.showGlobalError = showGlobalError;
    
    return that;
  }
  
});