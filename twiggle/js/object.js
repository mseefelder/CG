twgl.Object =  function( bufferInfo, center ){

	//internal variables
	var scope = this;

	center = center || [0.0,0.0,0.0];
	var m4 = twgl.m4;
	var v3 = twgl.v3;

	var temp = m4.identity();

	//Translation controls
	var isTranslating = false;
	var tVector = v3.copy([0.0,0.0,0.0]);
	var translation = m4.translation(center);

	//Rotation controls
	var isRotating = false;
	var rotation = m4.identity();
	var rotOrigin = v3.copy([0.0,0.0,0.0]);
	var rotRadius = 1.0;
	var initialVector = v3.copy([0.0,0.0,0.0]);
	var finalVector = v3.copy([0.0,0.0,0.0]);

	//translation*rotation*scale:
	var model = m4.identity();
	//modelMatrix has changed???
	var changed = true;
	//is this selected?
	this.isSelected = false;

	this.color = [0.5,0.6,0.7,1.0];

	this.bufferInfo = bufferInfo;

	this.render = function( webGlContext, shaderProgramInfo, myUniforms ){
		myUniforms.u_diffuse = this.color;
		twgl.setUniforms(shaderProgramInfo, myUniforms);
		twgl.setBuffersAndAttributes(webGlContext, shaderProgramInfo, this.bufferInfo);
      	gl.drawElements(gl.TRIANGLES, this.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
      	if (this.isSelected) {
      		gl.enable(gl.BLEND);
      		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      		gl.disable(gl.DEPTH_TEST);
      		var sphere = twgl.primitives.createSphereBufferInfo(gl, Math.sqrt(3), 24, 12);
      		myUniforms.u_diffuse = [0.5,0.5,0.5,0.3];
			twgl.setUniforms(shaderProgramInfo, myUniforms);
			twgl.setBuffersAndAttributes(webGlContext, shaderProgramInfo, sphere);
      		gl.drawElements(gl.TRIANGLES, sphere.numElements, gl.UNSIGNED_SHORT, 0);
      		gl.disable(gl.BLEND);
      		gl.enable(gl.DEPTH_TEST);
      	}
	};

	this.place = function( center ){
		m4.translation(center, translation);
		changed = true;
	};

	this.translate = function( vector ){
		//console.log(vector);
		if (!isTranslating){
			m4.copy(translation, temp);
			v3.copy(vector, tVector);
			isTranslating = true;
		} else {
			//console.log(tVector, temp);
			m4.multiply(temp, m4.translation(v3.subtract(vector, tVector)), translation);
			//m4.translate(tVector, temp, translation);
			changed = true
		}
	};

	this.endTranslation = function ( ) {
		changed = true;
		isTranslating = false;
	};

	this.rotate = function ( x, y, camera ) {
		var point = v3.copy([x*(camera.canvas.clientWidth / camera.canvas.clientHeight), y, 0.0]);
		if (!isRotating) {
			isRotating = true;
			console.log("pre");
			updateSphereRadiusAndOrigin(camera);
			console.log("post");
			v3.subtract(point, rotOrigin, point);
			initialVector = projectOnSphere(point[0],point[1],rotRadius);
			m4.copy(rotation, temp);
		}
		else {
			v3.subtract(point, rotOrigin, point);
			finalVector = projectOnSphere(point[0],point[1],rotRadius);
			//rotate
			var dot = v3.dot(initialVector,finalVector);
			var angle = (dot <= 1) ? Math.acos(dot) : 0.0;

			var axis = v3.cross(initialVector,finalVector);
			if(v3.lengthSq(axis) != 0) {
				v3.normalize(axis,axis);
			}

			axis = m4.transformDirection(m4.inverse(m4.multiply(m4.inverse(camera.cameraMatrix), camera.transformMatrix)), axis);

			var q = quaternionRotationMatrix( axis, angle );
			m4.multiply(temp, q, rotation);
			//has changed
			changed = true;
		}
	};

	this.endRotation = function ( ) {
		changed = true;
		isRotating = false;
	};

	this.modelMatrix = function(){
		if (changed) {
			changed = false;
			return m4.multiply(translation, rotation, model);
		}else{
			return model;
		};	
	};

	function projectOnSphere ( x, y, camera ) {
		var projection = v3.subtract([x,y,0.0], rotOrigin);
		var projectionLength = v3.length(projection); 
		if (projectionLength <= rotRadius) {
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

	function updateSphereRadiusAndOrigin ( camera ) {
		var origin = v3.copy([0.0,0.0,0.0]);
		var y_axis = v3.copy([0.0,1.0,0.0]);
		
		var modelViewProjectionMatrix = m4.multiply(m4.multiply(camera.viewProjectionMatrix, camera.transformMatrix), scope.modelMatrix());
		
		m4.transformPoint(modelViewProjectionMatrix, origin, rotOrigin);
		m4.transformPoint(modelViewProjectionMatrix, y_axis, y_axis);

		rotRadius = v3.length(v3.subtract(origin, y_axis));
		rotOrigin[2] = 0.0;

		console.log(rotRadius, rotOrigin);

	}


}