define(function(require) {
  var $ = require('jquery');
  var formUtil = require('app/util/formUtil');
  var stringUtil = require('app/util/stringUtil');
  var timeUtil = require('app/util/timeUtil');
  var appContext = require('appContext');
  var moment = require('momentI18n');
  var jsMessages = require('jsMessages');

  var GLOBAL_ERROR_MESSAGE_TARGET = 'profile-editor-global-error-message';
  
  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    
    var updateHandlers = {
      displayName: updateDisplayName,
      major: updateMajor,
      studyLevelId: updateStudyLevelId,
      studyType: updateStudyType,
      universityId: updateUniversityId,
      gender: updateGender,
      birthDate: updateBirthDate,
      nationalityId: updateNationalityId,
      biography: updateBiography,
      tutoredSubjectIds: updateTutoredSubjectIds,
      tutoredStudyLevelIds: updateTutoredStudyLevelIds,
      tutoringExperience: updateTutoringExperience,
      distinctions: updateDistinctions,
      travelPreference: updateTravelPreference,
      hourlyRate: updateHourlyRate
    };
    
    function initialize() {

    }
    initialize();
    
    function showGlobalError(message) {
      formUtil.replaceWithErrorMessage(GLOBAL_ERROR_MESSAGE_TARGET, message)
    }
    
    function clearGlobalError() {
      formUtil.replaceWithEmptyDiv(GLOBAL_ERROR_MESSAGE_TARGET);
    }
    
    function update(profile) {
      for(var key in profile) {
        if(updateHandlers[key]) {
          var value = profile[key];
          updateHandlers[key](value);
        }
      }
    }
    
    function updateDisplayName(value) {
      $('#profile-editor-displayname').html(value);
    }
    
    function updateMajor(value) {
      $target = $('#profile-editor-major');
      if(value) {
        if($target.length) {
          $target.html(value);
        } else {
          $('<p id="profile-editor-major">' + value + '</p>').prependTo($('.profile-meta'));
        }
      } else {
        $target.remove();
      }
    }
    
    function updateStudyLevelId(value) {
      var name = $('#studyLevelId option[value=' + value + ']').html();
      $('#profile-editor-studylevel').html(name);
    }
    
    function updateStudyType(value) {
      var name = appContext.referenceData.studyType[value];
      $('#profile-editor-studytype').html(name);
    }

    function updateUniversityId(value) {
      var name = $('#universityId option[value=' + value + ']').html();
      $('#profile-editor-university').html(name);
    }
    
    function updateGender(value) {
      var name = appContext.referenceData.gender[value];
      $('#profile-editor-gender-label').html(name);
      $icon = $('#profile-editor-gender-icon');
      $icon.removeClass('icon-male icon-female')
      $icon.addClass(value == 1 ? 'icon-male' : 'icon-female');
    }
    
    function updateBirthDate(value) {
      var age = moment().diff(value, 'years');
      $('#profile-editor-age').html(jsMessages('agewithyears', age));
    }
    
    function updateNationalityId(value) {
      var name = $('#nationalityId option[value=' + value + ']').html();
      $('#profile-editor-nationality').html(name);
    }
    
    function updateBiography(value) {
      value = stringUtil.newlineToBreak(value);
      $('#profile-editor-biography').html(value);
    }
    
    function updateTutoredSubjectIds(values) {
      var subjects = [];
      
      values.forEach(function(value) {
        var name = $('#modal-profile-editor-tutored-subjects input[value=' + value + ']')
          .closest('.checkbox-label').text().trim();
        subjects.push(name);
      });
      
      subjects.sort(function(a, b) {
        return a.localeCompare(b);
      });
      
      var subjects = subjects.map(function(subject) {
        return '<li class="style-color-1">' + subject + '</li>';
      }).join('\n');
      
      $('#profile-editor-tutored-subjects .list-tags').html(subjects);
    }
    
    function updateTutoredStudyLevelIds(values) {
      var studyLevels = [];
      
      $('#modal-profile-editor-tutored-studylevels input:checkbox').each(function(i, input) {
        $input = $(this);
        var value = $input.val();
        if($.inArray(value, values) != -1) {
          var name = $input.closest('.checkbox-label').text().trim();
          studyLevels.push(name);
        }
      });
      
      var studyLevels = studyLevels.map(function(studyLevel) {
        return '<li class="style-color-1">' + studyLevel + '</li>';
      }).join('\n');
      
      $('#profile-editor-tutored-studylevels .list-tags').html(studyLevels);
    }
    
    function updateTutoringExperience(values) {
      var content = '';
      
      if(values) {
        values.sort(startYearMonthComparator);
        
        values.forEach(function(value) {
          var start = timeUtil.momentFromYearMonth(value.startYearMonth);
          start = timeUtil.momentToYearMonthShort(start);
          
          var end = timeUtil.momentFromYearMonth(value.endYearMonth);
          end = timeUtil.momentToYearMonthShort(end);
          
          content += '<p>' + start + ' - ' + end + '<br><strong>' + value.subjects + '</strong><br>' +
            value.studyLevel + '</p>';
        });
      }
      
      $('#profile-editor-tutoringexperience .group-content').html(content);
    }
    
    function startYearMonthComparator(a, b) {
      if (a.startYearMonth < b.startYearMonth) {
        return -1;
      } else if (a.startYearMonth > b.startYearMonth) {
        return 1;
      } else {
        if (a.endYearMonth < b.endYearMonth) {
          return -1;
        } else if (a.endYearMonth > b.endYearMonth) {
          return 1;
        } else {
          return 0;
        }
      }
    }
    
    function updateDistinctions(values) {
      var content = '';
      
      if(values) {
        values.sort(yearMonthComparator);
        
        values.forEach(function(value) {
          var yearMonth = timeUtil.momentFromYearMonth(value.yearMonth);
          yearMonth = timeUtil.momentToYearMonthShort(yearMonth);
          
          content += '<p>' + yearMonth + '<br>' +
            stringUtil.newlineToBreak(value.description) + '</p>';
        });
      }
      
      $('#profile-editor-distinctions .group-content').html(content);
    }
    
    function yearMonthComparator(a, b) {
      if (a.yearMonth < b.yearMonth) {
        return -1;
      } else if (a.yearMonth > b.yearMonth) {
        return 1;
      } else {
        return 0;
      }
    }
    
    function updateTravelPreference(value) {
      var name = appContext.referenceData.travelPreference[value];
      $('#profile-editor-travelpreference-label').html(name);
    }
    
    function updateHourlyRate(value) {
      value = Math.round(value);
      $('#profile-editor-hourlyrate-label').html(value);
    }
    
    that.showGlobalError = showGlobalError;
    that.clearGlobalError = clearGlobalError;
    that.update = update;
    
    return that;
  }
  
});