define(function(require) {
  var jsMessages = require('jsMessages');
  var E = require('app/common/enum');
  var moment = require('momentI18n');

  return function create() {
    var that = $({});
    
    function initialize() {

    }
    
    $(document).ready(function() {
      initialize();
    });
    
    function renderBasicUserActions(data, type, row) {
      var statusClass = '';
      var statusTitle = '';
      if(row.accountStatus === E.ACCOUNT_STATUS.ACTIVATION_PENDING) {
        statusClass = 'status-pending';
        statusTitle = '(' + jsMessages('accountstatus.activationpending') + ')';
      } else if(row.accountStatus === E.ACCOUNT_STATUS.ACTIVE) {
        statusClass = 'status-active';
        statusTitle = '(' + jsMessages('accountstatus.active') + ')';
      } else if(row.accountStatus === E.ACCOUNT_STATUS.DISABLED) {
        statusClass = 'status-disabled';
        statusTitle = '(' + jsMessages('accountstatus.disabled') + ')';
      } else if(row.accountStatus === E.ACCOUNT_STATUS.ABANDONED) {
        statusClass = 'status-abandoned';
        statusTitle = '(' + jsMessages('accountstatus.abandoned') + ')';
      }
      
      var showDisabled = '';
      if(row.tutorType === null || row.accountStatus !== E.ACCOUNT_STATUS.ACTIVE) {
        showDisabled = 'disabled';
      }
      
      if(row.accountStatus === E.ACCOUNT_STATUS.DELETED) {
        return jsMessages('deleted');
      } else {
        if(type === 'filter') {
          return statusClass;
        } else {
          return  '<div class="form-inline">' +
            '<button class="btn btn-default btn-xs ' + showDisabled + '" data-knb-action="show-user-profile" data-knb-user-id="' + row.id + '" type="button" title="' + jsMessages('action.user.showprofile') + '"><i class="fa fa-user"></i></button>' +
            '<button class="btn btn-default btn-xs" data-knb-action="delete-account" data-knb-user-id="' + row.id + '" type="button" title="' + jsMessages('action.user.delete') + '"><i class="fa fa-trash"></i></button>' +
            '<button class="btn btn-default btn-xs" data-knb-action="change-account-status" data-knb-user-id="' + row.id + '" type="button" title="' + jsMessages('action.user.changestatus') + ' ' + statusTitle + '"><i class="fa fa-circle ' + statusClass + '"></i></button>' +
          '</div>';
        }
      }
    }
    
    function renderVerificationActions(data, type, row) {
      return  '<div class="form-inline">' +
        '<button class="btn btn-default btn-xs" data-knb-action="delete-account" data-knb-user-id="' + row.id + '" type="button" title="' + jsMessages('action.user.delete') + '"><i class="fa fa-trash"></i></button>' +
        '<button class="btn btn-default btn-xs" data-knb-action="change-account-status" data-knb-set-account-status="' + E.ACCOUNT_STATUS.ABANDONED + '" data-knb-user-id="' + row.id + '" type="button" title="' + jsMessages('action.user.changestatus.abandoned') + '"><i class="fa fa-road"></i></button>' +
      '</div>';
    }
    
    function renderTutorType(data, type, row) {
      if(row.tutorType === E.TUTOR_TYPE.CHINESE_ACADEMIC) {
        return 'CAT';
      } else if(row.tutorType === E.TUTOR_TYPE.FOREIGN_LANGUAGE){
        return 'FLT';
      } else if(row.tutorType === null){
        return 'STU';
      } else {
        return '-';
      }
    }
    
    function renderDate(data, type) {
      if(type === 'display' || type === 'filter') {
        var date = moment(data, moment.ISO_8601);
        var today = moment();
        if(date.isSame(today, 'day')) {
          return jsMessages('today') + ', ' + date.format('HH:mm');
        } else {
          return date.format('MMM DD, HH:mm');
        }
      } else {
        return data;
      }
    }
    
    that.renderBasicUserActions = renderBasicUserActions;
    that.renderVerificationActions = renderVerificationActions;
    that.renderTutorType = renderTutorType;
    that.renderDate = renderDate;

    return that;
  }();
  
});