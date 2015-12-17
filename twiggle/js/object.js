twgl.Object =  function( bufferInfo ){

	this.bufferInfo = bufferInfo;
	this.render = function( webGlContext, shaderProgramInfo ){
		twgl.setBuffersAndAttributes(webGlContext, shaderProgramInfo, this.bufferInfo);
      	gl.drawElements(gl.TRIANGLES, this.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
	};

}