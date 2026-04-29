// Cookie Consent Banner
document.addEventListener('DOMContentLoaded', function() {
    // Check if user already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        showCookieBanner();
    }
});

function showCookieBanner() {
    // Detect language based on path
    const isEn = window.location.pathname.includes('/en/');
    const privacyLink = isEn ? 'privacy.html' : 'privacy.html'; // Assuming relative paths handle this
    
    const textES = `🍪 <strong>Usamos cookies</strong> para mejorar tu experiencia y servir anuncios personalizados (AdSense). <a href="${privacyLink}" style="color: var(--primary-color); text-decoration: underline;">Más información</a>`;
    const textEN = `🍪 <strong>We use cookies</strong> to improve your experience and serve personalized ads (AdSense). <a href="${privacyLink}" style="color: var(--primary-color); text-decoration: underline;">Learn more</a>`;
    
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    // Estilos inline para asegurar su correcta visualización sin editar styles.css masivamente
    banner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 600px;
        background: rgba(20, 20, 25, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(108, 99, 255, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        color: white;
        font-family: 'DM Sans', sans-serif;
        text-align: center;
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    
    banner.innerHTML = `
        <div style="font-size: 0.95rem; line-height: 1.5;">
            ${isEn ? textEN : textES}
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="acceptCookies()" style="padding: 0.6rem 1.5rem; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; cursor: pointer; font-weight: 600;">${isEn ? 'Accept' : 'Aceptar'}</button>
            <button onclick="rejectCookies()" style="padding: 0.6rem 1.5rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: transparent; color: white; cursor: pointer;">${isEn ? 'Reject' : 'Rechazar'}</button>
        </div>
    `;
    document.body.appendChild(banner);
}

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    hideCookieBanner();
}

function rejectCookies() {
    localStorage.setItem('cookiesAccepted', 'false');
    hideCookieBanner();
    // Deshabilitar cookies si se requiere
    window['ga-disable-G-XXXXXXXXX'] = true;
}

function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => banner.remove(), 300);
    }
}
