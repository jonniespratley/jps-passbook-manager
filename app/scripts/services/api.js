'use strict';

angular.module('jpsPassbookManagerApp')
  .factory('api', function () {
    // Service logic
    // ...
     
    /**
     * REST API Resource Class
     *
     * * Version 1 -
     * http://localhost:8080/api/v1/myappmatrix/coupons?appid=com.appmatrixinc.my
     * * Version 2 -
     * http://localhost:8080/api/v2/myappmatrix/coupons?appid=com.appmatrixinc.my
     */
    var Api = resource('/api/:version/:database/:collection/:id', {
        version : 'v1', 
        database : '@database', 
        collection : '@collection', 
        id : '@id'
    }, {
        fetch : {
            method : 'GET', 
            params : {
                appid : ''
            }, 
            isArray : true
        }, 
        edit : {
            method : 'PUT', 
            params : {
                appid : ''
            }, 
            isArray : false
        }
    });
    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
