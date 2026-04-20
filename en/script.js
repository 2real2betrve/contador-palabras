// DOM Elements
const textarea = document.getElementById('texto');

// Stats
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
    const tiempoHabla = Math.ceil(palabras / 130);
    
    animarNumero(palabrasEl, palabras);
    animarNumero(caracteresEl, caracteres);
    animarNumero(caracteresSinEspaciosEl, caracteresSinEspacios);
    animarNumero(oracionesEl, oraciones);
    animarNumero(parrafosEl, parrafos);
    animarNumero(tiempoLecturaEl, tiempoLectura);
    actualizarInsights(texto, palabras, caracteres, tiempoHabla);
    
    actualizarProgreso(caracteres);
}

function actualizarInsights(texto, palabras, caracteres, tiempoHabla) {
    const average = palabras > 0 ? (caracteres / palabras).toFixed(1) : '0';
    const repeated = mostRepeatedWord(texto);
    const metaState = metaDescriptionState(caracteres);

    tiempoHablaEl.textContent = `${tiempoHabla} min`;
    promedioPalabraEl.textContent = `${average} characters`;
    palabraTopEl.textContent = repeated;
    metaStatusEl.textContent = metaState;
}

function mostRepeatedWord(texto) {
    const stopwords = new Set(['the', 'and', 'for', 'you', 'that', 'with', 'this', 'from', 'are', 'was', 'have', 'your', 'not']);
    const words = texto.toLowerCase().match(/[a-z0-9]+/g) || [];
    const counter = {};

    for (const word of words) {
        if (word.length < 3 || stopwords.has(word)) continue;
        counter[word] = (counter[word] || 0) + 1;
    }

    let top = '—';
    let max = 0;
    for (const [word, count] of Object.entries(counter)) {
        if (count > max) {
            top = `${word} (${count})`;
            max = count;
        }
    }
    return top;
}

function metaDescriptionState(characters) {
    if (characters === 0) return 'Too short';
    if (characters < 120) return 'Short';
    if (characters <= 160) return 'Optimal';
    if (characters <= 180) return 'Long';
    return 'Too long';
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

function compartir(network) {
    const url = encodeURIComponent('https://textcounter.online/en/');
    const text = encodeURIComponent('Try this free word and character counter');
    const links = {
        x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        whatsapp: `https://wa.me/?text=${text}%20${url}`
    };

    const link = links[network];
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
    mostrarNotificacion('Thanks for sharing!', 'success');
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
