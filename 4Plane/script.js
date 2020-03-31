var viewWidth, viewHeight, renderer, stage, address;
var loader;
var background, foreground, foregroundTex, hills, hillsTex, rocks1, rocks1Tex, rocks2, rocks2Tex, colorFilter, brightnessFilter, sun, moon, cloud, paralaxContainer, starParticles;

var speed = 0.2;
var hue = 0;
var hueSpeed = 0.08;
var nightHue = 280;
var springHue = -20;
var springBrightness = 1;
var forestHue = 90;
var forestBrightness = 0.8;
var autumnHue = 60;
var autumnBrightness = 0.8;
var winterHue = 220;
var winterBrightness = 1;
var foggyHue = 180;
var foggyBrightness = 0.5;
var halloweenHue = 300;
var halloweenBrightness = 0.4;
var summerHue = 0;
var summerBrightness = 1.1;
var baseHue = 0;
var baseBrightness = 1;
var day = true;
var sunShowing = true;
var sunHeightPerc = 0.45;
var moonHeightPerc = 1;
var lastTime = Date.now();
var starCount = 1000;
var stars = [];
var autoScroll = true;
var mouse = {x:0, y:0 }
var colorToggleValue = 0;

//var game = new Game();

function init(){
	preload();
	//game.init();
}

function preload(){

	var address = "http://www.testomic.com/public/codepen-assets/img/paralax/";
	loader = new PIXI.loaders.Loader(); // you can also create your own if you want
	loader.add('background', address + "background-nosun.jpg");
	loader.add('star', address + "star.png");
	loader.add('sun', address + "sun.png");
	loader.add('moon', address + "moon.png");
	loader.add('cloud', address + "cloud.png");
	loader.add('foreground', address + "foreground.png");
	loader.add('hills', address + "hills.png");
	loader.add('rocks1', address + "rocks1.png");
	loader.add('rocks2', address + "rocks2.png");
	loader.once('complete',onAssetsLoaded);
	loader.load();
}

function onAssetsLoaded(){
	
	renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight);
	$(".container").append(renderer.view);

	stage = new PIXI.Container();
	background =  new PIXI.Sprite(loader.resources.background.texture);
	background.anchor.set(0.5,0.5);
	
	paralaxContainer = new PIXI.Container();
	
	foreground = new PIXI.extras.TilingSprite(loader.resources.foreground.texture, renderer.width, renderer.height);
	
	hills = new PIXI.extras.TilingSprite(loader.resources.hills.texture, renderer.width, renderer.height);
	
	rocks1 = new PIXI.extras.TilingSprite(loader.resources.rocks1.texture, renderer.width, renderer.height);
	
	rocks2 = new PIXI.extras.TilingSprite(loader.resources.rocks2.texture, renderer.width, renderer.height);
	
	sun = new PIXI.Sprite(loader.resources.sun.texture);
	sun.anchor.set(0.5,0.5);
	
	moon = new PIXI.Sprite(loader.resources.moon.texture);
	moon.anchor.set(0.5,0.5);
	
	cloud = new PIXI.Sprite(loader.resources.cloud.texture);
	cloud.anchor.set(0.5,0.5);
	
	colorFilter = new PIXI.filters.ColorMatrixFilter();
	brightnessFilter = new PIXI.filters.ColorMatrixFilter();
	
	background.filters = [colorFilter, brightnessFilter];
	paralaxContainer.filters = [colorFilter, brightnessFilter];
	
	starParticles = new PIXI.particles.ParticleContainer(10000, {
			scale: true,
			position: true,
			rotation: true,
			uvs: true,
			alpha: true
	});	
	
	for(var i = 0; i < starCount; i++){
			var star = new PIXI.Sprite(loader.resources.star.texture);
			star.anchor.set(0.5,0.5);
			var rand = Math.random();
			star.scale.set(0.5*rand,0.5*rand);
			star.x = Math.random() * viewWidth;
    	star.y = Math.random() * viewHeight;
			star.alpha = Math.random();
			star.rotation = 360 * Math.random();
			stars.push(star);
			starParticles.addChild(star);
	}
	starParticles.alpha = 0;
	
	stage.addChild(background);
	stage.addChild(starParticles);
	stage.addChild(sun);
	stage.addChild(moon);
	stage.addChild(paralaxContainer);
	paralaxContainer.addChild(cloud);
	paralaxContainer.addChild(rocks2);
	paralaxContainer.addChild(rocks1);
	paralaxContainer.addChild(hills);
	paralaxContainer.addChild(foreground);
	
	$(window).resize(resize);
	resize();
	
	animate();
	checkToggle();
	
	document.addEventListener('mousemove', onMouseMove, false);
	document.addEventListener('touchmove', onTouchMove, false);
	setSeason();
}

