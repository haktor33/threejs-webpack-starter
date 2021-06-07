import * as THREE from 'three';
import { imgarrow } from '../images/image.datas';


export const createArrow = async (params) => {
    const { panoramaid, direction, panorama, scene, connectiOnClick, meshes, textures, materials, geometries } = params
    let url = imgarrow;
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(url);
    textures.push(texture);

    const geometry = new THREE.CircleGeometry(3, 65);
    geometries.push(geometry);
    geometry.name = panoramaid;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    materials.push(material);
    const arrow = new THREE.Mesh(geometry, material);
    meshes.push(arrow);

    let directionyaw = direction.yaw;
    let panoyaw = panorama.panoramaobject["pano-orientation"].yaw;
    const yaw = (panoyaw - directionyaw) + 90;
    arrow.yaw = yaw
    arrow.position.set(Math.cos(THREE.MathUtils.degToRad(yaw)) * 13, -10, Math.sin(THREE.MathUtils.degToRad(yaw)) * 13);

    arrow.rotateX(THREE.MathUtils.degToRad(90));
    arrow.rotateZ(THREE.MathUtils.degToRad(yaw - 90))



    arrow.on('click', (ev) => {
        connectiOnClick(ev.target.geometry.name);
        //eventhandler.dispatchEvent("connectionclick", { bubbles: true, cancelable: true, panoramaid: ev.target.geometry.name });
    });

    arrow.on('mouseout', (ev) => { arrow.material.transparent = true; });
    arrow.on('mouseover', (ev) => { arrow.material.transparent = false; });
    scene.add(arrow);

    return Promise.resolve(arrow);
};


