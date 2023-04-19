define(function(require) {
  var $ = require('jquery');

  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    
    
    
    function initialize() {
      addEntryListeners();
    }
    initialize();
    
    function addEntryListeners() {
      console.log("add EntryListeners called");
      //$('.table-calendar .meta-booking').click(onBookingEntryClick);
      //To handle both the entries in the booking message list and the calendar entries 
      $('.meta-booking').click(onBookingEntryClick);
    }
    
    
    function invokeEntryClickCallback(conversationId, senderId, displayName, profilePicture) {
      if(spec.callbacks && spec.callbacks.entryClick) {
        spec.callbacks.entryClick(conversationId, senderId, displayName, profilePicture);
      }
    }
    
    
    function onBookingEntryClick(event) {
      $this = $(this);
      
      console.log("is requested: " + $this.hasClass('is-requested'));
      
      console.log("entry clicked");
      event.preventDefault();
      $entry = $(this);
      var conversationId = $entry.data('knbBookingConversationId');
      var senderId = $entry.data('knbSenderId');
      var displayName = $entry.data('knbDisplayName');
      var profilePicture = $entry.data('knbProfilePicture');
      invokeEntryClickCallback(conversationId, senderId, displayName, profilePicture);
    }

    return that;
  }
  
});
