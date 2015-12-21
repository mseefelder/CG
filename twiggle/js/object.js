twgl.Object =  function( bufferInfo, center ){

	center = center || [0.0,0.0,0.0];
	var m4 = twgl.m4;

	var translation = m4.translation(center);
	var rotation = m4.identity();
	var scale = m4.identity();
	//translation*rotation*scale:
	var model = m4.identity();
	//modelMatrix has changed???
	var changed = true;

	this.bufferInfo = bufferInfo;

	this.render = function( webGlContext, shaderProgramInfo ){
		twgl.setUniforms(programInfo, uniforms);
		twgl.setBuffersAndAttributes(webGlContext, shaderProgramInfo, this.bufferInfo);
      	gl.drawElements(gl.TRIANGLES, this.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
	};

	this.place = function( center ){
		m4.translation(center, translation);
		changed = true;
	};

	this.modelMatrix = function(){
		if (changed) {
			changed = false;
			return m4.multiply(m4.multiply(translation,rotation),scale, model);
		}else{
			return model;
		};	
	};


}