function checkToggle(){
	$('#dayToggle').change( function() {
			
			if($("#dayToggle:checked").val() === "on"){
				$(".daySwitch p").text("Night");
				$(".daySwitch .slider").css("background", "#5c145d");
				day = false;
			}
			else{
				$(".daySwitch p").text("Day");
				$(".daySwitch .slider").css("background", "#E14658");
				day = true;
			}

	});
	
	$('#movingToggle').change( function() {

			if($("#movingToggle:checked").val() === "on"){
				$(".movingSwitch p").text("Mouse");
				$(".movingSwitch .slider").css("background", "#5c145d");
				autoScroll = false;
			}
			else{
				$(".movingSwitch p").text("Auto");
				$(".movingSwitch .slider").css("background", "#E14658");
				autoScroll = true;
			}

	});
	
	$('#colorToggle').change( function() {
			
		colorToggleValue = colorToggleValue < 6 ? colorToggleValue+1 : 0;
		
		setSeason();
	});
}

function setSeason(){
	switch(colorToggleValue){
			case 0:
				$(".colorSwitch p").text("Summer");
				$(".colorSwitch .slider").css("background", "#f5cb06");
				hue = baseHue = summerHue;
				baseBrightness = summerBrightness;
				sunHeightPerc = 0.4;
				day = true;
			break;
			case 1:
				$(".colorSwitch p").text("Spring");
				$(".colorSwitch .slider").css("background", "#E14658");
				hue = baseHue = springHue;
				baseBrightness = springBrightness;
				day = true;
				sunHeightPerc = 0.45;
			break;
			case 2:
				$(".colorSwitch p").text("Forest");
				$(".colorSwitch .slider").css("background", "#66b46f");
				hue = baseHue = forestHue;
				baseBrightness = forestBrightness;
				day = true;
				sunHeightPerc = 0.5;
			break;
			case 3:
				$(".colorSwitch p").text("Autumn");
				$(".colorSwitch .slider").css("background", "#6d7738");
				hue = baseHue = autumnHue;
				baseBrightness = autumnBrightness;
				day = true;
				sunHeightPerc = 0.55;
			break;
			case 4:
				$(".colorSwitch p").text("Winter");
				$(".colorSwitch .slider").css("background", "#12f6ea");
				hue = baseHue = winterHue;
				baseBrightness = winterBrightness;
				day = true;
			break;
			case 5:
				$(".colorSwitch p").text("Fog");
				$(".colorSwitch .slider").css("background", "#444444");
				hue = baseHue = foggyHue;
				baseBrightness = foggyBrightness;
				day = true;
			break;
			case 6:
				$(".colorSwitch p").text("Pumpkin");
				$(".colorSwitch .slider").css("background", "#7912c8");
				hue = baseHue = halloweenHue;
				baseBrightness = halloweenBrightness;
				day = true;
			break;
				
		}
}

function resize(){
	
	viewWidth = $(".container").width();
	viewHeight = $(".container").height();
	
	for(var i = 0; i < stars.length; i++){
			var star = stars[i];
			star.x = Math.random() * viewWidth;
			star.y = Math.random() * viewHeight;
	}
	
	if(renderer){
		renderer.resize(viewWidth, viewHeight);
	}
	
	if(background){	
		
		background.width = viewWidth;
		background.height = viewHeight;
		background.position.set(viewWidth*0.5, viewHeight*0.5);
		
		fitRectIntoBounds(sun, {width:viewWidth*0.4, height:viewHeight*0.4});
		fitRectIntoBounds(moon, {width:viewWidth*0.4, height:viewHeight*0.4});
		fitRectIntoBounds(cloud, {width:viewWidth*0.8, height:viewHeight*0.25});
		
	}
	
	if(foreground){
			resizeParalaxLayer(loader.resources.foreground.texture, foreground, 0.3, viewHeight);
	}
	
	if(hills){
		var y = viewHeight - (foreground.height*0.45);
		resizeParalaxLayer(loader.resources.hills.texture, hills, 0.3, y);
	}
	
	if(rocks1){
		var y = hills.y - (hills.height*0.2);
		resizeParalaxLayer(loader.resources.rocks1.texture, rocks1, 0.3, y);
	}
	
	if(rocks2){
		var y = rocks1.y + (rocks1.height * 0.5);
		resizeParalaxLayer(loader.resources.rocks2.texture, rocks2, 0.3, y);
	}
}

