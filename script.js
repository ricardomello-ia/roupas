document.addEventListener('DOMContentLoaded', () => {
    // 1. DARK MODE
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        trackEvent('theme_toggle', { theme: newTheme });
    });

    // 2. HEADER GLASSMORPHISM & MOBILE MENU
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuBtn.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        mobileMenuBtn.textContent = isActive ? '✕' : '☰';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // 3. CAPTURA DE UTM E INJEÇÃO AUTOMÁTICA NO WHATSAPP
    const urlParams = new URLSearchParams(window.location.search);
    let utmSource = urlParams.get('utm_source') || 'site_organico';
    
    if (utmSource !== 'site_organico') {
        localStorage.setItem('utm_source', utmSource);
    } else {
        utmSource = localStorage.getItem('utm_source') || 'site_organico';
    }

    // Atualiza TODOS os links com a classe 'whatsapp-link' (Hero, Sticky, Flutuante, etc.)
    const whatsappLinks = document.querySelectorAll('.whatsapp-link');
    const baseMessage = `Olá, Carla! Vim pelo ${utmSource.replace('_', ' ')} e gostaria de um orçamento.`;
    
    whatsappLinks.forEach(link => {
        if (!link.href.includes('text=')) {
            link.href = `https://wa.me/5511963382485?text=${encodeURIComponent(baseMessage)}`;
        } else {
            let currentText = decodeURIComponent(link.href.split('text=')[1] || '');
            if (!currentText.includes('Vim pelo')) {
                currentText += ` (Origem: ${utmSource})`;
                link.href = link.href.split('text=')[0] + 'text=' + encodeURIComponent(currentText);
            }
        }
    });

    // 4. FAQ ACCORDION
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
                trackEvent('faq_open', { question: question.textContent.trim() });
            }
        });
    });

    // 5. FORMULÁRIO INTELIGENTE (SEM BACKEND)
    const contactForm = document.getElementById('contact-form');
    const formFields = ['name', 'phone', 'service', 'message'].map(id => document.getElementById(id));

    // Auto-save rascunho
    formFields.forEach(field => {
        const saved = localStorage.getItem(`form_draft_${field.name}`);
        if (saved) field.value = saved;
        field.addEventListener('input', () => localStorage.setItem(`form_draft_${field.name}`, field.value));
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value.trim();

        if (!name || !phone || !service) {
            alert('Por favor, preencha os campos obrigatórios.');
            return;
        }

        const finalMessage = `Olá, Carla! Meu nome é *${name}*.\n📱 Meu WhatsApp: ${phone}\n🧵 Serviço: *${service}*\n💬 Detalhes: ${message || 'Gostaria de um orçamento.'}\n🌐 Origem: ${utmSource}`;
        const whatsappURL = `https://wa.me/5511963382485?text=${encodeURIComponent(finalMessage)}`;
        
        document.getElementById('success-modal').style.display = 'flex';
        trackEvent('form_submit', { service: service, source: utmSource });

        formFields.forEach(field => localStorage.removeItem(`form_draft_${field.name}`));
        contactForm.reset();

        setTimeout(() => window.open(whatsappURL, '_blank'), 1500);
    });

    window.closeModal = () => { document.getElementById('success-modal').style.display = 'none'; };
    document.querySelector('.close-modal').addEventListener('click', window.closeModal);

    // 6. COOKIE BANNER (LGPD) & TRACKING
    const cookieBanner = document.getElementById('cookie-banner');
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => { cookieBanner.style.display = 'block'; }, 2000);
    }

    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieBanner.style.display = 'none';
        trackEvent('cookie_consent', { status: 'accepted' });
    });

    // Função global de rastreamento segura
    window.trackEvent = (eventName, params = {}) => {
        if (localStorage.getItem('cookieConsent') === 'true') {
            console.log(`[TRACKING] Event: ${eventName}`, params);
            // Descomente a linha abaixo quando o GTM estiver ativo:
            // window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: eventName, ...params });
        }
    };
});