define(function(require) {
  var $ = require('jquery');
  var adminFormUtil = require('app/util/adminFormUtil');
  var jsMessages = require('jsMessages');
  var E = require('app/common/enum');

  $(document).ready(function() {
    
    $('.sidebar-menu .bg-success').each(function(i, element) {
      var $element = $(element);
      if($(element).parent().children('.sub-menu').length) {
        $element.siblings('a').click();
      }
    });
    
    $('.autonumeric').autoNumeric('init');
    
    $.validator && $.validator.setDefaults({
      ignore: '.validation-ignore',
      focusInvalid: false,
      onfocusout: false,
      onkeyup: function(element, event ) {
        if (event.which === E.KEY.TAB) {
          return
        }
        
        var $element = $(element);
        if ($element.valid()) {
          adminFormUtil.clearFieldError($element.attr('name'));
        }
      },
      errorPlacement: function(error, element) {
        adminFormUtil.addFieldError(element.attr('name'), error.html()); 
      },
      highlight: function( element, errorClass, validClass ) {
        adminFormUtil.addFieldErrorHighlightOnly($(element).attr('name'));
      },
      unhighlight: function( element, errorClass, validClass ) {
        adminFormUtil.clearFieldError($(element).attr('name'));
      }
    });
    
  });
  
});
