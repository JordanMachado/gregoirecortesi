import THREE from 'three';
window.THREE = THREE;
import WAGNER from '@superguigui/wagner';

// Passes
const FXAAPass = require('@superguigui/wagner/src/passes/fxaa/FXAAPASS');
const VignettePass = require('@superguigui/wagner/src/passes/vignette/VignettePass');
const NoisePass = require('@superguigui/wagner/src/passes/noise/noise');

// Objects
import Floor from './objects/Floor';

export default class WebGL {
  constructor(params) {
    this.params = {
      name: params.name || 'WebGL',
      device: params.device || 'desktop',
      postProcessing: params.postProcessing || false,
      keyboard: params.keyboard || false,
      mouse: params.mouse || false,
      touch: params.touch || false,
    };
    this.phone = this.params.device === 'phone';

    this.mouse = new THREE.Vector2();
    this.originalMouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.damping = {
      camera: {
        x: 0.02,
        y: 0.02,
        z: 0.02,
      },
      mouse: {
        x: 0.03,
        y: 0.03,
        z: 0.03,
      },
    };

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, params.size.width / params.size.height, 1, 1000);
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(params.size.width, params.size.height);
    this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    this.renderer.setClearColor(0xf6f6f6);

    if (window.DEBUG) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    }

    this.composer = null;
    this.initPostprocessing();
    this.initLights();
    this.initObjects();

    if (window.DEBUG || window.DEVMODE) this.initGUI();

  }
  initPostprocessing() {
    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    window.composer = this.composer;

    // Add pass and automatic gui
    this.passes = [];
    this.fxaaPass = new FXAAPass();
    this.passes.push(this.fxaaPass);
    this.noisePass = new NoisePass();
    this.noisePass.params.amount = 0.04;
    this.noisePass.params.speed = 0.2;
    this.passes.push(this.noisePass);
    this.vignettePass = new VignettePass({});
    this.vignettePass.params.boost = 1.05;
    this.vignettePass.params.reduction = (this.phone) ? 0.2 : 0.5;

    this.passes.push(this.vignettePass);

  }
  initLights() {

  }
  initObjects() {

    this.planeRay = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
    );
    this.planeRay.material.visible = false;
    this.scene.add(this.planeRay);

    this.floor = new Floor({ renderer: this.renderer, phone: this.phone });
    this.scene.add(this.floor);
  }
  initGUI() {
    this.folder = window.gui.addFolder(this.params.name);
    this.folder.add(this.params, 'postProcessing');
    this.folder.add(this.params, 'keyboard');
    this.folder.add(this.params, 'mouse');
    this.folder.add(this.params, 'touch');


    // init postprocessing GUI
    this.postProcessingFolder = this.folder.addFolder('PostProcessing');
    for (let i = 0; i < this.passes.length; i++) {
      const pass = this.passes[i];
      pass.enabled = true;
      let containsNumber = false;
      for (const key of Object.keys(pass.params)) {
        if (typeof pass.params[key] === 'number') {
          containsNumber = true;
        }
      }
      const folder = this.postProcessingFolder.addFolder(pass.constructor.name);
      folder.add(pass, 'enabled');
      if (containsNumber) {
        for (const key of Object.keys(pass.params)) {
          if (typeof pass.params[key] === 'number') {
            folder.add(pass.params, key);
          }
        }
      }
      folder.open();
    }
    this.postProcessingFolder.open();

    // init scene.child GUI
    for (let i = 0; i < this.scene.children.length; i++) {
      const child = this.scene.children[i];
      if (typeof child.addGUI === 'function') {
        child.addGUI(this.folder);
      }
    }
    this.folder.open();
  }
  render() {
    if (this.params.postProcessing) {
      this.composer.reset();
      this.composer.render(this.scene, this.camera);

      // Passes
      for (let i = 0; i < this.passes.length; i++) {
        if (this.passes[i].enabled) {
          this.composer.pass(this.passes[i]);
        }
      }

      this.composer.toScreen();

    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.camera.rotation.x += (this.mouse.y * this.damping.mouse.x - this.camera.rotation.x)
     * this.damping.camera.x;
    this.camera.rotation.y += (-this.mouse.x * this.damping.mouse.y - this.camera.rotation.y)
     * this.damping.camera.y;
    //  this.camera.rotation.z += (this.mouse.x * this.damping.mouse.z - this.camera.rotation.z)
    //  * this.damping.camera.z;
    //  this.camera.lookAt( this.scene.position );
    if (window.DEBUG) this.controls.update();

    this.floor.update();
  }
  hover() {
    this.floor.animate();
  }
  rayCast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.planeRay, true);
    if (intersects.length > 0) {
      this.floor.updateMouse(intersects[0].point);
    }
  }
  // Events
  resize(width, height) {


    if (this.composer) {
      this.composer.setSize(width, height);
    }

    this.renderer.domElement.width = width * window.devicePixelRatio;
    this.renderer.domElement.height = height * window.devicePixelRatio;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
  keyPress() {
    if (!this.params.keyboard) return;
  }
  keyDown() {
    if (!this.params.keyboard) return;
  }
  keyUp() {
    if (!this.params.keyboard) return;
  }
  click(x, y, time) {
    if (!this.params.mouse) return;
    this.originalMouse.x = x;
    this.originalMouse.y = y;
    this.mouse.x = (x / window.innerWidth - 0.5) * 2;
    this.mouse.y = (y / window.innerHeight - 0.5) * 2;

  }
  mouseMove(x, y, ime) {
    if (!this.params.mouse) return;
    this.originalMouse.x = x;
    this.originalMouse.y = y;
    this.mouse.x = (x / window.innerWidth - 0.5) * 2;
    this.mouse.y = (y / window.innerHeight - 0.5) * 2;
    // this.rayCast();
  }
  touchStart() {
    if (!this.params.touch) return;
  }
  touchEnd() {
    if (!this.params.touch) return;
  }
  touchMove(touches) {
    if (!this.params.touch) return;
    this.originalMouse.x = touches[0].clientX;
    this.originalMouse.y = touches[0].clientY;
    this.mouse.x = (touches[0].clientX / window.innerWidth - 0.5) * 2;
    this.mouse.y = (touches[0].clientY / window.innerHeight - 0.5) * 2;
  }

}
