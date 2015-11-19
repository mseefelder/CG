//Reference:
// https://en.wikibooks.org/wiki/OpenGL_Programming/Modern_OpenGL_Tutorial_Arcball

twgl.Trackball = function ( canvas ) {
	//
	this.canvas = ( canvas !== undefined ) ? canvas : document;
	var m4 = twgl.m4;
	var v3 = twgl.v3;
	
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
	this.oldTransformMatrix = m4.identity();
	this.transformMatrix = m4.identity();

	//internal variables
	var scope = this;
	var isRotating = false;
	var updateRotation = false;
	var initialVector = v3.copy([0,0,0]);
	var finalVector = v3.copy([0,0,0]);
	
	//this.functions
	this.update = function () {
		this.projectionMatrix = m4.perspective(30 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.5, 10);
		this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
		this.viewProjectionMatrix = m4.multiply(m4.inverse(this.cameraMatrix), this.projectionMatrix);
	};
	this.updateRotation = function () {
		if (updateRotation) {
			//update transform matrix with rotation
			var dot = v3.dot(initialVector,finalVector);
			var angle = (dot <= 1) ? Math.acos(dot) : 0.0;
			//rotation damping;
			angle = 0.8 * angle;
			var axis = v3.cross(initialVector,finalVector);
			if(v3.lengthSq(axis) != 0) {
				v3.normalize(axis,axis);
			}

			axis = m4.transformDirection(m4.inverse(m4.multiply(this.oldTransformMatrix, m4.inverse(this.cameraMatrix))), axis);

			//this.transformMatrix = m4.multiply( m4.axisRotation(axis, angle), this.oldTransformMatrix);
			m4.axisRotate(this.oldTransformMatrix, axis, angle, this.transformMatrix);
			
			//rotation updated. set as false
			updateRotation = false;
		}
	};

	//takes in two vector components supposed to be between -1.0 and 1.0
	this.rotate = function ( x, y ) {
        console.log(x,y);
        /**/
		if (!isRotating) {
			isRotating = true;
			initialVector = projectOnSphere(x,y);
			m4.copy(this.transformMatrix, this.oldTransformMatrix);
		}
		else {
			finalVector = projectOnSphere(x,y);
			updateRotation = true;
		}
		/**/
	};

	this.endRotation = function ( x, y ) {
		console.log("end of rotation");
		if (isRotating) {
			finalVector = projectOnSphere(x,y);
			updateRotation = true;
			isRotating = false;
		}
	};

	//takes in two vector components supposed to be between -1.0 and 1.0
	function projectOnSphere ( x, y ) {
		var projection = v3.copy([x,y,0]);
		var projectionLength = v3.length(projection); 
		if (projectionLength <= 1) {
			projection[2] = Math.sqrt(1 - projectionLength);
		} else{
			v3.normalize(projection, projection);
		}
		return projection;
	}

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

