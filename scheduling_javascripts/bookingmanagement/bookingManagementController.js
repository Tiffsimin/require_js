define(function(require) {

var $ = require('jquery');
  var jsMessages = require('jsMessages');
  var schedulingService = require('app/scheduling/schedulingService');
  var moment = require('momentI18n');
  var browserUtil = require('app/util/browserUtil');
  var bookingManagementView = require('app/scheduling/bookingmanagement/bookingManagementView');
  var bookingManagementModal = require('app/scheduling/bookingmanagement/bookingManagementModal');
  var errorCodes = require('app/common/errorCodes');
  var appContext = require('appContext');
  var defaultDialog = require('app/kui/dialog/defaultDialog')
  
  $(document).ready(function() {
    var currentUserId = appContext.user.id;
    var displayName;
    var profilePicture;
    
    var sendMessageCompleteDialog = defaultDialog({
      id: 'dialog-a',
      showCloseButton: true,
      message: 'blank'
    });
    
    var view = bookingManagementView({
      callbacks: {
        entryClick: onEntryClick
      }
    });
    
    var managementModal = bookingManagementModal({
      callbacks: {
        bookingResponseClick: onBookingResponseClick,
        cancellationResponseAcceptClick: onCancellationResponseAcceptClick,
        cancellationRequestClick: onCancellationRequestClick
      }
    });
    
    function onEntryClick(conversationId, senderId, entryDisplayName, entryProfilePicture) {
      displayName = entryDisplayName;
      profilePicture = entryProfilePicture;
      console.log("DisplayName is: " + displayName + "; Profile picture is: " + profilePicture);
      schedulingService.getBookingDetailsForConversationId(conversationId, currentUserId,
              onGetBookingDetailsForConversationIdCompleted, onGetBookingDetailsForConversationIdFailed)     
    } 
    
    function onGetBookingDetailsForConversationIdCompleted(result){
        managementModal.setBookingEntrtDetails(result.data.bookingEntryDetails, displayName, profilePicture);
        managementModal.show();   
    }
    
    function onGetBookingDetailsForConversationIdFailed(result){
      console.error("an error occurred while trying to retrieve the BookingDetails: " + JSON.stringify(result.data));
      
    }
    
    function onBookingResponseClick(bookingResponse){
      schedulingService.createBookingResponseInfo(bookingResponse, onCreateBookingResponseInfoCompleted, onCreateBookingResponseInfoFailed);
    }
    
    
   function onCreateBookingResponseInfoCompleted(result){
     //console.log("BookingResponseInfo: " + JSON.stringify(result.data)); 
     if(result.data.responseStatus == 'CONFIRMED'){
       sendMessageCompleteDialog.setMessage(jsMessages("bookingconfirmationsentdialog"));
     }else{//responseStatus":"DECLINED  
       sendMessageCompleteDialog.setMessage(jsMessages("bookingrejectionsentdialog"));
     }      
     sendMessageCompleteDialog.show({
       onHide: function() {
         browserUtil.reload();
       }
     });
    }
    
    function onCreateBookingResponseInfoFailed(result){
      console.error("an error occurred while trying to create booking response info: " + JSON.stringify(result.data));     
    }
  
    function onCancellationResponseAcceptClick(cancellationResponse){
      console.log("onCancellationResponseAcceptClick clicked");
      schedulingService.createCancellationResponseInfo(cancellationResponse, onCreateCancellationResponseInfoCompleted, onCreateCancellationResponseInfoFailed);     
    }
    
    function onCreateCancellationResponseInfoCompleted(result){
      console.log("CancellationResponseInfo: " + JSON.stringify(result.data));    
      sendMessageCompleteDialog.setMessage(jsMessages('cancellationresponsesentdialog'));
      sendMessageCompleteDialog.show({
        onHide: function() {
          browserUtil.reload();
        }
      });
    }
    
    function onCreateCancellationResponseInfoFailed(result){
      console.error("an error occurred while trying to create cancellation response info: " + JSON.stringify(result.data));
    }
  
    function onCancellationRequestClick(cancellationRequest){
      console.log("onCancellationRequestClick clicked");
      schedulingService.createCancellationRequestInfo(cancellationRequest, onCreateCancellationRequestInfoCompleted, onCreateCancellationRequestInfoFailed);   
    }
    
    function onCreateCancellationRequestInfoCompleted(result){
      console.log("CancellationRequestInfo: " + JSON.stringify(result.data));     
      sendMessageCompleteDialog.setMessage(jsMessages("cancellationrequestsentdialog"));
      sendMessageCompleteDialog.show({
        onHide: function() {
          browserUtil.reload();
        }
      });
    }
    
    function onCreateCancellationRequestInfoFailed(result){
      console.error("an error occurred while trying to create cancellation request info: " + JSON.stringify(result.data));
    }
    
   
  });

});
  