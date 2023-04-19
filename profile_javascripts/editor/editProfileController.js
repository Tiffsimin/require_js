define(function(require) {
  var $ = require('jquery');
  var userService = require('app/user/userService');
  var errorCodes = require('app/common/errorCodes');
  var editableSection = require('app/profile/editor/editableSection');
  var editableSectionWithModal = require('app/profile/editor/editableSectionWithModal');
  var editableSectionWithFormGroups = require('app/profile/editor/editableSectionWithFormGroups');
  var editProfilePicture = require('app/profile/editor/editProfilePicture');
  var editProfileView = require('app/profile/editor/editProfileView');
  var browserUtil = require('app/util/browserUtil');
  var jsMessages = require('jsMessages');

  console.log('edit profile module loaded: ');
  
  var SHOW_PROFILE_PICTURE_MODAL_DELAY_ON_ERROR = 1000;
  
  var profilePictureView;
  var profileView;
  var editableSections = {};
  var activeEditableSection;
  
  function addEditableSection(sectionId, globalErrorMessageTargetId) {
    if(!$('#' + sectionId).length) {
      return;
    }
    
    editableSections[sectionId] = editableSection({
      sectionId: sectionId,
      saveAndRestoreTargetClass: 'form-save-restore-target',
      globalErrorMessageTargetId: globalErrorMessageTargetId,
      callbacks: {
        cancelClick: onEditableSectionCancelClick,
        saveClick: onEditableSectionSaveClick
      }
    }); 
  }
  
  function addEditableSectionWithModal(sectionId, modalId, globalErrorMessageTargetId) {
    if(!$('#' + sectionId).length) {
      return;
    }
    
    editableSections[sectionId] = editableSectionWithModal({
      sectionId: sectionId,
      modalId: modalId,
      globalErrorMessageTargetId: globalErrorMessageTargetId,
      callbacks: {
        cancelClick: onEditableSectionCancelClick,
        saveClick: onEditableSectionSaveClick
      }
    }); 
  }
  
  function addTutoringExperienceEditableSection() {
    var sectionId = 'profile-editor-tutoringexperience';
    
    if(!$('#' + sectionId).length) {
      return;
    }
    
    editableSections[sectionId] = editableSectionWithFormGroups({
      sectionId: sectionId,
      formGroupFieldName: 'tutoringExperience',
      formGroupTemplateFieldName: 'tutoringExperienceTemplate',
      formGroupClass: 'form-group',
      formGroupContainerClass: 'form-group-container',
      formGroupTemplateContainerClass: 'form-group-template',
      globalErrorMessageTargetId: 'global-error-message-tutoringexperience',
      callbacks: {
        cancelClick: onEditableSectionCancelClick,
        saveClick: onEditableSectionSaveClick
      }
    });
  }
  
  function addDistinctionsEditableSection() {
    var sectionId = 'profile-editor-distinctions';
    
    if(!$('#' + sectionId).length) {
      return;
    }
    
    editableSections[sectionId] = editableSectionWithFormGroups({
      sectionId: sectionId,
      formGroupFieldName: 'distinctions',
      formGroupTemplateFieldName: 'distinctionsTemplate',
      formGroupClass: 'form-group',
      formGroupContainerClass: 'form-group-container',
      formGroupTemplateContainerClass: 'form-group-template',
      globalErrorMessageTargetId: 'global-error-message-distinctions',
      callbacks: {
        cancelClick: onEditableSectionCancelClick,
        saveClick: onEditableSectionSaveClick
      }
    });
  }
  
  $(document).ready(function() {
    profilePictureView = editProfilePicture({
      callbacks: {
        saveClick: onEditProfilePictureSaveClick
      }
    });
    profileView = editProfileView();
    addEditableSection('profile-editor-base-info', 'global-error-message-base-info');
    addEditableSection('profile-editor-hourlyrate', 'global-error-message-hourlyrate');
    addEditableSection('profile-editor-personal', 'global-error-message-personal');
    addEditableSection('profile-editor-about', 'global-error-message-about');
    addEditableSectionWithModal('profile-editor-tutored-subjects', 
            'modal-profile-editor-tutored-subjects', 'global-error-message-tutored-subjects');
    addEditableSectionWithModal('profile-editor-tutored-studylevels', 
            'modal-profile-editor-tutored-studylevels', 'global-error-message-tutored-studylevels');
    addTutoringExperienceEditableSection();
    addDistinctionsEditableSection();
    addEditableSection('profile-editor-travelpreference', 'global-error-message-travelpreference');
  });
  
  function onEditableSectionCancelClick(editableSection) {
    activeEditableSection = null;
    editableSection.hideForm();
  }
  
  function onEditableSectionSaveClick(editableSection) {
    activeEditableSection = editableSection;
    editableSection.clearAllErrors();
    var data = editableSection.serialize();
    if(data) {
      userService.updateProfile(data, onUpdateProfileCompleted, onUpdateProfileFailed);
    }
  }
  
  function onUpdateProfileCompleted(result) {
    profileView.update(result.params.profile);
    if(activeEditableSection) {
      activeEditableSection.hideForm();
      activeEditableSection = null;
    }
  }
  
  function onUpdateProfileFailed(result) {
    var errorHandled = false;
    
    profileView.clearGlobalError();
    if(activeEditableSection) {
      activeEditableSection.clearAllErrors();
    }
    
    if(result && result.jqXHR) {
      if(result.jqXHR.responseJSON && result.jqXHR.responseJSON.code) {
        switch(result.jqXHR.responseJSON.code) {
          case errorCodes.VALIDATION_CONSTRAINT_VIOLATION:
            if(activeEditableSection) {
              activeEditableSection.showValidationErrors(result.jqXHR.responseJSON.errors);
              errorHandled = true;
            } else {
              var globalErrors = '';
              result.jqXHR.responseJSON.errors.forEach(function(error) {
                if(globalErrors) {
                  globalErrors += "<br />";
                }
                globalErrors += error.message;
              });
              profileView.showGlobalError(globalErrors);
              errorHandled = true;
            }
            break;
        }
      } else if(result.jqXHR.responseText) {
        errorHandled = true;
        if(activeEditableSection) {
          activeEditableSection.showGlobalError(result.jqXHR.responseText);
        } else {
          profileView.showGlobalError(result.jqXHR.responseText);
        }
      }
    }
    
    if(!errorHandled) {
      if(activeEditableSection) {
        activeEditableSection.showGlobalError(jsMessages("error.system"));
      } else {
        profileView.showGlobalError(jsMessages("error.system"));
      }
    }
  }
  
  function onEditProfilePictureSaveClick(data) {
    profilePictureView.clearAllErrors();
    profilePictureView.hideModal();
    profilePictureView.showLoadingIndicator();
    userService.cropRawProfilePictureAndSave(data, onCropRawProfilePictureAndSaveCompleted, onCropRawProfilePictureAndSaveFailed);
  }
  
  function onCropRawProfilePictureAndSaveCompleted(result) {
    browserUtil.reload();
  }
  
  function onCropRawProfilePictureAndSaveFailed(result) {
    //delay the show call, since the animation of the hide call might still be pending
    setTimeout(function() {
      var errorMessage;
      
      if(result && result.jqXHR) {
        if(result.jqXHR.responseJSON && result.jqXHR.responseJSON.code) {
          switch(result.jqXHR.responseJSON.code) {
            case errorCodes.VALIDATION_CONSTRAINT_VIOLATION:
              errorMessage = '';
              result.jqXHR.responseJSON.errors.forEach(function(error) {
                if(errorMessage) {
                  errorMessage += "<br />";
                }
                errorMessage += error.message;
              });
              break;
          }
        } else if(result.jqXHR.responseText) {
          errorMessage = result.jqXHR.responseText;
        }
      }
      
      errorMessage = errorMessage || jsMessages("error.system");
      
      profilePictureView.hideLoadingIndicator();
      profilePictureView.showModal();
      profilePictureView.showErrorInModal(errorMessage);
    }, SHOW_PROFILE_PICTURE_MODAL_DELAY_ON_ERROR);
  }
  
});
