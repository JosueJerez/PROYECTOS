document.addEventListener('DOMContentLoaded', () => {

    // Lógica del menú hamburguesa
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinksList = document.querySelector('.nav-links');
    hamburgerMenu.addEventListener('click', () => {
        navLinksList.classList.toggle('active');
    });

    // Lógica de la ventana modal
    const modalOverlay = document.querySelector('.modal-overlay');
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    const closeModalButton = document.querySelector('.close-modal-btn');
    const formContainer = document.getElementById('form-container');
    const successMessage = document.getElementById('success-message');
    const demoForm = document.getElementById('demo-form');

    const openModal = () => {
        formContainer.classList.remove('hidden');
        successMessage.classList.add('hidden');
        modalOverlay.classList.remove('hidden');
    };
    const closeModal = () => {
        modalOverlay.classList.add('hidden');
    };

    openModalButtons.forEach(button => button.addEventListener('click', openModal));
    closeModalButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Lógica del formulario
    demoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formContainer.classList.add('hidden');
        successMessage.classList.remove('hidden');
        setTimeout(closeModal, 3000);
    });

    // Lógica de scroll para la navegación
    const sections = document.querySelectorAll('.scroll-section');
    const navLinksAnchors = document.querySelectorAll('.nav-links a.nav-link');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop - 100 && scrollPosition < section.offsetTop + section.offsetHeight - 100) {
                const currentId = section.getAttribute('id');
                navLinksAnchors.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    });
});