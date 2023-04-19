define(function(require) {
  var $ = require('jquery');
  var moment = require('momentI18n');
  var adminFormUtil = require('app/util/adminFormUtil');
  var timeUtil = require('app/util/timeUtil');
  var E = require('app/common/enum');
  var adminAddressSelectorWidget = require('app/admin/common/adminAddressSelectorWidget');

  var MODE = {
          INITIAL_CALL: 1,
          INTERVIEW: 2,
          DOCUMENT_RETRIEVAL: 3
  };
  
  var SCRIPT_NAME = 'adminUserVerificationModal';
  
  return function(spec) {
    spec = spec || {};
    spec.id = spec.id || 'modal-user-verification';
    
    var that = $({});
    
    var $modal;
    var $navTabs;
    var currentMode;
    var addressSelectorWidget;
    
    function initialize() {
      $modal = $('#' + spec.id);
      $navTabs = $modal.find('a[data-toggle="tab"]');
      $navTabs.click(function(event) {
        if($(this).parent('li').hasClass('disabled')) {
          return false;
        }
      });
      
      initializeInitialCallTab();
      initializeInterviewTab();
      initializeDocumentRetrievalTab();
    }
    
    function initializeInitialCallTab() {
      function isAnyInterviewDateTimeLocationFieldSet() {
        return $(".validation-group-interview-dtl").filter(function() { return $(this).val(); }).length > 0;
      }
      
      $("#form-initial-call").validate({
        rules: {
          'interviewDate': {
            dateISO: true,
            required: isAnyInterviewDateTimeLocationFieldSet
          },
          'interviewTime': {
            required: isAnyInterviewDateTimeLocationFieldSet
          },
          'interviewLocation': {
            required: isAnyInterviewDateTimeLocationFieldSet
          }
        },
        submitHandler: function(form) {
          var data = createInitialCallData();
          invokeInitialCallTabSaveClickCallback(data);
        }
      });
    }
    
    function initializeInterviewTab() {
      addressSelectorWidget = adminAddressSelectorWidget();
      
      $("#form-interview").validate({
        onkeyup: function(element) {
          var elementId = $(element).attr('id');
          if (!this.settings.rules[elementId] || this.settings.rules[elementId].onkeyup !== false) {
            $.validator.defaults.onkeyup.apply(this, arguments);
          }
        },
        rules: {
          'referringUserId': {
            digits: true,
            onkeyup: false,
            min: 1
          },
          'expiryDateTime': {
            dateISO: true
          },
          'hourlyRate': {
            number: true
          }
        },
        groups: {
          'groupSize': 'minimumGroupSize maximumGroupSize'
        },
        errorPlacement: function(error, element) {
          if (element.attr("name") == "minimumGroupSize" 
            || element.attr("name") == "maximumGroupSize") {
            adminFormUtil.clearFieldError('minimumGroupSize');
            adminFormUtil.addFieldError('minimumGroupSize', error.html());
            adminFormUtil.addFieldErrorHighlightOnly('maximumGroupSize');
          } else {
            adminFormUtil.addFieldError(element.attr('name'), error.html());
          }
        },
        submitHandler: function(form) {
          if(addressSelectorWidget.isInputEmpty() || addressSelectorWidget.validate()) {
            var data = createInterviewData();
            invokeInterviewTabSaveClickCallback(data);
          }
        },
        invalidHandler: function(event, validator) {
          if(!addressSelectorWidget.isInputEmpty()) {
            addressSelectorWidget.validate();
          }
        }
      });
    }
    
    function initializeDocumentRetrievalTab() {
      $('#visaReceptionDateTime').click(function() {
        if(!$(this).is(':checked') && $('#visaExpiryDateTime').valid()) {
          adminFormUtil.clearFieldError('visaExpiryDateTime');
        }
      });
      
      $('#passportReceptionDateTime').click(function() {
        if(!$(this).is(':checked') && $('#birthDate').valid()) {
          adminFormUtil.clearFieldError('birthDate');
        }
      });
      
      $("#form-document-retrieval").validate({
        rules: {
          'visaExpiryDateTime': {
            required: "#visaReceptionDateTime:checked",
            dateISO: true
          },
          'birthDate': {
            required: "#passportReceptionDateTime:checked",
            dateISO: true
          },
        },
        submitHandler: function(form) {
          var data = createDocumentRetrievalData();
          invokeDocumentRetrievalTabSaveClickCallback(data);
        }
      });
    }
    
    $(document).ready(function() {
      initialize();
    });
    
    function show(mode, data) {
      if(mode !== MODE.INITIAL_CALL) {
        addressSelectorWidget.show();
        addressSelectorWidget.clear();
      }
      
      clearAllErrors();
      setMode(mode);
      renderView(data);
      $modal.modal({
        keyboard: false,
        show: true
      });
    }
    
    function hide() {
      $modal.modal('hide');
    }
    
    function showGlobalError(message) {
      adminFormUtil.addGlobalError(getCurrentFormId(), message);
    }
    
    function showErrorsFromJqXhr(jqXhr) {
      adminFormUtil.renderFormErrorsFromJqXhr(getCurrentFormId(), jqXhr);
    }
    
    function getCurrentFormId() {
      var currentTabId = $('#modal-user-verification .nav-tabs li.active a').attr('href').substr(1);
      return $('#' + currentTabId).find('form').attr('id');
    }
    
    function clearAllErrors() {
      $modal.find('form').each(function(i, element) {
        var formId = $(element).attr('id');
        adminFormUtil.clearAllErrors(formId);
      })
    }
    
    function throwError(message) {
      throw SCRIPT_NAME + ': ' + message;
    }
    
    function setMode(mode) {
      currentMode = mode;
      
      if(mode === MODE.INITIAL_CALL) {
        $($navTabs[1]).parent('li').addClass('disabled');
        $($navTabs[2]).parent('li').addClass('disabled');
        $navTabs[0].click();
      } else if(mode === MODE.INTERVIEW) {
        $($navTabs[1]).parent('li').removeClass('disabled');
        $($navTabs[2]).parent('li').addClass('disabled');
        $navTabs[1].click();
      } else if(mode === MODE.DOCUMENT_RETRIEVAL){
        $($navTabs[1]).parent('li').removeClass('disabled');
        $($navTabs[2]).parent('li').removeClass('disabled');
        $navTabs[2].click();
      } else {
        throwError("invalid mode set '" + mode + "'");
      }
    }
    
    function renderView(data) {
      if(!data) {
        throwError('cannot render view, the specified data is empty');
      }
      
      renderInitialCallTab(data);
      renderInterviewTab(data);
      renderDocumentRetrievalTab(data);
    }
    
    function renderInitialCallTab(data) {
      adminFormUtil.populateFormFromJson('form-initial-call', data);
      
      var nativeTonguesField = $modal.find('.nativeTongues');
      nativeTonguesField.html('');
      data.tutoredSubjects.forEach(function(tutoredSubject) {
        var subject = tutoredSubject.subject;
        var checked = tutoredSubject.skillLevel && 
          tutoredSubject.skillLevel.id === E.SKILL_LEVEL.NATIVE_SPEAKER ? 'checked="checked"' : ''; 
        var entry = 
          '<div class="checkbox check-primary">' +
            '<input type="checkbox" value="' + subject.id + '" id="tutored_subject_' + subject.id + '" ' + checked + '>' +
            '<label for="tutored_subject_' + subject.id + '">' + subject.name + '</label>' +
          '</div>';
        nativeTonguesField.append(entry);
      });
      
      var interviewDate = '';
      var interviewTime = '';
      if(data.interviewDateTime) {
        var interviewMoment = moment(data.interviewDateTime, moment.ISO_8601);
        interviewDate = interviewMoment.format('YYYY-MM-DD');
        interviewTime = interviewMoment.format('HH:mm');
      }
      
      $('#interviewDate').val(interviewDate);
      $('#interviewDate').datepicker('update');
      
      $('#interviewTime').val(interviewTime);
      $('#interviewTime').timepicker('setTime', interviewTime);
    }
    
    function renderInterviewTab(data) {
      adminFormUtil.populateFormFromJson('form-interview', data);
      
      var interview = '';
      if(data.interviewDateTime) {
        var interviewMoment = moment(data.interviewDateTime, moment.ISO_8601);
        interview = interviewMoment.format('ddd, MMM DD, HH:mm') + ', ' + data.interviewLocation;
      }
      $modal.find('.interviewDateTimeLocation').html(interview);
      
      addressSelectorWidget.populateFromJson(data);
    }
    
    function renderDocumentRetrievalTab(data) {
      adminFormUtil.populateFormFromJson('form-document-retrieval', data);
    }
    
    function createInitialCallData() {
      var nativeTongueIds = $(".nativeTongues input:checkbox:checked").map(function(){
        return $(this).val();
      }).get();
      
      if(!nativeTongueIds || nativeTongueIds.length === 0) {
        nativeTongueIds = null;
      }
      
      var date = $('#interviewDate').val();
      var time = $('#interviewTime').val();
      
      var dateTime = null;
      if(date && time) {
        var timeMoment = timeUtil.momentFromTimeOnly(time);
        dateTime = date + 'T' + timeMoment.format('HH:mm');
      }
      
      var location = $('#interviewLocation').val().trim() || null;
      var notes = $('#initialCallNotes').val().trim() || null;
      
      return {
        nativeTongueIds: nativeTongueIds,
        interviewDateTime: dateTime,
        interviewLocation: location,
        initialCallNotes: notes
      };
    }
    
    function createInterviewData() {
      var data = adminFormUtil.serializeJson('form-interview');
      if(data.expiryDateTime) {
        data.expiryDateTime += "T00:00:00";
      }
      return data;
    }
    
    function createDocumentRetrievalData()  {
      var visaExpiry = $('#visaExpiryDateTime').val() || null; 
      if(visaExpiry) {
        visaExpiry += "T00:00:00";
      }
      
      var birthDate = $('#birthDate').val() || null; 
      
      return {
        passportReceived: $('#passportReceptionDateTime').is(':checked'),       
        visaReceived: $('#visaReceptionDateTime').is(':checked'),       
        visaExpiryDateTime: visaExpiry,
        birthDate: birthDate
      };
    }
    
    function invokeInitialCallTabSaveClickCallback(data) {
      if(spec.callbacks && spec.callbacks.initialCallTabSaveClick) {
        spec.callbacks.initialCallTabSaveClick(data);
      }
    }
    
    function invokeInterviewTabSaveClickCallback(data) {
      if(spec.callbacks && spec.callbacks.interviewTabSaveClick) {
        spec.callbacks.interviewTabSaveClick(data);
      }
    }
    
    function invokeDocumentRetrievalTabSaveClickCallback(data) {
      if(spec.callbacks && spec.callbacks.documentRetrievalTabSaveClick) {
        spec.callbacks.documentRetrievalTabSaveClick(data);
      }
    }
    
    that.show = show;
    that.hide = hide;
    that.showGlobalError = showGlobalError;
    that.showErrorsFromJqXhr = showErrorsFromJqXhr;
    that.clearAllErrors = clearAllErrors;
    that.MODE = MODE;

    return that;
  }
  
});