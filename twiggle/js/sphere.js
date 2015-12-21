//Specifies a Cube Mesh as a singleton
twgl.CubeMesh = (function ( ) {

  // Instance stores a reference to the Singleton
  var instance;

  function init( webGlContext ) {

    // Singleton

    // Private methods and variables -----
    //function privateMethod(){
    //    console.log( "I am private" );
    //}

    //var privateVariable = "Im also private";
    var arrays = {
      position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
      normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
      texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
    };

    return {

      // Public methods and variables
      //publicMethod: function () {
      //  console.log( "The public can see me!" );
      //},

      //publicProperty: "I am also public"
      bufferInfo: twgl.createBufferInfoFromArrays(webGlContext, arrays)
    };

  };

  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function ( webGlContext ) {

      if ( !instance ) {
        instance = init( webGlContext );
      }

      return instance;
    }

  };

})();

// Usage:

//var singleA = mySingleton.getInstance();  
//var singleB = mySingleton.getInstance();  
//console.log( singleA === singleB ); // true