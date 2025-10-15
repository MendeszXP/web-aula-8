
const CONFIG = {
    animationDuration: 300,
    apiBaseUrl: 'https://jsonplaceholder.typicode.com',
    storageKey: 'webDesignAula07_data',
    debounceDelay: 250
};

const APP_STATE = {
    currentTheme: 'light',
    userPreferences: {},
    formSubmissions: 0,
    lastInteraction: null,
    isMenuOpen: false
};

// =============================================
// 2. INICIALIZAÇÃO DA APLICAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Web Design Aula 07 - Inicializando...');
    
    initializeApp();
    setupEventListeners();
    loadUserPreferences();
    setupIntersectionObserver();
    initializeSmoothScrolling();
    setupFormHandlers();
    setupFlexboxDemoInteractions();
    setupPerformanceMonitoring();
});

function initializeApp() {
    console.log('📱 Inicializando aplicação...');
    detectUserPreferences();
    setInitialTheme();
    document.body.classList.add('js-loaded');
    initializeComponents();
}

// =============================================
// 3. SISTEMA DE TEMAS
// =============================================

function detectUserPreferences() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    APP_STATE.userPreferences = {
        reducedMotion: prefersReducedMotion,
        darkMode: prefersDarkMode
    };
    
    if (prefersReducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0ms');
    }
}

function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    APP_STATE.currentTheme = savedTheme;
    applyTheme(savedTheme);
    createThemeToggle();
}

function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
        root.style.setProperty('--background-color', '#1a1a1a');
        root.style.setProperty('--surface-color', '#2d2d2d');
        root.style.setProperty('--text-color', '#e0e0e0');
        root.style.setProperty('--heading-color', '#ffffff');
        root.style.setProperty('--primary-color', '#4a9dbd');
        root.style.setProperty('--secondary-color', '#5bbdc0');
    } else {
        root.style.setProperty('--background-color', '#f4f4f9');
        root.style.setProperty('--surface-color', '#ffffff');
        root.style.setProperty('--text-color', '#333333');
        root.style.setProperty('--heading-color', '#003440');
        root.style.setProperty('--primary-color', '#005f73');
        root.style.setProperty('--secondary-color', '#0a9396');
    }
    
    APP_STATE.currentTheme = theme;
    localStorage.setItem('theme', theme);
    updateThemeMetaTag(theme);
}

function createThemeToggle() {
    if (document.querySelector('.theme-toggle')) return;
    
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = `
        <span class="theme-icon">${APP_STATE.currentTheme === 'light' ? '🌙' : '☀️'}</span>
        <span class="theme-text">${APP_STATE.currentTheme === 'light' ? 'Escuro' : 'Claro'}</span>
    `;
    themeToggle.setAttribute('aria-label', 'Alternar entre tema claro e escuro');
    themeToggle.addEventListener('click', toggleTheme);
    
    const headerContainer = document.querySelector('.site-header .container');
    if (headerContainer) {
        headerContainer.appendChild(themeToggle);
    }
}

function toggleTheme() {
    const newTheme = APP_STATE.currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = `
            <span class="theme-icon">${newTheme === 'light' ? '🌙' : '☀️'}</span>
            <span class="theme-text">${newTheme === 'light' ? 'Escuro' : 'Claro'}</span>
        `;
    }
    
    showNotification(`Tema ${newTheme === 'light' ? 'claro' : 'escuro'} ativado!`);
}

function updateThemeMetaTag(theme) {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
    }
    metaTheme.content = theme === 'dark' ? '#1a1a1a' : '#005f73';
}

// =============================================
// 4. SCROLL SUAVE E ANIMAÇÕES
// =============================================

function initializeSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: APP_STATE.userPreferences.reducedMotion ? 'auto' : 'smooth'
                });
                
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                if (entry.target.dataset.animateOnce !== 'false') {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll('.card, .testimonial, .widget');
    animateElements.forEach(el => observer.observe(el));
}

// =============================================
// 5. SISTEMA DE FORMULÁRIOS
// =============================================

