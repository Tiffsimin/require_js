define(function(require) {
  var $ = require('jquery');
  var jsRoutes = require('jsRoutes');
  var browserUtil = require('app/util/browserUtil');

  return {
    getUsers: function(query, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.getUsers();
      
      var url = route.url;
      
      if(query.hasOwnProperty('limit')) {
        url = browserUtil.appendParameterToUrl(url, 'limit', query.limit);
        delete query.limit;
      }
      
      if(query.hasOwnProperty('sort')) {
        url = browserUtil.appendParameterToUrl(url, 'sort', encodeURIComponent(query.sort));
        delete query.sort;
      }
      
      var filter = '';
      for(var filterName in query) {
        if(filter) {
          filter += "|";
        }
        filter += filterName + '::' + query[filterName];
      }
      
      if(filter) {
        url = browserUtil.appendParameterToUrl(url, 'filter', encodeURIComponent(filter));
      }

      $.ajax({
        url: url,
        type: route.type,
        success: function(data) {
          successHandler({
            params: {
              query: query
            },
            data: data
          });
        },
        error: function(jqXHR) {
          if(jqXHR.status == 401) {
            browserUtil.redirect(jqXHR.responseText);
          } else {
            errorHandler({
              params: {
                query: query
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    getUserDetail: function(userId, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.getUserDetail(userId);

      $.ajax({
        url: route.url,
        type: route.type,
        success: function(data) {
          successHandler({
            params: {
              userId: userId
            },
            data: data
          });
        },
        error: function(jqXHR) {
          if(jqXHR.status == 401) {
            browserUtil.redirect(jqXHR.responseText);
          } else {
            errorHandler({
              params: {
                userId: userId
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    updateInitialCallInfo: function(userId, initialCallInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.updateInitialCallInfo(userId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(initialCallInfo),
        success: function(data) {
          successHandler({
            params: {
              userId: userId,
              initialCallInfo: initialCallInfo
            },
            data: data
          });
        },
        error: function(jqXHR) {
          if(jqXHR.status == 401) {
            browserUtil.redirect(jqXHR.responseText);
          } else {
            errorHandler({
              params: {
                userId: userId,
                initialCallInfo: initialCallInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    updateInterviewInfo: function(userId, interviewInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.updateInterviewInfo(userId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(interviewInfo),
        success: function(data) {
          successHandler({
            params: {
              userId: userId,
              interviewInfo: interviewInfo
            },
            data: data
          });
        },
        error: function(jqXHR) {
          if(jqXHR.status == 401) {
            browserUtil.redirect(jqXHR.responseText);
          } else {
            errorHandler({
              params: {
                userId: userId,
                interviewInfo: interviewInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    updateDocumentRetrievalInfo: function(userId, documentRetrievalInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.updateDocumentRetrievalInfo(userId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(documentRetrievalInfo),
        success: function(data) {
          successHandler({
            params: {
              userId: userId,
              documentRetrievalInfo: documentRetrievalInfo
            },
            data: data
          });
        },
        error: function(jqXHR) {
          if(jqXHR.status == 401) {
            browserUtil.redirect(jqXHR.responseText);
          } else {
            errorHandler({
              params: {
                userId: userId,
                documentRetrievalInfo: documentRetrievalInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    deleteAccount: function(userId, accountDeletionInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.deleteAccount(userId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(accountDeletionInfo),
        success: function(data) {
          successHandler({
            params: {
              userId: userId,
              accountDeletionInfo: accountDeletionInfo
            },
            data: data
          });
        },
        error: function(jqXHR) {
          if(jqXHR.status == 401) {
            browserUtil.redirect(jqXHR.responseText);
          } else {
            errorHandler({
              params: {
                userId: userId,
                accountDeletionInfo: accountDeletionInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    changeAccountStatus: function(userId, accountStatusChangeInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.changeAccountStatus(userId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(accountStatusChangeInfo),
        success: function(data) {
          successHandler({
            params: {
              userId: userId,
              accountStatusChangeInfo: accountStatusChangeInfo
            },
            data: data
          });
        },
        error: function(jqXHR) {
          if(jqXHR.status == 401) {
            browserUtil.redirect(jqXHR.responseText);
          } else {
            errorHandler({
              params: {
                userId: userId,
                accountStatusChangeInfo: accountStatusChangeInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    }
  }

});
