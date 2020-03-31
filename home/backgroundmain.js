//Finalised
function Text3d(text) {
    this.text = text;
    this.parameters = {
    	//Size of the text
        size: 50,
        //The boldness of the text
        height: 10,

        curveSegments:20,
        font: "helvetiker"
    };
    this.mesh = createTextMesh(text, this.parameters);
    this.position = this.mesh.position;
    this.width = this.mesh.geometry.boundingBox.max.x - this.mesh.geometry.boundingBox.min.x;
}

var camera, scene, renderer;
var root, letters3d;
var stats;
var lastUpdateTime = Date.now();

var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

function createTextMesh(text, textParameters) {
    var textMaterial = new THREE.LineBasicMaterial();
    var textGeometry = new THREE.TextGeometry(text, textParameters);
    textGeometry.computeBoundingBox();

    var textMesh = new THREE.Mesh(textGeometry, textMaterial);
    //The text go up or down (Higher value go) 
    textMesh.position.y = 130;
    //Let's the alphabet to start a step lower than it should be 
    textMesh.position.z = 50;
    return textMesh;
}

function randomElement(array) {
    var n = Math.random();
    var chunk = 1.0 / array.length;
    return array[Math.floor(n / chunk)];
}
function randomMaterial() {
    var colors = [0x9E0142, 0xD53E4F, 0xD53E4F, 0xFDAE61, 0xFEE08B, 0xFFFFBF, 0xE6F598, 0xABDDA4, 0x66C2A5, 0x3288BD, 0x5E4FA2];
    return new THREE.LineBasicMaterial({
        color: randomElement(colors),
        overdraw: true
    });
}
function sumOf(values, callback) {
    var sum = 0;
    values.forEach(function(it) { sum += callback(it); });
    return sum;
}
/*To create the rationale of the project */
function createInfoElement() {
    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '50px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color= 'white';
    info.innerHTML = '<font size ="5"><pre> Based on Sirhan (2007), students are lacking of understanding and motivation in learning chemistry. <br> However, chemistry plays an important role in our daily lives. <br> From the food we eat, clothes we wear medicines, water and etc. <br> Therefore, our group come up with an idea of building a small scope of chemistry learning website <br> using WebGL to encourage the students.<br> So, let us start learning Chemistry now! <br><br> First, drag to spin the text</font>';
    return info;
}
/*To create the footer*/
function createfooter() {
    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '550px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color= 'white';
    info.innerHTML = '<font size= "5"> Presented by: <pre> Ong Hui Xin 62322               Goh Suk Chin 60864 <br>Goh Cheng Lynn 60858              Gun Sin Yee 60876   </font>';
    return info;
}
//The status of the image
function createStats() {
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    //Position of the status
    stats.domElement.style.top = '10px';
    return stats;
}

function create3dLetters(text) {
    var letters3d = text.split("").map(function(letter) {
        var letter3d = (letter == " " ? new Text3d("-") : new Text3d(letter));
        letter3d.mesh.material = randomMaterial();
        if (letter == " ") letter3d.mesh.material.visible = false;
        return letter3d;
    });
    //Spacing between the letters
    var letterSpacing = 10;
    var position = -0.5 * (sumOf(letters3d, function(it){ return it.width; }) + letterSpacing * letters3d.length);
    letters3d.forEach(function(letter) {
        letter.position.x = position;
        position += letter.width + letterSpacing;
    });
    return letters3d;
}

function initChem() {
	/*To create the rationale of the project*/
    var container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(createInfoElement());
/*To create the footer*/
    var container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(createfooter());
/*Adding a perspectives camera*/
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    /*Camera position for x, y aand z*/
    camera.position.set(0, 150, 500);
/*Creating the coloured text*/
    var text = "WE'VE GOT CHEMISTRY";
    letters3d = create3dLetters(text);

    root = new THREE.Object3D();
    letters3d.forEach(function(it){ root.add(it.mesh); });
/*Scene allows what to set up objects, lights and cameras rendered by 3js.*/
    scene = new THREE.Scene();
    scene.add(root);
/*To make the canvas transparent*/
    renderer = new THREE.WebGLRenderer( {alpha:true});
/*Renderer*/
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    stats = createStats();
    container.appendChild(stats.domElement);

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
}
/*Enable the rotation to stop following the mouse*/
function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}
/*If the mouse if out of the screen stop rotating*/
function onDocumentMouseOut() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}
/*To display the coloured-words*/
function onDocumentTouchStart(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;
    }
}
/*To do*/
function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

var index = 0;
function render() {
    var now = Date.now();
    var frequency = 250;
    if (now - lastUpdateTime > frequency) {
        lastUpdateTime = (Math.floor(now / frequency) + 1) * frequency;
        var it = letters3d[index++];
        it.mesh.material = randomMaterial();
        if (it.text == "-") it.mesh.material.visible = false;

        if (Math.random() < 0.2) {
            it.mesh.position.z = 10;
        } else {
            it.mesh.position.z = 0;
        }
        index = index % letters3d.length;
    }
    root.rotation.y += (targetRotation - root.rotation.y) * 0.05;
    renderer.render(scene, camera);
}