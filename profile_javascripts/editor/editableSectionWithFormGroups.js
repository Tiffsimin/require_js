define(function(require) {
  var $ = require('jquery');
  var validationUtil = require('app/util/validationUtil');
  var formUtil = require('app/util/formUtil');
  var stringUtil = require('app/util/stringUtil');
  var editableSection = require('app/profile/editor/editableSection'); 
  
  var SCRIPT_NAME = 'editableSectionWithFormGroups';
  var FIELD_INDEX_PLACEHOLDER = '___FIELD_INDEX___';
  
  return function(spec) {
    spec = spec || {};
    
    var my = {};
    
    var that = editableSection(spec, my);
    var super_serialize = that.serialize;
    var super_saveCurrentValues = my.saveCurrentValues;
    var super_restoreCurrentValues = my.restoreCurrentValues;
    var $container = my.container;
    var template;
    var currentValues;
    var $formGroupContainer;
    var $addButton;
    
    var bracketIndexRegExp = new RegExp('.*' + spec.formGroupFieldName + '\\[(.+)\\].*');
    var underscoreIndexRegExp = new RegExp('.*' + spec.formGroupFieldName + '_(.+)_.*');
    
    function initialize() {
      validationUtil.checkNotBlank(SCRIPT_NAME, spec, 
              ['formGroupFieldName', 
               'formGroupTemplateFieldName',
               'formGroupClass',
               'formGroupContainerClass',
               'formGroupTemplateContainerClass']);
      createTemplate();
      $formGroupContainer = $container.find('.' + spec.formGroupContainerClass);
      $addButton = $container.find('.action-add');
      registerClickListeners();
    }
    initialize();
    
    function createTemplate() {
      $template = $container.find('.' + spec.formGroupTemplateContainerClass);
      
      formUtil.removeGlobalStylesFromFormElements($template);
      
      template = $template.html();
      
      var templateFieldName = spec.formGroupTemplateFieldName + '[0]';
      var formGroupFieldName = spec.formGroupFieldName + '[' + FIELD_INDEX_PLACEHOLDER + ']';
      template = stringUtil.replaceAll(template, templateFieldName, formGroupFieldName);
      
      var templateFieldId = spec.formGroupTemplateFieldName + '_0_';
      var formGroupFieldId = spec.formGroupFieldName + '_' + FIELD_INDEX_PLACEHOLDER + '_';
      template = stringUtil.replaceAll(template, templateFieldId, formGroupFieldId);
      
      $template.remove();
    }
    
    function registerClickListeners() {
      $addButton.click(function(event){
        event.preventDefault();
        addGroup();
      });
      
      registerRemoveButtonClickListeners();
    }
    
    function registerRemoveButtonClickListeners() {
     $container.find('.action-remove').click(function(event){
       event.preventDefault();
       removeGroup($(this).closest('.' + spec.formGroupClass));
     });
    }
    
    function addGroup() {
      var nbFormGroups = $container.find('.' + spec.formGroupClass).length;
      var $group = $(stringUtil.replaceAll(template, FIELD_INDEX_PLACEHOLDER, nbFormGroups));
      $group.appendTo($formGroupContainer);
      formUtil.applyGlobalStylesToNewFormElements($group);
      registerRemoveButtonClickListeners();
      my.processNewFormElements($group);
    }
    
    function removeGroup(group) {
      $group = $(group);
      
      $group.nextAll('.' + spec.formGroupClass).each(function(i, formGroup) {
        var $formGroup = $(formGroup);
        formUtil.removeGlobalStylesFromFormElements($formGroup);
        parseAllAttributesAndUpdateGroupIndex($formGroup.find('input[type=hidden],[name],[id],[for],[value]'));
        formUtil.applyGlobalStylesToNewFormElements($formGroup);
      });
      
      $group.next('hr').remove();
      $group.remove();
    }
    
    function parseAllAttributesAndUpdateGroupIndex(elements) {
      if(!elements) {
        return;
      }
      
      var currentIndex = null;
      var bracketSearchValue = null;
      var bracketNewValue = null;
      var underscoreSearchValue = null;
      var underscoreNewValue = null;
      
      elements.each(function(i, element) {
        var match;
        var dataKey;
        $element = $(element);
        var attributes = $element.attr(); 
        for(var attribute in attributes) {
          var value = attributes[attribute];
          if(bracketIndexRegExp.test(value)) {
            if(currentIndex === null) {
              match = bracketIndexRegExp.exec(value);
              currentIndex = parseInt(match[1]);
            }
            
            if(bracketSearchValue === null) {
              bracketSearchValue = spec.formGroupFieldName + '[' + currentIndex + ']';
              bracketNewValue = spec.formGroupFieldName + '[' + (currentIndex - 1) + ']';
            }
            
            value = value.replace(bracketSearchValue, bracketNewValue);
            $element.attr(attribute, value);
            
            if(attribute.indexOf('data-') === 0) {
              dataKey = stringUtil.dashToCamelCase(attribute.substr(5));
              $element.data(dataKey, value);
            }
          } else if(underscoreIndexRegExp.test(value)) {
            if(currentIndex === null) {
              match = underscoreIndexRegExp.exec(value);
              currentIndex = parseInt(match[1]);
            }
            
            if(underscoreSearchValue === null) {
              underscoreSearchValue = spec.formGroupFieldName + '_' + currentIndex + '_';
              underscoreNewValue = spec.formGroupFieldName + '_' + (currentIndex - 1) + '_';
            }
            
            value = value.replace(underscoreSearchValue, underscoreNewValue);
            $element.attr(attribute, value);
            
            if(attribute.indexOf('data-') === 0) {
              dataKey = stringUtil.dashToCamelCase(attribute.substr(5));
              $element.data(dataKey, value);
            }
          }
        }
      });
    }
    
    function saveCurrentValues() {
      super_saveCurrentValues();
      formUtil.removeGlobalStylesFromFormElements($formGroupContainer);
      currentValues = $formGroupContainer.clone(true, true);
      formUtil.applyGlobalStylesToNewFormElements($formGroupContainer);
    }
    
    function restoreCurrentValues() {
      if(!currentValues) {
        return;
      }
      
      $formGroupContainer.replaceWith(currentValues);
      formUtil.applyGlobalStylesToNewFormElements(currentValues);
      $formGroupContainer = $container.find('.' + spec.formGroupContainerClass);
      super_restoreCurrentValues();
      currentValues = null;
    }
    
    function clearCurrentValues() {
      if(!currentValues) {
        return;
      }
      
      currentValues = null;
    }
    
    function serialize() {
      removeEmptyFormGroups();
      
      var result = super_serialize();
      
      if(result !== null) {
        if($.isEmptyObject(result)) {
          result[spec.formGroupFieldName] = null;
        }
      }
      
      return result;
    }
    
    function removeEmptyFormGroups() {
      $container.find('.' + spec.formGroupClass).each(function(i, formGroup) {
        
        var allInputsEmpty = true;
        var $formGroup = $(formGroup);
        
        $formGroup.find('input:textall, select, input[type=radio]:checked, textarea').each(function(index, element) {
          var $element = $(element);
          if($element.val() !== '') {
            allInputsEmpty = false;
            return false;
          }
        });
        
        if(allInputsEmpty) {
          removeGroup($formGroup);
        }
      });
    }
    
    my.saveCurrentValues = saveCurrentValues;
    my.restoreCurrentValues = restoreCurrentValues;
    my.clearCurrentValues = clearCurrentValues;
    
    that.serialize = serialize;
    
//    that.showForm = showForm;
    
    return that;
  }
  
});