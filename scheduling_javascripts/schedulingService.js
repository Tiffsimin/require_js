define(function(require) {
  var $ = require('jquery');
  var jsRoutes = require('jsRoutes');
  var appContext = require('appContext');
  var browserUtil = require('app/util/browserUtil');

  function createAvailabilityInfoFromAvailability(availability) {
    return {
      tutorId: availability.tutorId,
      date: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      weeklyRecurrenceStartDate: availability.weeklyRecurrence && availability.weeklyRecurrence.startDate,
      weeklyRecurrenceEndDate: availability.weeklyRecurrence && availability.weeklyRecurrence.endDate,
      weeklyRecurrenceDaysOfWeekSelection: availability.weeklyRecurrence && availability.weeklyRecurrence.daysOfWeek
    }
  }
  
  function createBookingRequestInfoFromBookingSession(bookingSession){
    return {
        senderId: 0,
        recipientId: bookingSession.tutorId,
        message: bookingSession.comment,
        start: bookingSession.date + 'T' + bookingSession.startTime,
        end: bookingSession.date + 'T' + bookingSession.endTime
    }   
  }
  
  return {

    getBookingDetailsForConversationId: function(conversationId, senderId, successHandler, errorHandler) {
      var route = jsRoutes.controllers.SchedulingController.getBookingEntryDetails();

      $.ajax({
        url: route.url,
        type: route.type,
        data: {
          conversationId: conversationId,
          senderId: senderId
        },
        success: function(data) {
          successHandler({
            params: {
              conversationId: conversationId,
              senderId: senderId
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
                conversationId: conversationId,
                senderId: senderId
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    

     getAvailabilitiesForDate: function(date, successHandler, errorHandler) {
        var tutorId = appContext.user.id;
        var route = jsRoutes.controllers.SchedulingController
                .getAvailabilities(tutorId);

        $.ajax({
          url: route.url,
          type: route.type,
          data: {
            date: date
          },
          success: function(data) {
            successHandler({
              params: {
                date: date
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
                  date: date
                },
                jqXHR: jqXHR
              });
            }
          }
        });
      },
    
    createAvailability: function(availability, successHandler, errorHandler) {
      var tutorId = appContext.user.id;
      var route = jsRoutes.controllers.SchedulingController
              .createAvailability(tutorId);

      var availabilityInfo = createAvailabilityInfoFromAvailability(availability);
      
      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(availabilityInfo),
        success: function(data) {
          successHandler({
            params: {
              availability: availability
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
                availability: availability
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
        
    createBookingSession: function(bookingSession, successHandler, errorHandler) {
      var userId = appContext.user.id;
      var route = jsRoutes.controllers.SchedulingController
              .createBookingRequest(userId);

      var bookingRequestInfo = createBookingRequestInfoFromBookingSession(bookingSession);
      
      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(bookingRequestInfo),
        success: function(data) {
          successHandler({
            params: {
              bookingSession: bookingSession
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
                bookingSession: bookingSession
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    
    createBookingResponseInfo: function(bookingResponse, successHandler, errorHandler) {
      var tutorId = appContext.user.id;
      var route = jsRoutes.controllers.SchedulingController
              .createBookingResponse(tutorId);
     
      var bookingResponseInfo = bookingResponse;
      
      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(bookingResponseInfo),
        success: function(data) {
          successHandler({
            params: {
              bookingResponseInfo: bookingResponseInfo
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
                bookingResponseInfo: bookingResponseInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    
    createCancellationRequestInfo: function(cancellationRequest, successHandler, errorHandler) {
      var userId = appContext.user.id;
      var route = jsRoutes.controllers.SchedulingController
              .createCancellationRequest(userId);
    
      var cancellationRequestInfo = cancellationRequest; 

      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(cancellationRequestInfo),
        success: function(data) {
          successHandler({
            params: {
              cancellationRequestInfo: cancellationRequestInfo
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
                cancellationRequestInfo: cancellationRequestInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    
    createCancellationResponseInfo: function(cancellationResponse, successHandler, errorHandler) {     
      var userId = appContext.user.id;
      var route = jsRoutes.controllers.SchedulingController
              .createCancellationResponse(userId);
      var cancellationResponseInfo = cancellationResponse;
      $.ajax({
        url: route.url,
        type: route.type,
        contentType: 'application/json',
        data: JSON.stringify(cancellationResponseInfo),
        success: function(data) {
          successHandler({
            params: {
              cancellationResponseInfo: cancellationResponseInfo
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
                cancellationResponseInfo: cancellationResponseInfo
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    
    deleteSingleOccurrenceOfAvailability: function(availability, date, successHandler, errorHandler) {
      var route = jsRoutes.controllers.SchedulingController
              .deleteSingleOccurrenceOfAvailability(availability.tutorId, availability.id, date);

      $.ajax({
        url: route.url,
        type: route.type,
        success: function(data) {
          successHandler({
            params: {
              availability: availability,
              date: date
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
                availability: availability,
                date: date
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    },
    
    deleteAllFutureOccurrencesOfRecurringAvailability: function(availability, date, successHandler, errorHandler) {
      var route = jsRoutes.controllers.SchedulingController
              .deleteAllFutureOccurrencesOfRecurringAvailability(availability.tutorId, availability.id, date);

      $.ajax({
        url: route.url,
        type: route.type,
        success: function(data) {
          successHandler({
            params: {
              availability: availability,
              date: date
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
                availability: availability,
                date: date
              },
              jqXHR: jqXHR
            });
          }
        }
      });
    }
    
  }

});
