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
    spec.id = spec.id || 'modal-manage-availability';
    
    var my = {};
    
    var that = defaultModal(spec, my);
    
    var validationErrorHandlers = {
            startTime: showFromToTimesError,
            endTime: showFromToTimesError,
            weeklyRecurrenceDaysOfWeekSelection: showWeekdaysError,
            weeklyRecurrenceEndDate: showEndsError
    };
    
    var selectedDate;
    var selectedAvailability;
    var availabilityMap;
    var occupiedTimeSlots;
    var currentDuration;
    var ignoreFromToChangeEvents = false;
    var minLessonDuration = moment.duration(appContext.user.scheduling.minLessonDuration);
    
    var startTimeOfDay = timeUtil.momentFromTimeOnly(appContext.config.scheduling.startTimeOfDay);
    var endTimeOfDay = timeUtil.momentFromTimeOnly(appContext.config.scheduling.endTimeOfDay);
    var toggleDuration = appContext.config.ui.animation.toggleDuration;
    
    var $modal = my.modal;
    var $container = $modal.find('.form-container');
    var $timeSlotsSidebar = $modal.find('.schedule-preview');
    var $dateField = $modal.find('.modal-date');
    var $timeField = $modal.find('.modal-time');
    var $repeatFieldsContainer = $modal.find('.repeat-fields-container');
    var $repeatWeeklyField = $modal.find('.modal-repeat-weekly');
    var $repeatEndsField = $modal.find('.modal-repeat-ends');
    var $fromSelect = $modal.find('#input-select-from');
    var $toSelect = $modal.find('#input-select-to');
    var $repeatWeeklyCheckbox = $modal.find('#input-checkbox-repeat-weekly');
    var $repeatEndsNeverRadio = $modal.find('#input-radio-ends-never');
    var $repeatEndsOnDateRadio = $modal.find('#input-radio-ends-date');
    var $repeatEndDateDaySelect = $modal.find('#input-select-enddate-day');
    var $repeatEndDateMonthSelect = $modal.find('#input-select-enddate-month');
    var $repeatEndDateYearSelect = $modal.find('#input-select-enddate-year');
    var $deleteButton = $modal.find('#button-delete');
    var $saveButton = $modal.find('#button-save');
    
    function initialize() {
      addTimeSlotClickListeners();
      addFromToTimesListeners();
      addRepeatBlockListeners();
      addButtonListeners();
    }
    initialize();
    
    function addTimeSlotClickListeners() {
      $timeSlotsSidebar.find('li').click(function(event) {
        event.preventDefault();
        $this = $(this);
        var time = $this.data("knbTime");
        time = timeUtil.momentFromTimeOnly(time);
        if(isValidStartTimeForNewAvailability(time)) {
          addNewAvailabilityAtTime(time);
        }
      });
    }
    
    function addFromToTimesListeners() {
      $fromSelect.change(function() {
        if(!ignoreFromToChangeEvents) {
          updateToTime();
          if(!selectedAvailability) {
            updateNewAvailabilityTimeIndicator();
          }
        }
      });
      
      $toSelect.change(function() {
        if(!ignoreFromToChangeEvents) {
          updateCurrentDuration();
          if(!selectedAvailability) {
            updateNewAvailabilityTimeIndicator();
          }
        }
      });
    }
    
    function updateToTime() {
      var from = getFromTimeAsMoment();
      var fromTime = from.format("HH:mm");
      var toTime = from.clone().add(currentDuration).format("HH:mm");
      selectFromToTimes(fromTime, toTime);
    }
    
    function updateCurrentDuration() {
      var from = getFromTimeAsMoment();
      var to = getToTimeAsMoment();
      if(from.isBefore(to)) {
        currentDuration = moment.duration(to.subtract(from).hours(), 'hours');
        if(currentDuration.asMilliseconds() < minLessonDuration.asMilliseconds()) {
          currentDuration = minLessonDuration;
        }
      } else {
        currentDuration = minLessonDuration;
      }
    }
    
    function addRepeatBlockListeners() {
      $('.switch-weekly-checkbox input').on('ifChanged', function(event) {
        if(that.isVisible()) {
          toggleRepeatBlockVisibility(true);
        }
      });
      
      $('.switch-more-options input').on('ifChanged', function(event) {
        if(that.isVisible()) {
          toggleEndsOnDateBlockVisibility(true);
        }
      });
    }
    
    function addButtonListeners() {
      $deleteButton.click(onDeleteButtonClick);
      $saveButton.click(onSaveButtonClick);
    }
    
    function addNewAvailabilityAtTime(time) {
      time = time.clone();
      clearAvailabilitySelection();
      var from = time.format("HH:mm");
      var to = time.add(minLessonDuration).format("HH:mm");
      selectFromToTimes(from, to);
      updateNewAvailabilityTimeIndicator();
      updateEditability();
    }
    
    function removeNewAvailabilityTimeIndicator() {
      $timeSlotsSidebar.find('a.meta-entry.is-requested').remove();
    }
    
    function updateNewAvailabilityTimeIndicator() {
      removeNewAvailabilityTimeIndicator();
      var startHour = $fromSelect.val();
      var endHour = $toSelect.val();
      var duration = parseInt(endHour) - parseInt(startHour);
      var $timeSlot = $timeSlotsSidebar.find('#modal-timeslot-' + startHour);
      $('<a/>', {
        'href': '#',
        'class': 'meta-entry is-requested is-active duration-' + duration,
        'text': startHour + ':00 - ' + endHour + ':00'
      }).appendTo($timeSlot);
    }
    
    function isValidStartTimeForNewAvailability(time) {
      time = time.clone();
      //since the isBefore, isAfter and isBetween matches are exclusive, we need to add a second to the moment
      time.add(1, 'seconds');
      
      if(time.isBefore(startTimeOfDay) || time.isAfter(endTimeOfDay)) {
        return false;
      }

      var isValidStartTime = true;
      
      $.each(occupiedTimeSlots, function(index, occupiedTimeSlot) {
        if(time.isBetween(occupiedTimeSlot.start, occupiedTimeSlot.end)) {
          isValidStartTime = false;
          return false;
        }
      });
      
      return isValidStartTime;
    }
    
    function reset() {
      clearTimeSlotsSidebar();
      clearAvailabilitySelection();
    }
    
    function clearTimeSlotsSidebar() {
      $entries = $timeSlotsSidebar.find('a.meta-entry'); 
      $entries.off();
      $entries.remove();
    }
    
    function clearAvailabilitySelection() {
      selectedAvailability = null;
      that.setTitle(jsMessages('scheduling.availabilitymanagement.add'));
      updateSelectedAvailabilityStyle();
      clearInputs();
    }
    
    function updateSelectedAvailabilityStyle() {
      $timeSlotsSidebar.find('a.meta-entry.is-active').removeClass('is-active');
      
      if(selectedAvailability) {
        var startHour = selectedAvailability.startTime.split(":")[0];
        var $entry = $timeSlotsSidebar.find('#modal-timeslot-' + startHour).find('a');
        $entry.addClass('is-active');
      }
    }
    
    function clearInputs() {
      updateTimeSelectors();
      selectRepeatWeekly(false);
      clearWeekdaysSelection();
      clearEndsSelection();
      updateButtons();
    }
    
    function updateTimeSelectors() {
      if(selectedAvailability) {
        //TODO set the from and to time options so that only valid selections can be made when editing an availability
        //e.g. setFromOptions([{value: '16', text: '16:00'}, {value: '17', text: '17:00'}, {value: '18', text: '18:00'}]);
        selectFromToTimes(selectedAvailability.startTime, selectedAvailability.endTime);
      } else {
        //TODO set the from and to time options so that only valid selections can be made when adding a new availability
        //e.g. setFromOptions([{value: '16', text: '16:00'}, {value: '17', text: '17:00'}, {value: '18', text: '18:00'}]);
        
        //then select first possible time for new availability
        //e.g. selectFromToTimes("20:00", "21:00");
      }
    }
    
    function updateRepeatBlock() {
      if(!selectedAvailability) {
        return;
      }
      
      if(selectedAvailability.weeklyRecurrence) {
        selectRepeatWeekly(true);
        selectWeekdays(selectedAvailability.weeklyRecurrence.daysOfWeek);
        if(selectedAvailability.weeklyRecurrence.endDate) {
          selectEndsOnDate(selectedAvailability.weeklyRecurrence.endDate);
        } else {
          selectEndsNever();
        }
      } else {
        selectRepeatWeekly(false);
        clearWeekdaysSelection();
        clearEndsSelection();
      }
    }
    
    function selectFromToTimes(fromTime, toTime) {
      ignoreFromToChangeEvents = true;
      var fromHour = fromTime.split(":")[0];
      var toHour = toTime.split(":")[0];
      $fromSelect.val(fromHour).trigger("change"); 
      $toSelect.val(toHour).trigger("change");
      updateCurrentDuration();
      ignoreFromToChangeEvents = false;
    }
    
    //e.g. options = [{value: '16', text: '16:00'}, {value: '17', text: '17:00'}]
    function setFromOptions(options) {
      formUtil.setOptionsForSelect2($fromSelect, options);
    }
    
    //e.g. options = [{value: '16', text: '16:00'}, {value: '17', text: '17:00'}]
    function setToOptions(options) {
      formUtil.setOptionsForSelect2($toSelect, options);
    }
    
    function selectRepeatWeekly(checked) {
      $repeatWeeklyCheckbox.icheck(checked ? 'checked' : 'unchecked');
    }
    
    function selectWeekdays(weekdays) {
      clearWeekdaysSelection();
      $.each(weekdays, function(index, weekday) {
        weekday = weekday.toLowerCase();
        $weekdayInput = $modal.find('input[name="input-checkbox-' + weekday + '"]');
        $weekdayInput.icheck('checked');
      });
    }
    
    function clearWeekdaysSelection() {
      $modal.find('.switch-weekly-target input[type="checkbox"]').icheck('unchecked');
    }
    
    function selectEndsNever() {
      $repeatEndsNeverRadio.icheck('checked');
    }
    
    function selectEndsOnDate(endDate) {
      endDate = moment(endDate);
      $repeatEndsOnDateRadio.icheck('checked');
      $repeatEndDateDaySelect.val(endDate.format('D')).trigger("change"); 
      $repeatEndDateMonthSelect.val(endDate.format('M')).trigger("change");
      $repeatEndDateYearSelect.val(endDate.format('YYYY')).trigger("change");
    }
    
    function clearEndsSelection() {
      selectEndsNever(); 
      $repeatEndDateDaySelect.val('').trigger("change"); 
      $repeatEndDateMonthSelect.val('').trigger("change");
      $repeatEndDateYearSelect.val('').trigger("change");
    }
    
    function updateButtons() {
      if(selectedAvailability === null) {
        $deleteButton.invisible();
        $saveButton.visible();
      } else {
        $deleteButton.visible();
        $saveButton.invisible();
      }
    }
    
    function updateEditability() {
      if(selectedAvailability === null) {
        $container.addClass('is-editable-form');
      } else {
        $container.removeClass('is-editable-form');
        
        var time = getFromTimeAsMoment().format('HH:mm') + " - " + getToTimeAsMoment().format('HH:mm');
        $timeField.html(time);
        
        if(selectedAvailability.weeklyRecurrence) {
          $repeatFieldsContainer.show();
          
          var daysOfWeek = timeUtil.getTranslatedAbbrevDaysOfWeek(selectedAvailability.weeklyRecurrence.daysOfWeek);
          $repeatWeeklyField.html(daysOfWeek.join(', '));
          
          if(selectedAvailability.weeklyRecurrence.endDate) {
            var endDate = moment(selectedAvailability.weeklyRecurrence.endDate, moment.ISO_8601);
            $repeatEndsField.html(endDate.format('L'));
          } else {
            $repeatEndsField.html(jsMessages('repeatendsnever'));
          }
        } else {
          $repeatFieldsContainer.hide();
        }
      }
    }
    
    function addTimeSlotToSidebar(availability) {
      var startHour = availability.startTime.split(":")[0];
      var endHour = availability.endTime.split(":")[0];
      var duration = parseInt(endHour) - parseInt(startHour);
      var $timeSlot = $timeSlotsSidebar.find('#modal-timeslot-' + startHour);
      $('<a/>', {
        'href': '#',
        'class': 'meta-entry duration-' + duration,
        'text': startHour + ':00 - ' + endHour + ':00',
        'on': {
          click: function(event) {
            event.preventDefault();
            editAvailability(availability.id);
          }
        }
      }).appendTo($timeSlot);
    }
    
    function clearAllErrors() {
      formUtil.clearAllErrors('modal-manage-availability');
      formUtil.replaceWithEmptyDiv(GLOBAL_ERROR_MESSAGE_TARGET);
    }
    
    function showFromToTimesError(message) {
      formUtil.addFieldError($fromSelect.attr('name'), message, false);
    }
    
    function showWeekdaysError(message) {
      formUtil.addFieldError('input-checkbox-monday', message, false);
    }
    
    function showEndsError(message) {
      formUtil.addFieldError($repeatEndsNeverRadio.attr('name'), message, false);
    }
    
    function showGlobalError(message) {
      formUtil.replaceWithErrorMessage(GLOBAL_ERROR_MESSAGE_TARGET, message)
    }
    
    function setAvailabilitiesForDate(availabilities, date, selectedAvailabilityId) {
      reset();
      
      setAvailabilities(availabilities);
      setDate(date);
      
      if(selectedAvailabilityId) {
        editAvailability(selectedAvailabilityId);
      } else {
        selectFirstAvailableSlotOrFirstAvailability(availabilities[0]);
      }
      
      toggleRepeatBlockVisibility(false);
    }
    
    function setAvailabilities(availabilities) {
      availabilityMap = {};
      occupiedTimeSlots = [];
      
      $.each(availabilities, function(index, availability) {
        availabilityMap[availability.id] = availability;
        var startMoment = timeUtil.momentFromTimeOnly(availability.startTime);
        var endMoment = timeUtil.momentFromTimeOnly(availability.endTime);
        occupiedTimeSlots.push({start: startMoment, end: endMoment});
        addTimeSlotToSidebar(availability);
      });
    }
    
    function setDate(date) {
      selectedDate = moment(date, moment.ISO_8601);
      $dateField.html(selectedDate.format('L'));
    }
    
    function editAvailability(availabilityId) {
      var availability = availabilityMap[availabilityId];
      selectedAvailability = availability;
      
      removeNewAvailabilityTimeIndicator();
      updateSelectedAvailabilityStyle();
      that.setTitle(jsMessages('scheduling.availabilitymanagement.edit'));
      updateTimeSelectors();
      updateRepeatBlock();
      updateButtons();
      updateEditability();
    }
    
    function selectFirstAvailableSlotOrFirstAvailability(firstAvailability) {
      var availableSlotFound = false;
      
      for(var hour = startTimeOfDay.hour(); hour < endTimeOfDay.hour(); hour++) {
        var time = timeUtil.momentFromTimeOnly(hour + ":00");
        if(isValidStartTimeForNewAvailability(time)) {
          availableSlotFound = true;
          addNewAvailabilityAtTime(time);
          break;
        }
      }

      if(!availableSlotFound) {
        editAvailability(firstAvailability.id);
      }
    }
    
    function showValidationErrors(errors) {
      var globalErrors = '';
      
      errors.forEach(function(error) {
        if(validationErrorHandlers[error.field]) {
          validationErrorHandlers[error.field](error.message);
        } else {
          if(globalErrors) {
            globalErrors += "<br />";
          }
          globalErrors += error.message;
        }
      });
      
      if(globalErrors) {
        showGlobalError(globalErrors);
      }
    }
    
    function toggleRepeatBlockVisibility(animate) {
      if(animate === undefined) {
        animate = true;
      }
      
      if($repeatWeeklyCheckbox.is(':checked')) {
        if(animate) {
          $('.switch-weekly-target').show(toggleDuration);
        } else {
          $('.switch-weekly-target').show();
        }
      } else {
        if(animate) {
          $('.switch-weekly-target').hide(toggleDuration);
        } else {
          $('.switch-weekly-target').hide();
        }
      }
      
      toggleEndsOnDateBlockVisibility(false);
    }
    
    function toggleEndsOnDateBlockVisibility(animate) {
      if(animate === undefined) {
        animate = true;
      }
      
      if($repeatEndsOnDateRadio.is(':checked')) {
        if(animate) {
          $('.more-options').show(toggleDuration);
        } else {
          $('.more-options').show();
        }
      } else {
        if(animate) {
          $('.more-options').hide(toggleDuration);
        } else {
          $('.more-options').hide();
        }
      }
    }
    
    function getDate() {
      return selectedDate.format(appContext.config.format.date);
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
    
    function isRecurring() {
      return $repeatWeeklyCheckbox.is(':checked');
    }
    
    function getRecurrenceEndDate() {
      var endDate = null;
      if($repeatEndsOnDateRadio.is(':checked')) {
        endDate = getRecurrenceEndDateAsMoment().format(appContext.config.format.date);
      }
      return endDate;
    }
    
    function getRecurrenceEndDateAsMoment() {
      var year = $repeatEndDateYearSelect.val()
      var month = $repeatEndDateMonthSelect.val();
      var day = $repeatEndDateDaySelect.val()
      
      if(year && month && day) {
        return moment({year: year, month: (month - 1), day: day});
      } else {
        return moment.invalid();
      }
    }
      
    function getRecurrenceDaysOfWeek() {
      return $('.container-weekly-recurrence-days input:checkbox:checked').map(function() {
          return this.value;
      }).get();
    }
    
    function hasRecurrenceDaysOfWeek() {
      return getRecurrenceDaysOfWeek().length > 0;
    }
    
    function validate() {
      clearAllErrors();
      return validateFromToTimes() && validateEndDate() && validateRecurrenceDaysOfWeek();
    }
    
    function validateFromToTimes() {
      if(getFromTimeAsMoment().isBefore(getToTimeAsMoment())) {
        return true;
      } else {
        showFromToTimesError(jsMessages('error.scheduling.startbeforeend'));
        return false;
      }
    }
    
    function validateEndDate(){
      if(!$repeatEndsOnDateRadio.is(':checked')) {
        return true;
      }
      
      var endDate = getRecurrenceEndDateAsMoment();
      if(endDate.isValid()) {
        if(endDate.isAfter(moment(), 'day')) {
          if(endDate.isAfter(selectedDate)) {
            return true;
          } else {
            showEndsError(jsMessages('error.scheduling.enddatebeforestartdate', $dateField.html()));
            return false;
          }
        } else {
          showEndsError(jsMessages('error.scheduling.enddateinthepast'));
          return false;
        }        
      } else {
        showEndsError(jsMessages('error.scheduling.invalidenddate'));
        return false;
      }
    }
    
    function validateRecurrenceDaysOfWeek(){
      if(!isRecurring()) {
        return true;
      }
      
      if(hasRecurrenceDaysOfWeek()) {
        return true;
      } else {
        showWeekdaysError(jsMessages('error.scheduling.daysofweekempty'));
        return false;
      }
    }
    
    function invokeDeleteClickCallback() {
      if(spec.callbacks && spec.callbacks.deleteClick) {
        spec.callbacks.deleteClick(selectedAvailability);
      }
    }
    
    function invokeSaveClickCallback() {
      if(spec.callbacks && spec.callbacks.saveClick) {
        var availability = selectedAvailability || createAvailabilityFromFormValues(); 
        spec.callbacks.saveClick(availability);
      }
    }
    
    function createAvailabilityFromFormValues() {
      var availability = {};
      availability.date = getDate();
      availability.startTime = getFromTime();
      availability.endTime = getToTime();
      
      if(isRecurring()) {
        availability.weeklyRecurrence = {};
        availability.weeklyRecurrence.startDate = getDate();
        availability.weeklyRecurrence.endDate = getRecurrenceEndDate();
        availability.weeklyRecurrence.daysOfWeek = getRecurrenceDaysOfWeek();
      }
      
      return availability;
    }
    
    function onDeleteButtonClick(event) {
      //the click event's propagation is stopped, in order to avoid closing the confirm deletion modal by
      //accidentally interpreting the delete button's click event as a click on the background of the magnificPopup
      event.stopPropagation();
      invokeDeleteClickCallback();
    }
    
    function onSaveButtonClick(event) {
      if(validate()) {
        invokeSaveClickCallback();
      }
    }
    
    that.setAvailabilitiesForDate = setAvailabilitiesForDate;
    that.getDate = getDate;
    that.getFromTime = getFromTime;
    that.getToTime = getToTime;
    that.isRecurring = isRecurring;
    that.showValidationErrors = showValidationErrors;
    that.showGlobalError = showGlobalError;
    that.clearAllErrors = clearAllErrors;

    return that;
  }
  
});