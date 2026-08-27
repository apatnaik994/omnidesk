document.addEventListener('DOMContentLoaded', () => {
    // 1. Add 3D Tilt effect to Glass Panels
    // We only apply it to the sidebar and main tool sections for a neat effect
    VanillaTilt.init(document.querySelectorAll(".sidebar"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.02
    });

    VanillaTilt.init(document.querySelectorAll(".tool-container"), {
        max: 2,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
    });

    VanillaTilt.init(document.querySelectorAll(".top-header"), {
        max: 3,
        speed: 400,
        glare: true,
        "max-glare": 0.15,
    });

    // Add tilt to preview boxes in compressor
    VanillaTilt.init(document.querySelectorAll(".preview-box"), {
        max: 10,
        speed: 300,
        glare: true,
        "max-glare": 0.3,
        scale: 1.05
    });

    // 2. Add an interactive 3D floating object in the header
    const header = document.querySelector('.top-header');
    
    // Create a container for the 3D logo
    const logo3DContainer = document.createElement('div');
    logo3DContainer.id = 'header-3d-logo';
    logo3DContainer.style.width = '60px';
    logo3DContainer.style.height = '60px';
    logo3DContainer.style.position = 'absolute';
    logo3DContainer.style.right = '120px'; // Next to the header actions
    
    header.style.position = 'relative';
    header.appendChild(logo3DContainer);

    // Initialize Three.js scene for the 3D logo
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(60, 60);
    logo3DContainer.appendChild(renderer.domElement);

    // Create a cool 3D Torus Knot (looks like a complex network/utility icon)
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshPhysicalMaterial({ 
        color: 0x00CEC9,
        metalness: 0.7,
        roughness: 0.2,
        wireframe: false,
        transmission: 0.5, // glass-like
        transparent: true
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    camera.position.z = 30;

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;

    // Make the 3D object follow the mouse slightly
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        
        // Base rotation
        torusKnot.rotation.x += 0.01;
        torusKnot.rotation.y += 0.01;

        // Interactive rotation based on mouse
        torusKnot.rotation.x += mouseY * 0.05;
        torusKnot.rotation.y += mouseX * 0.05;

        renderer.render(scene, camera);
    }
    
    animate();
});
