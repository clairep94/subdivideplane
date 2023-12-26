import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const loader = new FontLoader(); 
// loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) { const geometry = new TextGeometry( 'Hello three.js!', { font: font, size: 80, height: 5, curveSegments: 12, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelOffset: 0, bevelSegments: 5 } ); } );


// Load the font
loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
  // Now you can use the loaded font to create text geometry
  const geometry = new TextGeometry('Hello three.js!', {
    font: font,
    size: 80,
    height: 5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 10,
    bevelSize: 8,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  // Create a mesh with the text geometry
  const textMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0xFFEA00
  }));

  // Set the position of the text mesh
  textMesh.position.set(0, 0, 0);

  // Add the text mesh to the scene
  scene.add(textMesh);
});








// Create a WebGLRenderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a Three.js Scene and Perspective Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Add OrbitControls for camera manipulation
const orbit = new OrbitControls(camera, renderer.domElement);

// Initial camera position and update controls
camera.position.set(10, 15, -22);
orbit.update();

// Plane, Grid, and Highlight Mesh
// Create a plane mesh, grid helper, and transparent highlight mesh
const planeMesh = new THREE.Mesh(
    // new THREE.PlaneGeometry(20, 20), 
    new THREE.PlaneGeometry(3,3),
    // new THREE.PlaneGeometry(4,4),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false
    })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);

// const grid = new THREE.GridHelper(20, 20);
// const grid = new THREE.GridHelper(4,4);
const grid = new THREE.GridHelper(3,3);

scene.add(grid);

const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true
    })
);
highlightMesh.rotateX(-Math.PI / 2);
// highlightMesh.position.set(0.5, 0, 0.5);
highlightMesh.position.set(0, 0, 0);
scene.add(highlightMesh);


// Mouse Interaction
// Listen for mouse movement and update highlightMesh position
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObject(planeMesh);
    if(intersects.length > 0) {
        const intersect = intersects[0];
        // const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor();
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        // Check if an object exists at the highlighted position
        const objectExist = objects.find(function(object) {
            return (object.position.x === highlightMesh.position.x)
            && (object.position.z === highlightMesh.position.z)
        });

        // Change highlightMesh color based on object existence
        if(!objectExist)
            highlightMesh.material.color.setHex(0xFFFFFF);
        else
            highlightMesh.material.color.setHex(0xFF0000);
    }
});

// Sphere Mesh and Object Creation
// Create a sphere mesh and an array to store objects
const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 4, 2),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xFFEA00
    })
);

// const letterMesh = new THREE.Mesh(
//     new THREE.TextGeometry('X',{font: font, size: 80, height: 5, curveSegments: 12, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelOffset: 0, bevelSegments: 5}),
//     new THREE.MeshBasicMaterial({
//         wireframe: true,
//         color: 0xFFEA00
//     })
// );



const objects = [];

// Listen for mouse clicks and create spheres at highlighted positions
window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        return (object.position.x === highlightMesh.position.x)
        && (object.position.z === highlightMesh.position.z)
    });
    // Create a new sphere if the highlighted position is not occupied
    if(!objectExist) {
        if(intersects.length > 0) {
            const sphereClone = sphereMesh.clone();
            sphereClone.position.copy(highlightMesh.position);
            scene.add(sphereClone);
            objects.push(sphereClone);
            highlightMesh.material.color.setHex(0xFF0000);
        }
    }
    console.log(scene.children.length);
});


// Animation Loop
// Define an animation loop that updates mesh properties
function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);
    objects.forEach(function(object) {
        object.rotation.x = time / 1000;
        object.rotation.z = time / 1000;
        object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
    });
    renderer.render(scene, camera);
}

// Set the animation loop
renderer.setAnimationLoop(animate);

// Resize Handling
// Listen for window resize events and update camera and renderer
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
