define(function(require) {
  var $ = require('jquery');
  var appContext = require('appContext');
  var jsMessages = require('jsMessages');
  var browserUtil = require('app/util/browserUtil');
  var E = require('app/common/enum');
  var adminUserManagementModal = require('app/admin/user/management/adminUserManagementModal');
  var adminUserService = require('app/admin/user/adminUserService');
  var adminErrorModal = require('app/admin/common/adminErrorModal');
  var adminTableCellRenderer = require('app/admin/common/adminTableCellRenderer');
  var basicUserActionModals = require('app/admin/common/adminBasicUserActionModals');

  console.log('admin user management module loaded: ');

  var modal = adminUserManagementModal({});
  
  var table;
  
  var tableData = {
    order: [[1, 'desc']],
    columns: [{
      data: null,
      defaultContent: "",
      title: jsMessages('user.type'),
      width: '40px',
      className: 'text-center',
      render: adminTableCellRenderer.renderTutorType
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
      data: 'universityEmail',
      title: jsMessages('uniemail.abbrev'),
      defaultContent: '-',
      width: '80px'
    }, {
      data: 'nationality.name',
      title: jsMessages('nationality'),
      defaultContent: '-'
    }, {
      data: 'birthDate',
      title: jsMessages('dateofbirth.abbrev'),
      defaultContent: '-',
      width: '100px'
    }, {
      data: null,
      defaultContent: "",
      title: "",
      orderable: false,
      width: '100px',
      className: 'text-center table-actions',
      render: adminTableCellRenderer.renderBasicUserActions
    }]
  };
  
  function createTable() {
    var ajaxUrl = appContext.config.url.userApiUrl;
    ajaxUrl = browserUtil.appendParameterToUrl(ajaxUrl, 'limit', appContext.config.ui.datatable.maxRowCount);
    
    var dom = "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>";

    var searchField = $('.data-table-search');
    
    table = $('.data-table').DataTable({
      'scrollX': true,
      'pageLength': appContext.config.ui.datatable.defaultPageSize,
      'dom': dom,
      'processing': true,
      'deferRender': true,
      'ajax': {
        url: ajaxUrl,
        dataSrc: 'users.entries'
      },
      'columns': tableData.columns,
      'order': tableData.order,
      'createdRow': function(row, data, dataIndex ) {
        if(data.accountStatus === E.ACCOUNT_STATUS.DELETED) {
          $(row).addClass('status-deleted');
        }
      }
    });
    
    searchField.on('keyup', function () {
      table.search(this.value).draw();
    });
    
    $('tbody').on('click', 'tr', function (event) {
      var $target = $(event.target); 
      if(!$target.closest('.table-actions').length) {
        var rowData = table.row(this).data();
        onRowClick(rowData);
      }
    });
  }
  
  function reloadTable() {
    table.ajax.reload(null, false);
  }
  
  function onRowClick(data) {
    adminUserService.getUserDetail(data.id, function(result) {
      modal.show(result.data);
    }, onGetUserDetailError);
  }
  
  function onGetUserDetailError(result) {
    var errorMessage = browserUtil.createErrorMessageFromJqXhr(result.jqXHR);
    adminErrorModal.show(errorMessage);
  }
  
  $(document).ready(function() {
    createTable();
    
    $.fn.dataTable.ext.errMode = function (settings, techNote, message) {
      var errorMessage = browserUtil.createErrorMessageFromJqXhr(settings.jqXHR);
      adminErrorModal.show(errorMessage);
    };
    
    $('.action-refresh').click(function(event) {
      reloadTable();
    });
    
    basicUserActionModals.on('update.knb', function(event) {
      reloadTable();
    })
  });

});
