define(function(require) {
  var $ = require('jquery');
  var jsRoutes = require('jsRoutes');
  var jsMessages = require('jsMessages');
  var browserUtil = require('app/util/browserUtil');
  var showProfileView = require('app/profile/detail/showProfileView');
  var templatePlaceholders = require('app/common/templatePlaceholders');
  var permissionManager = require('app/user/permissionManager');
  var defaultDialog = require('app/kui/dialog/defaultDialog')
  var requestTutorModal = require('app/profile/detail/requestTutorModal');
  var messagingService = require('app/messaging/messagingService');
  
  console.log('show profile module loaded: ');
  
  var PERMISSION_MANAGER_ERROR_KEY = 'error.permissionmanager';
  
  var profileView;
  var calendarUrlTemplate;
  var permissionManagerErrorDialog;
  var sendTutorRequestMessageCompleteDialog;
  var requestModal;
  var requestedTutorId;
  
  $(document).ready(function() {
    calendarUrlTemplate = $('#tutor-profile-calendar').data('knbCalendarUrlTemplate');
    
    profileView = showProfileView({
      callbacks: {
        compactCalendarDateClick: onCompactCalendarDateClick,
        requestTutorClick: onRequestTutorClick
      }
    });
    
    permissionManagerErrorDialog = defaultDialog({
      id: 'permission-manager-error-dialog',
      showCloseButton: true
    });
    
    sendTutorRequestMessageCompleteDialog = defaultDialog({
      id: 'tutor-request-sent-dialog',
      showCloseButton: true,
      successTitle: jsMessages("thankyou"),
      message: jsMessages("scheduling.requesttutor.success")
    });
    
    requestModal = requestTutorModal({
      callbacks: {
       sendRequestClick: onSendRequestClick
      }
    });
  });
  
  function onCompactCalendarDateClick(date) {
    var url = calendarUrlTemplate.replace(templatePlaceholders.TUTOR_PROFILE_CALENDAR_DATE, date);
    browserUtil.navigateTo(url);
  }
  
  function onRequestTutorClick(tutorId) {
    permissionManager.executeIfLoggedInAndActivatedOrShowModal(function() {
      requestedTutorId = tutorId;
      requestModal.show();
    }, function(result) {
      var errorMessage;
      if(result && result.jqXHR) {
        errorMessage = browserUtil.createErrorMessageFromJqXhr(result.jqXHR, PERMISSION_MANAGER_ERROR_KEY);
      } else {
        errorMessage = jsMessages(PERMISSION_MANAGER_ERROR_KEY);
      }
      
      permissionManagerErrorDialog.setErrorTitle();
      permissionManagerErrorDialog.setMessage(errorMessage);
      permissionManagerErrorDialog.show();
    });
  }
  
  function onSendRequestClick(data) {
    messagingService.sendTutorRequestMessage(requestedTutorId, data, onSendTutorRequestMessageCompleted, onSendTutorRequestMessageFailed);
  }
  
  function onSendTutorRequestMessageCompleted(result) {
    sendTutorRequestMessageCompleteDialog.show();
  }
  
  function onSendTutorRequestMessageFailed(result) {
    requestModal.showErrorsFromJqXhr(result.jqXHR);
  }
  
});
