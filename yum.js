
$(document).ready(function(){
    const carousel = $('.carousel');
    const items = $('.carousel-item');
    const prevBtn = $('.prev-button');
    const nextBtn = $('.next-button');
    
    let isDragging = false;
    let startPosition;
    let scrollLeft;

    // Calculate items to show based on screen width
    function getItemsToShow() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 4;
    }

    // Update carousel scroll position
    function updateCarousel(direction) {
        const itemWidth = items.first().outerWidth(true);
        const currentScroll = carousel.scrollLeft();
        const scrollAmount = direction === 'next' ? itemWidth : -itemWidth;
        
        carousel.animate({
            scrollLeft: currentScroll + scrollAmount
        }, 300);

        // Update button visibility
        updateButtonVisibility();
    }

    // Update navigation buttons visibility
    function updateButtonVisibility() {
        const maxScroll = carousel[0].scrollWidth - carousel[0].clientWidth;
        prevBtn.toggle(carousel.scrollLeft() > 0);
        nextBtn.toggle(carousel.scrollLeft() < maxScroll - 5);
    }

    // Handle mouse/touch events for drag scrolling
    carousel.on('mousedown touchstart', function(e) {
        isDragging = true;
        carousel.addClass('dragging');
        startPosition = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        scrollLeft = carousel.scrollLeft();
    });

    $(document).on('mousemove touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentPosition = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const walk = (startPosition - currentPosition) * 2;
        carousel.scrollLeft(scrollLeft + walk);
    });

    $(document).on('mouseup touchend', function() {
        isDragging = false;
        carousel.removeClass('dragging');
    });

    // Button click handlers
    nextBtn.click(() => updateCarousel('next'));
    prevBtn.click(() => updateCarousel('prev'));

    // Update on scroll
    carousel.on('scroll', updateButtonVisibility);

    // Update on window resize
    $(window).resize(function() {
        updateButtonVisibility();
    });

    // Initial setup
    updateButtonVisibility();
});

function navigateToCategory(category) {
    window.location.href = `category-recipes.html?category=${encodeURIComponent(category)}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    // Toggle mobile menu visibility
    mobileMenuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('show');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    });

    // Close menu when window is resized beyond mobile breakpoint
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) {
            mobileMenu.classList.remove('show');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        }
    });
});



