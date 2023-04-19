define(function(require) {
  var $ = require('jquery');
  var defaultModal = require('app/kui/modal/defaultModal');
  var formUtil = require('app/util/formUtil');
  var browserUtil = require('app/util/browserUtil');
  var jsMessages = require('jsMessages');
  var cropper = require('cropper');
  
  var MAIN_PAGE_ERROR_CONTAINER_ID = 'profile-editor-global-error-message';
  var MODAL_ERROR_CONTAINER_ID = 'global-error-message-profile-picture-upload';
  var SHOW_LOADING_INDICATOR_DELAY = 500;
  var PICTURE_SIZE = 120;
  
  return function(spec) {
    spec = spec || {};
    
    var that = $({});
    var $modal;
    var $modalContainer;
    var $cancelButton;
    var $saveButton;
    var $profilePictureForm;
    var $profilePictureInput;
    var $profilePictureUploadIFrame;
    var $rawProfilePictureUrl;
    var $cropperContainer;
    var $cropperWrapper;
    var $cropperImage;
    var $cropperInitializingIndicator;
    var $cropperButtons;
    var $zoomInButton;
    var $zoomOutButton;
    var $preview;
    var loadingIndicatorTimeoutHandle;
    var cropperInitialized;
    
    function initialize() {
      var modalSpec = {
              id: 'modal-profile-editor-profile-picture-upload',
              callbacks: {
                hide: onModalHide
              }
      };
      var modalMy = {};
      $modal = defaultModal(modalSpec, modalMy);
      $modalContainer = modalMy.modal;

      $cancelButton = $modalContainer.find('.action-cancel');
      $saveButton = $modalContainer.find('.action-save');
      $profilePictureInput = $('#upload-profile-picture');
      $profilePictureForm = $profilePictureInput.closest('form');
      $cropperContainer = $modalContainer.find('.profile-picture-cropper-container');
      $cropperWrapper = $modalContainer.find('.profile-picture-cropper-wrapper');
      $cropperImage = $cropperWrapper.find('img');
      $cropperInitializingIndicator = $cropperContainer.find('.initializing-indicator');
      $cropperButtons = $cropperContainer.find('.profile-picture-cropper-buttons');
      $zoomInButton = $cropperButtons.find('.action-zoom-in');
      $zoomOutButton = $cropperButtons.find('.action-zoom-out');
      $previewContainer = $modalContainer.find('.profile-picture-preview-container');
      $preview = $('.profile-picture-preview');
      
      if (!browserUtil.support.formData) {
        initializeProfilePictureUploadIframe();
      }
      
      registerProfilePictureUploadListeners();
      registerClickListeners();
    }
    initialize();
    
    function editProfilePicture(url) {
      $cropperInitializingIndicator.show();
      $cropperWrapper.css('visibility', 'hidden');
      $cropperButtons.css('visibility', 'hidden');
      $previewContainer.css('visibility', 'hidden');
      
      if(cropperInitialized) {
        $cropperImage.cropper('destroy');
      }
      
      initializeCropper(url);
      showModal();
    }
    
    function showModal() {
      $modal.show();
    }
    
    function hideModal() {
      $modal.hide();
    }
    
    function initializeCropper(url) {
      cropperInitialized = true;
      $cropperImage.attr('src', url);
      $cropperImage.cropper({
        checkCrossOrigin: false,
        viewMode: 1,
        aspectRatio: 1,
        dragMode: 'move',
        autoCropArea: 0.65,
        autoCrop: false,
        restore: false,
        guides: false,
        highlight: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        zoomOnWheel: false,
        toggleDragModeOnDblclick: false,
        preview: '.profile-picture-preview',
        built: function () {
         $cropperInitializingIndicator.hide();
         $(this).cropper('crop');
         var containerData = $(this).cropper('getContainerData');
         var leftPos = Math.round((containerData.width - PICTURE_SIZE) / 2);
         var topPos = Math.round((containerData.height - PICTURE_SIZE) / 2);
         $(this).cropper('setCropBoxData', {width: PICTURE_SIZE, height: PICTURE_SIZE, left: leftPos, top: topPos});
         $cropperWrapper.css('visibility', 'visible');
         $cropperButtons.css('visibility', 'visible');
         $previewContainer.css('visibility', 'visible');
         browserUtil.fixIE8SilIcons($modalContainer);
        },
        zoom: function (e) {
          if (e.ratio > 1) {
            e.preventDefault();
          }
        }
      });
    }

    function registerProfilePictureUploadListeners() {
      if(!($.browser.msie && $.browser.versionNumber <= 8)) {
        $('.profile-avatar label').on('click', function(e){
            e.preventDefault();
            $profilePictureInput.trigger('click');
        });
      }

      $profilePictureInput.on('change', function(e){
        loadingIndicatorTimeoutHandle = setTimeout(showLoadingIndicator, SHOW_LOADING_INDICATOR_DELAY);
        clearAllErrors();
        $profilePictureForm.submit();
      });
      
      $profilePictureForm.submit(function(event) {
        if(!$profilePictureInput.val()) {
          return false;
        }
        
        if(browserUtil.support.formData) {
          ajaxUploadProfilePicture();
          return false;
        }
      });
    }
    
    function registerClickListeners() {
      $cancelButton.click(function(event){
        event.preventDefault();
        $modal.hide();
      });
      
      $saveButton.click(function(event){
        event.preventDefault();
        var data = $cropperImage.cropper('getData', true);
        invokeSaveClickCallback(data);
      });
      
      $zoomInButton.click(function(event){
        event.preventDefault();
        $cropperImage.cropper('zoom', 0.1); 
      });
      
      $zoomOutButton.click(function(event){
        event.preventDefault();
        $cropperImage.cropper('zoom', -0.1);
      });
    }
    
    function initializeProfilePictureUploadIframe() {
      var target = 'upload-iframe-' + (new Date()).getTime();
      var $profilePictureUploadIFrame = $('<iframe>').attr({
            name: target,
            src: ''
          });

      $profilePictureUploadIFrame.one('load', function () {
        $profilePictureUploadIFrame.on('load', function () {
          var data;

          try {
            data = $(this).contents().find('body').text();
          } catch (e) {
            showUploadError(2);
            return;
          }

          if (data) {
            try {
              data = $.parseJSON(data);
            } catch (e) {
              showUploadError(3);
              return;
            }
          } else {
            showUploadError(4);
            return;
          }

          if(data) {
            handleProfilePictureUpload(data);
          }
        });
      });

      $profilePictureForm.attr('target', target).after($profilePictureUploadIFrame.hide());
    }
    
    function showUploadError(code) {
      hideLoadingIndicator();
      var errorMessage = jsMessages('error.system.rawprofilepictureupload') + ' (code ' + code + ')';
      showErrorOnMainPage(errorMessage);
    }
    
    function ajaxUploadProfilePicture() {
      var url = $profilePictureForm.attr('action');
      var data = new FormData($profilePictureForm[0]);

      $.ajax(url, {
        type: 'post',
        data: data,
        processData: false,
        contentType: false,

        success: function (data) {
          data = $.parseJSON(data);
          handleProfilePictureUpload(data);
        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {
          hideLoadingIndicator();
          var errorMessage = XMLHttpRequest && XMLHttpRequest.responseText
          if(errorMessage) {
            showErrorOnMainPage(errorMessage);
          } else {
            showUploadError(1);
          }
        },

      });
    }
    
    function handleProfilePictureUpload(data) {
      hideLoadingIndicator();
      if(data.success) {
        editProfilePicture(data.rawProfilePictureUrl);
      } else {
        showErrorOnMainPage(data.errorMessage);
      }
    }
    
    function showLoadingIndicator() {
      $('.loading-container').addClass('is-loading');
      browserUtil.scrollToTopOfPage();
    }
    
    function hideLoadingIndicator() {
      clearTimeout(loadingIndicatorTimeoutHandle);
      $('.loading-container').removeClass('is-loading');
    }
    
    function clearAllErrors() {
      formUtil.replaceWithEmptyDiv(MAIN_PAGE_ERROR_CONTAINER_ID);
      formUtil.replaceWithEmptyDiv(MODAL_ERROR_CONTAINER_ID);
    }
    
    function showErrorOnMainPage(message) {
      formUtil.replaceWithErrorMessage(MAIN_PAGE_ERROR_CONTAINER_ID, message)
    }
    
    function showErrorInModal(message) {
      formUtil.replaceWithErrorMessage(MODAL_ERROR_CONTAINER_ID, message)
    }
    
    function invokeSaveClickCallback(date) {
      if(spec.callbacks && spec.callbacks.saveClick) {
        spec.callbacks.saveClick(date);
      }
    }
    
    function onModalHide(modal) {
      $cancelButton.trigger('click');
    }
    
    that.clearAllErrors = clearAllErrors;
    that.showErrorInModal = showErrorInModal;
    that.showLoadingIndicator = showLoadingIndicator;
    that.hideLoadingIndicator = hideLoadingIndicator;
    that.showModal = showModal;
    that.hideModal = hideModal;
    
    return that;
  }
  
});