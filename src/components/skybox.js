import * as THREE from 'three';
import { zoomlevels } from '../components/panorama';

//const testUrls = [
//    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
//    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
//    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
//    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
//    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
//    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
//];

class Skybox {
    constructor(components) {
        this.components = components;
    }

    clear = () => {
        const { scene } = this.components;
        this.components.meshes.forEach(mesh => {
            scene.remove(mesh);
        });
        this.components.geometries.forEach(geometry => {
            geometry.dispose();
        });
        this.components.materials.forEach(material => {
            material.dispose();
        });
        this.components.textures.forEach(texture => {
            texture.dispose();
        });

        this.components.meshes = [];
        this.components.textures = [];
        this.components.materials = [];
        this.components.geometries = [];
    }

    getCanvasImage = (images) => {
        const { urls, direction } = images;
        var tilesnumber = Math.sqrt(urls.length);
        var canvas = document.createElement('canvas');
        canvas.width = 512 * tilesnumber;
        canvas.height = 512 * tilesnumber;
        let tileWidth = 512;

        var context = canvas.getContext('2d');
        var texture = new THREE.Texture(canvas);
        let promises = [];


        for (var i = 0; i < urls.length; i++) {
            promises.push(new Promise(resolve => {
                let img = new Image();
                img.crossOrigin = 'Anonymous';

                img.onload = function () {
                    context.drawImage(img, 0, 0, tileWidth, tileWidth, img.attributes.x * tileWidth, img.attributes.y * tileWidth, tileWidth, tileWidth);
                    texture.needsUpdate = true;
                    resolve({ texture, direction });
                };
                img.attributes.x = urls[i].x;
                img.attributes.y = urls[i].y;
                img.src = urls[i].url;
            }));
        }
        return promises.pop();
    }

    lazyLoad = (params) => {
        const { scene, meshes, textures, materials, geometries } = this.components;
        const { panorama, zoomlevel } = params;
        return new Promise((resolve, reject) => {
            const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
            geometries.push(skyboxGeo);
            const images = panorama.getImages(zoomlevel);
            const promises = images.map(image => this.getCanvasImage(image));

            Promise.all(promises).then((values) => {
                let materialArray = values.map(({ texture }) => {
                    textures.push(texture);
                    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });;
                    materials.push(material);
                    return material;
                });

                const skybox = new THREE.Mesh(skyboxGeo, materialArray);
                skybox.name = "skybox";
                meshes.push(skybox);
                scene.add(skybox);
                resolve(skybox);
            });
        })
    }

    loadSkyBox = (params) => {
        return new Promise((resolve, reject) => {
            params.zoomlevel = zoomlevels[0];
            this.lazyLoad(params).then(result => {
                params.zoomlevel = zoomlevels[2];
                this.lazyLoad(params).then(() => {
                    resolve(true);
                });
            });
        });
    }


}

export default Skybox;