function fitRectIntoBounds(sprite, bounds) {
  var rectRatio = sprite.width / sprite.height;
  var boundsRatio = bounds.width / bounds.height	;

  var newDimensions = {};

  // Rect is more landscape than bounds - fit to width
  if(rectRatio > boundsRatio) {
    newDimensions.width = bounds.width;
    newDimensions.height = sprite.height * (bounds.width / sprite.width);
  }
  // Rect is more portrait than bounds - fit to height
  else {
    newDimensions.width = sprite.width * (bounds.height / sprite.height);
    newDimensions.height = bounds.height;
  }

  sprite.width = newDimensions.width;
	sprite.height = newDimensions.height;
}

function resizeParalaxLayer(tex, sprite, heightPerc, y){
	
	var texHeight = tex.frame.height;
	sprite.height = texHeight * heightPerc;
	sprite.width = viewWidth;
	sprite.anchor.set(0,1);
	sprite.position.y = y;
	sprite.tileScale.set(heightPerc,heightPerc);
	sprite.tilePosition.set(0,texHeight * heightPerc);
}

function animate(){

	var now = new Date().getTime(),
  dt = now - (lastTime || now);
 	lastTime = now;
	
	var s = speed * dt;
	var hs = hueSpeed * dt;
	
	renderer.render(stage);
	requestAnimationFrame( animate );
	
	if(autoScroll){
		foreground.tilePosition.x -= s;
	}
	else{
		foreground.tilePosition.x = (mouse.x * viewWidth) * 0.5;
	}
	
	if(autoScroll){
		hills.tilePosition.x -= s * 0.5;
	}
	else{
		hills.tilePosition.x = (mouse.x * viewWidth) * 0.25;
	}
	
	if(autoScroll){
		rocks1.tilePosition.x -= s * 0.25;
	}
	else{
		rocks1.tilePosition.x = (mouse.x * viewWidth) * 0.125;
	}
	
	if(autoScroll){
		rocks2.tilePosition.x -= s * 0.125;
	}
	else{
		rocks2.tilePosition.x = (mouse.x * viewWidth) * 0.051;
	}
	
	if(!day){
		hideSun();
		if(hue < nightHue){
			hue += hs;	
		}
	}
	else{
		showSun();
		if(hue > baseHue){
			hue -= hs;
		}
	}

	var brightnessPerc = baseHue == summerHue ? (1.2 - hue/nightHue) : baseBrightness;
	brightnessPerc =  brightnessPerc > 1 ? 1 : brightnessPerc;

	colorFilter.hue(hue, false);
	brightnessFilter.brightness(brightnessPerc, false);
	
	sun.position.set(viewWidth * 0.5, viewHeight * sunHeightPerc);
	moon.position.set(viewWidth * 0.5, viewHeight * moonHeightPerc);
	cloud.position.set(viewWidth * 0.5, viewHeight * 0.55);
}

function hideSun(){
	if(sunShowing){
		sunShowing = false;
		
		var animation = new TimelineLite()
		animation.to(this, 2, {sunHeightPerc:1, ease:Back.easeIn})
             .to(this, 5, {moonHeightPerc:0.45, ease:Back.easeOut});
		
		TweenLite.to(starParticles, 2, {alpha:0.5, delay:3});
	}
}

function showSun(){
	if(!sunShowing){
		sunShowing = true;
		
		var animation = new TimelineLite()
		animation.to(this, 2, {moonHeightPerc:1, ease:Back.easeIn})
             .to(this, 5, {sunHeightPerc:0.45, ease:Back.easeOut});

		TweenLite.to(starParticles, 2, {alpha:0});
	}
}

