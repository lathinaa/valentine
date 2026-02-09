function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }

    // Scroll to top of content area on mobile
    if (window.innerWidth < 600) {
        document.getElementById('content-area').scrollIntoView({ behavior: 'smooth' });
    }
}

// Memories Gallery Logic
document.addEventListener('DOMContentLoaded', () => {
    const gifts = document.querySelectorAll('.memory-gift');
    const modal = document.getElementById('memory-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');

    // Open Modal
    gifts.forEach(gift => {
        gift.addEventListener('click', () => {
            const photoSrc = gift.getAttribute('data-photo');
            const captionText = gift.getAttribute('data-caption');

            modalImg.src = photoSrc;
            modalCaption.textContent = captionText;

            modal.classList.remove('hidden');
            // Small timeout to allow display:block to apply before opacity transition
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            modalImg.src = ''; // Clear src
        }, 300); // Wait for transition
    };

    // Close on Space Key
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && modal.classList.contains('active')) {
            e.preventDefault(); // Prevent scrolling
            closeModal();
        }
    });

    // Close on Click Outside (Optional but good UX)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
