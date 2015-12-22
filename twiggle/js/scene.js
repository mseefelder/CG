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
    var mode = 2;
    //Index of selected object. -1 = no object selected
    var selected = 0;

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

    function instructions () {

      alert("A - Adicionar cubos (clique do mouse) \n S - Selecionar cubo (clique do mouse) \n X - Remover cubo selecionado \n R - Modo de rotação (clique do mouse) \n T - Modo de translação (clique do mouse)");

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

      cube[selected].isSelected = false;
      selected = (pixelValues[3] != 0)?pixelValues[0]:-1;
      if(selected != -1)
        cube[selected].isSelected = true;

      //last thing: unbind framebuffer
      twgl.bindFramebufferInfo(gl);
    }

    function rotateTrackball () {
      trackball.rotate(mouse.x, mouse.y);
    }

    function addCube() {
      var unproj = trackball.unproject(mouse.x, mouse.y);
      var indexPlus = cube.push(new twgl.Object( cubeMesh.bufferInfo, 
        unproj
        ));
      cube[indexPlus-1].color = [
        Math.random(),
        Math.random(),
        Math.random(),
        1.0
      ];
    }

    function deleteCube() {
      if (selected != -1){
        cube.splice(selected,1);
        selected = -1;
      }
    }

    function translateCube ( ) {
      var unproj = trackball.unproject(mouse.x, mouse.y);
      cube[selected].translate(unproj);
    }

    function rotateCube ( ) {
      cube[selected].rotate(mouse.x, mouse.y, trackball);
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
            if(selected != -1){
              var unproj = trackball.unproject(mouse.x, mouse.y);
              cube[selected].translate(unproj);
              gl.canvas.addEventListener('mousemove', translateCube, false);
            }
            break;
          case 2: //rotate
            if(selected == -1){
              trackball.rotate(mouse.x,mouse.y);     
              gl.canvas.addEventListener('mousemove', rotateTrackball, false);
            } else {
              cube[selected].rotate(mouse.x,mouse.y, trackball);     
              gl.canvas.addEventListener('mousemove', rotateCube, false);
            }            
            break;
          case 3: //select
            break;
        }

    }, false);
     
    //when the mouse is released:
    //clear the global variable 'point' and remove the 'movePoint()' binding to 'mousemove' 
    gl.canvas.addEventListener('mouseup', function() {
      switch(mode){
          case 0: //add cube
            console.log(trackball.unprojectSimple(mouse.x, mouse.y, 0.0), " ", trackball.unprojectSimple(mouse.x, mouse.y, 1.0));
            addCube();
            break;
          case 1: //translate
            if (selected != -1) {
              gl.canvas.removeEventListener('mousemove', translateCube, false);
              cube[selected].endTranslation();
            }
            break;
          case 2: //rotate
            if (selected == -1) {
              gl.canvas.removeEventListener('mousemove', rotateTrackball, false);
              trackball.endRotation();
            } else {
              gl.canvas.removeEventListener('mousemove', rotateCube, false);
              cube[selected].endRotation();
            }
            break;
          case 3: //select
            pick();
            //gl.canvas.removeEventListener('mousemove', zoomTrackball, false);
            //trackball.endZoom();
            break;
        }
      
    }, false);

    document.addEventListener('keyup', function( e ) {
      switch ( e.keyCode ) {
        case 'A'.charCodeAt(0):
          mode = 0;
          break;
        case 'S'.charCodeAt(0):
          mode = 3;
          break;
        case 'R'.charCodeAt(0):
          mode = 2;
          break;
        case 'T'.charCodeAt(0):
          mode = 1;
          break;
        case 'X'.charCodeAt(0):
          if (selected != -1) {
            deleteCube();
          };
          break;
      }
    }, true);

    instructions();
    createFramebuffer();
    onResize();
    console.log(fb);
    requestAnimationFrame(render);
