// ====== VARIABLES GLOBALES ======
let isDragging = false;
let currentElement = null;
let offsetX = 0;
let offsetY = 0;
let startX = 0;
let startY = 0;
let hasMoved = false;
const DRAG_THRESHOLD = 5; // Pixeles mínimos para considerar que se está arrastrando

// ====== CURSOR PERSONALIZADO ======
const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => {
    cursor.classList.add('clicking');
});

document.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
});

// ====== PANTALLA DE CARGA ======
const loadingScreen = document.getElementById('loading-screen');
const loadingVideo = document.getElementById('loading-video');
const mainBoard = document.getElementById('main-board');
let videoLoops = 0;

loadingVideo.addEventListener('ended', () => {
    videoLoops++;
    
    if (videoLoops < 2) {
        // Reproducir el video nuevamente
        loadingVideo.play();
    } else {
        // Después de 2 loops, ocultar pantalla de carga
        loadingScreen.style.transition = 'opacity 0.5s ease';
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            mainBoard.classList.remove('hidden');
            initializeDraggables();
            addRandomRotations();
        }, 500);
    }
});

// Si el video no carga o hay error, mostrar el tablero después de 3 segundos
loadingVideo.addEventListener('error', () => {
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            mainBoard.classList.remove('hidden');
            initializeDraggables();
            addRandomRotations();
        }, 500);
    }, 3000);
});

// Fallback: si el video tarda mucho, mostrar el tablero
setTimeout(() => {
    if (!mainBoard.classList.contains('hidden')) return;
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        mainBoard.classList.remove('hidden');
        initializeDraggables();
        addRandomRotations();
    }, 500);
}, 5000);

// ====== AÑADIR ROTACIONES ALEATORIAS ======
function addRandomRotations() {
    const items = document.querySelectorAll('.draggable-item');
    items.forEach(item => {
        const randomRotation = (Math.random() - 0.5) * 12; // Entre -6 y +6 grados para un look más limpio
        const currentTransform = item.style.transform || '';
        item.style.transform = currentTransform + ` rotate(${randomRotation}deg)`;
    });
}

// ====== INICIALIZAR ELEMENTOS ARRASTRABLES ======
function initializeDraggables() {
    const draggableItems = document.querySelectorAll('.draggable-item');
    
    draggableItems.forEach(item => {
        // Mouse events
        item.addEventListener('mousedown', startDrag);
        
        // Touch events para móviles
        item.addEventListener('touchstart', startDrag);
    });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', endDrag);
}

// ====== INICIAR ARRASTRE ======
function startDrag(e) {
    e.preventDefault();
    
    currentElement = e.currentTarget;
    isDragging = true;
    hasMoved = false; // Resetear el flag de movimiento
    
    currentElement.style.zIndex = '1000';
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    // Guardar posición inicial para detectar movimiento
    startX = clientX;
    startY = clientY;
    
    const rect = currentElement.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    
    // Efecto visual al agarrar
    currentElement.style.transition = 'none';
}

// ====== ARRASTRAR ======
function drag(e) {
    if (!isDragging || !currentElement) return;
    
    e.preventDefault();
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    // Calcular la distancia desde el punto inicial
    const distanceX = Math.abs(clientX - startX);
    const distanceY = Math.abs(clientY - startY);
    
    // Si se movió más allá del umbral, marcar como arrastrado
    if (distanceX > DRAG_THRESHOLD || distanceY > DRAG_THRESHOLD) {
        hasMoved = true;
    }
    
    // Solo mover si superó el umbral
    if (hasMoved) {
        let newX = clientX - offsetX;
        let newY = clientY - offsetY;
        
        // Límites de la pantalla
        const maxX = window.innerWidth - currentElement.offsetWidth;
        const maxY = window.innerHeight - currentElement.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        currentElement.style.left = newX + 'px';
        currentElement.style.top = newY + 'px';
    }
}

// ====== TERMINAR ARRASTRE ======
function endDrag(e) {
    if (!currentElement) return;
    
    isDragging = false;
    
    currentElement.style.transition = 'transform 0.1s ease';
    currentElement.style.zIndex = '1';
    
    // Si NO se movió significativamente, es un CLICK
    if (!hasMoved) {
        handleClick(currentElement);
    }
    
    currentElement = null;
    hasMoved = false;
}

// ====== MANEJAR CLICKS ======
function handleClick(element) {
    if (!element.classList.contains('clickable')) return;
    
    const page = element.getAttribute('data-page');
    
    if (page) {
        // Efecto de feedback visual
        element.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            element.style.transform = '';
        }, 100);
        
        // Transición suave antes de cambiar de página
        setTimeout(() => {
            mainBoard.style.transition = 'opacity 0.3s ease';
            mainBoard.style.opacity = '0';
            
            setTimeout(() => {
                window.location.href = page;
            }, 300);
        }, 150);
    }
}

// ====== EFECTOS DE SONIDO (OPCIONAL) ======
// Puedes añadir sonidos al arrastrar o hacer click
function playSound(soundType) {
    // Implementar si quieres efectos de sonido
    // const audio = new Audio(`sounds/${soundType}.mp3`);
    // audio.play();
}

// ====== PREVENIR SELECCIÓN DE TEXTO ======
document.addEventListener('selectstart', (e) => {
    if (isDragging) {
        e.preventDefault();
    }
});

// ====== EASTER EGGS Y EFECTOS ESPECIALES ======
let clickCount = 0;
document.addEventListener('click', (e) => {
    // Triple click en el fondo para efecto especial
    if (e.target === mainBoard || e.target.classList.contains('background-texture')) {
        clickCount++;
        
        if (clickCount === 3) {
            createGlitchEffect();
            clickCount = 0;
        }
        
        setTimeout(() => {
            clickCount = 0;
        }, 1000);
    }
});

function createGlitchEffect() {
    mainBoard.style.animation = 'glitch 0.3s ease';
    
    setTimeout(() => {
        mainBoard.style.animation = '';
    }, 300);
}

// Añadir animación glitch al CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes glitch {
        0%, 100% { transform: translate(0); }
        25% { transform: translate(-5px, 5px); }
        50% { transform: translate(5px, -5px); }
        75% { transform: translate(-5px, -5px); }
    }
`;
document.head.appendChild(style);

// ====== PARTÍCULAS ALEATORIAS ======
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '5px';
    particle.style.height = '5px';
    particle.style.background = ['#ff006e', '#00d9ff', '#00ff00', '#ffeb3b'][Math.floor(Math.random() * 4)];
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.opacity = '1';
    particle.style.transition = 'all 1s ease';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.style.top = (y + (Math.random() - 0.5) * 100) + 'px';
        particle.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
        particle.style.opacity = '0';
    }, 10);
    
    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// Crear partículas ocasionalmente
setInterval(() => {
    if (Math.random() < 0.1) {
        createParticle(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight
        );
    }
}, 1000);

console.log('%c// WELCOME TO THE CHAOS //', 'color: #00ff00; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00ff00;');
console.log('%cDrag, explore, discover...', 'color: #ff006e; font-size: 14px;');
