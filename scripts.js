document.addEventListener('DOMContentLoaded', function() {
    // Variáveis do Carrossel
    const carousel = document.querySelector('.carousel-items');
    const cards = document.querySelectorAll('.category-card');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    
    // Variáveis dos Modais
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeButtons = document.querySelectorAll('.close-button');

    // Configurações do Carrossel
    let currentIndex = 0;
    let cardWidth = cards[0].offsetWidth;
    let visibleCards = 5; // Ajuste para 5 itens visíveis
    let maxIndex = Math.max(0, cards.length - visibleCards);
    let autoPlayInterval;
    const autoPlayDelay = 4000;

    // Função para atualizar o número de itens visíveis e o índice máximo
    function updateCarouselSettings() {
        cardWidth = cards[0].offsetWidth;
        maxIndex = Math.max(0, cards.length - visibleCards);
        updateCarousel();
    }

    // Função para atualizar a posição do carrossel
    function updateCarousel() {
        const gap = 16; // Espaço entre os itens
        const translateX = -currentIndex * (cardWidth + gap);
        carousel.style.transform = `translateX(${translateX}px)`;
        updateButtons();
    }

    // Função para atualizar a visibilidade dos botões de navegação
    function updateButtons() {
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevButton.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
        nextButton.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
        nextButton.style.cursor = currentIndex === maxIndex ? 'not-allowed' : 'pointer';
    }

    // Função para mover o carrossel
    function moveCarousel(direction) {
        if (direction === 'next') {
            currentIndex = currentIndex === maxIndex ? 0 : currentIndex + 1;
        } else {
            currentIndex = currentIndex === 0 ? maxIndex : currentIndex - 1;
        }
        updateCarousel();
    }

    // Função para iniciar o autoplay
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => moveCarousel('next'), autoPlayDelay);
    }

    // Função para parar o autoplay
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Funções dos Modais
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            form.querySelectorAll('input').forEach(input => {
                const label = input.nextElementSibling;
                if (label) label.classList.remove('active');
            });
        }
    }

    // Event Listeners do Carrossel
    prevButton.addEventListener('click', () => {
        moveCarousel('prev');
        stopAutoPlay();
    });

    nextButton.addEventListener('click', () => {
        moveCarousel('next');
        stopAutoPlay();
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Event Listeners dos Modais
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(registerModal);
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Fechar modal com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => closeModal(modal));
        }
    });

    // Auto preenchimento do CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', async function() {
            const cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        document.getElementById('address').value = data.logradouro;
                        document.getElementById('neighborhood').value = data.bairro;
                        document.getElementById('city').value = data.localidade;
                        
                        ['address', 'neighborhood', 'city'].forEach(id => {
                            const input = document.getElementById(id);
                            if (input.value) {
                                input.nextElementSibling.classList.add('active');
                            }
                        });
                    }
                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                }
            }
        });
    }

    // Validação dos formulários
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Validar campos obrigatórios
            form.querySelectorAll('input[required]').forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    const formGroup = input.closest('.form-group');
                    formGroup.classList.add('shake');
                    setTimeout(() => formGroup.classList.remove('shake'), 300);
                }
            });

            // Validar senhas no cadastro
            if (form.classList.contains('register-form')) {
                const password = form.querySelector('#registerPassword');
                const confirmPassword = form.querySelector('#confirmPassword');
                
                if (password.value !== confirmPassword.value) {
                    isValid = false;
                    [password, confirmPassword].forEach(input => {
                        const formGroup = input.closest('.form-group');
                        formGroup.classList.add('shake');
                        setTimeout(() => formGroup.classList.remove('shake'), 300);
                    });
                }
            }

            if (isValid) {
                console.log('Formulário válido:', form.classList.contains('login-form') ? 'Login' : 'Cadastro');
                closeModal(form.closest('.modal'));
            }
        });
    });

    // Labels flutuantes
    document.querySelectorAll('.form-group input').forEach(input => {
        const activateLabel = () => {
            const label = input.nextElementSibling;
            if (label) label.classList.add('active');
        };

        const deactivateLabel = () => {
            const label = input.nextElementSibling;
            if (label && !input.value.trim()) {
                label.classList.remove('active');
            }
        };

        input.addEventListener('focus', activateLabel);
        input.addEventListener('input', activateLabel);
        input.addEventListener('blur', deactivateLabel);

        // Verificar estado inicial
        if (input.value.trim()) activateLabel();
    });

    // Máscaras para inputs
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/^(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Inicializar e atualizar o carrossel ao redimensionar a janela
    window.addEventListener('resize', updateCarouselSettings);
    updateCarouselSettings();
    startAutoPlay();
});
