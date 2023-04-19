define(function(require) {
  var $ = require('jquery');
  var browserUtil = require('app/util/browserUtil');
  var jsRoutes = require('jsRoutes');
  var jsMessages = require('jsMessages');
  var E = require('app/common/enum');
  var multiValueFilterComponent = require('app/kui/form/filter/multiValueFilterComponent');
  var singleValueFilterComponent = require('app/kui/form/filter/singleValueFilterComponent');
  var priceRangeFilterComponent = require('app/profile/search/priceRangeFilterComponent');
  var resultCountAndSortControlsWidget = require('app/profile/search/resultCountAndSortControlsWidget');
  var activeFiltersWidget = require('app/profile/search/activeFiltersWidget');
  var permissionManager = require('app/user/permissionManager');
  var defaultDialog = require('app/kui/dialog/defaultDialog')
  var requestGuidanceModal = require('app/profile/search/requestGuidanceModal');
  var messagingService = require('app/messaging/messagingService');
        
  console.log('searchTutors module loaded: ');
  
  var PERMISSION_MANAGER_ERROR_KEY = 'error.permissionmanager';
  var SCROLL_TO_TUTOR_OFFSET = -50;
  
  var filters = {};
  var resultCountAndSortControls;
  
  var filterChanged = false;
  var lastFilter = null;
  var lastSort = null;
  var permissionManagerErrorDialog;
  var sendGuidanceRequestMessageCompleteDialog;
  var requestModal;
  
  function addMultiValueFilter(filterName) {
    var filter = multiValueFilterComponent({
      filterName: filterName,
      callbacks: {
        close: onFilterClose,
        change: onFilterChange
      }
    });
    filters[filterName] = filter;
  }
  
  function addSingleValueFilter(filterName) {
    var filter = singleValueFilterComponent({
      filterName: filterName,
      callbacks: {
        close: onFilterClose,
        change: onFilterChange
      }
    });
    filters[filterName] = filter;
  }
  
  function addPriceRangeFilter() {
    var filter = priceRangeFilterComponent({
      callbacks: {
        close: onFilterClose,
        change: onFilterChange
      }
    });
    filters["priceRange"] = filter;
  }
  
  function getCurrentTutorTypeId() {
    return $('.type-selector .button.active').data('knbTutorTypeId');
  }
  
  function serializeFilters() {
    var tutorTypeId = getCurrentTutorTypeId(); 
    var tutorTypeFilter = 'tutorTypeId::' + tutorTypeId;
    var serializedFilters = [tutorTypeFilter];
    
    for(var filterName in filters) {
      var filter = filters[filterName];
      var serializedFilter = filter.serialize();
      if(serializedFilter) {
        serializedFilters.push(serializedFilter);
      }
    }
    
    return serializedFilters.join('|');
  }
  
  function updateEntries() {
    var currentFilter = serializeFilters();
    var currentSort = resultCountAndSortControls.getSort();
    if(currentFilter === lastFilter && currentSort === lastSort) {
      return;
    }
    
    showLoadingOverlay();
    
    lastFilter = currentFilter;
    lastSort = currentSort;
    
    var url = jsRoutes.controllers.ProfileController.showTutorSearch().url;
    
    if(currentFilter) {
      url = browserUtil.appendParameterToUrl(url, "filter", encodeURIComponent(currentFilter));
    }
    
    if(currentSort) {
      url = browserUtil.appendParameterToUrl(url, "sort", encodeURIComponent(currentSort));
    }
    
    browserUtil.navigateTo(url);
  }
  
  function showLoadingOverlay() {
    closeAllFilters();
    $('.loading-container').addClass('is-loading');
  }
  
  function closeAllFilters() {
    for(var filterName in filters) {
      var filter = filters[filterName];
      filter.close();
    }
  }
  
  $(document).ready(function() {
    if($('#filter-districtIds').length) {
      addMultiValueFilter('districtIds');
    }
    
    addMultiValueFilter('tutoredSubjectIds');
    
    if(getCurrentTutorTypeId() == E.TUTOR_TYPE.CHINESE_ACADEMIC) {
      addMultiValueFilter('universityIds');
      addMultiValueFilter('studyLevelIds');
    } else {
      addSingleValueFilter('skillLevelId');
    }
    
    addSingleValueFilter('genderId');
    addPriceRangeFilter();
    
    resultCountAndSortControls = resultCountAndSortControlsWidget({
      callbacks: {
        sortChange: onSortChange
      }
    });
    
    activeFilters = activeFiltersWidget({
      callbacks: {
        filterClick: onActiveFiltersFilterClick,
        clearClick: onActiveFiltersClearClick
      }
    });
    
    lastFilter = serializeFilters();
    lastSort = resultCountAndSortControls.getSort();
    
    scrollToTutorWhenComingFromProfile();
    
    $.fn.matchHeight._maintainScroll = true;
    $('.container-tutor-listing .tutor-listing').matchHeight({
        byRow: true,
        property: 'height',
        target: null,
        remove: false
    });
    
    initializeGuidanceRequestModal();
  });
  
  function initializeGuidanceRequestModal() {
    permissionManagerErrorDialog = defaultDialog({
      id: 'permission-manager-error-dialog',
      showCloseButton: true
    });
    
    sendGuidanceRequestMessageCompleteDialog = defaultDialog({
      id: 'guidance-request-sent-dialog',
      showCloseButton: true,
      successTitle: jsMessages("thankyou"),
      message: jsMessages("profile.search.requestguidance.success")
    });
    
    requestModal = requestGuidanceModal({
      callbacks: {
       sendRequestClick: onSendGuidanceRequestClick
      }
    });
    
    $('.action-request-guidance').click(function(event) {
      event.preventDefault();
      permissionManager.executeIfLoggedInAndActivatedOrShowModal(function() {
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
    });
  }
  
  function scrollToTutorWhenComingFromProfile() {
    var hash = window.location.hash;
    if(hash && hash !== "#") {
      browserUtil.scrollToElement(hash, SCROLL_TO_TUTOR_OFFSET);
    }
  }
  
  function onSendGuidanceRequestClick(data) {
    messagingService.sendGuidanceRequestMessage(data, onSendGuidanceRequestMessageCompleted, onSendGuidanceRequestMessageFailed);
  }
  
  function onSendGuidanceRequestMessageCompleted(result) {
    sendGuidanceRequestMessageCompleteDialog.show();
  }
  
  function onSendGuidanceRequestMessageFailed(result) {
    requestModal.showErrorsFromJqXhr(result.jqXHR);
  }
  
  function onFilterClose() {
    if(filterChanged) {
      updateEntries();
    }
    
    filterChanged = false;
  }
  
  function onFilterChange() {
    filterChanged = true;
  }
  
  function onSortChange() {
    updateEntries();
  }
  
  function onActiveFiltersFilterClick(name, value) {
    var filter = filters[name];
    filter.deselectValue(value);
    updateEntries();
  }
  
  function onActiveFiltersClearClick() {
    for(var filterName in filters) {
      var filter = filters[filterName];
      filter.deselectAll();
    }
    updateEntries();
  }
  
});
