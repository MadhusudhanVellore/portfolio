document.addEventListener('DOMContentLoaded', () => {
    // Update year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear().toString();
    }

    // Scroll reveal logic
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Modal logic
    const aboutBtn = document.getElementById('about-link');
    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    const modal = document.getElementById('status-modal');
    const modalContent = document.getElementById('status-modal-content');
    const closeBtn = document.getElementById('close-modal-btn');

    function openModal(e) {
        e.preventDefault();
        modal.classList.remove('hidden');
        // small delay to allow display:block to apply before changing opacity
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    if (aboutBtn) {
        aboutBtn.addEventListener('click', openModal);
    }

    if (mobileProfileBtn) {
        mobileProfileBtn.addEventListener('click', openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