function setupFormHandlers() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        setupFormValidation(contactForm);
        setupRealTimeValidation(contactForm);
    }
}

function setupRealTimeValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (field.type) {
        case 'email':
            isValid = isValidEmail(value);
            errorMessage = 'Por favor, insira um email válido.';
            break;
        case 'tel':
            if (value && !isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Por favor, insira um telefone válido.';
            }
            break;
        default:
            if (field.required && !value) {
                isValid = false;
                errorMessage = 'Este campo é obrigatório.';
            }
    }
    
    if (!isValid && errorMessage) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError({ target: field });
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) {
        showNotification('Por favor, corrija os erros no formulário.', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    simulateFormSubmission(form, formValues);
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function simulateFormSubmission(form, data) {
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    submitButton.style.opacity = '0.7';
    
    setTimeout(() => {
        APP_STATE.formSubmissions++;
        saveFormSubmission(data);
        showNotification('Mensagem enviada com sucesso!', 'success');
        form.reset();
        
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.style.opacity = '1';
        analyzeFormData(data);
    }, 2000);
}

function saveFormSubmission(data) {
    const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    submissions.push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));
}

function analyzeFormData(data) {
    console.log('📈 Análise de dados do formulário:', data);
}

function showFieldError(field, message) {
    clearFieldError({ target: field });
    field.classList.add('error');
    
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #f44336;
        font-size: 0.85em;
        display: block;
        margin-top: 5px;
    `;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// =============================================
// 6. DEMONSTRAÇÃO FLEXBOX INTERATIVA
// =============================================

function setupFlexboxDemoInteractions() {
    const boxContainer = document.querySelector('.box-container');
    const boxes = document.querySelectorAll('.box');
    
    if (!boxContainer) return;
    
    createFlexboxControls(boxContainer);
    setupBoxDragEffects(boxes);
    setupReorganizationAnimation(boxContainer, boxes);
}

function createFlexboxControls(container) {
    const controls = document.createElement('div');
    controls.className = 'flexbox-controls';
    controls.innerHTML = `
        <h4>🎛️ Controles Flexbox Interativos</h4>
        <div class="control-group">
            <button id="shuffleBoxes">🔀 Embaralhar</button>
            <button id="resetBoxes">🔄 Resetar</button>
            <button id="toggleAnimation">⏯️ Animação</button>
        </div>
        <div class="control-group">
            <label>Justify-content:
                <select id="justifyContent">
                    <option value="flex-start">flex-start</option>
                    <option value="center">center</option>
                    <option value="flex-end">flex-end</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around" selected>space-around</option>
                    <option value="space-evenly">space-evenly</option>
                </select>
            </label>
        </div>
    `;
    
    container.parentNode.insertBefore(controls, container);
    
    document.getElementById('shuffleBoxes').addEventListener('click', shuffleBoxes);
    document.getElementById('resetBoxes').addEventListener('click', resetBoxes);
    document.getElementById('toggleAnimation').addEventListener('click', toggleBoxAnimation);
    document.getElementById('justifyContent').addEventListener('change', updateFlexboxProperty);
}

function shuffleBoxes() {
    const boxes = document.querySelectorAll('.box');
    const container = document.querySelector('.box-container');
    
    boxes.forEach(box => {
        box.style.transform = 'scale(0.8) rotate(-10deg)';
        box.style.opacity = '0.5';
    });
    
    setTimeout(() => {
        for (let i = boxes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            container.appendChild(boxes[j]);
        }
        
        boxes.forEach(box => {
            box.style.transform = 'scale(1) rotate(0deg)';
            box.style.opacity = '1';
        });
        
        showNotification('Caixas embaralhadas! 🎲');
    }, 300);
}

function resetBoxes() {
    const boxes = document.querySelectorAll('.box');
    const container = document.querySelector('.box-container');
    
    boxes.forEach(box => {
        box.style.order = '';
        box.style.transform = '';
        box.style.opacity = '1';
    });
    
    [...boxes].sort((a, b) => {
        const aNum = parseInt(a.textContent.match(/\d+/)[0]);
        const bNum = parseInt(b.textContent.match(/\d+/)[0]);
        return aNum - bNum;
    }).forEach(box => container.appendChild(box));
    
    showNotification('Caixas resetadas! 🏠');
}

function toggleBoxAnimation() {
    const boxes = document.querySelectorAll('.box');
    const isAnimated = boxes[0].style.animationPlayState === 'paused';
    
    boxes.forEach(box => {
        box.style.animationPlayState = isAnimated ? 'running' : 'paused';
    });
    
    showNotification(`Animação ${isAnimated ? 'ativada' : 'pausada'}! ${isAnimated ? '🎬' : '⏸️'}`);
}

function updateFlexboxProperty(e) {
    const container = document.querySelector('.box-container');
    container.style.justifyContent = e.target.value;
    showNotification(`Justify-content: ${e.target.value} 🎨`);
}

function setupBoxDragEffects(boxes) {
    boxes.forEach(box => {
        box.setAttribute('draggable', 'true');
        
        box.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', box.textContent);
            box.classList.add('dragging');
        });
        
        box.addEventListener('dragend', () => {
            box.classList.remove('dragging');
        });
    });
}

function setupReorganizationAnimation(container, boxes) {
    let isReorganizing = false;
    
    setInterval(() => {
        if (!isReorganizing && Math.random() > 0.7) {
            isReorganizing = true;
            
            boxes.forEach(box => {
                const randomOrder = Math.floor(Math.random() * 20);
                box.style.order = randomOrder;
            });
            
            setTimeout(() => {
                isReorganizing = false;
            }, 1000);
        }
    }, 5000);
}

// =============================================
// 7. SISTEMA DE NOTIFICAÇÕES
// =============================================

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '5px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        transform: 'translateX(150%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    
    const backgroundColor = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#ff9800'
    }[type] || '#2196F3';
    
    notification.style.backgroundColor = backgroundColor;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// =============================================
// 8. PERFORMANCE E OTIMIZAÇÃO
// =============================================

function setupPerformanceMonitoring() {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 Tempo de carregamento: ${loadTime}ms`);
    });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('🔄 Viewport redimensionada:', window.innerWidth, 'x', window.innerHeight);
        }, CONFIG.debounceDelay);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================
