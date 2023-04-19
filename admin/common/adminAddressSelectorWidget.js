define(function(require) {
  var $ = require('jquery');
  var adminFormUtil = require('app/util/adminFormUtil');
  var jsMessages = require('jsMessages');

  var LOCATION_MESSAGE_TARGET = 'location-message-target';
  var TEXT_INPUT_NAME = 'address-input';
  var UPDATE_POSITION_DELAY_IN_MS = 500;
  
  return function(spec) {
    spec = spec || {};
    spec.containerId = spec.containerId || 'admin-address-selector';
    
    var that = $({});

    var adminAddressSelector;
    var mapLoaded = false;
    var currentLocation = null;
    var $container;
    var $inputField;
    var $longitudeField;
    var $latitudeField;
    var $streetField;
    var $districtField;
    var $localityField;
    var $provinceField;
    var positionUpdateTimeoutHandle = null;
    
    function initialize() {
      $container = $('#' + spec.containerId);
      $inputField = $container.find('#' + TEXT_INPUT_NAME);
      $longitudeField = $container.find('#longitude');
      $latitudeField = $container.find('#latitude');
      $streetField = $container.find('#street');
      $districtField = $container.find('#district');
      $localityField = $container.find('#locality');
      $provinceField = $container.find('#province');
    }
    initialize();
    
    function loadMap() {
      if(mapLoaded) {
        return;
      }
      
      mapLoaded = true;
      
      require(['app/kui/location/addressSelector'], function(addressSelector) {
        initializeAddressSelector(addressSelector);
      });
    }
    
    function initializeAddressSelector(addressSelector) {
      var addressSelectorSpec = {
        mapCanvasId: 'address-map',
        textInputName: TEXT_INPUT_NAME,
        requiredAddressComponents: ['street', 'district', 'city', 'province'],
        callbacks: {
          change: onAddressSelectorChange,
          geocoderError: onGeocoderError
        }
      };
      
      var initialPosition = getInitialAddressPosition();
      if(initialPosition) {
        addressSelectorSpec.initialPosition = initialPosition;
      }

      adminAddressSelector = addressSelector(addressSelectorSpec);
    }
    
    function getInitialAddressPosition() {
      var latitude = $latitudeField.val();
      var longitude = $longitudeField.val();
      
      if(latitude && longitude) {
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);
        return {lat: latitude, lng: longitude};
      } else {
        return null;
      } 
    }
    
    function showError(message) {
      adminFormUtil.clearFieldError(TEXT_INPUT_NAME);
      adminFormUtil.addFieldError(TEXT_INPUT_NAME, message);
      var fieldValueOnError = $('#' + TEXT_INPUT_NAME).val();
      $('#' + TEXT_INPUT_NAME).on('keyup.locationerror', function () {
        if(fieldValueOnError !== $(this).val()) {
          $(this).off('keyup.locationerror');
          adminFormUtil.clearFieldError(TEXT_INPUT_NAME);
        }
      });
    }
    
    function onAddressSelectorChange(value) {
      currentLocation = value;
      updateHiddenAddressFields(value);
      invokeLocationChangeCallback(value);
    }
    
    function onGeocoderError(message) {
      showError(message);
    }
    
    function updateHiddenAddressFields(value){
      if(value) {
        $longitudeField.val(value.point.lng);
        $latitudeField.val(value.point.lat);
        $streetField.val(value.address.street);
        $districtField.val(value.address.district);
        $localityField.val(value.address.city);
        $provinceField.val(value.address.province);
      } else {
        $longitudeField.val('');
        $latitudeField.val('');
        $streetField.val('');
        $districtField.val('');
        $localityField.val('');
        $provinceField.val('');
      }
    }
    
    function invokeLocationChangeCallback(value) {
      if(spec.callbacks && spec.callbacks.locationChange) {
        spec.callbacks.locationChange(value);
      } 
    }
    
    function getLocation() {
      return currentLocation;
    }
    
    function validate() {
      if(currentLocation) {
        return true;
      } else {
        showError(jsMessages('error.signup.tutor.selectlocation.empty'));
        return false;
      }
    }
    
    function populateFromJson(data) {
      if(!data.address || !data.address.addressSelectorData || !data.latitudeLongitude) {
        return;
      }
      
      $longitudeField.val(data.latitudeLongitude.longitude);
      $latitudeField.val(data.latitudeLongitude.latitude);
      $streetField.val(data.address.street);
      $districtField.val(data.address.addressSelectorData.district);
      $localityField.val(data.address.addressSelectorData.locality);
      $provinceField.val(data.address.addressSelectorData.province);
      
      var inputFieldValue = data.address.addressSelectorData.locality + ', ' + data.address.addressSelectorData.district + ', ' + data.address.street;
      
      if(adminAddressSelector) {
        adminAddressSelector.setInputValue(inputFieldValue);
        
        //this hack is needed to prevent positioning errors when the modal containing the map is not visible, yet
        clearTimeout(positionUpdateTimeoutHandle);
        positionUpdateTimeoutHandle = setTimeout(function() {
          adminAddressSelector.setPosition(data.latitudeLongitude.longitude, data.latitudeLongitude.latitude);
        }, UPDATE_POSITION_DELAY_IN_MS);
      } else {
        $inputField.val(inputFieldValue);
      }

      currentLocation = {
              point: {
                lat: data.latitudeLongitude.latitude,
                lng: data.latitudeLongitude.longitude 
              },
              address: {
                street: data.address.street,
                district: data.address.addressSelectorData.district,
                city: data.address.addressSelectorData.locality,
                province: data.address.addressSelectorData.province
              }
      };
    }
    
    function isInputEmpty() {
      if($inputField.val()) {
        return false;
      } else {
        return true;
      }
    }
    
    function show() {
      if(!mapLoaded) {
        loadMap();
      }
    }
    
    function clear() {
      $inputField.val('');
      $longitudeField.val('');
      $latitudeField.val('');
      $streetField.val('');
      $districtField.val('');
      $localityField.val('');
      $provinceField.val('');
      if(adminAddressSelector) {
      //this hack is needed to prevent positioning errors when the modal containing the map is not visible, yet
        clearTimeout(positionUpdateTimeoutHandle);
        positionUpdateTimeoutHandle = setTimeout(function() {
          adminAddressSelector.reset();
        }, UPDATE_POSITION_DELAY_IN_MS);
      }
      currentLocation = null;
    }
    
    that.show = show;
    that.clear = clear;
    that.getLocation = getLocation;
    that.validate = validate;
    that.populateFromJson = populateFromJson;
    that.isInputEmpty = isInputEmpty;
    
    return that;
  }
  
});