import * as THREE from "three";
import { Water } from "./objects/Water";
import { Sky } from "./objects/Sky";
import { OrbitControls } from "./objects/OrbitControls";

export function useWater(
  container: HTMLDivElement,
  renderCallback: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void
) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );

  camera.position.set(-95, 13, 181);

  let renderer: THREE.WebGLRenderer;
  let controls, water: any, sun: any, mesh;
  if (!container) {
    return { scene, camera };
  }
  init();
  animate();

  function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    sun = new THREE.Vector3();

    // Water PlaneBufferGeometry
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "/textures/waternormals.jpg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });

    water.rotation.x = -Math.PI / 2;

    scene.add(water);

    // Skybox

    const sky: any = new Sky();
    sky.scale.setScalar(20000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const parameters = {
      inclination: 0.51,
      azimuth: 0.205,
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {
      const theta = Math.PI * (parameters.inclination - 0.5);
      const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

      sun.x = Math.cos(phi);
      sun.y = Math.sin(phi) * Math.sin(theta);
      sun.z = Math.sin(phi) * Math.cos(theta);

      sky.material.uniforms["sunPosition"].value.copy(sun);
      water.material.uniforms["sunDirection"].value.copy(sun).normalize();

      scene.environment = pmremGenerator.fromScene(sky).texture;
    }

    updateSun();

    const geometry = new THREE.BoxGeometry(30, 30, 30);
    const material = new THREE.MeshStandardMaterial({ roughness: 0 });
    mesh = new THREE.Mesh(geometry, material);

    controls = new OrbitControls(camera, renderer.domElement, 1.2);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    // controls.minDistance = 10.0;
    controls.maxDistance = 500.0;

    controls.update();

    //   const gui = new GUI()

    //   const folderSky = gui.addFolder('Sky')
    //   folderSky.add(parameters, 'inclination', 0, 0.5, 0.0001).onChange(updateSun)
    //   folderSky.add(parameters, 'azimuth', 0, 1, 0.0001).onChange(updateSun)
    //   folderSky.open()
    //   const waterUniforms = water.material.uniforms
    //   const folderWater = gui.addFolder('Water')
    //   folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale')
    //   folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size')
    //   folderWater.add(waterUniforms.alpha, 'value', 0.9, 1, 0.001).name('alpha')
    //   folderWater.open()

    window.addEventListener("resize", onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
    //   stats.update()
  }

  function render() {
    const time = performance.now() * 0.001;
    renderCallback(scene, camera);
    //   mesh.position.y = Math.sin(time) * 20 + 5
    //   mesh.rotation.x = time * 0.5
    //   mesh.rotation.z = time * 0.51
    // camera.rotation.x -= 0.01
    // camera.rotation.y += 0.01
    // camera.rotation.z += 0.002

    // var lookAtVector = new THREE.Vector3(0, 0, -1)
    // lookAtVector.applyQuaternion(camera.quaternion)
    // console.log(lookAtVector, 'camera')

    water.material.uniforms["time"].value += 1.0 / 60.0;

    renderer.render(scene, camera);
  }

  return { scene, camera };
}