function onMouseMove(e){
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onTouchMove(e) {

	if (e.touches.length === 1) {
		mouse.x = ( e.touches[0].pageX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( e.touches[0].pageY / window.innerHeight ) * 2 + 1;
	}
}


//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x68c3c0,

};

///////////////

// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];

function resetGame(){
  game = {speed:0,
          initSpeed:.00035,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000025,
          incrementSpeedByLevel:.000005,
          distanceForSpeedUpdate:100,
          speedLastUpdate:0,

          distance:0,
          ratioSpeedDistance:50,
          //energy:100,
          energy:60,
          ratioSpeedEnergy:3,

          level:1,
          levelLastUpdate:0,
          distanceForLevelUpdate:1000,

          planeDefaultHeight:100,
          planeAmpHeight:80,
          planeAmpWidth:75,
          planeMoveSensivity:0.005,
          planeRotXSensivity:0.0008,
          planeRotZSensivity:0.0004,
          planeFallSpeed:.001,
          planeMinSpeed:1.2,
          planeMaxSpeed:1.6,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,

          seaRadius:600,
          //seaLength:800,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 5,
          wavesMaxAmp : 20,
          wavesMinSpeed : 0.001,
          wavesMaxSpeed : 0.003,

          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,

          // coinDistanceTolerance:15,
          // coinValue:3,
          // coinsSpeed:.5,
          // coinLastSpawn:0,
          // distanceForCoinsSpawn:100,

          ennemyDistanceTolerance:10,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:50,

          status : "playing",
         };
  //fieldLevel.innerHTML = Math.floor(game.level);
}

//THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;
  nearPlane = .1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = game.planeDefaultHeight;
  //camera.lookAt(new THREE.Vector3(0, 400, 0));

  renderer2 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer2.setSize(WIDTH, HEIGHT);

  renderer2.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer2.domElement);

  window.addEventListener('resize', handleWindowResize, false);

  /*
  controls = new THREE.OrbitControls(camera, renderer2.domElement);
  controls.minPolarAngle = -Math.PI / 2;
  controls.maxPolarAngle = Math.PI ;

  //controls.noZoom = true;
  //controls.noPan = true;
  //*/
}

// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer2.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

function handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

function handleMouseUp(event){
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}


function handleTouchEnd(event){
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}

// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

}


var Pilot = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "pilot";
  this.angleHairs=0;

  var bodyGeom = new THREE.BoxGeometry(15,15,15);
  var bodyMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
  var body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(2,-12,0);

  this.mesh.add(body);

  var faceGeom = new THREE.BoxGeometry(10,10,10);
  var faceMat = new THREE.MeshLambertMaterial({color:Colors.pink});
  var face = new THREE.Mesh(faceGeom, faceMat);
  this.mesh.add(face);

  var hairGeom = new THREE.BoxGeometry(4,4,4);
  var hairMat = new THREE.MeshLambertMaterial({color:Colors.brown});
  var hair = new THREE.Mesh(hairGeom, hairMat);
  hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));
  var hairs = new THREE.Object3D();

  this.hairsTop = new THREE.Object3D();

  for (var i=0; i<12; i++){
    var h = hair.clone();
    var col = i%3;
    var row = Math.floor(i/3);
    var startPosZ = -4;
    var startPosX = -4;
    h.position.set(startPosX + row*4, 0, startPosZ + col*4);
    h.geometry.applyMatrix(new THREE.Matrix4().makeScale(1,1,1));
    this.hairsTop.add(h);
  }
  hairs.add(this.hairsTop);

  var hairSideGeom = new THREE.BoxGeometry(12,4,2);
  hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
  var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
  var hairSideL = hairSideR.clone();
  hairSideR.position.set(8,-2,6);
  hairSideL.position.set(8,-2,-6);
  hairs.add(hairSideR);
  hairs.add(hairSideL);

  var hairBackGeom = new THREE.BoxGeometry(2,8,10);
  var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
  hairBack.position.set(-1,-4,0)
  hairs.add(hairBack);
  hairs.position.set(-5,5,0);

  this.mesh.add(hairs);

  var glassGeom = new THREE.BoxGeometry(5,5,5);
  var glassMat = new THREE.MeshLambertMaterial({color:Colors.brown});
  var glassR = new THREE.Mesh(glassGeom,glassMat);
  glassR.position.set(6,0,3);
  var glassL = glassR.clone();
  glassL.position.z = -glassR.position.z

  var glassAGeom = new THREE.BoxGeometry(11,1,11);
  var glassA = new THREE.Mesh(glassAGeom, glassMat);
  this.mesh.add(glassR);
  this.mesh.add(glassL);
  this.mesh.add(glassA);

  var earGeom = new THREE.BoxGeometry(2,3,2);
  var earL = new THREE.Mesh(earGeom,faceMat);
  earL.position.set(0,0,-6);
  var earR = earL.clone();
  earR.position.set(0,0,6);
  this.mesh.add(earL);
  this.mesh.add(earR);
}

