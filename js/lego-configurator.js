var scene = new THREE.Scene();
var renderer;
var camera, gui;
var camControls;
var boat, character, headlight;

var configuration = {
    "boat-color-1": "#ff0000",
    "boat-color-2": "#ffffff",
    "boat-darkened-panes": 0.2,
    "character-color": "#0000ff"
};

$visualisation = $(".visualisation");

window.addEventListener('resize', onWindowResize, false);

initRenderer();
addCamera();
addLights();
addControls();
loadBoat();
loadCharacter();
addPlane();
updatePrice();
render();

function render() {
    headLight.position.set(camera.position.x, camera.position.y, camera.position.z);

    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

function onWindowResize() {
    camera.aspect = $visualisation.innerWidth() / $visualisation.innerHeight();
    camera.updateProjectionMatrix();
    renderer.setSize($visualisation.innerWidth(), $visualisation.innerHeight());
    render();
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize($visualisation.innerWidth(), $visualisation.innerHeight());
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    $visualisation.append(renderer.domElement);
}

function addControls() {
    camControls = new THREE.OrbitControls(camera, renderer.domElement);
    camControls.damping = 0.2;

    $(document).ready(function() {
        $('#boat-color-1').val(configuration["boat-color-1"]).change(function(e) {
            var color = e.target.value;
            boat.getObjectByName("_1409_dat_001", true).children[0].material.color = new THREE.Color(color);
        });

        $('#boat-color-2').val(configuration["boat-color-2"]).change(function(e) {
            var color = e.target.value;
            boat.getObjectByName("_7611_dat", true).children[0].material.color = new THREE.Color(color);
        });

        $('#boat-darkened-panes').val(configuration["boat-darkened-panes"]).on("input", function(e) {
            var factor = e.target.value;
            boat.getObjectByName("_7783_dat", true).children[0].material.opacity = factor;
        });

        $('#include-character').click(function(e) {
            $('.character-color-wrapper').toggleClass("hidden");
            character.visible = $('#include-character').prop('checked') ? true : false;
            updatePrice();
        });

        $('#character-color').val(configuration["character-color"]).change(function(e) {
            var color = e.target.value
            character.getObjectByName("_816_dat", true).children[0].material.color = new THREE.Color(color);
        });
    });
}

function addPlane() {
    var planeGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var planeMaterial = new THREE.MeshBasicMaterial( {color: 0xDDDDDD, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add( plane );
}

function loadBoat() {
    var loader = new THREE.ColladaLoader();
    loader.load("model/boat.dae", function (result) {
        boat = result.scene;
        boat.scale.set(0.2, 0.2, 0.2);
        boat.rotation.x = -Math.PI / 2;
        boat.castShadow = true;

        boat.getObjectByName("_7783_dat", true).children[0].material.color = "#000000";
        boat.getObjectByName("_7783_dat", true).children[0].material.opacity = 0.2;
        boat.getObjectByName("_7783_dat", true).children[0].material.transparent = true;

        $.each(boat.children, function(index, value) {
            if(typeof(value.children[0].material) !== "undefined") {
                value.children[0].material.shininess = 0;
            }
        });

        console.log(boat)
        scene.add(boat);
    });
}

function loadCharacter() {
    var loader = new THREE.ColladaLoader();
    loader.load("model/character.dae", function (result) {
        character = result.scene;
        character.visible = false;
        character.scale.set(0.2, 0.2, 0.2);
        character.rotation.x = -Math.PI / 2;
        character.castShadow = true;

        $.each(character.children, function(index, value) {
            if(typeof(value.children[0].material) !== "undefined") {
                value.children[0].material.shininess = 0;
            }
        });

        console.log(character)
        scene.add(character);
    });
}


function addLights() {
    addAmbientLight();
    addHeadLight();
    addSpotLight();
}

function addAmbientLight() {
    var ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.add(ambientLight);
}

function addHeadLight() {
    headLight = new THREE.PointLight(0xAAAAAA, 2.0);
    headLight.position.set(camera.position.x, camera.position.y, camera.position.z);
    scene.add(headLight);
}

function addSpotLight() {
    var spotLight = new THREE.SpotLight(0xAAAAAA, 0.1);
    spotLight.position.set(5, 5, 5);
    spotLight.castShadow = true;
    spotLight.target.position.set(0, 0, 0);
    spotLight.shadowDarkness = 0.1;
    spotLight.shadowCameraNear = 3;
    spotLight.shadowCameraFar = 23;
    spotLight.shadowBias = 0.00001;
    spotLight.shadowMapWidth = 2048;
    spotLight.shadowMapHeight = 2048;
    scene.add(spotLight);
}

function addCamera() {
    camera = new THREE.PerspectiveCamera(30, $visualisation.innerWidth()/$visualisation.innerHeight(), 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = camera.position.z * 0.4;
    camera.lookAt(new THREE.Vector3(0,0,0));
}

function updatePrice() {
    $('.price').html(calculatePrice().toFixed(2));
}

function calculatePrice() {
    return $('#include-character').prop('checked') ? 9.9 : 12.9;
}