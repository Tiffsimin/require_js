define(function(require) {
  var $ = require('jquery');
  var appContext = require('appContext');
  var jsMessages = require('jsMessages');
  var browserUtil = require('app/util/browserUtil');
  var E = require('app/common/enum');
  var moment = require('momentI18n');
  var adminUserVerificationModal = require('app/admin/user/verification/adminUserVerificationModal');
  var adminUserService = require('app/admin/user/adminUserService');
  var adminErrorModal = require('app/admin/common/adminErrorModal');
  var adminTableCellRenderer = require('app/admin/common/adminTableCellRenderer');
  var basicUserActionModals = require('app/admin/common/adminBasicUserActionModals');

  console.log('admin user verification module loaded: ');
  
  var modal = adminUserVerificationModal({
    callbacks: {
      initialCallTabSaveClick: onModalInitialCallTabSaveClick,
      interviewTabSaveClick: onModalInterviewTabSaveClick,
      documentRetrievalTabSaveClick: onModalDocumentRetrievalTabSaveClick
    }
  });
  
  var requestedUserDetail = {
          status: null,
          userId: null
  };
  
  var actionsColumn = {
    data: null,
    defaultContent: "",
    title: "",
    orderable: false,
    searchable: false,
    width: '65px',
    className: 'text-center table-actions',
    render: adminTableCellRenderer.renderVerificationActions
  };
  
  var tableData = {
          'tab-unscheduled': {
            created: false,
            tableRef: null,
            verificationStatusId: E.TUTOR_VERIFICATION_STATUS.UNSCHEDULED,
            order: [[6, 'asc']],
            columns: [{
              data: null,
              defaultContent: "",
              title: "",
              orderable: false,
              searchable: false,
              width: '5px',
              className: 'text-center',
              render: function(data, type, row) {
                if(row.hasInitialCallNotes) {
                  return '<i class="pg-note"></i>';
                } else {
                  return '';
                }
              }
            }, {
              data: 'id',
              title: jsMessages('user.id'),
              width: '50px'
            }, {
              data: 'displayName',
              title: jsMessages('displayname')
            }, {
              data: 'email',
              title: jsMessages('email.abbrev')
            }, {
              data: 'phoneNumber',
              title: jsMessages('phonenumber.abbrev'),
              width: '100px',
              defaultContent: ""
            }, {
              data: 'nationality.name',
              title: jsMessages('nationality'),
              defaultContent: ""
            }, {
              data: 'creationDateTime',
              title: jsMessages('user.created'),
              defaultContent: "",
              width: '100px',
              render: adminTableCellRenderer.renderDate
            }, $.extend({}, actionsColumn)],
            createdRowHandler: function(row, data, dataIndex ) {
              if(data.hasInitialCallNotes) {
                $(row).addClass('warning');
              }
            },
            clickedRowHandler: onUnscheduledRowClick
          },
          'tab-scheduled': {
            created: false,
            tableRef: null,
            verificationStatusId: E.TUTOR_VERIFICATION_STATUS.SCHEDULED,
            order: [[4, 'asc']],
            columns: [{
              data: 'id',
              title: jsMessages('user.id'),
              width: '60px'
            }, {
              data: 'displayName',
              title: jsMessages('displayname')
            }, {
              data: 'email',
              title: jsMessages('email.abbrev')
            }, {
              data: 'nationality.name',
              title: jsMessages('nationality'),
              defaultContent: ""
            }, {
              data: 'interviewDateTime',
              title: jsMessages('datetime'),
              defaultContent: "",
              width: '100px',
              render: adminTableCellRenderer.renderDate
            }, {
              data: 'interviewLocation',
              title: jsMessages('location'),
              defaultContent: ""
            }, $.extend({}, actionsColumn)],
            createdRowHandler: function(row, data, dataIndex ) {
              var interviewDate = moment(data.interviewDateTime, moment.ISO_8601);
              var today = moment();
              if(interviewDate.isSame(today, 'day')) {
                $(row).addClass('warning');
              } else if(interviewDate.isBefore(today, 'day')) {
                $(row).addClass('danger');
              }
            },
            clickedRowHandler: onScheduledRowClick
          },
          'tab-awaiting-documents': {
            created: false,
            tableRef: null,
            verificationStatusId: E.TUTOR_VERIFICATION_STATUS.AWAITING_DOCUMENTS,
            order: [[5, 'asc']],
            columns: [{
              data: 'id',
              title: jsMessages('user.id'),
              width: '50px'
            }, {
              data: 'displayName',
              title: jsMessages('displayname')
            }, {
              data: 'email',
              title: jsMessages('email.abbrev')
            }, {
              data: 'phoneNumber',
              title: jsMessages('phonenumber.abbrev'),
              width: '100px',
              defaultContent: ""
            }, {
              data: 'nationality.name',
              title: jsMessages('nationality'),
              defaultContent: ""
            }, {
              data: 'interviewDateTime',
              title: jsMessages('user.interviewed'),
              defaultContent: "",
              width: '100px',
              render: adminTableCellRenderer.renderDate
            }, $.extend({}, actionsColumn)],
            clickedRowHandler: onAwaitingDocumentsRowClick
          }
  };
  
  function createTable(id) {
    var data = tableData[id];
    
    if(!data) {
      throw "adminUserVerificationController: unsupported id '" +  id + "' encountered";
    }
    
    if(data.created) {
      data.tableRef.ajax.reload();
      return;
    }
    
    data.created = true;
      
    var filter = '';
    filter += 'tutorVerificationStatusId::' + data.verificationStatusId + '|';
    filter += 'tutorTypeId::' + E.TUTOR_TYPE.FOREIGN_LANGUAGE;
    
    var ajaxUrl = appContext.config.url.userApiUrl;
    ajaxUrl = browserUtil.appendParameterToUrl(ajaxUrl, 'limit', appContext.config.ui.datatable.maxRowCount);
    ajaxUrl = browserUtil.appendParameterToUrl(ajaxUrl, "filter", encodeURIComponent(filter));
    
    var dom = "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>";

    var searchField = $('#' + id + ' .data-table-search');
    
    var table = $('#' + id + ' .data-table').DataTable({
      'scrollX': true,
      'pageLength': appContext.config.ui.datatable.defaultPageSize,
      'dom': dom,
      'processing': true,
      'deferRender': true,
      'ajax': {
        url: ajaxUrl,
        dataSrc: 'users.entries'
      },
      'columns': data.columns,
      'order': data.order,
      'createdRow': data.createdRowHandler
    });
    
    data.tableRef = table;
    
    searchField.on('keyup', function () {
      table.search(this.value).draw();
    });
    
    if(data.clickedRowHandler) {
      $('#' + id + ' tbody').on('click', 'tr', function (event) {
        var $target = $(event.target); 
        if(!$target.closest('.table-actions').length) {
          var rowData = table.row(this).data();
          data.clickedRowHandler(rowData);
        }
      });
    }
  }
  
  function reloadCurrentTable() {
    var currentTableId = $('.user-verification-data-table .nav-tabs li.active a').attr('href').substr(1);
    tableData[currentTableId].tableRef.ajax.reload(null, false);
  }
  
  function onUnscheduledRowClick(data) {
    requestedUserDetail.status = E.TUTOR_VERIFICATION_STATUS.UNSCHEDULED;
    requestedUserDetail.userId = data.id;
    
    adminUserService.getUserDetail(data.id, function(result) {
      if(requestedUserDetail.status === E.TUTOR_VERIFICATION_STATUS.UNSCHEDULED &&
              requestedUserDetail.userId === result.params.userId) {
        modal.show(modal.MODE.INITIAL_CALL, result.data);
      }
    }, onGetUserDetailError);
  }
  
  function onScheduledRowClick(data) {
    requestedUserDetail.status = E.TUTOR_VERIFICATION_STATUS.SCHEDULED;
    requestedUserDetail.userId = data.id;
    
    adminUserService.getUserDetail(data.id, function(result) {
      if(requestedUserDetail.status === E.TUTOR_VERIFICATION_STATUS.SCHEDULED &&
              requestedUserDetail.userId === result.params.userId) {
        modal.show(modal.MODE.INTERVIEW, result.data);
      }
    }, onGetUserDetailError);
  }
  
  function onAwaitingDocumentsRowClick(data) {
    requestedUserDetail.status = E.TUTOR_VERIFICATION_STATUS.AWAITING_DOCUMENTS;
    requestedUserDetail.userId = data.id;
    
    adminUserService.getUserDetail(data.id, function(result) {
      if(requestedUserDetail.status === E.TUTOR_VERIFICATION_STATUS.AWAITING_DOCUMENTS &&
              requestedUserDetail.userId === result.params.userId) {
        modal.show(modal.MODE.DOCUMENT_RETRIEVAL, result.data);
      }
    }, onGetUserDetailError);
  }
  
  function onGetUserDetailError(result) {
    var errorMessage = browserUtil.createErrorMessageFromJqXhr(result.jqXHR);
    adminErrorModal.show(errorMessage);
  }
  
  function onModalInitialCallTabSaveClick(data) {
    adminUserService.updateInitialCallInfo(requestedUserDetail.userId, data, function(result) {
      reloadCurrentTable();
      modal.hide();
    }, onUserServiceError);
  }
  
  function onModalInterviewTabSaveClick(data) {
    adminUserService.updateInterviewInfo(requestedUserDetail.userId, data, function(result) {
      reloadCurrentTable();
      modal.hide();
    }, onUserServiceError);
  }
  
  function onModalDocumentRetrievalTabSaveClick(data) {
    adminUserService.updateDocumentRetrievalInfo(requestedUserDetail.userId, data, function(result) {
      reloadCurrentTable();
      modal.hide();
    }, onUserServiceError);
  }
  
  function onUserServiceError(result) {
    modal.showErrorsFromJqXhr(result.jqXHR);
  }
  
  $(document).ready(function() {
    $.fn.dataTable.ext.errMode = function (settings, techNote, message) {
      var errorMessage = browserUtil.createErrorMessageFromJqXhr(settings.jqXHR);
      adminErrorModal.show(errorMessage);
    };
    
    $('.user-verification-data-table a[data-toggle="tab"]').on('show.bs.tab', function (e) {
      var targetId = e.target.toString().match(/#.+/gi)[0].substr(1);
      createTable(targetId);
    });
    
    $('.user-verification-data-table a[data-toggle="tab"]').first().trigger('show.bs.tab');
    
    $('.action-refresh').click(function(event) {
      reloadCurrentTable();
    });
    
    basicUserActionModals.on('update.knb', function(event) {
      reloadCurrentTable();
    })
  });

});
