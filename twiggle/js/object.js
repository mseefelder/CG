twgl.Object =  function( bufferInfo, center ){

	center = center || [0.0,0.0,0.0];
	var m4 = twgl.m4;
	var v3 = twgl.v3;

	var temp = m4.identity();

	var isTranslating = false;
	var tVector = v3.copy([0.0,0.0,0.0]);
	var translation = m4.translation(center);

	var isRotating = false;
	var rotation = m4.identity();
	//translation*rotation*scale:
	var model = m4.identity();
	//modelMatrix has changed???
	var changed = true;

	this.color = [0.5,0.6,0.7,1.0];

	this.bufferInfo = bufferInfo;

	this.render = function( webGlContext, shaderProgramInfo, myUniforms ){
		myUniforms.u_diffuse = this.color;
		twgl.setUniforms(shaderProgramInfo, myUniforms);
		twgl.setBuffersAndAttributes(webGlContext, shaderProgramInfo, this.bufferInfo);
      	gl.drawElements(gl.TRIANGLES, this.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
	};

	this.place = function( center ){
		m4.translation(center, translation);
		changed = true;
	};

	this.translate = function( vector ){
		console.log(vector);
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

	this.modelMatrix = function(){
		if (changed) {
			changed = false;
			return m4.multiply(translation, rotation, model);
		}else{
			return model;
		};	
	};


}