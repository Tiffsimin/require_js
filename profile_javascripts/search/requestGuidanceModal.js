define(function(require) {
  var $ = require('jquery');
  var defaultModal = require('app/kui/modal/defaultModal');
  var formUtil = require('app/util/formUtil');
  
  return function(spec) {
    spec = spec || {};
    spec.id = spec.id || 'modal-request-guidance';
    
    var my = {};
    
    var that = defaultModal(spec, my);
    
    var super_show = that.show;
    var $modal = my.modal;
    var $sendButton = $modal.find('#button-send');
    var formId = $modal.find('form').attr('id');
    
    function initialize() {
      $sendButton.click(function(event) {
        event.preventDefault();
        clearAllErrors();
        invokeSendRequestClickCallback();
      });
    }
    initialize();

    function showErrorsFromJqXhr(jqXhr) {
      formUtil.renderFormErrorsFromJqXhr(formId, jqXhr);
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors(formId);
    }
    
    function invokeSendRequestClickCallback() {
      if(spec.callbacks && spec.callbacks.sendRequestClick) {
        var data = formUtil.serializeFormToJson(formId); 
        spec.callbacks.sendRequestClick(data);
      }
    }
    
    function show() {
      formUtil.resetForm(formId);
      super_show();
      autosize.destroy($modal.find('.style-auto-expand textarea'));
      autosize($modal.find('.style-auto-expand textarea'));
    }
    
    that.show = show;
    that.showErrorsFromJqXhr = showErrorsFromJqXhr;

    return that;
  }
  
});

