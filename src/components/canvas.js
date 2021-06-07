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
    //controls.enablePan = false;

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

    const drawHelper = new DrawHelper(scene, camera);
    //drawHelper.start();
    const skybox = new Skybox({ ...components, scene });
    components = { ...components, controls, scene, raycaster, canvas, sizes, renderer, camera, drawHelper, skybox };


    /**
    * Events
    */
    document.addEventListener('resize', (evt) => canvasEvents.onResize(evt, components));
    document.addEventListener('pointerdown', onMouseDown, false);
    /**
     * Animate
     */
    canvasEvents.renderScene(components);
}


const onMouseDown = (e) => {
    if (e.which !== 3) return;
    e.preventDefault();
    let { scene, raycaster, sizes, camera } = components;
    let mouse = {};
    mouse.x = (e.clientX / sizes.width) * 2 - 1;
    mouse.y = -(e.clientY / sizes.height) * 2 + 1;


    var mesh = scene.getObjectByName("skybox");
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([mesh], true);
    console.log(intersects.length)
    if (intersects.length > 0) {
        const p = intersects[0].point;
        const uv = intersects[0].uv;
        mesh.updateMatrixWorld();
        const local_p = mesh.worldToLocal(p)
        console.log(local_p);
        console.log(uv);


        const vertices = [];

        for (let i = 0; i < 1; i++) {

            const x = THREE.MathUtils.randFloatSpread(0);
            const y = THREE.MathUtils.randFloatSpread(2);
            const z = THREE.MathUtils.randFloatSpread(2);

            vertices.push(x, y, z);

        }

        var pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        var pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 10 });
        var points = new THREE.Points(pointsGeometry, pointsMaterial);
        scene.add(points);
    }


}

export { initalize };