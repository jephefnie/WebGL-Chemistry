$(document).ready(function() {


    var materialH, materialC, bondMaterial;
    var geomH, geomC;
    var camera, controls, scene, renderer, stats, container;
    var atoms = [];
    var bonds = [];
    var bondLengths = [[-1, 109], [109, 154]];
    var mouse = new THREE.Vector2(0, 0);
    var molName = document.createElement('div');
    molName.style.position = 'absolute';
    molName.style.width = 100;
    molName.style.height = 100;
    molName.style.top = (window.innerHeight - 100) + 'px';
    molName.style.left = 10 + 'px';
    molName.style.color = 'white';
    molName.style.fontFamily = 'courier';
    document.body.appendChild(molName);

    var settings = {
        repulsion: 100000,
        restitution: 0.9,
        bondedAttraction: 0.001,
        boundsRepulsion: 1000,
        boundsSize: 100000,
        clear: function() {
            for (var i = 0; i < atoms.length; i++) {
                scene.remove(atoms[i].sphere);
            }
            atoms = [];
            for (i = 0; i < bonds.length; i++) {
                scene.remove(bonds[i].cyl);
            }
            bonds = [];

            atoms.push(new Atom(new THREE.Vector3(0, 0, 0), 1, []));

            nameAll(atoms);
        }
    };

    init();
    animate();
    nameAll(atoms);

    var gui = new dat.GUI();
    gui.add(settings, 'repulsion', 0.0, 1000000);
    gui.add(settings, 'restitution', 0.0, 1.0);
    gui.add(settings, 'bondedAttraction', 0.0, 0.01);
    gui.add(settings, 'boundsRepulsion', 0, 1000000000000);
    gui.add(settings, 'clear');

    atoms.push(new Atom(new THREE.Vector3(0, 0, 0), 1, []));

    document.addEventListener('click', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    var raycaster = new THREE.Raycaster();

    function onDocumentMouseDown(event) {
        console.log("click");

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
                    event.preventDefault();

            for (var i = 0; i < atoms.length; i++) {
                if (atoms[i].sphere == intersects[0].object) {
                    if (event.ctrlKey) {
                        scene.remove(atoms[i].sphere);
                        for (var j = 0; j < bonds.length; j++) {
                            if (bonds[j].a1 == atoms[i] || bonds[j].a2 == atoms[i]) {
                                scene.remove(bonds[j].cyl);
                                bonds[j].cyl.geometry.dispose();
                                bonds.splice(j, 1);
                                j--;
                            }
                        }
                        for (j = 0; j < atoms.length; j++) {
                            var ind = atoms[j].bonds.indexOf(atoms[i]);
                            if (ind >= 0) {
                                atoms[j].bonds.splice(ind, 1);
                            }
                        }
                        atoms.splice(i, 1);
                        nameAll(atoms);
                    } else if (atoms[i].type == 1 && atoms[i].bonds.length < 4) {
                        var newPos = new THREE.Vector3();
                        newPos.copy(intersects[0].point);
                        if (event.button == 0 && !event.shiftKey) {
                            atoms.push(new Atom(newPos, 0, [atoms[i]]));
                        } else {
                            atoms.push(new Atom(newPos, 1, [atoms[i]]));
                        }
                        nameAll(atoms);
                    }
                    break;
                }
            }
        }
    }

    window.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    function onMouseMove(event) {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    function init() {
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1e5);
        camera.position.z = 1000;

        scene = new THREE.Scene();

        scene.add(camera);

        // light
		// Lighting
		//scene.add( new THREE.HemisphereLight( 0x254386, 0x2EDDDD ) );
		var spotLight = new THREE.SpotLight( 0xff0000 );
		spotLight.position.set( 100,800,10 );
		//spotLight.angle = Math.PI / 8;
		// spotLight.decay = 1;
		spotLight.distance = 3000;
		// spotLight.penumbra = 2.0;
		spotLight.shadow.camera.near=0.1;
		spotLight.shadow.camera.far=25;
		spotLight.castShadow = true;
		spotLight.receiveShadow = true;
		scene.add( spotLight );
		

		var ambientlight = new THREE.AmbientLight( 0x404040 );
		scene.add( ambientlight );
        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(0, 0, 500).normalize();

		
		camera.add(dirLight);
        camera.add(dirLight.target);

        materialH = new THREE.MeshLambertMaterial({ color:0xffffff, side: THREE.DoubleSide });
        materialC = new THREE.MeshLambertMaterial({ color:0x303030, side: THREE.DoubleSide });
        bondMaterial = new THREE.MeshLambertMaterial({ color:0x202020, side: THREE.DoubleSide });

        geomH = new THREE.SphereGeometry(53, 30, 30);
		
        geomC = new THREE.SphereGeometry(70, 30, 30);
		
        // bounding box
		
        /*var help = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(settings.boundsSize, settings.boundsSize, settings.boundsSize), new THREE.MeshBasicMaterial()));
        help.material.color.set(0xFFFFFF);
        scene.add(help);*/

        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.BasicShadow;

        container = document.createElement('div');
        document.body.appendChild(container);
        container.appendChild(renderer.domElement);


        controls = new THREE.TrackballControls(camera, renderer.domElement);

        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 1;
        controls.panSpeed = 2;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
		
		
		// Floor
		const geometry = new THREE.PlaneGeometry( 2000, 2000, 1, 1 );
		const texture = new THREE.TextureLoader().load( 'floor.jfif');
		var material = new THREE.MeshPhongMaterial( { 
		  map: texture
		  
		   
		} );
		var floor = new THREE.Mesh( geometry, material );
		floor.material.side = THREE.DoubleSide;
		floor.rotation.x = 90;
		floor.position.y = -500;
		floor.castShadow = true;
		floor.receiveShadow = true;
		scene.add( floor );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);

        window.addEventListener('resize', onWindowResize, false);
    }

    function nameAll(atoms) {
        var names = 'Molecules: ';

        // Break into individual molecules
        for (var i = 0; i < atoms.length; i++) {
            atoms[i].visited = false;
        }
        var molecules = [];
        for (i = 0; i < atoms.length; i++) {
            var molecule = dfs(atoms[i]);
            if (molecule.length > 0) {
                molecules.push(molecule);
            }
        }
        for (i = 0; i < molecules.length; i++) {
            if (i != 0) {
                names += ', ';
            }
            names += name(molecules[i]);
        }

        molName.innerHTML = names;
    }

    function dfs(atom) {
        if (atom.visited) {
            return [];
        }
        atom.visited = true;
        var mol = [];
        for (var b = 0; b < atom.bonds.length; b++) {
            mol = mol.concat(dfs(atom.bonds[b]));
        }
        mol.push(atom);
        return mol;
    }

    // Useful prefixes
    var mainPre = ['', 'meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];
    var subPre = ['', '', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];

    function name(atoms) {
        if (atoms.length == 1) {
            if (atoms[0].type == 0) {
                return 'hydrogen';
            } else if (atoms[1].type == 1) {
                return 'carbon';
            }
        }

        // Check for correct bonding
        for (var i = 0; i < atoms.length; i++) {
            if ((atoms[i].type == 1 && atoms[i].bonds.length != 4) || (atoms[i].type == 0 && atoms[i].bonds.length != 1)) {
                return 'Invalidinium';
            }
            atoms[i].visited = false;
        }

        // Find longest chain
        var maxChain = [];

        for (i = 0; i < atoms.length; i++) {
            if (atoms[i].type == 1) {
                var chain = dfsChain(atoms[i]);
                for (j = 0; j < atoms.length; j++) {
                    atoms[j].visited = false;
                }
                if (chain.length > maxChain.length) {
                    maxChain = chain;
                }
            }
        }

        var name;
        if (maxChain.length > 10) {
            name = maxChain.length + 'ane';
        } else {
            name = mainPre[maxChain.length] + 'ane';
        }

        var substituents = [];
        var numSubs = 0;
        // Check for substituents
        for (i = 0; i < maxChain.length; i++) {
            var subBonds = [];
            for (var b = 0; b < maxChain[i].bonds.length; b++) {
                if (maxChain[i].bonds[b].type == 1) {
                    if (!((i > 0 && maxChain[i].bonds[b] == maxChain[i - 1]) || (i < maxChain.length - 1 && maxChain[i].bonds[b] == maxChain[i + 1]))) {
                        subBonds.push(maxChain[i].bonds[b]);
                    }
                }
            }

            // Substituent on this carbon
            if (subBonds.length > 0) {
                var subs = [];
                for (var j = 0; j < subBonds.length; j++) {
                    subs.push(dfsSub(subBonds[j], maxChain[i]));
                    numSubs++;
                }
                substituents.push(subs);
            } else {
                substituents.push([]);
            }
        }

        if (numSubs == 0) {
            return name;
        }

        // Determine chain numbering
        var nameForwards = true;

        // Number going forwards
        var forwardNums = [];
        var found = 0;
        i = 0;
        while (found < numSubs) {
            if (substituents[i] != []) {
                for (j = 0; j < substituents[i].length; j++) {
                    forwardNums.push(i + 1);
                    found++;
                }
            }
            i++;
        }

        // Number going backwards
        var backwardNums = [];
        found = 0;
        i = 0;
        while (found < numSubs) {
            if (substituents[substituents.length - i - 1] != []) {
                for (j = 0; j < substituents[substituents.length - i - 1].length; j++) {
                    backwardNums.push(i + 1);
                    found++;
                }
            }
            i++;
        }

        // Which direction has better numbering?
        for (i = 0; i < forwardNums.length; i++) {
            if (backwardNums[i] < forwardNums[i]) {
                nameForwards = false;
                break;
            }
        }

        // No way I'm going to bother actually checking alphabetic order if numbers don't work
        // Also, I'll just assume all substituents are simple chains
        var subNums = [];
        for (i = 0; i < 11; i++) {
            subNums.push([]);
        }
        for (i = 0; i < substituents.length; i++) {
            for (j = 0; j < substituents[i].length; j++) {
                var num = i + 1;
                if (!nameForwards) {
                    num = substituents.length - i;
                }
                subNums[substituents[i][j].length].push(num);
            }
        }

        var subNames = [];
        for (i = 0; i < subNums.length; i++) {
            if (subNums[i].length > 0) {
                var na = '';
                subNums[i].sort();
                for (j = 0; j < subNums[i].length; j++) {
                    na += subNums[i][j];
                    if (j != subNums[i].length - 1) {
                        na += ','
                    }
                }
                na += '-';
                if (subNums[i].length <= 10) {
                    na += subPre[subNums[i].length];
                } else {
                    na += subNames[i].length;
                }
                var pref = '';
                if (i <= 10) {
                    pref = mainPre[i];
                } else {
                    pref = '' + i;
                }
                na += pref;
                na += 'yl';
                subNames.push([na, pref]);
            }
        }

        subNames.sort(function(a, b) {
            return a[1].localeCompare(b[1]);
        });

        var pre = '';
        for (i = 0; i < subNames.length; i++) {
            pre += subNames[i][0];
            if (i != subNames.length - 1) {
                pre += '-'
            }
        }

        return pre + name;
    }

    function dfsSub(start, last) {
        var sub = [];
        for (var b = 0; b < start.bonds.length; b++) {
            if (start.bonds[b].type == 1 && start.bonds[b] != last) {
                sub = sub.concat(dfsSub(start.bonds[b], start));
            }
        }
        sub.push(start);
        return sub;
    }

    function dfsChain(pos) {
        if (pos.visited) {
            return [];
        }
        pos.visited = true;
        var maxChain = [];

        for (var b = 0; b < pos.bonds.length; b++) {
            if (pos.bonds[b].type == 1) {
                var q = dfsChain(pos.bonds[b]);
                if (q.length > maxChain.length) {
                    maxChain = q;
                }
            }
        }
        maxChain.push(pos);
        return maxChain;
    }

    function Atom(pos, type, bondedTo) {
        var geom;
        var material;
        if (type == 0) {
            material = materialH;
            geom = geomH;
        } else if (type == 1) {
            material = materialC;
            geom = geomC
        }
        this.type = type;
        this.sphere = new THREE.Mesh(geom, material);
        this.sphere.position.copy(pos);
        scene.add(this.sphere);
        this.bonds = bondedTo;
        for (var i = 0; i < bondedTo.length; i++) {
            bondedTo[i].bonds.push(this);
            bonds.push(new Bond(this, bondedTo[i]));
        }
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.update = function() {
            //if (this.acceleration.length() > 100) {
            //    this.acceleration.setLength(100);
            //}
            this.velocity.add(this.acceleration);
            this.velocity.multiplyScalar(settings.restitution);
            this.sphere.position.add(this.velocity);
        };
    }

    function Bond(a1, a2) {
        this.a1 = a1;
        this.a2 = a2;

        this.cyl = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 20, 32), bondMaterial);

        this.update = function() {
            var diff = new THREE.Vector3();
            diff.subVectors(a1.sphere.position, a2.sphere.position);
            var cylGeo = new THREE.CylinderGeometry(20, 20, diff.length(), 32);
            scene.remove(this.cyl);
            //this.cyl.dispose();
            this.cyl.geometry.dispose();
            this.cyl = new THREE.Mesh(cylGeo, bondMaterial);
            scene.add(this.cyl);
            diff.divideScalar(2);
            this.cyl.position.addVectors(a2.sphere.position, diff);
            var cur = new THREE.Vector3(0, 1, 0);
            diff.normalize();
            var quat = new THREE.Quaternion();
            quat.setFromUnitVectors(cur, diff);
            this.cyl.quaternion.copy(quat);
        };

        this.update();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();
    }

    function animate() {
        requestAnimationFrame( animate );

        // atom-bb interactions
        for (var i = 0; i < atoms.length; i++) {
            var negX = atoms[i].sphere.position.x + settings.boundsSize / 2;
            var posX = atoms[i].sphere.position.x - settings.boundsSize / 2;
            var negY = atoms[i].sphere.position.y + settings.boundsSize / 2;
            var posY = atoms[i].sphere.position.y - settings.boundsSize / 2;
            var negZ = atoms[i].sphere.position.z + settings.boundsSize / 2;
            var posZ = atoms[i].sphere.position.z - settings.boundsSize / 2;
			

            if (negX < 0) {
                atoms[i].sphere.position.x = 1 - settings.boundsSize / 2;
            }
            if (posX > 0) {
                atoms[i].sphere.position.x = settings.boundsSize / 2 - 1;
            }
            if (negY < 0) {
                atoms[i].sphere.position.y = 1 - settings.boundsSize / 2;
            }
            if (posY > 0) {
                atoms[i].sphere.position.y = settings.boundsSize / 2 - 1;
            }
            if (negZ < 0) {
                atoms[i].sphere.position.z = 1 - settings.boundsSize / 2;
            }
            if (posZ > 0) {
                atoms[i].sphere.position.z = settings.boundsSize / 2 - 1;
            }

            var dV = new THREE.Vector3(1 / (negX * negX) - 1 / (posX * posX),
                                       1 / (negY * negY) - 1 / (posY * posY),
                                       1 / (negZ * negZ) - 1 / (posZ * posZ));
            dV.multiplyScalar(settings.boundsRepulsion);
            atoms[i].acceleration.add(dV);
        }

        // atom-atom interactions
        for (i = 0; i < atoms.length - 1; i++) {
            for (var j = i + 1; j < atoms.length; j++) {
                if (atoms[i].bonds.indexOf(atoms[j]) >= 0) {
                    var diff = new THREE.Vector3();
                    diff.subVectors(atoms[j].sphere.position, atoms[i].sphere.position);
                    var l = diff.length();
                    var optimal = new THREE.Vector3();
                    optimal.copy(diff);
                    var bl = bondLengths[atoms[i].type][atoms[j].type];
                    optimal.setLength(bl);
                    diff.sub(optimal);
                    diff.normalize();
                    diff.multiplyScalar((l - bl) * (l - bl));
                    diff.multiplyScalar(settings.bondedAttraction);
                    atoms[i].acceleration.add(diff);
                    atoms[j].acceleration.sub(diff);
                } else {
                    diff = new THREE.Vector3();
                    diff.subVectors(atoms[j].sphere.position, atoms[i].sphere.position);
                    l = diff.length();
                    diff.normalize();
                    diff.divideScalar(l * l);
                    diff.multiplyScalar(settings.repulsion);
                    atoms[j].acceleration.add(diff);
                    atoms[i].acceleration.sub(diff);
                }
            }
        }

        // update based on acceleration
        for (i = 0; i < atoms.length; i++) {
            atoms[i].update();
            atoms[i].acceleration = new THREE.Vector3(0, 0, 0);
        }

        // update bonds
        for (i = 0; i < bonds.length; i++) {
            bonds[i].update();
        }

        controls.update();
        renderer.render( scene, camera );

        stats.update();
    }
});