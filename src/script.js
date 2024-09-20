import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
scene.add(directionalLight);
//fourth attivare castShadow alla luce interessato**************
directionalLight.castShadow = true;

/*******************
 * Ottimizzare shadow map (attenzione alla regola power of 2)
 */
// Ottimizzare il shadowmap, di default shadowmap è sul 512x512 possiamo aumentare
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

//Ottimizzare l'ampiatezza della camera
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;

//Ottimizzare il far e near del light per evitare il far troppo lontano e near troppo vicino,
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;

//Controllare il BLUR - poi il concetto di PCFSoftShadowMap nel renderer (che toglie il blur ma il shadow è meglio rispetto prima line 150 circa)
directionalLight.shadow.radius = 10;

//CameraHelper aiuta a vedere visivamente la zona della camera
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
scene.add(directionalLightCameraHelper);

//Active disactive cameraHelper con h btn
directionalLightCameraHelper.visible = false;
window.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "h") {
    directionalLightCameraHelper.visible =
      !directionalLightCameraHelper.visible;
  }
});



//
/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

/**
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
//second attivare il castshadow sul oggetto interessato***************
sphere.castShadow = true;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;
//third attivare il reciveShadow sul oggetto interessato***************
plane.receiveShadow = true;

scene.add(sphere, plane);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// first of all attivare shadowmap sul renderer***************
renderer.shadowMap.enabled = true;

//PSFSoftShadowMap dopo 
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
