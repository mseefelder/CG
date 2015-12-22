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
    var pickingProgramInfo = twgl.createProgramInfo(gl, ["pvs", "pfs"]); //used for picking

    //create scene trackball
    var trackball = new twgl.Trackball(gl.canvas);
    //Framebuffer for picking
    var fb = null;

    //Viewport dimensions
    var viewport = function (){
      this.x = gl.canvas.width,
      this.y = gl.canvas.height
    };

    //global variable for mouse position
    var mouse = {x: 0, y: 0, intX:0, intY:0}; 

    //global variable for interaction mode
    // 0 = add; 1 = translate; 2 = rotate; 3 = scale; 
    var mode = 3;
    //Index of selected object. -1 = no object selected
    var selected = -1;

    //Cube geometry object
    var cubeMesh = twgl.CubeMesh.getInstance(gl);

    //Create an object instance with cube geometry
    var cube = [new twgl.Object( cubeMesh.bufferInfo )];

    //Shader uniforms
    var uniforms = {
      u_lightWorldPos: [1, 8, -10],
      u_lightColor: [1, 0.8, 0.8, 1],
      u_ambient: [0, 0, 0, 1],
      u_specular: [1, 1, 1, 1],
      u_shininess: 50,
      u_specularFactor: 1,
    };

    function render(time) {
      time *= 0.001;

      twgl.resizeCanvasToDisplaySize(gl.canvas);
      
      //only recalculate camera matrixes when resized
      if (gl.canvas.width !== viewport.x || gl.canvas.height !== viewport.y) {
        //resize canvas to fill browser window and resize glViewport
        onResize();
      };
      trackball.updateRotation();
      //trackball.updateModelMatrix();

      gl.enable(gl.DEPTH_TEST);
      //gl.enable(gl.CULL_FACE); //double-sided faces
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      //will transform stuff around (model matrix) when processing the vertices (vertex shader)
      var world = trackball.transformMatrix;//m4.identity();//rotationX(time);//

      //set uniforms
      uniforms.u_viewInverse = trackball.cameraMatrix;
      uniforms.u_world = world;
      //we use the following to deal with the normals on the vertex shader
      uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
      //model * (view*projection) = modelViewProjection
      /*uniforms.u_worldViewProjection*/var wat = m4.multiply(trackball.viewProjectionMatrix, world);//m4.multiply(world, trackball.viewProjectionMatrix);//

      gl.useProgram(programInfo.program);
      //twgl.setUniforms(programInfo, uniforms);

      //twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      //gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
      for (var i = 0; i < cube.length; i++) {
        //console.log(i);
        uniforms.u_worldViewProjection = m4.multiply(wat, cube[i].modelMatrix());
        uniforms.u_index = i;
        cube[i].render(gl, programInfo, uniforms);
      };
      //var pixelValues = new Uint8Array(4);
      //gl.readPixels(10, 35, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);
      //console.log(pixelValues);

      //cube.render(gl, programInfo);

      requestAnimationFrame(render);
    }

    //PREPARATION
    function createFramebuffer () {
      fb = twgl.createFramebufferInfo(gl, [{ format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.CLAMP_TO_EDGE, },], viewport.x, viewport.y);
      //unbind fb
      twgl.bindFramebufferInfo(gl);
    }

    //MAINTENANCE
    function onResize () {
      viewport.x = gl.canvas.width;
      viewport.y = gl.canvas.height;
      gl.viewport(0, 0, viewport.x, viewport.y);
      twgl.resizeFramebufferInfo(gl,fb,[{ format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.CLAMP_TO_EDGE, },],viewport.x,viewport.y);
      trackball.update();
    }

    //INTERACTION

    function pick () {
      //bind framebuffer
      twgl.bindFramebufferInfo(gl,fb);
      /**/
      //normal render
      twgl.resizeCanvasToDisplaySize(gl.canvas);
      
      //only recalculate camera matrixes when resized
      if (gl.canvas.width !== viewport.x || gl.canvas.height !== viewport.y) {
        //resize canvas to fill browser window and resize glViewport
        onResize();
      };
      trackball.updateRotation();
      //trackball.updateModelMatrix();

      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      //will transform stuff around (model matrix) when processing the vertices (vertex shader)
      var world = trackball.transformMatrix;

      //set uniforms
      uniforms.u_viewInverse = trackball.cameraMatrix;
      uniforms.u_world = world;
      //we use the following to deal with the normals on the vertex shader
      uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
      //model * (view*projection) = modelViewProjection
      var wat = m4.multiply(trackball.viewProjectionMatrix, world);//m4.multiply(world, trackball.viewProjectionMatrix);//

      gl.useProgram(pickingProgramInfo.program);

      for (var i = 0; i < cube.length; i++) {
        //console.log(i);
        uniforms.u_worldViewProjection = m4.multiply(wat, cube[i].modelMatrix());
        uniforms.u_index = i;
        cube[i].render(gl, pickingProgramInfo, uniforms);
      };
      /**/
      //check status
      //console.log(fb);
      //console.log(gl.checkFramebufferStatus(0) == gl.FRAMEBUFFER_COMPLETE);

      //pick pixel
      var pixelValues = new Uint8Array(4);
      //console.log(mouse.intX," ",mouse.intY);
      gl.readPixels(mouse.intX, mouse.intY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);
      console.log(pixelValues);

      selected = (pixelValues[3] != 0)?pixelValues[0]:-1;

      //last thing: unbind framebuffer
      twgl.bindFramebufferInfo(gl);
    }

    function rotateTrackball () {
      trackball.rotate(mouse.x, mouse.y);
    }

    function addCube() {
      var unproj = trackball.unproject(mouse.x, mouse.y);
      cube.push(new twgl.Object( cubeMesh.bufferInfo, 
        unproj
        ));
    }

    function deleteCube() {
      if (selected != -1){
        cube.splice(selected,1);
        selected = -1;
      }
    }

    //EVENTS

    //event that updates the mouse position when the mouse moves
    gl.canvas.addEventListener('mousemove', function(e) {
      mouse.x = (2.0*(e.pageX - this.offsetLeft)/gl.canvas.width)-1.0;
      mouse.y = -((2.0*(e.pageY - this.offsetTop)/gl.canvas.height)-1.0);
      mouse.intX = e.pageX - this.offsetLeft;
      mouse.intY = gl.canvas.height - e.pageY - this.offsetTop;
    }, false);

    //when mouse is clicked (but not yet released) this event:
    //  checks if it has clicked on any of the points belonging to the lines;
    //    if so, attributes this point to the global variable 'point';
    //  sets the 'mousemove' event to call the movePoint function.
    gl.canvas.addEventListener('mousedown', function(e) {
        switch(mode){
          case 0: //add cube

            break;
          case 1: //translate
            //trackball.translate(mouse.x,mouse.y);
            //gl.canvas.addEventListener('mousemove', translateTrackball, false);
            break;
          case 2: //rotate
            if(selected == -1){
              trackball.rotate(mouse.x,mouse.y);     
              gl.canvas.addEventListener('mousemove', rotateTrackball, false);
            } else {

            }            
            break;
          case 3: //scale
            //var unprojLen = v3.length(trackball.unproject(mouse.x, mouse.y));
            //var scale = Math.sqrt((mouse.x*mouse.x)+(mouse.y*mouse.y));
            //trackball.zoom(scale);
            //gl.canvas.addEventListener('mousemove', zoomTrackball, false);
            break;
        }

    }, false);
     
    //when the mouse is released:
    //clear the global variable 'point' and remove the 'movePoint()' binding to 'mousemove' 
    gl.canvas.addEventListener('mouseup', function() {
      switch(mode){
          case 0: //add cube
            addCube();
            break;
          case 1: //translate
            //gl.canvas.removeEventListener('mousemove', translateTrackball, false);
            //trackball.endTranslation();
            break;
          case 2: //rotate
            if (selected == -1) {
              gl.canvas.removeEventListener('mousemove', rotateTrackball, false);
              trackball.endRotation();
            } else {

            }
            break;
          case 3: //select
            pick();
            //gl.canvas.removeEventListener('mousemove', zoomTrackball, false);
            //trackball.endZoom();
            break;
        }
      
    }, false);


    createFramebuffer();
    onResize();
    console.log(fb);
    requestAnimationFrame(render);


    /*
    function createFrameBuffer () {
      //create framebuffer for picking
      // create an empty texture
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, viewport.x, viewport.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Create a framebuffer and attach the texture.
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      //unbind the framebuffer and texture
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);

      return fb;
    }

    function pick () {
      //only recalculate camera matrixes when resized
      twgl.resizeCanvasToDisplaySize(gl.canvas);
      if (gl.canvas.width !== viewport.x || gl.canvas.height !== viewport.y) {
        //resize canvas to fill browser window and resize glViewport
        onResize();
      };

      //create framebuffer
      //framebuffer
      var fb = createFramebuffer();
      console.log("fb",fb);
      //bind picking framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

      //render
      trackball.updateRotation();

      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      //will transform stuff around (model matrix) when processing the vertices (vertex shader)
      var world = trackball.transformMatrix;//m4.identity();//rotationX(time);//

      //set uniforms
      uniforms.u_viewInverse = trackball.cameraMatrix;
      uniforms.u_world = world;
      //we use the following to deal with the normals on the vertex shader
      uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
      //model * (view*projection) = modelViewProjection
      var wat = m4.multiply(trackball.viewProjectionMatrix, world);//m4.multiply(world, trackball.viewProjectionMatrix);//

      console.log("pickingProgramInfo", pickingProgramInfo.program);
      gl.useProgram(pickingProgramInfo.program);

      for (var i = 0; i < cube.length; i++) {
        //console.log(i);
        uniforms.u_worldViewProjection = m4.multiply(wat, cube[i].modelMatrix());
        uniforms.u_index = 5.0;
        cube[i].render(gl, pickingProgramInfo);
      };

      //pick
      var pixel = new Uint8Array;
      var pickX = (mouse.x+1.0)/2.0*viewport.x;
      var pickY = (mouse.y+1.0)/2.0*viewport.y;
      gl.readPixels(pickX,pickY,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
      console.log(pixel);
      
      //unbind
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }     
     */