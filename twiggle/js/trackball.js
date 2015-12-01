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
	//arcball's radius
	this.radius = 1.0;
	
	//projection "lenses"
	this.projectionMatrix = m4.perspective(30 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.5, 10);
	this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
	this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, m4.inverse(this.cameraMatrix));

	//transformation matrix
	this.oldTransformMatrix = m4.identity();
	this.transformMatrix = m4.identity();

	//internal variables
	var scope = this;
	var isRotating = false;
	var newRotation = false;
	var initialVector = v3.copy([0,0,0]);
	var finalVector = v3.copy([0,0,0]);
	
	//this.functions
	this.update = function () {
		this.projectionMatrix = m4.perspective(30 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.5, 10);
		this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
		this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, m4.inverse(this.cameraMatrix));
	};
	this.updateRotation = function () {
		if (newRotation) {
			//update transform matrix with rotation
			var dot = v3.dot(initialVector,finalVector);
			var angle = (dot <= 1) ? Math.acos(dot) : 0.0;

			var axis = v3.cross(initialVector,finalVector);
			if(v3.lengthSq(axis) != 0) {
				v3.normalize(axis,axis);
			}

			axis = m4.transformDirection(m4.inverse(m4.multiply(m4.inverse(this.cameraMatrix), this.oldTransformMatrix)), axis);

			var q = quaternionRotationMatrix( axis, angle );
			m4.multiply(this.oldTransformMatrix, q, this.transformMatrix);
			
			//rotation updated. set as false
			newRotation = false;
		}
	};

	//takes in two vector components supposed to be between -1.0 and 1.0
	this.rotate = function ( x, y ) {
        console.log(x,y);
        /**/
		if (!isRotating) {
			isRotating = true;
			initialVector = projectOnSphere(x,y,1.0);
			m4.copy(this.transformMatrix, this.oldTransformMatrix);
		}
		else {
			finalVector = projectOnSphere(x,y,1.0);
			newRotation = true;
		}
		/**/
	};

	this.endRotation = function ( x, y ) {
		console.log("end of rotation");
		if (isRotating) {
			newRotation = false;
			isRotating = false;
		}
	};

	//takes in two vector components supposed to be between -1.0 and 1.0
	function projectOnSphere ( x, y, radius ) {
		var projection = v3.copy([x,y,0]);
		var projectionLength = v3.length(projection); 
		if (projectionLength <= radius) {
			projection[2] = Math.sqrt(1 - projectionLength);
		} else{
			v3.normalize(projection, projection);
		}
		//redundant step
		if (v3.length(projection) > 0.0) {
			v3.normalize(projection, projection);
		}
		return projection;
	}

	//expects a unit vector for the axis and a angle of rotation in radians
	function quaternionRotationMatrix (axis, angle) {
		var rot = new Float32Array(16);

		var s = Math.cos(angle/2.0);
		var wx = Math.sin(angle/2.0)*axis[0];
		var wy = Math.sin(angle/2.0)*axis[1];
		var wz = Math.sin(angle/2.0)*axis[2];


		rot[0] = 1-2.0*wy*wy-2.0*wz*wz;
		rot[1] = 2.0*wx*wy+2.0*s*wz;
		rot[2] = 2.0*wx*wz-2.0*s*wy;
		rot[3] = 0;
		rot[4] = 2.0*wx*wy-2.0*s*wz;
		rot[5] = 1-2.0*wx*wx-2.0*wz*wz;
		rot[6] = 2.0*wy*wz+2.0*s*wx;
		rot[7] = 0;
		rot[8] = 2.0*wx*wz+2.0*s*wy;
		rot[9] = 2.0*wy*wz-2.0*s*wx;
		rot[10] = 1-2.0*wx*wx-2.0*wy*wy;
		rot[11] = 0;
		rot[12] = 0;
		rot[13] = 0;
		rot[14] = 0;
		rot[15] = 1;

		return rot;
	}
	
	/*
	this.canvas.addEventListener( 'canvasmenu', function ( event ) { event.preventDefault(); }, false );
	this.canvas.addEventListener( 'mousedown', onMouseDown, false );
	this.canvas.addEventListener( 'mousewheel', onMouseWheel, false );
	this.canvas.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
	*/
};