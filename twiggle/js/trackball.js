//Reference:
// https://en.wikibooks.org/wiki/OpenGL_Programming/Modern_OpenGL_Tutorial_Arcball

twgl.Trackball = function ( canvas ) {
	this.canvas = ( canvas !== undefined ) ? canvas : document;
	var m4 = twgl.m4;
	var v3 = twgl.v3;
	
	//camera variables

	//eye position in the world
	this.eye = [0, 0, -101];
	//where is the eye looking at?
	this.target = [0,0,0];
	//where does the top of the camera point to?
	this.up = [0,1,0];
	//arcball's radius
	this.radius = 2.0;
	this.near = 1.0;
	this.far = 201.0;
	this.fov = 10.0;
	
	//projection "lenses"
	this.projectionMatrix = m4.perspective(this.fov * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, this.near, this.far);
	//Matrixes to transform global variables into the camera's and vice-versa
	this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
	this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, m4.inverse(this.cameraMatrix));

	//transformation matrix
	this.oldTransformMatrix = m4.identity();
	this.transformMatrix = m4.identity();

	//internal variables
	var scope = this;
	//rotation controls
	//is trackball rotating?
	var isRotating = false;
	//Do we need to update the matrix beacause we did a rotation?
	var newRotation = false;
	//rotation auxiliary vectors
	var initialVector = v3.copy([0,0,0]);
	var finalVector = v3.copy([0,0,0]);

	//this.functions

	//update all matrixes but the transformMatrix (stores the rotation)
	this.update = function () {
		this.projectionMatrix = m4.perspective(this.fov * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, this.near, this.far);
		//this.projectionMatrix = m4.ortho(-1.0,1.0,-1.0,1.0, 0.0, 100);

		this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
		this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, m4.inverse(this.cameraMatrix));
	};

	//update the transformMatrix (stores the rotation) if needed
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

	//rotation handling
	//takes in two vector components supposed to be between -1.0 and 1.0
	this.rotate = function ( x, y ) {
		if (!isRotating) {
			isRotating = true;
			initialVector = projectOnSphere(x*(canvas.clientWidth / canvas.clientHeight),y,1.0);
			m4.copy(this.transformMatrix, this.oldTransformMatrix);
		}
		else {
			finalVector = projectOnSphere(x*(canvas.clientWidth / canvas.clientHeight),y,1.0);
			newRotation = true;
		}
	};

	//ends the rotation by setting the flags as false
	this.endRotation = function ( ) {
		console.log("end of rotation");
		if (isRotating) {
			newRotation = false;
			isRotating = false;
		}
	};

	//unprojects mouse coordinates to a depth equivalent to the system's origin
	//arguments are mouse coordinates
	this.unproject = function (x,y) {

		var unprojA = m4.transformPoint(
        	m4.inverse( m4.multiply(this.viewProjectionMatrix, this.transformMatrix) ), 
        	[x,y,0.0]);
      	var unprojB = m4.transformPoint(
        	m4.inverse( m4.multiply(this.viewProjectionMatrix, this.transformMatrix) ), 
        	[x,y,1.0]);

      /**/
      //check real values for near and far planes
      var n = m4.transformPoint(
        m4.inverse( this.viewProjectionMatrix ), 
        [1,1,0.0])[2];
      var f = m4.transformPoint(
        m4.inverse( this.viewProjectionMatrix ), 
        [1,1,1.0])[2];
      var total = Math.abs(f-n);
      //normalize to get affine combination coefficients
      n = Math.abs(n/total); 
      f = Math.abs(f/total);

      //Finds point as affine combination
      var unprojC = [
        f*unprojA[0]+n*unprojB[0],
        f*unprojA[1]+n*unprojB[1],
        f*unprojA[2]+n*unprojB[2]
      ];

      return unprojC;
	};

	//simple unprojection
	//x and y are mouse coordinates. z is the desired depth value
	this.unprojectSimple = function (x,y,z) {
		var unprojA = m4.transformPoint(
        	m4.inverse( m4.multiply(this.viewProjectionMatrix, this.transformMatrix) ), 
        	[x,y,z]);

    	return unprojA;
	}

	//projects screen coordinates x and y to a sphere
	//takes in two vector components supposed to be between -1.0 and 1.0 and the sphere's radius
	function projectOnSphere ( x, y, radius ) {
		var projection = v3.copy([x,y,0]);
		var projectionLength = v3.length(projection); 
		if (projectionLength <= radius) {
			projection[2] = Math.sqrt(1 - projectionLength);
		} else{
			v3.normalize(projection, projection);
		}
		if (v3.length(projection) > 0.0) {
			v3.normalize(projection, projection);
		}
		return projection;
	}
};