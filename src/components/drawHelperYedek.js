import * as THREE from 'three';

var MAX_POINTS = 500;
var count = 0;
var splineArray = [];

class DrawHelper {
    constructor(scene, camera, controls, raycaster) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.raycaster = raycaster;
        this.skyboxMesh = null;

        this.geo = null;
        this.material = null;
        this.mesh = null;
        this.created = false;
        this.positions = null;
        this.mouse = new THREE.Vector3();        
        this.point = new THREE.Vector3();     
    }

    start = () => {
        this.created = true;
        this.geo = new THREE.BufferGeometry();
        this.controls.enabled = false;
        this.positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
        this.geo.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 100 });//new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
        this.mesh = new THREE.Line(this.geo, this.material);
        this.scene.add(this.mesh);
        this.skyboxMesh = this.scene.getObjectByName("skybox");
        document.addEventListener('pointerdown', this.onMouseDown, false);
        document.addEventListener("mousemove", this.onMouseMove, false);
    }

    stop = () => {
        document.removeEventListener('pointerdown', this.onMouseDown);
        document.removeEventListener("mousemove", this.onMouseMove);
        this.controls.enabled = true;
    }

    remove = () => {
        this.created = false;
        this.scene.remove(mesh);
        this.geo.dispose();
        this.material.dispose();
        this.mesh.dispose();
        this.geo = null; this.material = null; this.mesh = null;
    }

    updateLine = () => {
        var positions = this.positions;      

        positions[count * 3 - 3] = this.mouse.x;
        positions[count * 3 - 2] = this.mouse.y;
        positions[count * 3 - 1] = this.mouse.z;
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }

    onMouseMove = (evt) => {
        this.mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
        this.mouse.z = 0;
        this.mouse.unproject(this.camera);
        if (count !== 0) {
            this.updateLine();
        }
    }

    addPoint = () => {
        var positions = this.positions;
        console.log("point nr " + count + ": " + this.mouse.x + " " + this.mouse.y + " " + this.mouse.z);

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects([this.skyboxMesh], true);
        if (intersects.length > 0) {
            this.point = intersects[0].point;
        } else {
            this.point = this.mouse;
        }

        positions[count * 3 + 0] = this.point.x;
        positions[count * 3 + 1] = this.point.y;
        positions[count * 3 + 2] = this.point.z;
        count++;
        this.mesh.geometry.setDrawRange(0, count);
        this.updateLine();
    }

    addFinishPoint = () => {
        this.stop();
        var positions = this.positions;
        this.mouse.x = positions[0];
        this.mouse.y = positions[1];
        this.mouse.z = positions[2];
        this.addPoint();
    }

    onMouseDown = (evt) => {
        if (evt.which == 3) {
            this.addFinishPoint();
            return;
        }
        // on first click add an extra point
        if (count === 0) {
            this.addPoint();
        }
        this.addPoint();
    }
};

export default DrawHelper;





