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

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeResumeModal();
            const logoModal = document.getElementById('logo-modal');
            if (logoModal) {
                logoModal.classList.add('hidden');
                logoModal.classList.remove('flex');
            }
        }
    });
});

function openResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    }
}

function closeResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }
}
