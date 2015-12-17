    "use strict";
    twgl.setAttributePrefix("a_");
    var m4 = twgl.m4;
    var gl = twgl.getWebGLContext(document.getElementById("c"));
    var programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

    //create scene trackball
    var trackball = new twgl.Trackball(gl.canvas);

    //application status variables
    var viewport = function (){
      this.x = gl.canvas.width,
      this.y = gl.canvas.height
    };


    //global variable for mouse position
    var mouse = {x: 0, y: 0}; 

    //Cube geometry object
    var cubeMesh = twgl.CubeMesh.getInstance(gl);

    //Create an object instance with cube geometry
    var cube = new twgl.Object( cubeMesh.bufferInfo );

    var uniforms = {
      u_lightWorldPos: [1, 8, -10],
      u_lightColor: [1, 0.8, 0.8, 1],
      u_ambient: [0, 0, 0, 1],
      u_specular: [1, 1, 1, 1],
      u_shininess: 50,
      u_specularFactor: 1,
    };

    function rotateTrackball () {
      trackball.rotate(mouse.x, mouse.y);
    }

    //event that updates the mouse position when the mouse moves
    gl.canvas.addEventListener('mousemove', function(e) {
      mouse.x = (2.0*(e.pageX - this.offsetLeft)/gl.canvas.width)-1.0;
      mouse.y = -((2.0*(e.pageY - this.offsetTop)/gl.canvas.height)-1.0);
    }, false);

    //when mouse is clicked (but not yet released) this event:
    //  checks if it has clicked on any of the points belonging to the lines;
    //    if so, attributes this point to the global variable 'point';
    //  sets the 'mousemove' event to call the movePoint function.
    gl.canvas.addEventListener('mousedown', function(e) {
        trackball.rotate(mouse.x,mouse.y);     
        gl.canvas.addEventListener('mousemove', rotateTrackball, false);
    }, false);
     
    //when the mouse is released:
    //clear the global variable 'point' and remove the 'movePoint()' binding to 'mousemove' 
    gl.canvas.addEventListener('mouseup', function() {
      gl.canvas.removeEventListener('mousemove', rotateTrackball, false);
      trackball.endRotation(mouse.x,mouse.y);
    }, false);

    //moves the point referenced by global variable 'point' to global variable 'mouse' x,y coordinates
    //then, clear the canvas and redraw
    /*function movePoint () {
      if (point) {
        point.move(mouse.x, mouse.y)
      }
      display();
    }*/

    function onResize () {
      viewport.x = gl.canvas.width;
      viewport.y = gl.canvas.height;
      gl.viewport(0, 0, viewport.x, viewport.y);
      trackball.update();
    }

    function render(time) {
      time *= 0.001;

      twgl.resizeCanvasToDisplaySize(gl.canvas);
      
      //only recalculate camera matrixes when resized
      if (gl.canvas.width !== viewport.x || gl.canvas.height !== viewport.y) {
        //resize canvas to fill browser window and resize glViewport
        onResize();
      };
      trackball.updateRotation();

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
      uniforms.u_worldViewProjection = m4.multiply(trackball.viewProjectionMatrix, world);//m4.multiply(world, trackball.viewProjectionMatrix);//

      gl.useProgram(programInfo.program);
      twgl.setUniforms(programInfo, uniforms);

      //twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      //gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
      cube.render(gl, programInfo);

      requestAnimationFrame(render);
    }

    onResize();
    requestAnimationFrame(render);
