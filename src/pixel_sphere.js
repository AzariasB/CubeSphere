import $ from 'jquery';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import DAT from 'dat.gui';

import './less/style.less';

$(document).ready(function() {
	var Sphere = function(scene, radius) {
		this.scene = scene;
		this.radius = radius;
		this.dblRadius = this.radius << 1;
		this.sqRadius = this.radius * this.radius;
		this.yCubes = {};
		this.modelCubes = [];
		this.displayedX = radius << 1;
		this.cutDisplay = false;

		var self = this;
		var material = new THREE.MeshNormalMaterial();
		var basicMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var globalGeometry;
		var globalMesh;

		this.generate = function() {
			this.clear();
			globalGeometry = new THREE.Geometry();
			planSphere(0, 0, 0);
		};

		function planSphere(x, y, z) {
			var res = createSphere(x, y, z);
			if (res === true) {
				self.update();
				hideMessage();
				animate();
			} else {
				setTimeout(function() {
					planSphere(res.x, res.y, res.z);
				}, 0);
			}
		}

		function createSphere(x, y, z) {
			var totCubes = 0;
			for (; x < self.radius; x++) {
				for (; y < self.radius; y++) {
					for (; z < self.radius; z++) {
						var dst = distance(x, y, z);
						if (dst >= self.sqRadius - self.dblRadius && dst <= self.sqRadius) {
							createCube(x, y, z);
							createCube(-x, y, z);
							createCube(x, -y, z);
							createCube(x, y, -z);
							createCube(-x, -y, z);
							createCube(x, -y, -z);
							createCube(-x, y, -z);
							createCube(-x, -y, -z);
							totCubes += 8;
						}
						if (totCubes > 2000) {
							return {
								x : x,
								y : y,
								z : z++
							};
						}
						if (dst > self.sqRadius) {
							break;
						}
					}
					z = 0;
				}
				y = 0;
			}
			return true;
		}

		this.setRadius = function(val) {
			this.radius = val;
			this.dblRadius = val << 1;
			this.sqRadius = val * val;
		};

		this.clear = function() {
			this.clearModelCubes();
			this.yCubes = {};
		};

		this.clearModelCubes = function() {
			this.modelCubes.forEach(function(cube) {
				scene.remove(cube);
			});
			this.modelCubes = [];
		};

		this.displayX = function(yToDisplay) {
			this.clearModelCubes();
			yToDisplay -= this.radius;
			globalGeometry = new THREE.Geometry();
			for (var i in this.yCubes) {
				if (+i <= yToDisplay) {
					this.yCubes[i].forEach(function(val) {
						globalGeometry.merge(val.geometry, val.matrix);
					});
				}
				if (+i === yToDisplay) {
					this.yCubes[i].forEach(function(val) {
						var cube = new THREE.BoxHelper(val);
						cube.material.color.set(0x000000);
						self.modelCubes.push(cube);
						scene.add(cube);
					});
				}
			}
			this.update();
		};

		this.update = function() {
			if (globalMesh) {
				scene.remove(globalGeometry);
				scene.remove(globalMesh);
			}
			globalMesh = new THREE.Mesh(globalGeometry, material);
			scene.add(globalMesh);
		};

		function distance(x, y, z) {
			return x * x + y * y + z * z;
		}

		function createCube(x, y, z) {
			if (!self.yCubes[y]) {
				self.yCubes[y] = [];
			}
			var cube = new THREE.Mesh(geometry);
			cube.position.set(x, y, z);
			cube.matrixAutoUpdate = false;
			cube.updateMatrix();
			self.yCubes[y].push(cube);
			globalGeometry.merge(cube.geometry, cube.matrix);
		}

		this.generate();
	};

	var camera, scene, renderer, controls;
	var sphere;
	var gui, animationID;
	var info = document.getElementById('infos');

	init();

	function init() {
		scene = new THREE.Scene({ fog: true });
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0xffffff, 1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		camera.position.z = 100;

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.5;
		controls.enableZoom = true;

		sphere = new Sphere(scene, 10);

		gui = new DAT.GUI();
		var displayedController = gui.add(sphere, 'displayedX', 1, sphere.radius * 2).step(1);
		displayedController.onFinishChange(function(value) {
			sphere.displayX(value);
		});

		var radController = gui.add(sphere, 'radius', 4, 75).step(1);
		radController.onChange(function() {
			cancelAnimationFrame(animationID);
			displayMessage('Generating ...');
		});

		radController.onFinishChange(function(value) {
			if (value >= 50) {
				displayMessage('This may take a while...');
			}
			sphere.setRadius(value);
			sphere.generate();
			displayedController.max(value << 1);
		});

		gui.close();
	}

	function displayMessage(content) {
		info.innerText = content;
		info.className = '';
	}

	function hideMessage() {
		info.className = 'hidden';
	}

	function animate() {
		animationID = requestAnimationFrame(animate);

		controls.update();

		render();
	}

	function render() {
		renderer.render(scene, camera);
	}
});
