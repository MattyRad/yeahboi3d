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
var jump_distance = 0.1;
var acceleration = 0.0025;
var acceleration_step = 0.0025;

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
       acceleration_step = acceleration_step * (1 + acceleration);

       jump_distance -= acceleration_step;

       player.position.y += jump_distance;
    }

    if (player.position.y < initial_y) { // hit the "ground"
        jumping = false;

        // reset our acceleration calculations
        jump_distance = 0.1;
        acceleration_step = acceleration;

        // may have overshot, hard reset
        player.position.y = initial_y;
    }


    for (var vi = 0; vi < player.geometry.vertices.length; vi++) {
        var localVertex = player.geometry.vertices[vi].clone();
        var globalVertex = localVertex.applyMatrix4( player.matrix );
        var directionVector = globalVertex.sub( player.position );
        var originPoint = player.position.clone();

        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects([obstacle]);

        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
            throw Error('game over!');
        }
    }

    renderer.render(scene, camera);
};

animate();