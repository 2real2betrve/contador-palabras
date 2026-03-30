// DOM Elements
const textarea = document.getElementById('texto');

// Stats
const palabrasEl = document.getElementById('palabras');
const caracteresEl = document.getElementById('caracteres');
const caracteresSinEspaciosEl = document.getElementById('caracteres-sin-espacios');
const oracionesEl = document.getElementById('oraciones');
const parrafosEl = document.getElementById('parrafos');
const tiempoLecturaEl = document.getElementById('tiempo-lectura');

// Progress bars for social media
const limits = {
    twitter: { el: document.getElementById('progress-twitter'), max: 280 },
    instagram: { el: document.getElementById('progress-instagram'), max: 150 },
    tiktok: { el: document.getElementById('progress-tiktok'), max: 2200 },
    linkedin: { el: document.getElementById('progress-linkedin'), max: 3000 },
    youtube: { el: document.getElementById('progress-youtube'), max: 100 },
    seo: { el: document.getElementById('progress-seo'), max: 60 }
};

// Main counting function
function contarTodo() {
    const texto = textarea.value;
    
    const caracteres = texto.length;
    const caracteresSinEspacios = texto.replace(/\s/g, '').length;
    const palabras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
    const oraciones = texto.trim() === '' ? 0 : (texto.match(/[.!?]+/g) || []).length;
    const parrafos = texto.trim() === '' ? 0 : texto.split(/\n\s*\n/).filter(p => p.trim() !== '').length || (texto.trim() ? 1 : 0);
    const tiempoLectura = Math.ceil(palabras / 200);
    
    animarNumero(palabrasEl, palabras);
    animarNumero(caracteresEl, caracteres);
    animarNumero(caracteresSinEspaciosEl, caracteresSinEspacios);
    animarNumero(oracionesEl, oraciones);
    animarNumero(parrafosEl, parrafos);
    animarNumero(tiempoLecturaEl, tiempoLectura);
    
    actualizarProgreso(caracteres);
}

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

function actualizarProgreso(caracteres) {
    for (const [key, data] of Object.entries(limits)) {
        const porcentaje = Math.min((caracteres / data.max) * 100, 100);
        data.el.style.width = porcentaje + '%';
        
        data.el.classList.remove('warning', 'danger');
        if (porcentaje >= 100) {
            data.el.classList.add('danger');
        } else if (porcentaje >= 80) {
            data.el.classList.add('warning');
        }
    }
}

function copiarTexto() {
    const texto = textarea.value;
    if (texto.trim() === '') {
        mostrarNotificacion('No text to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion('Text copied to clipboard!', 'success');
    }).catch(() => {
        textarea.select();
        document.execCommand('copy');
        mostrarNotificacion('Text copied!', 'success');
    });
}

function limpiarTexto() {
    textarea.value = '';
    contarTodo();
    textarea.focus();
    mostrarNotificacion('Text cleared', 'info');
}

function descargarTexto() {
    const texto = textarea.value;
    if (texto.trim() === '') {
        mostrarNotificacion('No text to download', 'warning');
        return;
    }
    
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarNotificacion('File downloaded!', 'success');
}

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

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .stat-number { transition: transform 0.1s ease; }
`;
document.head.appendChild(style);

textarea.addEventListener('input', contarTodo);
document.addEventListener('DOMContentLoaded', contarTodo);
