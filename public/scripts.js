var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var keyboard = new THREEx.KeyboardState();

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// player
var geometry = new THREE.BoxGeometry( 0.2, 1, 0.2 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var player = new THREE.Mesh( geometry, material );
var initial_x = player.position.x;
var initial_y = player.position.y;
var initial_z = player.position.z;
scene.add( player );

// obstacle
var geometry = new THREE.BoxGeometry( 0.2, 1, 0.2 );
var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
var obstacle = new THREE.Mesh( geometry, material );
obstacle.position.x += 1;
scene.add( obstacle );

camera.position.z = 5;

var jumping = false;

var animate = function () {
    requestAnimationFrame( animate );

    obstacle.position.x -= 0.01;

    if (obstacle.position.x < (initial_x - 1)) {
        obstacle.position.x = 1;
    }

    if (keyboard.pressed("space")) {
       jumping = true;
    }

    if (jumping) {
       player.position.y += 0.01;
    }

    renderer.render(scene, camera);
};

animate();