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

// obstacles
var obstacles = [];

for (var i = 0; i < 100; i++) {
    var geometry = new THREE.BoxGeometry( 0.2, 1, 0.2 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    var obstacle = new THREE.Mesh( geometry, material );
    obstacle.position.x = 10 + Math.floor(Math.random() * 300);
    obstacles.push(obstacle);
    scene.add( obstacle );
}

var jumping = false;
var jump_distance = 0.1;
var acceleration = 0.0025;
var acceleration_step = 0.0025;

var radius = 7;
var thetaX = 0;
var thetaY = 0;
var thetaZ = 0;

function degrees_to_radians(degrees)
{
    var pi = Math.PI;
    return degrees * (pi/180);
}

function oscillateCamera() {
    thetaX += 0.1;
    thetaY += 0.05;
    thetaZ += 0.05;

    camera.position.x = radius * Math.sin( degrees_to_radians( thetaX ) );
    camera.position.y = radius * Math.sin( degrees_to_radians( thetaY ) );
    camera.position.z = 3 + radius * Math.cos( degrees_to_radians( thetaZ ) );
    camera.lookAt( scene.position );
}

var animate = function () {
    requestAnimationFrame( animate );

    oscillateCamera();

    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].position.x -= 0.05;

        if (obstacles[i].position.x < (initial_x - 15)) {
            obstacles[i].position.x = 10 + Math.floor(Math.random() * 300);
        }
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
        var collisionResults = ray.intersectObjects(obstacles);

        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
            throw Error('game over!');
        }
    }

    renderer.render(scene, camera);
};

animate();