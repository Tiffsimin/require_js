define(function(require) {
  var $ = require('jquery');
  var moment = require('momentI18n');

  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    var $footer;
    var $footerTitle;
    var $footerEntries;
    
    function initialize() {
      $footer = $('.table-calendar-footer');
      $footerTitle = $('.table-calendar-footer-title');
      $footerEntries = $('.table-calendar-footer-entries');
      addCellEntryListeners();
    }
    initialize();
    
    function addCellEntryListeners() {
      $('.state-default .meta-date').click(onMetaDateClick);
      $('.state-default .meta-entry').click(onMetaEntryClick);
    }
    
    function invokeDateCellClickCallback(date) {
      if(spec.callbacks && spec.callbacks.dateCellClick) {
        spec.callbacks.dateCellClick(date);
      }
    }
    
    function invokeEntryClickCallback(date, availabilityId) {
      if(spec.callbacks && spec.callbacks.entryClick) {
        spec.callbacks.entryClick(date, availabilityId);
      }
    }
    
    function onMetaDateClick(event) {
      event.preventDefault();
      var $entry = $(this);
      var date = $entry.data('knbDate');
      var entries = $entry.parent().children('.meta-entry');
      updateCompactCalendarEntries(date, entries);
      if(!isCompactCalendarShown()) {
        invokeDateCellClickCallback(date);
      }
    }
    
    function onMetaEntryClick(event) {
      event.preventDefault();
      var $entry = $(this);
      var date = $entry.siblings('.meta-date').data('knbDate');
      var entries = $entry.parent().children('.meta-entry');
      updateCompactCalendarEntries(date, entries);
      var availabilityId = $entry.data('knbAvailabilityId');
      invokeEntryClickCallback(date, availabilityId);
    }
    
    function updateCompactCalendarEntries(date, entries)  {
      var formattedDate = moment(date, moment.ISO_8601).format('LL');
      var title = jsMessages('entriesfor', formattedDate);
      $footerTitle.html(title);
      
      $footerEntries.empty();
      if(entries) {
        entries.each(function(index, entry) {
          var $entry = $(entry).clone();
          $entry.click(function(event) {
              event.preventDefault();
              var availabilityId = $entry.data('knbAvailabilityId');
              invokeEntryClickCallback(date, availabilityId);
          });
          $footerEntries.append($('<li></li>').append($entry));
        });
      }
      
      var $addNew = $('<a href="#" class="meta-entry">' + jsMessages('addnewavailability') + '</a>').click(function(event) {
        event.preventDefault();
        invokeDateCellClickCallback(date);
      });
      $footerEntries.append($('<li></li>').append($addNew));
    }
    
    function isCompactCalendarShown() {
      return $footer.is(":visible");
    }

    return that;
  }
  
});