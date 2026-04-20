// Cookie Consent Banner
document.addEventListener('DOMContentLoaded', function() {
    // Check if user already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        showCookieBanner();
    }
});

function showCookieBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-content">
            <p>🍪 <strong>Usamos cookies</strong> para mejorar tu experiencia. Este sitio utiliza Google AdSense y Analytics. <a href="privacy.html" style="color: #667eea; text-decoration: underline;">Más información</a></p>
            <div class="cookie-buttons">
                <button onclick="acceptCookies()" class="cookie-accept">Aceptar</button>
                <button onclick="rejectCookies()" class="cookie-reject">Rechazar</button>
            </div>
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
    // Disable Google Analytics and AdSense cookies if rejected
    window['ga-disable-G-XXXXXXXXX'] = true;
}

function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
    }
}
