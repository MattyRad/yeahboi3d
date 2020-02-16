var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
var keyboard = new THREEx.KeyboardState();

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize, false );

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

function degrees_to_radians(degrees)
{
    var pi = Math.PI;
    return degrees * (pi/180);
}

function oscillateCamera() {
    thetaX += 0.3;
    thetaY += 0.03;
    thetaZ += 0.001;

    camera.position.x = radius * Math.sin( degrees_to_radians( thetaX ) );
    camera.position.y = radius * Math.sin( degrees_to_radians( thetaY ) );
    camera.position.z = 10 + radius * Math.cos( degrees_to_radians( thetaZ ) );
    camera.lookAt( scene.position );
}

var yeahboi_text = null;
var yeahboi_text_position = -4.65;

var setupText = function () {
    var loader = new THREE.FontLoader();

    loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/254249/helvetiker_regular.typeface.json", function (font) {
        var message = "YEAHBO";

        var text_geometry = new THREE.TextGeometry(message, {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 12
        });

        var text_material = new THREE.MeshBasicMaterial( { color: 0x444444, opacity: 0.8, transparent: true } )

        yeahboi_text = new THREE.Mesh(text_geometry, text_material);
        yeahboi_text.position.x = yeahboi_text_position;
        yeahboi_text.position.y = -0.5;

        scene.add(yeahboi_text);
    });
};

setupText();

var sound = new Howl({
    src: ['/mp3/sound.mp3'],
    autoplay: false,
    loop: true,
    volume: 0.25,
    onend: function() {
        sound.seek(5);
    }
});

var frame = 0;

var lose = lose_dialog_shown = started = false;

var titletext = document.createElement('div');
titletext.style.position = 'absolute';
titletext.style.width = '100%';
titletext.style.textAlign = 'center';
titletext.style.fontFamily = '"Arial Black", Gadget, sans-serif';
titletext.style.fontSize = 18;
titletext.innerHTML = '<h1>YEAHBOI</h1><br>Get the most I\'s on your boi!<br><br> Press spacebar/click to jump. Click here to begin!<br> (Mobile users should switch to landscape mode)';
titletext.style.top = '0%';
titletext.style.left = '0%';
titletext.addEventListener("click", function (e) {
    sound.play();
    started = true;
    e.target.innerHTML = '';
    e.target.style.display = 'none';
    e.target.style.top = '0%';
    e.target.style.left = '0%';

    var body = document.getElementById('body');

    setTimeout(function () {
        body.addEventListener("click", function (e) {
            if (jumping && ! doublejumping && jump_distance < 0.07) {
                jump_distance = 0.1;
                acceleration_step = acceleration;
                doublejumping = true;
                player.rotation.z -= 0.05; // poke
            }

           jumping = true;
        });
    }, 1000);
}, false);
document.body.appendChild(titletext);

var animate = function () {
    requestAnimationFrame( animate );

    if (! started) {
        return renderer.render(scene, camera);
    }

    frame++;

    if (lose) {
        if (! lose_dialog_shown) {
            lose_dialog_shown = true;

            var i_concat = '';

            for (var i = 0; i < trails.length; i++) {
                i_concat = i_concat + 'I';
            }

            alerted = true;

            alert('YEAH BO' + i_concat + "\nScore: " + trails.length);
        }

        return;
    }

    oscillateCamera();

    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].position.x -= 0.05;

        if (obstacles[i].position.x < (initial_x - 50)) {
            obstacles[i].position.x = player.position.x + 20 + Math.floor(Math.random() * 300);
        }
    }

    yeahboi_text_position -= 0.05;

    if (yeahboi_text) {
        yeahboi_text.position.x = yeahboi_text_position;
    }

    if (keyboard.pressed("space")) {
        if (jumping && ! doublejumping && jump_distance < 0.07) {
            jump_distance = 0.1;
            acceleration_step = acceleration;
            doublejumping = true;
            player.rotation.z -= 0.05; // poke
        }

       jumping = true;
    }

    if (player.rotation.z < 0) {
        player.rotation.z -= 0.05;

        if (player.rotation.z < -3) {
            player.rotation.z = 0;
        }
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
            sound.pause();

            lose = true;
        }
    }

    if (frame % 20 === 0) {
        var trail = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial( { color: 0x444444, opacity: 0.8, transparent: true } )
        );

        trail.position.x = player.position.x;
        trail.position.z = player.position.z;
        trail.position.y = player.position.y;
        trail.rotation.x = player.rotation.x;
        trail.rotation.z = player.rotation.z;
        trail.rotation.y = player.rotation.y;

        trails.push(trail);

        scene.add(trail);
    }

    for (var i = 0; i < trails.length; i++) {
        trails[i].position.x -= 0.05;
    }

    renderer.render(scene, camera);
};

animate();