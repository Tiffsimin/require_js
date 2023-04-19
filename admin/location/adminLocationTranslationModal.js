define(function(require) {
  var $ = require('jquery');
  var adminFormUtil = require('app/util/adminFormUtil');

  return function(spec) {
    var spec = spec || {};
    var that = $({});
    
    var $modal;
    var $chineseField;
    var $translationInput;
    var formId;
    
    function initialize() {
      $modal = $('#modal-location-translation');
      $idField = $modal.find('[name=id]');
      $chineseField = $modal.find('.field-chinese-translation');
      $translationInput = $modal.find('[name=translation]');
      formId = $modal.find('form').attr('id');
      
      $('#' + formId).validate({
        rules: {
          'sortWeight': {
            digits: true
          }
        },
        submitHandler: function(form) {
          var data = adminFormUtil.serializeJson(formId);
          invokeSaveClickCallback(data);
        }
      });
    }
    
    $(document).ready(function() {
      initialize();
    });
    
    function invokeSaveClickCallback(data) {
      if(spec.callbacks && spec.callbacks.saveClick) {
        spec.callbacks.saveClick(data);
      }
    }
    
    function show(data) {
      adminFormUtil.resetForm(formId);
      adminFormUtil.populateFormFromJson(formId, data);
      $chineseField.html(data.translations[1]);
      $translationInput.val(data.translations[0]);
      $modal.modal('show');
      setTimeout(function() {
        $translationInput.focus();
      }, 500);
    }
    
    function hide() {
      $modal.modal('hide');
    }
    
    function showErrorsFromJqXhr(jqXhr) {
      adminFormUtil.renderFormErrorsFromJqXhr(formId, jqXhr);
    }
    
    that.show = show;
    that.hide = hide;
    that.showErrorsFromJqXhr = showErrorsFromJqXhr;
    
    return that;
  };
  
});