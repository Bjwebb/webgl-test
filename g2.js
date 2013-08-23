

function mouseClick(e) {
    document.getElementById('container').webkitRequestPointerLock(); // FIXME
}

function mouseMove(e) { 
    var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0,
    movementY = e.movementY ||
      e.mozMovementY      ||
      e.webkitMovementY   ||
      0;
    car.rotateOnAxis( new THREE.Vector3(0,1,0), movementX/100 );
    camera_pivot.rotation.x -= movementY/100;
    if (camera_pivot.rotation.x < -Math.PI/4) camera_pivot.rotation.x = -Math.PI/4;
    if (camera_pivot.rotation.x > 3*Math.PI/4) camera_pivot.rotation.x = 3*Math.PI/4;
}



var car, car2, scene, camera;
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
        scene = new THREE.Scene();
           

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
        jsonLoader.load( "blender/test.json", function( geometry, materials ) { 
            car = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
            carpos = new THREE.Object3D();
            scene.add(car);

            camera_pivot = new THREE.Object3D();
            car.add( camera_pivot );

            //Create a perspective camera
            camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 1, 1000 );
            camera.rotation.x = -Math.PI/4;
            camera.position.y = 5;
            camera.position.z = 5;

            camera_pivot.rotation.order = 'YXZ';
                    
            camera_pivot.add( camera );
        });
            
        jsonLoader.load( "blender/car.json", function( geometry, materials ) { 
            car2 = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
            car2.position.x = -5;
            scene.add(car2);
            car2.geometry.computeBoundingBox();
        });
           


        jsonLoader.load( "blender/level.json", function( geometry, materials ) { 
            plane = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials), 0 );
            carpos = new THREE.Object3D();
            //Add the model to the scene
            scene.add(plane);

        } );

        /* 
        plane FIXME var plane = new Physijs.BoxMesh(new THREE.CubeGeometry(40, 40, 0.5), new THREE.MeshNormalMaterial(), 0);
        plane.rotation.x = -Math.PI/2;
        plane.position.y = -3;
        scene.add(plane);
        */

        //Call the animate function
        animate();
    }


    }
    var lastTime = 0;
    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
            handleKeys(elapsed);
        }
        lastTime = timeNow;


        render();

        //will not render if the browser window is inactive
        requestAnimationFrame( animate );
    }

    function render() {

            renderer.render( scene, camera );
    }
var currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
    if (event.keyCode == 32) {
        //car.setLinearVelocity( new THREE.Vector3(0,10,0) );
    }
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}


function collisionDetection() {
    car.updateMatrixWorld();
    var center = car2.worldToLocal( car.localToWorld(car.geometry.boundingSphere.center.clone()) );
    var r = car.geometry.boundingSphere.radius;
    var bb = car2.geometry.boundingBox;
    console.log((center.x-r));
    console.log(bb.max.x);
    console.log(center);
    console.log(r);
    if ((center.x + r) > bb.min.x && (center.x - r) < bb.max.x &&
        (center.y + r) > bb.min.y && (center.y - r) < bb.max.y &&
        (center.z + r) > bb.min.z && (center.z - r) < bb.max.z) {
        return true;
    }
    return false;
}


function handleKeys(elapsed) {
    if (car) {
        var speed = 10;
        var vector = new THREE.Vector3( 0, 0, -1 );
        vector.applyEuler( car.rotation, car.rotation.order );
        vector.y = 0;
        var cameraVector = new THREE.Vector3( 0, 0, -1 );
        cameraVector.applyEuler( camera_pivot.rotation, camera_pivot.rotation.order );
        cameraVector.y = 0;
        if (currentlyPressedKeys[87] || currentlyPressedKeys[82] || currentlyPressedKeys[65] || currentlyPressedKeys[83]) {
            old = car.position.clone();
            if (currentlyPressedKeys[87]) {
                car.position.add( vector.multiplyScalar(elapsed*speed/1000)  );
            }
            if (currentlyPressedKeys[82]) {
                car.position.add( vector.multiplyScalar(-elapsed*speed/1000)  );
            }
            vector.cross( new THREE.Vector3(0,1,0) );
            if (currentlyPressedKeys[65]) {
                car.position.add( vector.multiplyScalar(-elapsed*speed/1000)  );
            }
            if (currentlyPressedKeys[83]) {
                car.position.add( vector.multiplyScalar(elapsed*speed/1000)  );
            }
            console.log(car.position);
            if (collisionDetection()) {
                car.position = old;
                console.log('MOO');
            }
            console.log(old);
            console.log(car.position);
            console.log(' ');
        }
    }
}
