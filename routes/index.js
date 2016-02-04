'use strict';

module.exports = function(API_BASE, Logger, server, AdminRoutes, AuthRoutes, DbRoutes, DeviceRoutes, PassRoutes){
  
  //let logger = Logger.getLogger('Routes');
  console.log('Routes loaded!');
  
  return function(){
    this.mount = function(){
    
      //Mount Routers
    	server.use(API_BASE + '/', AuthRoutes);
    	server.use(API_BASE + '/admin', AdminRoutes);
    	server.use(API_BASE + '/db', DbRoutes);
    	server.use(API_BASE + '/device', DeviceRoutes);
    }
  }
};
