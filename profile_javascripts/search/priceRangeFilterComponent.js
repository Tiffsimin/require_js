define(function(require) {
  var $ = require('jquery');
  var defaultDropDownComponent = require('app/kui/form/dropdown/defaultDropDownComponent');
  
  return function(spec) {
    spec = spec || {};
    spec.dropDownId = spec.dropDownId || 'filter-priceRange';
    
    var that = defaultDropDownComponent(spec);
    var $container = that.container;
    
    function initialize() {
      registerRadioListeners();
    }
    initialize();
    
    function registerRadioListeners() {
      $container.find('input:radio').on('ifChanged', function(event){
        if(hasSelection()) {
          invokeChangeCallback();
          that.close();
        }
      });
    }
    
    function invokeChangeCallback() {
      if(spec.callbacks && spec.callbacks.change) {
        spec.callbacks.change();
      }
    }
    
    function getSelectedValue() {
      return $container.find('input:radio:checked');
    }
    
    function getFilterName() {
      return "priceRange";
    }
    
    function deselectAll() {
      $container.icheck('unchecked');
    }
    
    function hasSelection() {
      return getSelectedValue().length > 0;
    }
    
    function serialize() {
      if(hasSelection()) {
        var selectedValue = getSelectedValue();
        var result = 'minHourlyRate::' + selectedValue.data("knbMinPrice");
        
        var maxHourlyRate = selectedValue.data("knbMaxPrice");
        if(maxHourlyRate) {
          result += "|maxHourlyRate::" + maxHourlyRate;
        }
        
        return result;
      } else {
        return null;
      }
    }
    
    that.getFilterName = getFilterName;
    that.deselectAll = deselectAll;
    that.deselectValue = deselectAll;
    that.hasSelection = hasSelection;
    that.serialize = serialize;
    
    return that;
  }
  
});