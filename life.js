var gl;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;
var shaderProgram2;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    shaderProgram2 = gl.createProgram();
    gl.attachShader(shaderProgram2, vertexShader);
    gl.attachShader(shaderProgram2, getShader(gl, "shader2-fs"));
    gl.linkProgram(shaderProgram2);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) || !gl.getProgramParameter(shaderProgram2, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }


    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexVirtAttribute = gl.getAttribLocation(shaderProgram, "aVertexVirtPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexVirtAttribute);

    shaderProgram2.vertexPositionAttribute = gl.getAttribLocation(shaderProgram2, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram2.vertexPositionAttribute);
    shaderProgram2.vertexVirtAttribute = gl.getAttribLocation(shaderProgram2, "aVertexVirtPosition");
    gl.enableVertexAttribArray(shaderProgram2.vertexVirtAttribute);

}



function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;
var squareVirtVertexBuffer;

var center = [-0.5, 0]
var zoom = 1.0;

function initBuffers() {
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
        1.0, 1.0,  0.0,
        -1.0, 1.0,  0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    
    squareVirtVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVirtVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    squareVirtVertexBuffer.itemSize = 3;
    squareVirtVertexBuffer.numItems = 4;



    squareVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
    var squareVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(squareVertexIndices), gl.STATIC_DRAW);
    squareVertexIndexBuffer.itemSize = 1;
    squareVertexIndexBuffer.numItems = 6;
}

pong = true;

function drawScene() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram2);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVirtVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexVirtAttribute, squareVirtVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    if (pong) {
        gl.bindTexture(gl.TEXTURE_2D, rttTexture1);
    } else {
        gl.bindTexture(gl.TEXTURE_2D, rttTexture2);
    }
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        //handleKeys(elapsed);
    }
    lastTime = timeNow;
}


function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}


var currentlyPressedKeys = {};

function handleKeyDown(event) {
    if (event.keyCode == 90) {

        if (pong) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer2);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer1);
        }
        gl.viewport(0, 0, rttFramebuffer1.width, rttFramebuffer1.height); //FIXME
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVirtVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexVirtAttribute, squareVirtVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        if (pong) {
            gl.bindTexture(gl.TEXTURE_2D, rttTexture1);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, rttTexture2);
        }
        pong = !pong;
        console.log(pong);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }   
}


    var data = new Uint8Array(4*512*512);
    function redrawData() {
        if (pong) {
            gl.bindTexture(gl.TEXTURE_2D, rttTexture1);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, rttTexture2);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

  function handleMouseDown(event) {
        if (pong) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer1);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer2);
        }
        gl.readPixels(0,0,128,128,gl.RGBA,gl.UNSIGNED_BYTE,data)

        var x = new Number();
        var y = new Number();
        var canvas = document.getElementById("test-canvas");

      x = event.clientX + document.body.scrollLeft +
          document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop +
          document.documentElement.scrollTop;

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        data_x = Math.floor(x/4);
        data_y = 128 - Math.floor(y/4);
        data[128*4*data_y+4*data_x+3] = 255;
        data[128*4*data_y+4*data_x+2] = 255;
        redrawData();
      }

    var rttFramebuffer1;
    var rttTexture1;
    var rttFramebuffer2;
    var rttTexture2;
    function initTextureFramebuffers() {
        var a = initTextureFramebuffer(rttFramebuffer1, rttTexture1);
        rttFramebuffer1 = a[0]; rttTexture1 = a[1];
        var a = initTextureFramebuffer(rttFramebuffer2, rttTexture2);
        rttFramebuffer2 = a[0]; rttTexture2 = a[1];
    }
    function initTextureFramebuffer(rttFramebuffer, rttTexture) {
        rttFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
        rttFramebuffer.width = 128;
        rttFramebuffer.height = 128;

        rttTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, rttTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return [rttFramebuffer, rttTexture]
    }

function webGLStart() {
    var canvas = document.getElementById("test-canvas");
    initGL(canvas);
    initShaders()
    initBuffers();
    initTextureFramebuffers();

    // FIXME
    if (pong) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer1);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer2);
    }
    gl.readPixels(0,0,128,128,gl.RGBA,gl.UNSIGNED_BYTE,data)
    for (var i=3; i<data.length; i+=4) {
        data[i] = 255;
    }
    redrawData();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    //document.onkeyup = handleKeyUp;
    canvas.onmousedown = handleMouseDown;
    //document.onmouseup = handleMouseUp;
    //document.onmousemove = handleMouseMove;

    tick();
}

