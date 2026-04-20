// Elementos del DOM
const textarea = document.getElementById('texto');

// Estadísticas
const palabrasEl = document.getElementById('palabras');
const caracteresEl = document.getElementById('caracteres');
const caracteresSinEspaciosEl = document.getElementById('caracteres-sin-espacios');
const oracionesEl = document.getElementById('oraciones');
const parrafosEl = document.getElementById('parrafos');
const tiempoLecturaEl = document.getElementById('tiempo-lectura');
const tiempoHablaEl = document.getElementById('tiempo-habla');
const promedioPalabraEl = document.getElementById('promedio-palabra');
const palabraTopEl = document.getElementById('palabra-top');
const metaStatusEl = document.getElementById('meta-status');

// Barras de progreso para redes sociales
const limits = {
    twitter: { el: document.getElementById('progress-twitter'), max: 280 },
    instagram: { el: document.getElementById('progress-instagram'), max: 150 },
    tiktok: { el: document.getElementById('progress-tiktok'), max: 2200 },
    linkedin: { el: document.getElementById('progress-linkedin'), max: 3000 },
    youtube: { el: document.getElementById('progress-youtube'), max: 100 },
    seo: { el: document.getElementById('progress-seo'), max: 60 }
};

// Función principal que cuenta todo
function contarTodo() {
    const texto = textarea.value;
    
    // Contar caracteres
    const caracteres = texto.length;
    const caracteresSinEspacios = texto.replace(/\s/g, '').length;
    
    // Contar palabras
    const palabras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
    
    // Contar oraciones (basado en . ! ?)
    const oraciones = texto.trim() === '' ? 0 : (texto.match(/[.!?]+/g) || []).length;
    
    // Contar párrafos
    const parrafos = texto.trim() === '' ? 0 : texto.split(/\n\s*\n/).filter(p => p.trim() !== '').length || (texto.trim() ? 1 : 0);
    
    // Tiempo de lectura (200 palabras por minuto promedio)
    const tiempoLectura = Math.ceil(palabras / 200);
    const tiempoHabla = Math.ceil(palabras / 130);
    
    // Actualizar UI con animación
    animarNumero(palabrasEl, palabras);
    animarNumero(caracteresEl, caracteres);
    animarNumero(caracteresSinEspaciosEl, caracteresSinEspacios);
    animarNumero(oracionesEl, oraciones);
    animarNumero(parrafosEl, parrafos);
    animarNumero(tiempoLecturaEl, tiempoLectura);
    actualizarInsights(texto, palabras, caracteres, tiempoHabla);
    
    // Actualizar barras de progreso
    actualizarProgreso(caracteres);
}

function actualizarInsights(texto, palabras, caracteres, tiempoHabla) {
    const promedio = palabras > 0 ? (caracteres / palabras).toFixed(1) : '0';
    const repetida = palabraMasRepetida(texto);
    const estadoMeta = estadoMetaDescription(caracteres);

    tiempoHablaEl.textContent = `${tiempoHabla} min`;
    promedioPalabraEl.textContent = `${promedio} caracteres`;
    palabraTopEl.textContent = repetida;
    metaStatusEl.textContent = estadoMeta;
}

function palabraMasRepetida(texto) {
    const stopwords = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'que', 'y', 'o', 'en', 'a', 'un', 'una', 'es', 'por', 'para', 'con', 'al']);
    const palabras = texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .match(/[a-z0-9]+/g) || [];

    const contador = {};
    for (const palabra of palabras) {
        if (palabra.length < 3 || stopwords.has(palabra)) continue;
        contador[palabra] = (contador[palabra] || 0) + 1;
    }

    let top = '—';
    let max = 0;
    for (const [palabra, count] of Object.entries(contador)) {
        if (count > max) {
            top = `${palabra} (${count})`;
            max = count;
        }
    }
    return top;
}

function estadoMetaDescription(caracteres) {
    if (caracteres === 0) return 'Muy corta';
    if (caracteres < 120) return 'Corta';
    if (caracteres <= 160) return 'Óptima';
    if (caracteres <= 180) return 'Larga';
    return 'Demasiado larga';
}

// Animar números
function animarNumero(elemento, nuevoValor) {
    const valorActual = parseInt(elemento.textContent) || 0;
    if (valorActual !== nuevoValor) {
        elemento.textContent = nuevoValor;
        elemento.style.transform = 'scale(1.2)';
        setTimeout(() => {
            elemento.style.transform = 'scale(1)';
        }, 100);
    }
}

// Actualizar barras de progreso de redes sociales
function actualizarProgreso(caracteres) {
    for (const [key, data] of Object.entries(limits)) {
        const porcentaje = Math.min((caracteres / data.max) * 100, 100);
        data.el.style.width = porcentaje + '%';
        
        // Cambiar color según el porcentaje
        data.el.classList.remove('warning', 'danger');
        if (porcentaje >= 100) {
            data.el.classList.add('danger');
        } else if (porcentaje >= 80) {
            data.el.classList.add('warning');
        }
    }
}

// Copiar texto al portapapeles
function copiarTexto() {
    const texto = textarea.value;
    if (texto.trim() === '') {
        mostrarNotificacion('No hay texto para copiar', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion('¡Texto copiado al portapapeles!', 'success');
    }).catch(() => {
        textarea.select();
        document.execCommand('copy');
        mostrarNotificacion('¡Texto copiado!', 'success');
    });
}

// Limpiar texto
function limpiarTexto() {
    textarea.value = '';
    contarTodo();
    textarea.focus();
    mostrarNotificacion('Texto eliminado', 'info');
}

// Descargar texto como archivo
function descargarTexto() {
    const texto = textarea.value;
    if (texto.trim() === '') {
        mostrarNotificacion('No hay texto para descargar', 'warning');
        return;
    }
    
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mi-texto.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarNotificacion('¡Archivo descargado!', 'success');
}

function compartir(red) {
    const url = encodeURIComponent('https://textcounter.online/');
    const texto = encodeURIComponent('Prueba este contador de palabras y caracteres gratis');
    const enlaces = {
        x: `https://twitter.com/intent/tweet?text=${texto}&url=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        whatsapp: `https://wa.me/?text=${texto}%20${url}`
    };

    const enlace = enlaces[red];
    if (!enlace) return;
    window.open(enlace, '_blank', 'noopener,noreferrer');
    mostrarNotificacion('¡Gracias por compartir!', 'success');
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const existente = document.querySelector('.notificacion');
    if (existente) existente.remove();
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    
    Object.assign(notificacion.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
    });
    
    const colores = {
        success: '#27ae60',
        warning: '#f39c12',
        info: '#3498db',
        error: '#e74c3c'
    };
    notificacion.style.background = colores[tipo] || colores.info;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateX(100px)';
        notificacion.style.transition = 'all 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .stat-number {
        transition: transform 0.1s ease;
    }
`;
document.head.appendChild(style);

// Event listeners
textarea.addEventListener('input', contarTodo);

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', contarTodo);
