define(function(require) {

var $ = require('jquery');
  var jsMessages = require('jsMessages');
  var schedulingService = require('app/scheduling/schedulingService');
  var moment = require('momentI18n');
  var browserUtil = require('app/util/browserUtil');
  var manageSessionBookingCalendarView = require('app/scheduling/sessionbooking/manageSessionBookingCalendarView');
  var permissionManager = require('app/user/permissionManager');
  var manageSessionBookingModal = require('app/scheduling/sessionbooking/manageSessionBookingModal');
  var appContext = require('appContext');
  var errorCodes = require('app/common/errorCodes');
  var defaultDialog = require('app/kui/dialog/defaultDialog')
  
  var PERMISSION_MANAGER_ERROR_KEY = 'error.permissionmanager';
  
  $(document).ready(function() {
    
    var requestedDate = null;
    var selectedSessionId = null;
    
    var sendMessageCompleteDialog = defaultDialog({
      id: 'dialog-a',
      showCloseButton: true,
      message: 'blank'
    });
    
    var permissionManagerErrorDialog = defaultDialog({
      id: 'permission-manager-error-dialog',
      showCloseButton: true
    });
    
    var calendarView = manageSessionBookingCalendarView({
      callbacks: {
        entryClick: onEntryClick
      }
    });
    
    var managementModal = manageSessionBookingModal({
      callbacks: {
       bookClick: onSessionBookingClick
      }
    });
    
    function onEntryClick(date, start, end, tutorId) {
      permissionManager.executeIfLoggedInAndActivatedOrShowModal(function() {
        managementModal.setBookingSessionForDate(date, start, end, tutorId);
        managementModal.show();
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
   
    function onSessionBookingClick(bookingSession) {
      schedulingService.createBookingSession(bookingSession, onCreateBookingSessionCompleted, onCreateBookingSessionFailed);
    }
    
    function onCreateBookingSessionCompleted(result) {
      //TODO MIAOMIAO
      if(result.data == "ACTIVATION_PENDING"){
          console.log("ACTIVATION_PENDING" + JSON.stringify(result.data));
      }else{         
        sendMessageCompleteDialog.setMessage(jsMessages("bookingrequestsentdialog"));
        sendMessageCompleteDialog.show({
          onHide: function() {
            browserUtil.reload();
          }
        });
      }      
    }
    
    function onCreateBookingSessionFailed(result) {
      var errorHandled = false;
      
      managementModal.clearAllErrors();
      
      if(result && result.jqXHR) {
        if(result.jqXHR.responseJSON && result.jqXHR.responseJSON.code) {
          switch(result.jqXHR.responseJSON.code) {
            case errorCodes.VALIDATION_CONSTRAINT_VIOLATION:
              errorHandled = true;
              managementModal.showValidationErrors(result.jqXHR.responseJSON.errors);
              break;
          }
        } else if(result.jqXHR.responseText) {
          errorHandled = true;
          managementModal.showGlobalError(result.jqXHR.responseText);
        }
      }
      
      if(!errorHandled) {
        managementModal.showGlobalError(jsMessages("error.system"));
      }
    }
      
  });

});
  