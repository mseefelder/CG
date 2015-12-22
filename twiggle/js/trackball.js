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
	this.eye = [0, 0, -30];
	//where is the eye looking at?
	this.target = [0,0,0];
	//where does the top of the camera point to?
	this.up = [0,1,0];
	//arcball's radius
	this.radius = 1.0;
	this.near = 1.0;
	this.far = 100.0;
	this.fov = 10.0;
	
	//projection "lenses"
	this.projectionMatrix = m4.perspective(this.fov * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, this.near, this.far);
	this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
	this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, m4.inverse(this.cameraMatrix));

	//loc rot scale
	this.rotationMatrix = m4.identity();
	var translationVector = v3.create(0.0,0.0,0.0);
	var zoomValue = 1.0;

	//temporary values
	this.tempMatrix = m4.identity();
	this.tempVector = v3.create(0.0,0.0,0.0);
	this.tempValue = 1.0;

	//transformation matrix
	this.oldTransformMatrix = m4.identity();
	this.transformMatrix = m4.identity();

	//internal variables
	var scope = this;
	//rotation controls
	var isRotating = false;
	var newRotation = false;
	var initialVector = v3.copy([0,0,0]);
	var finalVector = v3.copy([0,0,0]);

	//this.functions
	this.update = function () {
		this.projectionMatrix = m4.perspective(this.fov * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, this.near, this.far);
		//this.projectionMatrix = m4.ortho(-1.0,1.0,-1.0,1.0, 0.0, 100);

		this.cameraMatrix = m4.lookAt(this.eye, this.target, this.up);
		this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, m4.inverse(this.cameraMatrix));
	};

	this.updateRotation = function () {
		/**/
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
		/**/
		/*
		if (newRotation) {
			//update transform matrix with rotation
			var dot = v3.dot(initialVector,finalVector);
			var angle = (dot <= 1) ? Math.acos(dot) : 0.0;

			var axis = v3.cross(initialVector,finalVector);
			if(v3.lengthSq(axis) != 0) {
				v3.normalize(axis,axis);
			}

			axis = m4.transformDirection(m4.inverse(m4.multiply(m4.inverse(this.cameraMatrix), this.tempMatrix)), axis);

			var q = quaternionRotationMatrix( axis, angle );
			m4.multiply(this.tempMatrix, q, this.rotationMatrix);
			
			//rotation updated. set as false
			newRotation = false;
		}
		*/
	};

	//takes in two vector components supposed to be between -1.0 and 1.0
	this.rotate = function ( x, y ) {
		if (!isRotating) {
			isRotating = true;
			initialVector = projectOnSphere(x,y,1.0);
			m4.copy(this.transformMatrix, this.oldTransformMatrix);
		}
		else {
			finalVector = projectOnSphere(x,y,1.0);
			newRotation = true;
		}
	};

	this.endRotation = function ( ) {
		console.log("end of rotation");
		if (isRotating) {
			newRotation = false;
			isRotating = false;
		}
	};

	this.unproject = function (x,y) {
		//console.log("Unproject",x," ",y);

		var unprojA = m4.transformPoint(
        	m4.inverse( m4.multiply(this.viewProjectionMatrix, this.transformMatrix) ), 
        	[mouse.x,mouse.y,0.0]);
      	var unprojB = m4.transformPoint(
        	m4.inverse( m4.multiply(this.viewProjectionMatrix, this.transformMatrix) ), 
        	[mouse.x,mouse.y,1.0]);

      /**/
      //GAMBIARRA MODE
      var n = m4.transformPoint(
        m4.inverse( this.viewProjectionMatrix ), 
        [1,1,0.0])[2];
      var f = m4.transformPoint(
        m4.inverse( this.viewProjectionMatrix ), 
        [1,1,1.0])[2];
      var total = Math.abs(f-n);
      n = Math.abs(n/total); f = Math.abs(f/total);
      
      //console.log(total," ",f," ",n," ");

      var unprojC = [
        f*unprojA[0]+n*unprojB[0],
        f*unprojA[1]+n*unprojB[1],
        f*unprojA[2]+n*unprojB[2]
      ];

      //console.log(unprojC);
      /**/

      //calculating the weights for affine combination of near and far points:
      /**
      //DEVERIA SER ASSIM
      var l = v3.length(trackball.eye);
      var range = Math.abs(trackball.near-trackball.far)*1.0;
      var f = Math.abs(l-trackball.near)/range;
      var n = Math.abs(l-trackball.far)/range;
      console.log(unprojA[2]," ",unprojB[2]," ",l," ",range," ",f," ",n);

      //combined
      var unprojC = [
        n*unprojA[0]+f*unprojB[0],
        n*unprojA[1]+f*unprojB[1],
        n*unprojA[2]+f*unprojB[2]
      ];/**/

      return unprojC;
	};

	this.unprojectSimple = function (x,y) {
		var unprojA = m4.transformPoint(
        	m4.inverse( m4.multiply(this.viewProjectionMatrix, this.transformMatrix) ), 
        	[x,y,1.0]);

    	return unprojA;
	}

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
	/*
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
	*/
	
	/*
	this.canvas.addEventListener( 'canvasmenu', function ( event ) { event.preventDefault(); }, false );
	this.canvas.addEventListener( 'mousedown', onMouseDown, false );
	this.canvas.addEventListener( 'mousewheel', onMouseWheel, false );
	this.canvas.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
	*/
};