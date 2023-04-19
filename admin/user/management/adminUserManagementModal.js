define(function(require) {
  var $ = require('jquery');
  var moment = require('momentI18n');
  var adminFormUtil = require('app/util/adminFormUtil');
  var timeUtil = require('app/util/timeUtil');
  var E = require('app/common/enum');

  var SCRIPT_NAME = 'adminUserManagementModal';
  
  return function(spec) {
    spec = spec || {};
    spec.id = spec.id || 'modal-user-management';
    
    var that = $({});
    
    var $modal;
    var $navTabs;
    
    function initialize() {
      $modal = $('#' + spec.id);
      $navTabs = $modal.find('a[data-toggle="tab"]');
      $navTabs.click(function(event) {
        if($(this).parent('li').hasClass('disabled')) {
          return false;
        }
      });
      
      initializeGeneralTab();
    }
    
    function initializeGeneralTab() {
      //any general tab initializations
    }
    
    $(document).ready(function() {
      initialize();
    });
    
    function show(data) {
      renderView(data);
      $modal.modal({
        keyboard: false,
        show: true
      });
    }
    
    function hide() {
      $modal.modal('hide');
    }
    
    function throwError(message) {
      throw SCRIPT_NAME + ': ' + message;
    }
    
    function renderView(data) {
      if(!data) {
        throwError('cannot render view, the specified data is empty');
      }
      
      renderGeneralTab(data);
    }
    
    function renderGeneralTab(data) {
      adminFormUtil.populateFormFromJson('form-general', data);
    }
    
    that.show = show;
    that.hide = hide;

    return that;
  }
  
});