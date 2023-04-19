define(function(require) {
  var $ = require('jquery');
  var jsRoutes = require('jsRoutes');
  var adminFormUtil = require('app/util/adminFormUtil');
  var adminUserService = require('app/admin/user/adminUserService'); 

  return function create() {
    var that = $({});
    
    var $userProfileModal;
    var $accountDeletionModal;
    var accountDeletionFormId;
    var idToDelete;
    var $accountStatusChangeModal;
    var $accountStatusSelect;
    var accountStatusChangeFormId;
    var idToChange;
    
    function initialize() {
      initializeUserProfileModal();
      initializeAccountDeletionModal();
      initializeAccountStatusChangeModal();
    }
    
    function initializeUserProfileModal() {
      $userProfileModal = $('#modal-user-profile');
      $('body').on('click', '[data-knb-action="show-user-profile"]', function (event) {
        var id = $(this).data('knbUserId');
        var url = jsRoutes.controllers.ProfileController.showTutorProfile(id).url;
        $userProfileModal.find('iframe').attr('src', url);
        $userProfileModal.modal('show');
      });
    }
    
    function initializeAccountDeletionModal() {
      $accountDeletionModal = $('#modal-delete-account');
      accountDeletionFormId = $accountDeletionModal.find('form').attr('id');
      
      $('body').on('click', '[data-knb-action="delete-account"]', function (event) {
        adminFormUtil.resetForm(accountDeletionFormId);
        idToDelete = $(this).data('knbUserId');
        $accountDeletionModal.modal('show');
      });
      
      $('#' + accountDeletionFormId).validate({
        rules: {
          'deletionReason': {
            required: true
          }
        },
        submitHandler: function(form) {
          var data = adminFormUtil.serializeJson(accountDeletionFormId);
          adminUserService.deleteAccount(idToDelete, data, function(result) {
            that.trigger('update.knb');
            $accountDeletionModal.modal('hide');
          }, function onUserServiceError(result) {
            adminFormUtil.renderFormErrorsFromJqXhr(accountDeletionFormId, result.jqXHR);
          });
        }
      });
    }
    
    function initializeAccountStatusChangeModal() {
      $accountStatusChangeModal = $('#modal-change-account-status');
      $accountStatusSelect = $accountStatusChangeModal.find('#accountStatus');
      accountStatusChangeFormId = $accountStatusChangeModal.find('form').attr('id');
      
      $('body').on('click', '[data-knb-action="change-account-status"]', function (event) {
        adminFormUtil.resetForm(accountStatusChangeFormId);
        idToChange = $(this).data('knbUserId');
        
        var presetAccountStatus = $(this).data('knbSetAccountStatus');
        if(presetAccountStatus) {
          $accountStatusSelect.select2('val', presetAccountStatus);
          $accountStatusSelect.select2('disable');
        }
        
        $accountStatusChangeModal.modal('show');
      });
      
      $('#' + accountStatusChangeFormId).validate({
        rules: {
          'accountStatus': {
            required: true
          },
          'changeReason': {
            required: true
          }
        },
        submitHandler: function(form) {
          $accountStatusSelect.select2('enable');
          var data = adminFormUtil.serializeJson(accountStatusChangeFormId);
          adminUserService.changeAccountStatus(idToChange, data, function(result) {
            that.trigger('update.knb');
            $accountStatusChangeModal.modal('hide');
          }, function onUserServiceError(result) {
            adminFormUtil.renderFormErrorsFromJqXhr(accountStatusChangeFormId, result.jqXHR);
          });
        }
      });
    }
    
    $(document).ready(function() {
      initialize();
    });
    
    function hideModals() {
      $userProfileModal.modal('hide');
    }
    
    return that;
  }();
  
});