define(function(require) {
  var $ = require('jquery');
  var defaultModal = require('app/kui/modal/defaultModal');
  var jsMessages = require('jsMessages');
  var moment = require('momentI18n');
  var formUtil = require('app/util/formUtil');
  var timeUtil = require('app/util/timeUtil');
  var appContext = require('appContext');
  var urlProvider = require('app/common/urlProvider');
  
  var GLOBAL_ERROR_MESSAGE_TARGET = 'global-error-message';
  
  return function(spec) {
    spec = spec || {};
    spec.id = spec.id ||'modal-manage-booking';
    
    var my = {};
    
    var that = defaultModal(spec, my);
    
    var entryDetails;
    var currentUserId = appContext.user.id;
    var $modal = my.modal;
    var $noteTemplate;
    var $noteContainer = $modal.find('.chat-group');
    var $senderName = $modal.find('#modal-sender-display-name');
    var $senderImage = $modal.find('#modal-sender-image');
    var $sessionDate = $modal.find('#modal-session-date');
    var $sessionTime = $modal.find('#modal-session-time');
    var $street = $modal.find('#model-address-street');
    var $region = $modal.find('#model-address-region');
    var $country = $modal.find('#model-address-country');
    
    var $bookingRequestButtonsContainer = $modal.find('#booking-request-button-container');
    var $cancellationRequestButtonsContainer = $modal.find('#cancellation-request-button-container');
    var $cancellationResponseButtonsContainer = $modal.find('#cancellation-response-button-container');
    
    var $cancellingNoteDiv =  $modal.find('#cancelling-note-div');
    var $cancellingNoteInfo =  $modal.find('#cancelling-note-info');
    var $cancellingNoteContent =  $modal.find('#cancelling-note-content');
    var $responseNoteDiv =  $modal.find('#response-note-div');
    var $responseNoteInfo =  $modal.find('#response-note-info');
    var $responseNoteContent =  $modal.find('#response-note-content');
    var $requestingNoteDiv =  $modal.find('#requesting-note-div');
    var $requestingNoteInfo =  $modal.find('#requesting-note-info');
    var $requestingNoteContent =  $modal.find('#requesting-note-content');
    
    var $bookingRequestDeclineButton = $modal.find('#button-booking-request-decline');
    var $bookingRequestAcceptButton = $modal.find('#button-booking-request-accept');
    var $cancellationResponseAcceptButton = $modal.find('#button-cancellation-response-accept');
    var $cancellationRequestButton = $modal.find('#button-cancellation-request');
    
    var $noteInput = $modal.find('#input-note-textarea'); 
    var $responseDiv = $modal.find('#response-div'); 
    var $sendMessageButton = $modal.find('.action-chat-message'); 
    var $avatarImage = $modal.find('.avatar-image'); 
    
    function initialize() {
      $noteTemplate = $modal.find('.message-listing').clone();
      $modal.find('.message-listing').remove();
      addButtonListeners();
    }
    
    initialize();
    
    function addButtonListeners() {
      $bookingRequestDeclineButton.click(onBookingRequestDeclineClick);
      $bookingRequestAcceptButton.click(onBookingRequestAcceptClick);
      $cancellationResponseAcceptButton.click(onCancellationResponseAcceptClick);
      $cancellationRequestButton.click(onCancellationRequestClick);
    }
    
    function addNote(side, displayName, moment, message) {
      var $note = $noteTemplate.clone();
      $note.addClass('style-' + side);
      var header = displayName + ', ' + moment.calendar();
      $note.find('.meta-generic').html(header);
      $note.find('.message-text').html(message);
      $noteContainer.append($note);
    }
    
    function addUserNote(displayName, moment, message) {
      addNote('right', displayName, moment, message);
    }
    
    function addContactNote(displayName, moment, message) {
      addNote('left', displayName, moment, message);
    }
    
    function onBookingRequestDeclineClick(event){
      invokeBookingRequestDeclineCallback();
    }
    
    function invokeBookingRequestDeclineCallback(){
      if(spec.callbacks && spec.callbacks.bookingResponseClick) {      
        var bookingResponse = createBookingResponse();
        bookingResponse.responseStatus = 1;
        spec.callbacks.bookingResponseClick(bookingResponse);
      }        
    }
    
    function onBookingRequestAcceptClick(event){
      invokeBookingRequestAcceptCallback();
    }
    
    function invokeBookingRequestAcceptCallback(){
      if(spec.callbacks && spec.callbacks.bookingResponseClick) {
        var bookingResponse = createBookingResponse();
        bookingResponse.responseStatus = 0;
        spec.callbacks.bookingResponseClick(bookingResponse);
      }  
    }
    
    function onCancellationResponseAcceptClick(event){
      invokeCancellationResponseAcceptCallback();
    }
    
    function invokeCancellationResponseAcceptCallback(){
      if(spec.callbacks && spec.callbacks.cancellationResponseAcceptClick) {
       var cancellationResponse = createCancellationResponse();
       cancellationResponse.responseStatus = 0;
        spec.callbacks.cancellationResponseAcceptClick(cancellationResponse);
      } 
    }

    function onCancellationRequestClick(event){
 
        invokeCancellationRequestCallback();
    }
    
    function invokeCancellationRequestCallback(){
     if(spec.callbacks && spec.callbacks.cancellationRequestClick) {
        var cancellationRequest = createCancellationRequest()
        spec.callbacks.cancellationRequestClick(cancellationRequest);
      } 
    }

    function setBookingEntrtDetails(bookingEntrtDetails, displayName, profilePicture) {
      reset();
      
      entryDetails = bookingEntrtDetails;
      entryDetails.displayName = displayName;
      entryDetails.profilePicture = profilePicture;
      $senderName.text(displayName);
      $sessionDate.text(bookingEntrtDetails.date);
      $sessionTime.text(bookingEntrtDetails.startTime + "-" + bookingEntrtDetails.endTime);
      
      $street.text(bookingEntrtDetails.address.street + "," + bookingEntrtDetails.address.district + "," );
      $region.text(bookingEntrtDetails.address.locality + "," + bookingEntrtDetails.address.province + "," );   
      $country.text(bookingEntrtDetails.address.zipCode);
      
      setNotes(bookingEntrtDetails.notes, bookingEntrtDetails.status);
      
      hideButtonsContainers(bookingEntrtDetails.status, bookingEntrtDetails.senderId);
      
      var contactId;
      if(currentUserId == bookingEntrtDetails.senderId) {
        contactId = bookingEntrtDetails.receiverId;
      } else {
        contactId = bookingEntrtDetails.senderId;
      }
      $sendMessageButton.data('knbContactId', contactId);
      
      $avatarImage.attr('src', urlProvider.getAvatarSmallUrl(profilePicture));
      $avatarImage.attr('alt', displayName);
    }
    
    //this function sets the note history
    function setNotes(notes, status){
      $noteContainer.empty();
     //REQUESTING
      if(status == 1){ 
         if(notes[0].displayName == entryDetails.displayName){
           addContactNote(notes[0].displayName, moment(notes[0].sentAtDateTime, moment.ISO_8601), notes[0].content);
         }else{
           addUserNote(notes[0].displayName, moment(notes[0].sentAtDateTime, moment.ISO_8601), notes[0].content);
         }       
      }
      //SCHEDULED
      else if(status == 2){       
         if(notes[1].displayName == entryDetails.displayName){
           addContactNote(notes[1].displayName, moment(notes[1].sentAtDateTime, moment.ISO_8601), notes[1].content);
         }else{
           addUserNote(notes[1].displayName, moment(notes[1].sentAtDateTime, moment.ISO_8601), notes[1].content);
         }   
         
         if(notes[0].displayName == entryDetails.displayName){
           addContactNote(notes[0].displayName, moment(notes[0].sentAtDateTime, moment.ISO_8601), notes[0].content);
         }else{
           addUserNote(notes[0].displayName, moment(notes[0].sentAtDateTime, moment.ISO_8601), notes[0].content);
         }  
        //$responseNoteInfo.text(notes[1].displayName + '. ' + notes[1].sentAtDateTime  + '. ' + notes[1].sentAtTime);
        //$responseNoteContent.text(notes[1].content);
      }
      //CANCELLING
      else if(status == 3){
        if(notes[2].displayName == entryDetails.displayName){
          addContactNote(notes[2].displayName, moment(notes[2].sentAtDateTime, moment.ISO_8601), notes[2].content);
        }else{
          addUserNote(notes[2].displayName, moment(notes[2].sentAtDateTime, moment.ISO_8601), notes[2].content);
        }  
        
        if(notes[1].displayName == entryDetails.displayName){
          addContactNote(notes[1].displayName, moment(notes[1].sentAtDateTime, moment.ISO_8601), notes[1].content);
        }else{
          addUserNote(notes[1].displayName, moment(notes[1].sentAtDateTime, moment.ISO_8601), notes[1].content);
        }   
        
        if(notes[0].displayName == entryDetails.displayName){
          addContactNote(notes[0].displayName, moment(notes[0].sentAtDateTime, moment.ISO_8601), notes[0].content);
        }else{
          addUserNote(notes[0].displayName, moment(notes[0].sentAtDateTime, moment.ISO_8601), notes[0].content);
        }  
        //$responseNoteInfo.text(notes[1].displayName + '. ' + notes[1].date  + '. ' + notes[1].sentAtTime);
        //$responseNoteContent.text(notes[1].content);
        //$cancellingNoteInfo.text(notes[2].displayName + '. ' + notes[2].date  + '. ' + notes[2].sentAtTime);
        //$cancellingNoteContent.text(notes[2].content);
      }           
    }
    
    function hideButtonsContainers(status, senderId){
      if((currentUserId == senderId) && !(status == 2)){
        console.log("this message can not be replied" + "currentUserId: " + currentUserId + "senderId: " + senderId);
        $responseDiv.hide();
      }
      //REQUESTING
      else if(status == 1){
        console.log("the status is: " + status);
        $responseDiv.show();
        $cancellationRequestButtonsContainer.hide() ;
        $cancellationResponseButtonsContainer.hide();  
        $bookingRequestButtonsContainer.show();
      }
      //SCHEDULED
      else if(status == 2){
        console.log("the status is: " + status);
        $responseDiv.show();
        $bookingRequestButtonsContainer.hide() ;
        $cancellationResponseButtonsContainer.hide(); 
        $cancellationRequestButtonsContainer.show() ;
      }
      //CANCELLING
      else if(status == 3){
        console.log("the status is: " + status);
        $responseDiv.show();
        $bookingRequestButtonsContainer.hide() ;
        $cancellationRequestButtonsContainer.hide() ;
        $cancellationResponseButtonsContainer.show();
      }     
    }

    function reset() {
      
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors('modal-manage-booking');
      formUtil.replaceWithEmptyDiv(GLOBAL_ERROR_MESSAGE_TARGET);
    }
    
    function showGlobalError(message) {
      formUtil.replaceWithErrorMessage(GLOBAL_ERROR_MESSAGE_TARGET, message)
    }
    
    function createBookingResponse(){
      var bookingResponse = {};
  
      bookingResponse.recipientId = entryDetails.senderId;   
      bookingResponse.conversationId = entryDetails.conversationId;
      bookingResponse.message = $noteInput.val(); 
      bookingResponse.responseStatus = 1; 
      
      return bookingResponse;
    }
    
    function createCancellationRequest(){
      var cancellationRequest = {};
      if(currentUserId == entryDetails.senderId){
        cancellationRequest.recipientId = entryDetails.receiverId;
      }else{
        cancellationRequest.recipientId = entryDetails.senderId;
      } 
      cancellationRequest.conversationId = entryDetails.conversationId;
      cancellationRequest.message = $noteInput.val();
      
      return cancellationRequest;     
    }
    
    function createCancellationResponse(){
      var cancellationResponse = {};
      cancellationResponse.recipientId = entryDetails.senderId;
      cancellationResponse.conversationId = entryDetails.conversationId;
      cancellationResponse.message = $noteInput.val();
      cancellationResponse.responseStatus = 1;
      
      return cancellationResponse;     
    }

    that.setBookingEntrtDetails = setBookingEntrtDetails;
    that.showGlobalError = showGlobalError;
    that.clearAllErrors = clearAllErrors;
    
    return that;
  }
  
    
});