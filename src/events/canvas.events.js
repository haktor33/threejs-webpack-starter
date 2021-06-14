import { createArrow } from "../objects/arrows";

const setZoom = (evt, camera, controls) => {
    let zoomin;
    if (evt.deltaY) {
        zoomin = event.deltaY < 0;
    } else {
        zoomin = !evt.target.classList.contains("zoomout")
    }

    if (zoomin) {
        if (camera.fov < 20)
            return;

        camera.fov -= 10;
        controls.object.updateProjectionMatrix();
    } else {
        if (camera.fov > 80)
            return;
        camera.fov += 10;
        controls.object.updateProjectionMatrix();
    }
}

const setConnectedPanoramas = (params) => {
    let { connections } = params.panorama.panoramaobject;
    //connections = connections.filter((f, i) => i < 3);
    connections.forEach(connection => {
        const panoramaid = connection["pano-id"];
        const direction = connection["relative-location"];
        createArrow({ ...params, panoramaid, direction }).then(arrow => { });
    })
}

const clearScene = (components) => {
    const { scene, skybox } = components;
    components.meshes.forEach(mesh => {
        scene.remove(mesh);
    });
    components.geometries.forEach(geometry => {
        geometry.dispose();
    });
    components.materials.forEach(material => {
        material.dispose();
    });
    components.textures.forEach(texture => {
        texture.dispose();
    });

    components.meshes = [];
    components.textures = [];
    components.materials = [];
    components.geometries = [];
    skybox.clear();
}

const onResize = (evt, components) => {
    let { sizes, camera, renderer } = components;
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

const renderScene = (components) => {
    let { scene, controls, camera, renderer } = components;
    // Update Orbital Controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(() => renderScene(components));
}

const onDrawClick = (evt, btn, drawHelper) => {
    if (btn.innerHTML === "Çizimi Başlat") {
        btn.innerHTML = "Çizimi Durdur";
        drawHelper.start();
    } else {
        btn.innerHTML = "Çizimi Başlat";
        drawHelper.stop();
    }
}


export const canvasEvents = { setZoom, setConnectedPanoramas, clearScene, onResize, renderScene, onDrawClick };