Pilot.prototype.updateHairs = function(){
  //*
   var hairs = this.hairsTop.children;

   var l = hairs.length;
   for (var i=0; i<l; i++){
      var h = hairs[i];
      h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25;
   }
  this.angleHairs += game.speed*deltaTime*40;
  //*/
}

var AirPlane = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "airPlane";

  // Cabin

  var geomCabin = new THREE.BoxGeometry(80,50,50,1,1,1);
  var matCabin = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

  geomCabin.vertices[4].y-=10;
  geomCabin.vertices[4].z+=20;
  geomCabin.vertices[5].y-=10;
  geomCabin.vertices[5].z-=20;
  geomCabin.vertices[6].y+=30;
  geomCabin.vertices[6].z+=20;
  geomCabin.vertices[7].y+=30;
  geomCabin.vertices[7].z-=20;

  var cabin = new THREE.Mesh(geomCabin, matCabin);
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  this.mesh.add(cabin);

  // Engine

  var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
  var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var engine = new THREE.Mesh(geomEngine, matEngine);
  engine.position.x = 50;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);

  // Tail Plane

  var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
  var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  tailPlane.position.set(-40,20,0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);

  // Wings

  var geomSideWing = new THREE.BoxGeometry(30,5,120,1,1,1);
  var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
  var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  sideWing.position.set(0,15,0);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);

  var geomWindshield = new THREE.BoxGeometry(3,15,20,1,1,1);
  var matWindshield = new THREE.MeshPhongMaterial({color:Colors.white,transparent:true, opacity:.3, shading:THREE.FlatShading});;
  var windshield = new THREE.Mesh(geomWindshield, matWindshield);
  windshield.position.set(5,27,0);

  windshield.castShadow = true;
  windshield.receiveShadow = true;

  this.mesh.add(windshield);

  var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
  geomPropeller.vertices[4].y-=5;
  geomPropeller.vertices[4].z+=5;
  geomPropeller.vertices[5].y-=5;
  geomPropeller.vertices[5].z-=5;
  geomPropeller.vertices[6].y+=5;
  geomPropeller.vertices[6].z+=5;
  geomPropeller.vertices[7].y+=5;
  geomPropeller.vertices[7].z-=5;
  var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller);

  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  var geomBlade = new THREE.BoxGeometry(1,80,10,1,1,1);
  var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
  var blade1 = new THREE.Mesh(geomBlade, matBlade);
  blade1.position.set(8,0,0);

  blade1.castShadow = true;
  blade1.receiveShadow = true;

  var blade2 = blade1.clone();
  blade2.rotation.x = Math.PI/2;

  blade2.castShadow = true;
  blade2.receiveShadow = true;

  this.propeller.add(blade1);
  this.propeller.add(blade2);
  this.propeller.position.set(60,0,0);
  this.mesh.add(this.propeller);

  var wheelProtecGeom = new THREE.BoxGeometry(30,15,10,1,1,1);
  var wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
  var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
  wheelProtecR.position.set(25,-20,25);
  this.mesh.add(wheelProtecR);

  var wheelTireGeom = new THREE.BoxGeometry(24,24,4);
  var wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
  var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
  wheelTireR.position.set(25,-28,25);

  var wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
  var wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
  var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
  wheelTireR.add(wheelAxis);

  this.mesh.add(wheelTireR);

  var wheelProtecL = wheelProtecR.clone();
  wheelProtecL.position.z = -wheelProtecR.position.z ;
  this.mesh.add(wheelProtecL);

  var wheelTireL = wheelTireR.clone();
  wheelTireL.position.z = -wheelTireR.position.z;
  this.mesh.add(wheelTireL);

  var wheelTireB = wheelTireR.clone();
  wheelTireB.scale.set(.5,.5,.5);
  wheelTireB.position.set(-35,-5,0);
  this.mesh.add(wheelTireB);

  var suspensionGeom = new THREE.BoxGeometry(4,20,4);
  suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0))
  var suspensionMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
  var suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
  suspension.position.set(-35,-5,0);
  suspension.rotation.z = -.3;
  this.mesh.add(suspension);

  this.pilot = new Pilot();
  this.pilot.mesh.position.set(-10,27,0);
  this.mesh.add(this.pilot.mesh);


  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;

};

