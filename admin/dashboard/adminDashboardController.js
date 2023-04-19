define(function(require) {
  var $ = require('jquery');
  var appContext = require('appContext'); 

  console.log('admin dashboard module loaded: ');
  
  $(document).ready(function() {

    console.log('admin display name: ' + appContext.admin.displayName);
    
  });
  
});
