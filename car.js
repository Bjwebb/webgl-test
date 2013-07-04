var car, scene, camera;
function onLoad(){
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
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
            
            //Create a perspective camera
    camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 1, 1000 );
    camera.position.x = 3;
    camera.position.z = 3;
    camera.eulerOrder = 'ZXY';
    camera.rotation.x = Math.PI/4;
    camera.rotation.z = Math.PI/2;
            
    scene.add( camera );

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
            jsonLoader.load( "models/car.json", function( geometry, materials ) { 
                car = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
                //Add the model to the scene
                scene.add(car);

                var car2 = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
                car2.position.y = -2;
                scene.add(car2);
            } );

      // plane
      var plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshNormalMaterial());
      scene.add(plane);

            //Call the animate function
            animate();
    }


}
    var lastTime = 0;
    function animate() {
        //will not render if the browser window is inactive
        requestAnimationFrame( animate );
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
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys(elapsed) {
    var speed = 4;
    var rspeed = 2;
    if (currentlyPressedKeys[37]) {
        car.rotation.z += elapsed*rspeed/1000;
    }
    if (currentlyPressedKeys[39]) {
        car.rotation.z -= elapsed*rspeed/1000;
    }
    if (currentlyPressedKeys[40]) {
        car.position.x += (elapsed*speed/1000) * Math.cos(car.rotation.z);
        car.position.y += (elapsed*speed/1000) * Math.sin(car.rotation.z);
    }
    if (currentlyPressedKeys[38]) {
        car.position.x -= (elapsed*speed/1000) * Math.cos(car.rotation.z);
        car.position.y -= (elapsed*speed/1000) * Math.sin(car.rotation.z);
    }
    camera.position.x = car.position.x + 3 * Math.cos(car.rotation.z);
    camera.position.y = car.position.y + 3 * Math.sin(car.rotation.z);
    camera.rotation.z = car.rotation.z + Math.PI/2;
}
