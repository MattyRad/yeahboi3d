var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// player
var geometry = new THREE.BoxGeometry( 0.2, 1, 0.2 );
var material = new THREE.MeshNormalMaterial( { color: 0x00ff00 } );
var player = new THREE.Mesh( geometry, material );
var initial_x = player.position.x;
var initial_y = player.position.y;
var initial_z = player.position.z;
scene.add( player );

// obstacles
var obstacles = [];

for (var i = 0; i < 100; i++) {
    var geometry = new THREE.BoxGeometry( 0.2, 1, 0.2 );
    var material = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
    var obstacle = new THREE.Mesh( geometry, material );
    obstacle.position.x = 10 + Math.floor(Math.random() * 300);
    obstacles.push(obstacle);
    scene.add( obstacle );
}

var lights = [];
lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[0].position.set(0, 200, 0);
lights[1].position.set(100, 200, 100);
lights[2].position.set(-100, -200, -100);

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 1000, 1000 ),
    new THREE.MeshBasicMaterial( { color: 0x997744 } )
);
plane.rotation.x = - Math.PI / 2;
plane.position.y = -1;
//plane.receiveShadow = true;
scene.add( plane );

scene.background = new THREE.Color( 0x99ffff );

var jumping = doublejumping = false;
var jump_distance = 0.1;
var acceleration = 0.0025;
var acceleration_step = 0.0025;

var radius = 7;
var thetaX = 0;
var thetaY = 0;
var thetaZ = 0;

var trails = [];
var last_trail_emitted_at = null;
var trail_time_interval = 0.4;

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
        if (jumping && ! doublejumping && jump_distance < 0.07) {
            jump_distance = 0.1;
            acceleration_step = acceleration;
            doublejumping = true;
        }

       jumping = true;
    }

    if (jumping || doublejumping) {
       acceleration_step = acceleration_step * (1 + acceleration);

       jump_distance -= acceleration_step;

       player.position.y += jump_distance;
    }

    if (player.position.y < initial_y) { // hit the "ground"
        jumping = doublejumping = false;

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

    var delta = clock.getElapsedTime();

    if (last_trail_emitted_at === null || delta > (last_trail_emitted_at + trail_time_interval)) {
        last_trail_emitted_at = delta;

        var trail = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial( { color: 0x555555, opacity: 0.8, transparent: true } )
        );

        trail.position.x = player.position.x;
        trail.position.z = player.position.z;
        trail.position.y = player.position.y;

        trails.push(trail);

        scene.add(trail);
    }

    for (var i = 0; i < trails.length; i++) {
        trails[i].position.x -= 0.05;
    }

    renderer.render(scene, camera);
};

animate();