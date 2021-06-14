import * as THREE from 'three';
import { Interaction } from 'three.interaction';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import DrawHelper from './drawHelper';
import Skybox from './skybox';
import { getPanoramabyCoordinates, getPanoramabyID } from '../services/service';
import { canvasEvents } from '../events/canvas.events';

const { location } = window['runConfig'];
const sizes = { width: window.innerWidth, height: window.innerHeight }
let components = { arrowEnable: true, meshes: [], textures: [], materials: [], geometries: [] };


const initalize = () => {
    //get first Panorama
    getPanoramabyCoordinates(location).then(panorama => {
        createThreeScene();
        changePanorama(panorama);
    });
};

const connectiOnClick = (id) => {
    if (components.arrowEnable) {
        components.arrowEnable = false;
        getPanoramabyID(id).then(panorama => {
            changePanorama(panorama);
        });
    }
};

const changePanorama = (panorama) => {
    canvasEvents.clearScene(components);
    canvasEvents.setConnectedPanoramas({ panorama, connectiOnClick, ...components });
    components.skybox.loadSkyBox({ panorama }).then(result => components.arrowEnable = result);
}

const createThreeScene = () => {

    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    let scene = new THREE.Scene();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0xffffff, 2);
    scene.add(pointLight);

    /**
     * Camera
     */
    let camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 20000)
    camera.position.set(0, 0, 0);
    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.domElement.addEventListener('wheel', (evt) => canvasEvents.setZoom(evt, camera, controls), false);
    controls.enableDamping = true
    controls.enableZoom = true;
    controls.enablePan = false;

    controls.maxDistance = 50;
    controls.minDistance = 50;
    controls.minPolarAngle = Math.PI / 3;
    controls.rotateSpeed = -1;

    /**
     * Raycaster
     */
    const raycaster = new THREE.Raycaster();

    /**
     * Renderer
     */
    let renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const interaction = new Interaction(renderer, scene, camera);

    const skybox = new Skybox({ ...components, scene });
    const drawHelper = new DrawHelper(scene, camera, controls, raycaster);
    components = { ...components, controls, scene, raycaster, canvas, sizes, renderer, camera, drawHelper, skybox };

    //buttons
    //var drawButton = document.getElementById("draw");

    /**
    * Events
    */
    window.addEventListener('resize', (evt) => canvasEvents.onResize(evt, components));
    //drawButton.addEventListener("click", (evt) => canvasEvents.onDrawClick(evt, drawButton, drawHelper), false);
    document.addEventListener('pointerdown', onMouseDown, false);
    /**
     * Animate
     */
    canvasEvents.renderScene(components);
}


const vertices = [];
const onMouseDown = (e) => {
    if (e.which === 3) return;
    e.preventDefault();
    let { scene, raycaster, sizes, camera } = components;
    let mouse = {};
    mouse.x = (e.clientX / sizes.width) * 2 - 1;
    mouse.y = -(e.clientY / sizes.height) * 2 + 1;


    var skyboxMesh = scene.getObjectByName("skybox");
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([skyboxMesh], true);
    if (intersects.length > 0) {
        const p = intersects[0].point;
        //const uv = intersects[0].uv;
        //mesh.updateMatrixWorld();
        //const local_p = mesh.worldToLocal(p)
        //console.log(local_p);
        //console.log(uv);
        //console.log("index:" + i);

        vertices.push(p.x - 10, p.y - 10, p.z);
        vertices.push(p.x + 10, p.y - 10, p.z);
        vertices.push(p.x + 10, p.y + 10, p.z);
        vertices.push(p.x - 10, p.y + 10, p.z);
        //vertices.push(-10.0, -10.0, 0.0);
        //vertices.push(10.0, -10.0, 0.0);
        //vertices.push(10.0, 10.0, 0.0);

        //var geometry = new THREE.BufferGeometry();
        //geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        //var material = new THREE.MeshLambertMaterial({ color: 0xF3FFE2 });
        //var mesh = new THREE.Mesh(geometry, material);
        //scene.add(mesh);

    }


}

export { initalize };