// Sky = function(){
//   this.mesh = new THREE.Object3D();
//   this.nClouds = 20;
//   this.clouds = [];
//   var stepAngle = Math.PI*2 / this.nClouds;
//   for(var i=0; i<this.nClouds; i++){
//     var c = new Cloud();
//     this.clouds.push(c);
//     var a = stepAngle*i;
//     var h = game.seaRadius + 150 + Math.random()*200;
//     c.mesh.position.y = Math.sin(a)*h;
//     c.mesh.position.x = Math.cos(a)*h;
//     c.mesh.position.z = -300-Math.random()*500;
//     c.mesh.rotation.z = a + Math.PI/2;
//     var s = 1+Math.random()*2;
//     c.mesh.scale.set(s,s,s);
//     this.mesh.add(c.mesh);
//   }
// }

// Sky.prototype.moveClouds = function(){
//   for(var i=0; i<this.nClouds; i++){
//     var c = this.clouds[i];
//     c.rotate();
//   }
//   this.mesh.rotation.z += game.speed*deltaTime;

// }

Sea = function(){
  var geom = new THREE.CylinderGeometry(game.seaRadius,game.seaRadius,game.seaLength,40,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i=0;i<l;i++){
    var v = geom.vertices[i];
    //v.y = Math.random()*30;
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,
                     amp:game.wavesMinAmp + Math.random()*(game.wavesMaxAmp-game.wavesMinAmp),
                     speed:game.wavesMinSpeed + Math.random()*(game.wavesMaxSpeed - game.wavesMinSpeed)
                    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (){
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    vprops.ang += vprops.speed*deltaTime;
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

// Cloud = function(){
//   this.mesh = new THREE.Object3D();
//   this.mesh.name = "cloud";
//   var geom = new THREE.CubeGeometry(20,20,20);
//   var mat = new THREE.MeshPhongMaterial({
//     color:Colors.white,

//   });

//   //*
//   var nBlocs = 3+Math.floor(Math.random()*3);
//   for (var i=0; i<nBlocs; i++ ){
//     var m = new THREE.Mesh(geom.clone(), mat);
//     m.position.x = i*15;
//     m.position.y = Math.random()*10;
//     m.position.z = Math.random()*10;
//     m.rotation.z = Math.random()*Math.PI*2;
//     m.rotation.y = Math.random()*Math.PI*2;
//     var s = .1 + Math.random()*.9;
//     m.scale.set(s,s,s);
//     this.mesh.add(m);
//     m.castShadow = true;
//     m.receiveShadow = true;

//   }
//   //*/
// }

// Cloud.prototype.rotate = function(){
//   var l = this.mesh.children.length;
//   for(var i=0; i<l; i++){
//     var m = this.mesh.children[i];
//     m.rotation.z+= Math.random()*.005*(i+1);
//     m.rotation.y+= Math.random()*.002*(i+1);
//   }
// }

Ennemy = function(){
  var geom = new THREE.TetrahedronGeometry(8,2);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.red,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

EnnemiesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.ennemiesInUse = [];
}

EnnemiesHolder.prototype.spawnEnnemies = function(){
  var nEnnemies = game.level;

  for (var i=0; i<nEnnemies; i++){
    var ennemy;
    if (ennemiesPool.length) {
      ennemy = ennemiesPool.pop();
    }else{
      ennemy = new Ennemy();
    }

    ennemy.angle = - (i*0.1);
    ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;

    this.mesh.add(ennemy.mesh);
    this.ennemiesInUse.push(ennemy);
  }
}

EnnemiesHolder.prototype.rotateEnnemies = function(){
  for (var i=0; i<this.ennemiesInUse.length; i++){
    var ennemy = this.ennemiesInUse[i];
    ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;

    if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;

    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
    ennemy.mesh.rotation.z += Math.random()*.1;
    ennemy.mesh.rotation.y += Math.random()*.1;

    //var globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.ennemyDistanceTolerance){
      particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);

      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      game.planeCollisionSpeedX = 100 * diffPos.x / d;
      game.planeCollisionSpeedY = 100 * diffPos.y / d;
      ambientLight.intensity = 2;

      //removeEnergy();
      addEnergy();
      i--;
    }else if (ennemy.angle > Math.PI){
      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      i--;
    }
  }
}

Particle = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
  var _this = this;
  var _p = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var speed = .6+Math.random()*.2;
  TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(_p) _p.remove(_this.mesh);
      _this.mesh.scale.set(1,1,1);
      particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

  var nPArticles = density;
  for (var i=0; i<nPArticles; i++){
    var particle;
    if (particlesPool.length) {
      particle = particlesPool.pop();
    }else{
      particle = new Particle();
    }
    this.mesh.add(particle.mesh);
    particle.mesh.visible = true;
    var _this = this;
    particle.mesh.position.y = pos.y;
    particle.mesh.position.x = pos.x;
    particle.explode(pos,color, scale);
  }
}

