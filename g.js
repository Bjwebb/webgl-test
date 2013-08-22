Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';




function mouseClick(e) {
    document.getElementById('container').webkitRequestPointerLock(); // FIXME
}

function mouseMove(e) { 
    // .movementX/Y are valid normally as the mouse hovers
    // over an element. But when the mouse is locked the
    // mousemove event continues to fire whenever the mouse
    // moves.
  var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0,
  movementY = e.movementY ||
      e.mozMovementY      ||
      e.webkitMovementY   ||
      0;
    console.log(movementX + ", " + movementY); 
    camera_pivot.rotation.y += movementX/100;
    camera_pivot.rotation.x -= movementY/100;
}



var car, scene, camera;
function onLoad(){
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
document.getElementById('container').addEventListener("click", mouseClick);
document.getElementById('container').addEventListener("mousemove", mouseMove);
    initScene();
    function initScene() {

            // Grab our canvas
            var container = document.getElementById("container");
            //Create a new renderer and set the size
            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setSize(window.innerWidth-50, window.innerHeight-50);
            //Add the renderer to the DOM
    container.appendChild( renderer.domElement );

            //Create a new scene
    scene = new Physijs.Scene();
           

    //Add controls for interactively moving the camera with mouse
            
    
            //Add some lights
            var dirLight = new THREE.DirectionalLight(0xffffff, 1);
            dirLight.position.set(-3, 3, 7);
            dirLight.position.normalize();
            scene.add(dirLight);
    
            var pointLight = new THREE.PointLight(0xFFFFFF, 5, 50);
            pointLight.position.set(10, 20, -10);
            scene.add(pointLight);
                                    
            //Create a new loader for loading the model
            var jsonLoader = new THREE.JSONLoader();

            //Load a model and store it in the variable XXX
            jsonLoader.load( "blender/car.json", function( geometry, materials ) { 
                car = new Physijs.BoxMesh( geometry, new THREE.MeshFaceMaterial(materials) );
                carpos = new THREE.Object3D();
                //Add the model to the scene
                scene.add(car);
                car.setDamping(0.8, 0.8);
                
                var car2 = new Physijs.BoxMesh( geometry, new THREE.MeshFaceMaterial(materials) );
                car2.position.x = -3;
                scene.add(car2);
                car2.setDamping(0.8, 0.8);
               
        camera_pivot = new THREE.Object3D();
        car.add( camera_pivot );

    //Create a perspective camera
    camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 1, 1000 );
    camera.rotation.x = -Math.PI/4;
    camera.position.y = 5;
    camera.position.z = 5;

    camera_pivot.eulerOrder = 'YXZ';
            
    camera_pivot.add( camera );

            } );

      // plane FIXME
      var plane = new Physijs.BoxMesh(new THREE.CubeGeometry(40, 40, 0.5), new THREE.MeshNormalMaterial(), 0);
      plane.rotation.x = -Math.PI/2;
      plane.position.y = -0.5
      scene.add(plane);

            //Call the animate function
            animate();
    }


}
    var lastTime = 0;
    function animate() {
        //will not render if the browser window is inactive
        requestAnimationFrame( animate );
        scene.simulate();

        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
            handleKeys(elapsed);
        }
        lastTime = timeNow;


        render();
    }

    function render() {

            renderer.render( scene, camera );
    }
var currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
    if (event.keyCode == 32) {
        car.setLinearVelocity( new THREE.Vector3(0,10,0) );
    }
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}


var extrarot = 0 // FIXME
function handleKeys(elapsed) {
    var speed = 4;
    var rspeed = 2;
    if (car) {
    var vector = new THREE.Vector3( 0, 0, -1 );
    vector.applyEuler( car.rotation, car.eulerOrder );
    vector.y = 0;
    if (currentlyPressedKeys[37]) {
        car.setAngularVelocity( new THREE.Vector3(0,1,0) );
    }
    else if (currentlyPressedKeys[39]) {
        car.setAngularVelocity( new THREE.Vector3(0,-1,0) );
    }
    else {
        car.setAngularVelocity( new THREE.Vector3(0,0,0) );
    }
    if (currentlyPressedKeys[40]) {
        car.applyCentralForce( vector.multiplyScalar(-100) );
    }
    if (currentlyPressedKeys[38]) {
        car.applyCentralForce( vector.multiplyScalar(100) );
    }
    if (currentlyPressedKeys[90]) {
        camera_pivot.rotation.y -= elapsed*rspeed/1000;
    }
    if (currentlyPressedKeys[88]) {
        camera_pivot.rotation.y += elapsed*rspeed/1000;
    }
    if (currentlyPressedKeys[89]) {
        //console.log(vector);
    }
    if (currentlyPressedKeys[87]) {
        car.setLinearVelocity( vector.multiplyScalar(10)  );
    }
    if (currentlyPressedKeys[65]) {
        car.setLinearVelocity( vector.multiplyScalar(-10) );
    }
    if (currentlyPressedKeys[82]) {
        car.setLinearVelocity( vector.multiplyScalar(-10) );
    }
    if (currentlyPressedKeys[83]) {
        car.setLinearVelocity( new THREE.Vector3(
            10*Math.cos(roty),
            0,
            10*Math.sin(roty)) );
    }
    /*if (!currentlyPressedKeys[87] && !currentlyPressedKeys[65]
        && !currentlyPressedKeys[82] && !currentlyPressedKeys[83]) {
        car.setLinearVelocity( 3 );
    }*/
        //camera.position.z = car.position.z + 3 * Math.cos(car.rotation.y + extrarot);
        //camera.position.x = car.position.x + 3 * Math.sin(car.rotation.y + extrarot);
        //camera.position.y = car.position.y + 3;
        /*
        camera.position = car.localToWorld( new THREE.Vector3(0,0,5) );
        camera.position.y += 1;
        v2 = vector.clone();
        v2.y = 0;
        console.log(car.rotation);
        v2.add(camera.position);
        camera.lookAt(v2);
        //camera.rotation.y = car.rotation.y + extrarot;
        */
    }
}
