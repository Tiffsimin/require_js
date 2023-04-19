define(function(require) {
  var $ = require('jquery');
  var defaultModal = require('app/kui/modal/defaultModal');
  var jsMessages = require('jsMessages');
  var moment = require('momentI18n');
  var formUtil = require('app/util/formUtil');
  var timeUtil = require('app/util/timeUtil');
  var appContext = require('appContext');
  
  var GLOBAL_ERROR_MESSAGE_TARGET = 'global-error-message';
  
  return function(spec) {
    spec = spec || {};
    spec.id = spec.id || 'modal-book-session';
    
    var my = {};
    
    var that = defaultModal(spec, my);
    
    var selectedDate;
    var sessionToBook;
    //it is in milisecond
    var currentDuration;
    var $tutorData = $('#tutor-data');
    var minLessonDuration = moment.duration($tutorData.data('knbMinLessonDuration'));
    var ignoreFromToChangeEvents = false;
    var sessionTutorId;
    var fromTimeAsHour;
    var toTimeAsHour;
    var minLessonDurationAsHour = minLessonDuration.asHours();
    
    var startTimeOfDay = timeUtil.momentFromTimeOnly(appContext.config.scheduling.startTimeOfDay);
    var endTimeOfDay = timeUtil.momentFromTimeOnly(appContext.config.scheduling.endTimeOfDay);
    
    var $modal = my.modal;
    var $fromSelect = $modal.find('#input-select-from');
    var $toSelect = $modal.find('#input-select-to');
    var $inputComment = $modal.find('#input-comment');   
    var $bookButton = $modal.find('#button-book');
    var $dateField = $modal.find('.modal-date');
    
    function initialize() {
      addFromToTimesListeners();
      addButtonListeners();
    }
    initialize();

//////////////////////input message///////////////////////////////////////////////////////    

    
    
//////////////////////from to time selection management///////////////////////////////////
    function addFromToTimesListeners() {
      $fromSelect.change(function() {
        if(!ignoreFromToChangeEvents) {
          updateToTime();       
        }
      });      
      $toSelect.change(function() {
        if(!ignoreFromToChangeEvents) {
          updateCurrentDuration();
        }
      });
    }
    
    function updateToTime() {
      var fromTime = getFromTimeAsMoment().format("HH:mm");
      var minLessonDurationAsHour = minLessonDuration.asHours();
      setToOptions(setFromToTimeRangeOptions(moment(fromTime, "HH:mm").hour() + minLessonDurationAsHour, toTimeAsHour));
    }
    
    function updateCurrentDuration() {
      var from = getFromTimeAsMoment();
      var to = getToTimeAsMoment();
      if(from.isBefore(to)) {
        currentDuration = moment.duration(to.subtract(from).hours(), 'hours');
      } else {
        currentDuration = 0;
      }
    }
    
    function selectFromToTimes(fromTime, toTime) {
      ignoreFromToChangeEvents = true;
      //var fromHour = fromTime.split(":")[0];
      //var toHour = toTime.split(":")[0];
      var fromHour = moment(fromTime, "HH:mm").hour();
      var toHour = moment(toTime, "HH:mm").hour();
      $fromSelect.val(fromHour).trigger("change"); 
      $toSelect.val(toHour).trigger("change");
      updateCurrentDuration();
      ignoreFromToChangeEvents = false;
    }
    
    function getFromTime() {
      var fromTime = timeUtil.momentFromTimeOnly($fromSelect.val());
      return fromTime.format(appContext.config.format.time);
    }
    
    function getFromTimeAsMoment() {
      return timeUtil.momentFromTimeOnly($fromSelect.val());
    }
    
    function getToTime() {
      var toTime = timeUtil.momentFromTimeOnly($toSelect.val());
      return toTime.format(appContext.config.format.time);
    }
    
    function getToTimeAsMoment() {
      return timeUtil.momentFromTimeOnly($toSelect.val());
    }
/////////////////////////session booking//////////////////////////////////////////////////////

     
    function createBookingSessionFromFormValues() {
      var bookingSession = {};
      bookingSession.comment = $inputComment.val();
      bookingSession.date = getDate();
      bookingSession.startTime = getFromTime();
      bookingSession.endTime = getToTime();
      bookingSession.tutorId = sessionTutorId;
      
      return bookingSession;
    }
    
    function setBookingSessionForDate(date, start, end, tutorId) {
      reset();   
      setDate(date);
      sessionTutorId = tutorId;
      var startTime = timeUtil.momentFromTimeOnly(start).format("HH:mm");
      var endTime = timeUtil.momentFromTimeOnly(end).format("HH:mm");
      
      fromTimeAsHour = moment(startTime, "HH:mm").hour();
      toTimeAsHour = moment(endTime, "HH:mm").hour();

      setFromOptions(setFromToTimeRangeOptions(fromTimeAsHour, toTimeAsHour - minLessonDurationAsHour));
      setToOptions(setFromToTimeRangeOptions(fromTimeAsHour + minLessonDurationAsHour, toTimeAsHour));

      selectFromToTimes(startTime, endTime);   
    }
    
    function reset() {
      
    }
    
//////////////////////button listener/////////////////////////////////////////////////////////
    function addButtonListeners() {
      $bookButton.click(onBookButtonClick);
    }
    
    function onBookButtonClick(event) {
      event.stopPropagation();
      if(validate()){
        invokeBookClickCallback();
      }   
    }
    
    function invokeBookClickCallback() {
      if(spec.callbacks && spec.callbacks.bookClick) {
        var bookingSession = createBookingSessionFromFormValues(); 
        spec.callbacks.bookClick(bookingSession);
      }
    }
    
/////////////////////error handling////////////////////////////////////
    function validateFromToTimes() {
      if(getFromTimeAsMoment().isBefore(getToTimeAsMoment())) {
        return true;
      } else {
        showFromToTimesError(jsMessages('error.scheduling.startbeforeend'));
        return false;
      }
    }
    
    function validateLessonDuration() {
      if(currentDuration.asMilliseconds() >= minLessonDuration.asMilliseconds()) {
        return true;
      } else {
        return false;
      }
    }
    
    function validate() {
      clearAllErrors();
      return validateFromToTimes() && validateLessonDuration();
    }
    var validationErrorHandlers = {
            startTime: showFromToTimesError,
            endTime: showFromToTimesError,
    };
    
    function showValidationErrors(errors) {
      errors.forEach(function(error) {
        if(validationErrorHandlers[error.field]) {
          validationErrorHandlers[error.field](error.message);
        } else {
          showGlobalError(error.message);
        }
      });
    }
    
    function showFromToTimesError(message) {
      formUtil.addFieldError($fromSelect.attr('name'), message, false);
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors('modal-book-session');
      formUtil.replaceWithEmptyDiv(GLOBAL_ERROR_MESSAGE_TARGET);
    }
    
    function showGlobalError(message) {
      formUtil.replaceWithErrorMessage(GLOBAL_ERROR_MESSAGE_TARGET, message)
    }
    
    
    ///////////////on load setting////////////////////////////////
    
    function setFromToTimeRangeOptions(from, to){
      //from is a number here, it can be treated as a string
      options = [{value: from, text: from + ':00'}];
      for (i = from; i < to; i++) { 
        var currentValue = i + 1;
        var option = {value: currentValue, text: currentValue + ':00'};
        options.push(option);
       }
      return options;
    }
    
    function setFromOptions(options) {
      formUtil.setOptionsForSelect2($fromSelect, options);
    }
    
    //e.g. options = [{value: '16', text: '16:00'}, {value: '17', text: '17:00'}]
    function setToOptions(options) {
      formUtil.setOptionsForSelect2($toSelect, options);
    }
    
    function setDate(date) {
      selectedDate = moment(date, moment.ISO_8601);
      $dateField.html(selectedDate.format('L'));
    }
    
    function getDate() {
      return selectedDate.format(appContext.config.format.date);
    }
    
    that.getDate = getDate;
    that.setBookingSessionForDate = setBookingSessionForDate;
    that.comment = $inputComment.val();
    that.getFromTime = getFromTime;
    that.getToTime = getToTime;
    that.showValidationErrors = showValidationErrors;
    that.showGlobalError = showGlobalError;
    that.clearAllErrors = clearAllErrors;
    
    return that;
  }
  
});

