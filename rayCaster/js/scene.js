    "use strict";
    //Prefix for attributes on shader
    twgl.setAttributePrefix("a_");
    //Making my life easier:
    var m4 = twgl.m4;
    var v3 = twgl.v3;
    //Getting the context
    //var gl = twgl.getWebGLContext(document.getElementById("c"), {preserveDrawingBuffer: true});
    var gl = twgl.getWebGLContext(document.getElementById("c"));
    //Creating the shader programs
    var programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]); //normal rendering

    //Viewport dimensions
    var viewport = function (){
      this.x = gl.canvas.width,
      this.y = gl.canvas.height
    };

    //global variable for mouse position
    var mouse = {x: 0, y: 0, intX:0, intY:0, clickX:0, clickY:0};

    var plane = twgl.primitives.createPlaneBufferInfo(gl, 2, 2);

    //Shader uniforms
    var uniforms = {
      iResolution: [viewport.x, viewport.y, 1.0],           // viewport resolution (in pixels) uniform vec3      
      iGlobalTime: 0.0,           // shader playback time (in seconds) uniform float     
      iMouse: [mouse.x, mouse.y, mouse.clickX, mouse.clickY],                // mouse pixel coords. xy: current (if MLB down), zw: click uniform vec4      
    };

    //renders the scene
    function render(time) {
      time *= 0.001;

      twgl.resizeCanvasToDisplaySize(gl.canvas);
      
      //only recalculate camera matrixes when resized
      if (gl.canvas.width !== viewport.x || gl.canvas.height !== viewport.y) {
        //resize canvas to fill browser window and resize glViewport
        onResize();
      };

      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      //defines which shader we'll use
      gl.useProgram(programInfo.program);
      
      twgl.setUniforms(programInfo, uniforms);
      twgl.setBuffersAndAttributes(gl, programInfo, plane);

      updateUniforms();
      gl.drawElements(gl.TRIANGLES, plane.numElements, gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(render);
    }

    //PREPARATION

    //MAINTENANCE
    //Deal with browser resizing
    function onResize () {
      viewport.x = gl.canvas.width;
      viewport.y = gl.canvas.height;
      gl.viewport(0, 0, viewport.x, viewport.y);
     
    }

    function updateUniforms () {
      uniforms.iResolution = [viewport.x, viewport.y, 1.0];
      uniforms.iGlobalTime = Date.now();
      uniforms.iMouse = [mouse.x, mouse.y, mouse.clickX, mouse.clickY];
    }

    //Alert the control instructions
    function instructions () {

      alert("");

    }

    //EVENTS

    //event that updates the mouse position when the mouse moves
    gl.canvas.addEventListener('mousemove', function(e) {
      mouse.x = (2.0*(e.pageX - this.offsetLeft)/gl.canvas.width)-1.0;
      mouse.y = -((2.0*(e.pageY - this.offsetTop)/gl.canvas.height)-1.0);
      mouse.intX = e.pageX - this.offsetLeft;
      mouse.intY = gl.canvas.height - e.pageY - this.offsetTop;
    }, false);

    //when mouse is clicked (but not yet released)
    gl.canvas.addEventListener('mousedown', function(e) {
      mouse.clickX = mouse.x;
      mouse.clickY = mouse.y;
    }, false);
     
    //when the mouse is released
    gl.canvas.addEventListener('mouseup', function() {      
    }, false);

    //Change modes
    document.addEventListener('keyup', function( e ) {
      switch ( e.keyCode ) {
      }
    }, true);

    //start application
    onResize();
    requestAnimationFrame(render);