Coin = function(){
  var geom = new THREE.TetrahedronGeometry(5,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,

    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

CoinsHolder = function (nCoins){
  this.mesh = new THREE.Object3D();
  this.coinsInUse = [];
  this.coinsPool = [];
  for (var i=0; i<nCoins; i++){
    var coin = new Coin();
    this.coinsPool.push(coin);
  }
}

CoinsHolder.prototype.spawnCoins = function(){

  var nCoins = 1 + Math.floor(Math.random()*10);
  var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
  var amplitude = 10 + Math.round(Math.random()*10);
  for (var i=0; i<nCoins; i++){
    var coin;
    if (this.coinsPool.length) {
      coin = this.coinsPool.pop();
    }else{
      coin = new Coin();
    }
    this.mesh.add(coin.mesh);
    this.coinsInUse.push(coin);
    coin.angle = - (i*0.02);
    coin.distance = d + Math.cos(i*.5)*amplitude;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
  }
}

CoinsHolder.prototype.rotateCoins = function(){
  for (var i=0; i<this.coinsInUse.length; i++){
    var coin = this.coinsInUse[i];
    if (coin.exploding) continue;
    coin.angle += game.speed*deltaTime*game.coinsSpeed;
    if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
    coin.mesh.rotation.z += Math.random()*.1;
    coin.mesh.rotation.y += Math.random()*.1;

    //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.coinDistanceTolerance){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
      addEnergy();
      i--;
    }else if (coin.angle > Math.PI){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}


// 3D Models
var sea;
var airplane;

function createPlane(){
  airplane = new AirPlane();
  airplane.mesh.scale.set(.25,.25,.25);
  airplane.mesh.position.y = game.planeDefaultHeight;
  scene.add(airplane.mesh);
}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -game.seaRadius;
  scene.add(sea.mesh);
}

// function createSky(){
//   sky = new Sky();
//   sky.mesh.position.y = -game.seaRadius;
//   scene.add(sky.mesh);
// }

function createCoins(){

  coinsHolder = new CoinsHolder(20);
  scene.add(coinsHolder.mesh)
}

function createEnnemies(){
  for (var i=0; i<10; i++){
    var ennemy = new Ennemy();
    ennemiesPool.push(ennemy);
  }
  ennemiesHolder = new EnnemiesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(ennemiesHolder.mesh)
}

function createParticles(){
  for (var i=0; i<10; i++){
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(particlesHolder.mesh)
}

function loop(){

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

  if (game.status=="playing"){

    // Add energy coins every 100m;
    if (Math.floor(game.distance)%game.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn){
      game.coinLastSpawn = Math.floor(game.distance);
      //coinsHolder.spawnCoins();
    }

    if (Math.floor(game.distance)%game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate){
      game.speedLastUpdate = Math.floor(game.distance);
      game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
    }


    if (Math.floor(game.distance)%game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn){
      game.ennemyLastSpawn = Math.floor(game.distance);
      ennemiesHolder.spawnEnnemies();
    }

    if (Math.floor(game.distance)%game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate){
      game.levelLastUpdate = Math.floor(game.distance);
      game.level++;
      fieldLevel.innerHTML = Math.floor(game.level);

      game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel*game.level
    }


    updatePlane();
    updateDistance();
    updateEnergy();
    game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
    game.speed = game.baseSpeed * game.planeSpeed;

  }else if(game.status=="gameover"){
    game.speed *= .99;
    airplane.mesh.rotation.z += (-Math.PI/2 - airplane.mesh.rotation.z)*.0002*deltaTime;
    airplane.mesh.rotation.x += 0.0003*deltaTime;
    game.planeFallSpeed *= 1.05;
    airplane.mesh.position.y -= game.planeFallSpeed*deltaTime;

    if (airplane.mesh.position.y <-200){
      // showReplay();
      // game.status = "waitingReplay";

    }
  }else if (game.status=="waitingReplay"){

  }


  airplane.propeller.rotation.x +=.2 + game.planeSpeed * deltaTime*.005;
  //sea.mesh.rotation.z += game.speed*deltaTime;//*game.seaRotationSpeed;

  //if ( sea.mesh.rotation.z > 2*Math.PI)  sea.mesh.rotation.z -= 2*Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;

  //coinsHolder.rotateCoins();
  ennemiesHolder.rotateEnnemies();

  //sky.moveClouds();
  //sea.moveWaves();

  renderer2.render(scene, camera);
  requestAnimationFrame(loop);
}

function updateDistance(){
  game.distance += game.speed*deltaTime*game.ratioSpeedDistance;
  fieldDistance.innerHTML = Math.floor(game.distance);
  var d = 502*(1-(game.distance%game.distanceForLevelUpdate)/game.distanceForLevelUpdate);
  levelCircle.setAttribute("stroke-dashoffset", d);

}

var blinkEnergy=false;

function updateEnergy(){
  game.energy -= game.speed*deltaTime*game.ratioSpeedEnergy;
  game.energy = Math.max(0, game.energy);
  energyBar.style.right = (100-game.energy)+"%";
  energyBar.style.backgroundColor = (game.energy<50)? "#f25346" : "#68c3c0";

  if (game.energy<30){
    energyBar.style.animationName = "blinking";
    console.log(game.energy);
  }else{
    energyBar.style.animationName = "none";
    console.log(game.energy);
  }

  if (game.energy <1){
    game.status = "gameover";
  }
  else if (game.energy >= 95){
  	alert("Your energy value is 100% now! You may proceed to the next section!")
  	window.location.href = "../periodicTable/periodicTable.html";
  	console.log("enerygy max");
  }
}

function addEnergy(){
  // game.energy += game.coinValue;
  game.energy += 1.5 * game.ennemyValue;
  game.energy = Math.min(game.energy, 100);
}

// function removeEnergy(){
//   game.energy -= game.ennemyValue;
//   game.energy = Math.max(0, game.energy);
// }


function updatePlane(){

  game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
  var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
  var targetX = normalize(mousePos.x,-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);

  game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
  targetX += game.planeCollisionDisplacementX;


  game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
  targetY += game.planeCollisionDisplacementY;

  airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*deltaTime*game.planeMoveSensivity;
  airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*deltaTime*game.planeMoveSensivity;

  airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*deltaTime*game.planeRotXSensivity;
  airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*deltaTime*game.planeRotZSensivity;
  var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
  camera.fov = normalize(mousePos.x,-1,1,40, 80);
  camera.updateProjectionMatrix ()
  camera.position.y += (airplane.mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity;

  game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
  game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
  game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
  game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;

  airplane.pilot.updateHairs();
}

// function showReplay(){
//   replayMessage.style.display="block";
// }

// function hideReplay(){
//   replayMessage.style.display="none";
// }

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;

function initGame(event){

  // UI

  fieldDistance = document.getElementById("distValue");
  energyBar = document.getElementById("energyBar");
  replayMessage = document.getElementById("replayMessage");
  fieldLevel = document.getElementById("levelValue");
  levelCircle = document.getElementById("levelCircleStroke");

  resetGame();
  createScene();

  createLights();
  createPlane();
  //createSea();
  //createSky();
  createCoins();
  createEnnemies();
  createParticles();

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  loop();
}

// window.addEventListener('load', init, false);


$( document ).ready(function() {
	init();
	initGame();
});