define(function(require) {
  var $ = require('jquery');
  var jsRoutes = require('jsRoutes');
  var browserUtil = require('app/util/browserUtil');

  return {
    updateProvinceTranslation: function(provinceId, translationInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.updateProvinceTranslation(provinceId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(translationInfo),
        success: function(data) {
          successHandler({
            params: {
              provinceId: provinceId,
              translationInfo: translationInfo
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
                provinceId: provinceId,
                translationInfo: translationInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    updateLocalityTranslation: function(localityId, translationInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.updateLocalityTranslation(localityId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(translationInfo),
        success: function(data) {
          successHandler({
            params: {
              localityId: localityId,
              translationInfo: translationInfo
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
                localityId: localityId,
                translationInfo: translationInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    updateDistrictTranslation: function(districtId, translationInfo, successHandler, errorHandler) {
      var route = jsRoutes.controllers.AdminController.updateDistrictTranslation(districtId);

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(translationInfo),
        success: function(data) {
          successHandler({
            params: {
              districtId: districtId,
              translationInfo: translationInfo
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
                districtId: districtId,
                translationInfo: translationInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    }
  }

});
