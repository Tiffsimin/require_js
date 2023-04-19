define(function(require) {
  var $ = require('jquery');
  var validationUtil = require('app/util/validationUtil');
  var formUtil = require('app/util/formUtil');
  
  var SCRIPT_NAME = 'editableSection';
  
  return function(spec, my) {
    spec = spec || {};
    
    my = my || {};
    
    var that = $({});
    var currentValues;
    var $container;
    var $editableBlock;
    var $editButton;
    var $cancelButton;
    var $saveButton;
    
    function initialize() {
      validationUtil.checkNotBlank(SCRIPT_NAME, spec, ['sectionId', 'globalErrorMessageTargetId']);
      $container = $('#' + spec.sectionId);
      my.container = $container;
      $editButton = $container.find('.button-edit');
      $cancelButton = $container.find('.action-cancel');
      $saveButton = $container.find('.action-save');
      $editableBlock = $editButton.closest('.is-editable');
      registerClickListeners();
      registerKeyUpListeners($container.find('input:textall'));
    }
    initialize();
    
    function registerClickListeners() {
      $editButton.click(function(event){
        event.preventDefault();
        my.saveCurrentValues();
        showForm();
      });
      
      $cancelButton.click(function(event){
        event.preventDefault();
        my.restoreCurrentValues();
        invokeCancelClickCallback();
      });
      
      $saveButton.click(function(event){
        event.preventDefault();
        invokeSaveClickCallback();
      });
    }
    
    function registerKeyUpListeners(elements) {
      elements.keyup(function(event) {
        if(event.keyCode == 13) {
          $saveButton.trigger('click');
        }
      });
    }
    
    function processNewFormElements(formElements) {
      $formElements = $(formElements);
      registerKeyUpListeners($formElements.find('input:textall'));
    }
    
    function saveCurrentValues() {
      currentValues = {
              textInput: {},
              select: {},
              radio: {},
              textArea: {}
      };
      
      $container.find('input:textall').each(function(index, element) {
        var $element = $(element);
        currentValues.textInput[$element.attr('id')] = $element.val();
      });
      
      $container.find('select').each(function(index, element) {
        var $element = $(element);
        currentValues.select[$element.attr('id')] = $element.val();
      });
      
      $container.find('input[type=radio]:checked').each(function(index, element) {
        var $element = $(element);
        currentValues.radio[$element.attr('name')] = $element.val();
      });
      
      $container.find('textarea').each(function(index, element) {
        var $element = $(element);
        currentValues.textArea[$element.attr('id')] = $element.val();
      });
    }
    
    function restoreCurrentValues() {
      if(!currentValues) {
        return;
      }
      
      $container.find('input:textall').each(function(index, element) {
        var $element = $(element);
        var value = currentValues.textInput[$element.attr('id')];
        $element.val(value);
        //these events need to be triggered to make sure the placeholder is properly set
        $element.trigger('keyup');
        $element.trigger('blur');
      });
      
      $container.find('select').each(function(index, element) {
        var $element = $(element);
        var value = currentValues.select[$element.attr('id')];
        $element.val(value).trigger("change");
      });
      
      $container.find('input[type=radio]').each(function(index, element) {
        var $element = $(element);
        var value = currentValues.radio[$element.attr('name')]; 
        $element.icheck($element.attr('value') == value ? 'checked' : 'unchecked');
      });
      
      $container.find('textarea').each(function(index, element) {
        var $element = $(element);
        var value = currentValues.textArea[$element.attr('id')];
        $element.val(value);
        //these events need to be triggered to make sure the placeholder is properly set
        $element.trigger('keyup');
        $element.trigger('blur');
        autosize.update($element);
      });
    } 
    
    function clearCurrentValues() {
      currentValues = null;
    }
    
    function showForm() {
      $editableBlock.removeClass('is-editable');
      $editableBlock.addClass('is-editable-active');
      clearAllErrors();

      autosize.destroy($container.find('.style-auto-expand textarea'));
      autosize($container.find('.style-auto-expand textarea'));
      
      $(document).on('keyup', null, onDocumentKeyUp);
    }
    
    function hideForm() {
      $editableBlock.removeClass('is-editable-active');
      $editableBlock.addClass('is-editable');
      my.clearCurrentValues();
      $(document).off('keyup', null, onDocumentKeyUp);
      trimTextInputs();
    }
    
    function trimTextInputs() {
      $container.find('input:textall').each(function(index, element) {
        var $element = $(element);
        var value = $element.val();
        if(value) {
          value = value.trim();
        }
        $element.val(value);
        //these events need to be triggered to make sure the placeholder is properly set
        $element.trigger('keyup');
        $element.trigger('blur');
      });
      
      $container.find('textarea').each(function(index, element) {
        var $element = $(element);
        var value = $element.val();
        if(value) {
          value = value.trim();
        }
        $element.val(value);
        //these events need to be triggered to make sure the placeholder is properly set
        $element.trigger('keyup');
        $element.trigger('blur');
        autosize.update($element);
      });
    }
    
    function serialize() {
      var data = formUtil.serializeJson($container.find('input, textarea, select'));
      var errors = formUtil.processSerializationPropertiesAndReturnErrorsIfAny($container, data);
      
      if(errors) {
        showValidationErrors(errors);
        return null;
      } else {
        return data;
      }
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors(spec.sectionId);
      formUtil.replaceWithEmptyDiv(spec.globalErrorMessageTargetId);
    }
    
    function showValidationErrors(errors) {
      var globalErrors = '';
      
      formUtil.routeSerializationPropertyErrorsToFormField($container, errors);
      
      errors.forEach(function(error) {
        var $field = $container.find('.field-group [name="' + error.field + '"]');
        
        if($field.length) {
          formUtil.addFieldError(error.field , error.message);
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
    
    //hide the form when hitting the escape key
    function onDocumentKeyUp(event) {
      if (event.keyCode == 27) {
        $cancelButton.trigger('click');
      }
    }
    
    my.processNewFormElements = processNewFormElements;
    my.saveCurrentValues = saveCurrentValues;
    my.restoreCurrentValues = restoreCurrentValues;
    my.clearCurrentValues = clearCurrentValues;
    
    that.showForm = showForm;
    that.hideForm = hideForm;
    that.serialize = serialize;
    that.clearAllErrors = clearAllErrors;
    that.showValidationErrors = showValidationErrors;
    that.showGlobalError = showGlobalError;
    
    return that;
  }
  
});