// 9. COMPONENTES E INICIALIZAÇÃO
// =============================================

function initializeComponents() {
    initializeCards();
    initializeTestimonials();
    initializeWidgets();
}

function initializeCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.addEventListener('mousemove', (e) => {
            if (APP_STATE.userPreferences.reducedMotion) return;
            
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${y * -5}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
        });
    });
}

function initializeTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach((testimonial, index) => {
        testimonial.style.animationDelay = `${index * 0.2}s`;
    });
}

function initializeWidgets() {
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach((widget, index) => {
        widget.style.animationDelay = `${index * 0.15}s`;
    });
}

// =============================================
// 10. CONFIGURAÇÃO DE EVENT LISTENERS
// =============================================

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyboardNavigation);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', saveAppState);
}

function handleKeyboardNavigation(e) {
    if (e.key === 'Escape') {
        APP_STATE.isMenuOpen = false;
    }
    
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
}

function handleFocusIn(e) {
    if (e.target.matches('button, a, input, select, textarea')) {
        e.target.classList.add('focused');
    }
}

function handleContextMenu(e) {
    if (e.target.matches('.card, .box')) {
        e.preventDefault();
        showNotification('Menu de contexto desabilitado para este elemento');
    }
}

function saveAppState() {
    const stateToSave = {
        theme: APP_STATE.currentTheme,
        preferences: APP_STATE.userPreferences,
        lastVisit: new Date().toISOString()
    };
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(stateToSave));
}

function loadUserPreferences() {
    try {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(APP_STATE, parsed);
            
            if (parsed.lastVisit) {
                console.log('👋 Última visita:', new Date(parsed.lastVisit).toLocaleString());
            }
        }
    } catch (error) {
        console.warn('❌ Erro ao carregar preferências:', error);
    }
}
