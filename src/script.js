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
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
// IMPORTARE Baked shadow
const bakedShadow = textureLoader.load("/textures/bakedShadow.jpg");
const simpleShadow = textureLoader.load("/textures/simpleShadow.jpg");
bakedShadow.colorSpace = THREE.SRGBColorSpace;

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
  if (e.key == "d") {
    directionalLightCameraHelper.visible =
      !directionalLightCameraHelper.visible;
  }
});

//SPOTLIGHT
const spotLight = new THREE.SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3);

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.fov = 30; //field of view of camera
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 5;

spotLight.position.set(0, 2, 2);
scene.add(spotLight);
scene.add(spotLight.target);

//CameraHelper aiuta a vedere visivamente la zona della camera
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(spotLightCameraHelper);

//Active disactive cameraHelper con s btn
spotLightCameraHelper.visible = false;
window.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "s") {
    spotLightCameraHelper.visible = !spotLightCameraHelper.visible;
  }
});

// POINT LIGHT
const pointLight = new THREE.PointLight(0xffffff, 2.7);

pointLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.1;
spotLight.shadow.camera.far = 5;

scene.add(pointLight);
pointLight.position.set(-1, 1, 0);

//CameraHelper aiuta a vedere visivamente la zona della camera
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
scene.add(pointLightCameraHelper);

//Active disactive cameraHelper con s btn
pointLightCameraHelper.visible = false;
window.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "p") {
    pointLightCameraHelper.visible = !pointLightCameraHelper.visible;
  }
});
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
 * Baked shadow dinamico
 */
//creare un mesh con un planeGeometry misura giusta e meshbasicmaterial
const sphereShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x00000,
    transparent: true,
    alphaMap: simpleShadow,
  })
);

//posizionare in modo giusto appenna sopra del plane
sphereShadow.rotateX(-(Math.PI * 0.5));
sphereShadow.position.y = plane.position.y + 0.01;

scene.add(sphereShadow);
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

  //update sphere
  sphere.position.x = Math.cos(elapsedTime) * 1.5;
  sphere.position.z = Math.sin(elapsedTime) * 1.5;
  sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

  //update sphere shadow
  sphereShadow.position.x = sphere.position.x;
  sphereShadow.position.z = sphere.position.z;
  sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
