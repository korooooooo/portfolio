import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import * as TWEEN from 'three/addons/libs/tween.module.js';

let scene, camera, webGLRenderer, css3DRenderer;
let controls;
let screenMesh;

const portfolioHTML = `
    <html lang="ja">
    <head>
        <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background-color: rgba(245, 245, 245, 0.9); color: #333; border: 2px solid #ccc; border-radius: 10px; overflow-y: auto; height: 100%; box-sizing: border-box; }
            h1 { margin-top: 0; }
            a { color: #007bff; }
            button {
                display: inline-block;
                margin-top: 16px;
                padding: 10px 16px;
                font-size: 14px;
                font-weight: 600;
                color: #fff;
                background: linear-gradient(135deg, #4a90e2, #0066cc);
                border: none;
                border-radius: 6px;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
            }

            button:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
            }

            button:active {
                transform: translateY(0);
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
            }
        </style>
    </head>
    <body>
        <h1>My Portfolio</h1>
        <p>3DモデルのPC画面内に表示</p>
        <p>実際にスクロールやクリックが可能</p>
        <ul>
            <li><a href="#" onclick="alert('Project 1 clicked!')">プロジェクト 1</a></li>
            <li><a href="#" onclick="alert('Project 2 clicked!')">プロジェクト 2</a></li>
        </ul>
        <p>ここに作品や自己紹介を記述</p>
        <button id="open-portfolio" type="button">新しいタブで作品を見る</button>

        <script>
            document.getElementById('open-portfolio').addEventListener('click', () => {
                window.open('https://example.com', '_blank');
            });
        </script>
    </body>
    </html>
`;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const webglContainer = document.getElementById('webgl-container');
    webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webglContainer.appendChild(webGLRenderer.domElement);

    const cssContainer = document.getElementById('css-container');
    css3DRenderer = new CSS3DRenderer();
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    cssContainer.appendChild(css3DRenderer.domElement);

    controls = new OrbitControls(camera, webGLRenderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    createEnvironment();
    screenMesh = createComputerModel();
    createCSS3DWebsite(screenMesh);

    document.getElementById('zoom-button').addEventListener('click', zoomToScreen);
    document.getElementById('reset-button').addEventListener('click', resetView);

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function createEnvironment() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
}

function createComputerModel() {
    const group = new THREE.Group();
    scene.add(group);
    const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 0.2), monitorMaterial);
    monitorBody.position.y = 1;
    group.add(monitorBody);
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), monitorMaterial);
    monitorStand.position.y = 0.25;
    group.add(monitorStand);

    const screenGeometry = new THREE.PlaneGeometry(2.3, 1.3);
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 });
    const localScreenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    localScreenMesh.position.set(0, 1, 0.11);
    group.add(localScreenMesh);

    return localScreenMesh;
}

function createCSS3DWebsite(targetMesh) {
    const div = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(portfolioHTML);
    const scale = 0.005;
    iframe.style.width = `${targetMesh.geometry.parameters.width / scale}px`;
    iframe.style.height = `${targetMesh.geometry.parameters.height / scale}px`;
    iframe.style.border = 'none';
    div.appendChild(iframe);
    const cssObject = new CSS3DObject(div);
    cssObject.position.copy(targetMesh.position);
    cssObject.rotation.copy(targetMesh.rotation);
    cssObject.scale.set(scale, scale, scale);
    scene.add(cssObject);
}

function zoomToScreen() {
    const duration = 1200;

    const targetPosition = new THREE.Vector3(
        screenMesh.position.x,
        screenMesh.position.y,
        screenMesh.position.z + 1
    );

    const targetLookAt = new THREE.Vector3().copy(screenMesh.position);

    new TWEEN.Tween(camera.position)
        .to(targetPosition, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

    new TWEEN.Tween(controls.target)
        .to(targetLookAt, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
}

function resetView() {
    const duration = 1200;

    const targetPosition = new THREE.Vector3(0, 1.5, 4);
    const targetLookAt = new THREE.Vector3(0, 1, 0);

    new TWEEN.Tween(camera.position)
        .to(targetPosition, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

    new TWEEN.Tween(controls.target)
        .to(targetLookAt, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    TWEEN.update();
    controls.update();

    webGLRenderer.render(scene, camera);
    css3DRenderer.render(scene, camera);
}

init();
