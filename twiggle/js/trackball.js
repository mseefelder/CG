//Reference:
// https://en.wikibooks.org/wiki/OpenGL_Programming/Modern_OpenGL_Tutorial_Arcball

twgl.Trackball = function ( canvas ) {
	//
	this.canvas = ( canvas !== undefined ) ? canvas : document;
	
	//camera variables
	//some of these would better be "private", but let it be for now

	//eye position in the world
	this.eye = [1, 4, -6];
	//where is the eye looking at?
	this.target = [0,0,0];
	//where does the top of the camera point to?
	this.up = [0,1,0];
	//projection "lenses"
	this.projectionMatrix = m4.perspective(30 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.5, 10);
	this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
	this.viewProjectionMatrix = m4.multiply(m4.inverse(this.cameraMatrix), this.projectionMatrix);

	//transformation matrix
	this.transformMatrix = m4.identity();

	//internal variables
	var scope = this;
	var isRotating = false;
	var updateRotation = false;
	var initialVector = v3.create(0,0,0);
	var finalVector = v3.create(0,0,0);
	
	//this.functions
	this.update = function () {
		if (updateRotation) {
			//update transform matrix with rotation
			//...
			//rotation updated. set as false
			updateRotation = false;
		}
		this.projectionMatrix = m4.perspective(30 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.5, 10);
		this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
		this.viewProjectionMatrix = m4.multiply(m4.inverse(this.cameraMatrix), this.projectionMatrix);
	};

	//takes in two vector components supposed to be between -1.0 and 1.0
	this.rotate = function ( x, y ) {
		if (!isRotating) {
			isRotating = true;
			initialVector = projectOnSphere(x,y);
		}
		else {
			finalVector = projectOnSphere(x,y);
			updateRotation = true;
		}
	};

	this.endRotation = function ( x, y ) {
		if (isRotating) {
			finalVector = projectOnSphere(x,y);
			updateRotation = true;
			isRotating = false;
		}
	};

	//
	function onMouseDown( event ){
		
	}

	function onMouseWheel( event ){

	}
	
	/*
	this.canvas.addEventListener( 'canvasmenu', function ( event ) { event.preventDefault(); }, false );
	this.canvas.addEventListener( 'mousedown', onMouseDown, false );
	this.canvas.addEventListener( 'mousewheel', onMouseWheel, false );
	this.canvas.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
	*/
};

//twgl.Trackball.prototype = Object.create( twgl.EventDispatcher.prototype );

/*
	twgl.EventDispatcher = function () {}

	twgl.EventDispatcher.prototype = {

		constructor: twgl.EventDispatcher,

		apply: function ( object ) {

			object.addEventListener = twgl.EventDispatcher.prototype.addEventListener;
			object.hasEventListener = twgl.EventDispatcher.prototype.hasEventListener;
			object.removeEventListener = twgl.EventDispatcher.prototype.removeEventListener;
			object.dispatchEvent = twgl.EventDispatcher.prototype.dispatchEvent;

		},

		addEventListener: function ( type, listener ) {

			if ( this._listeners === undefined ) this._listeners = {};

			var listeners = this._listeners;

			if ( listeners[ type ] === undefined ) {

				listeners[ type ] = [];

			}

			if ( listeners[ type ].indexOf( listener ) === - 1 ) {

				listeners[ type ].push( listener );

			}

		},

		hasEventListener: function ( type, listener ) {

			if ( this._listeners === undefined ) return false;

			var listeners = this._listeners;

			if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

				return true;

			}

			return false;

		},

		removeEventListener: function ( type, listener ) {

			if ( this._listeners === undefined ) return;

			var listeners = this._listeners;
			var index = listeners[ type ].indexOf( listener );

			if ( index !== - 1 ) {

				listeners[ type ].splice( index, 1 );

			}

		},

		dispatchEvent: function ( event ) {

			if ( this._listeners === undefined ) return;

			var listeners = this._listeners;
			var listenerArray = listeners[ event.type ];

			if ( listenerArray !== undefined ) {

				event.target = this;

				for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {

					listenerArray[ i ].call( this, event );

				}

			}

		}

	};
*/

