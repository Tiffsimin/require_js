define(function(require) {
  var $ = require('jquery');
  var appContext = require('appContext');
  var jsRoutes = require('jsRoutes');
  var jsMessages = require('jsMessages');
  var browserUtil = require('app/util/browserUtil');
  var E = require('app/common/enum');
  var adminLocationTranslationModal = require('app/admin/location/adminLocationTranslationModal');
  var adminErrorModal = require('app/admin/common/adminErrorModal');
  var adminLocationService = require('app/admin/location/adminLocationService');

  console.log('admin district management module loaded: ');

  var modal = adminLocationTranslationModal({
    callbacks: {
      saveClick: onModalSaveClick
    }
  });
  
  var table;
  
  var tableData = {
    order: [[3, 'asc']],
    columns: [{
      data: 'id',
      title: jsMessages('entity.id'),
      width: '50px'
    }, {
      data: 'sortWeight',
      title: jsMessages('sortweight'),
      defaultContent: '-',
      width: '100px'
    }, {
      data: 'translations.1',
      title: jsMessages('language.chinese'),
      defaultContent: '-'
    }, {
      data: 'translations.0',
      title: jsMessages('language.english'),
      defaultContent: '-',
    }]
  };
  
  function createTable() {
    var ajaxUrl = jsRoutes.controllers.AdminController.getDistricts().url;
    
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
        dataSrc: 'districts'
      },
      'columns': tableData.columns,
      'order': tableData.order,
      'createdRow': function(row, data, dataIndex ) {
        if(!data.translations || !data.translations[0] || !data.translations[1]) {
          $(row).addClass('warning');
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
    modal.show(data);
  }
  
  function onModalSaveClick(data) {
    adminLocationService.updateDistrictTranslation(data.id, data, function(result) {
      reloadTable();
      modal.hide();
    }, function(result) {
      modal.showErrorsFromJqXhr(result.jqXHR);
    });
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
  });

});
