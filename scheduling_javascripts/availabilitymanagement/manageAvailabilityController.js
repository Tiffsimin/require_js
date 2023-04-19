define(function(require) {
  var $ = require('jquery');
  var jsMessages = require('jsMessages');
  var schedulingService = require('app/scheduling/schedulingService');
  var moment = require('momentI18n');
  var browserUtil = require('app/util/browserUtil');
  var manageAvailabilityCalendarView = require('app/scheduling/availabilitymanagement/manageAvailabilityCalendarView');
  var manageAvailabilityModal = require('app/scheduling/availabilitymanagement/manageAvailabilityModal');
  var confirmAvailabilityDeletionModal = require('app/scheduling/availabilitymanagement/confirmAvailabilityDeletionModal');
  var confirmSingleAvailabilityDeletionModal = require('app/scheduling/availabilitymanagement/confirmSingleAvailabilityDeletionModal');
  var errorCodes = require('app/common/errorCodes');
        
  $(document).ready(function() {
    
    var requestedDate = null;
    var selectedAvailabilityId = null;
    
    var calendarView = manageAvailabilityCalendarView({
      callbacks: {
        dateCellClick: onDateCellClick,
        entryClick: onEntryClick
      }
    });
    
    var managementModal = manageAvailabilityModal({
      callbacks: {
        deleteClick: onAvailabilityDeleteClick,
        saveClick: onAvailabilitySaveClick
      }
    });
    
    var confirmDeletionModal = confirmAvailabilityDeletionModal({
      callbacks: {
        deleteFutureClick: onDeleteFutureClick,
        deleteSingleClick: onDeleteSingleClick
      }
    });
    
    var confirmSingleDeletionModal = confirmSingleAvailabilityDeletionModal({
      callbacks: {
        deleteYesClick: onDeleteYesClick,
        deleteNoClick: onDeleteNoClick
      }
    });
    
    function onDateCellClick(date) {
      managementModal.clearAllErrors();
      requestedDate = date;
      selectedAvailabilityId = null;
      
      schedulingService.getAvailabilitiesForDate(requestedDate, 
              onGetAvailabilitiesForDateCompleted, onGetAvailabilitiesForDateFailed);
    }
    
    function onEntryClick(date, availabilityId) {
      managementModal.clearAllErrors();
      requestedDate = date;
      selectedAvailabilityId = availabilityId;
      
      schedulingService.getAvailabilitiesForDate(requestedDate, 
              onGetAvailabilitiesForDateCompleted, onGetAvailabilitiesForDateFailed);
    } 
    
    function onGetAvailabilitiesForDateCompleted(result) {
      if(result.params.date == requestedDate) {
        managementModal.setAvailabilitiesForDate(result.data.availabilities, result.params.date, selectedAvailabilityId);
        managementModal.show();
      }
    }
    
    function onGetAvailabilitiesForDateFailed(result) {
      console.error("an error occurred while trying to retrieve the availabilities for date '" + result.params.date + "': " + JSON.stringify(result.jqXHR));
    }
    
    function onAvailabilityDeleteClick(availability) {
      if (availability.weeklyRecurrence == null){
        confirmSingleDeletionModal.setAvailability(availability);
        confirmSingleDeletionModal.show();
      }else {
        confirmDeletionModal.setAvailability(availability);
        confirmDeletionModal.show();
      }
    }
    
    function onAvailabilitySaveClick(availability) {
      if(availability.id) {
        console.log("update " + availability.id + ", " + managementModal.getDate());
      } else {
        schedulingService.createAvailability(availability, onCreateAvailabilityCompleted, onCreateAvailabilityFailed);
      }
    }
    
    function onDeleteFutureClick(availability) {
     schedulingService.deleteAllFutureOccurrencesOfRecurringAvailability(availability, managementModal.getDate(), onAllOccurrencesDeletionCompleted, onAllOccurrencesDeletionFailed);
    }
    
    function onSingleOccurrenceDeletionCompleted(result) {
      browserUtil.reload();
    }
    
    function onSingleOccurrenceDeletionFailed(result) {
      var errorHandled = false;
      
      confirmDeletionModal.clearAllErrors();
      
      if(result && result.jqXHR) {
         if(result.jqXHR.responseText) {
           errorHandled = true;
           confirmDeletionModal.showGlobalError(result.jqXHR.responseText);
        }
      }
      
      if(!errorHandled) {
        confirmDeletionModal.showGlobalError(jsMessages("error.system"));
      }  
    }
    
    function onDeleteSingleClick(availability) {
      schedulingService.deleteSingleOccurrenceOfAvailability(availability, managementModal.getDate(),
              onSingleOccurrenceDeletionCompleted, onSingleOccurrenceDeletionFailed)
    }
    
    function onAllOccurrencesDeletionCompleted(result) {
      browserUtil.reload();
    }
    
    function onAllOccurrencesDeletionFailed(result) {
      var errorHandled = false;
      
      confirmDeletionModal.clearAllErrors();
      
      if(result && result.jqXHR) {
         if(result.jqXHR.responseText) {
           errorHandled = true;
           confirmDeletionModal.showGlobalError(result.jqXHR.responseText);
        }
      }
      
      if(!errorHandled) {
        confirmDeletionModal.showGlobalError(jsMessages("error.system"));
      }
    }
    
    
    function onCreateAvailabilityCompleted(result) {
      browserUtil.reload();
    }
    
    function onCreateAvailabilityFailed(result) {
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
    
    function onDeleteYesClick(availability){
      schedulingService.deleteSingleOccurrenceOfAvailability(availability, managementModal.getDate(),
              onSingleOccurrenceDeletionCompleted, onSingleOccurrenceDeletionFailed);    
    }
    
    function onDeleteNoClick(){
      
    }
    
  });

});
