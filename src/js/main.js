// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
    // Initialize any components
    initializeCategories();
    initializeMobileMenu();
    initializeFeatureCards();
    initializeTradingChart();
    initializeChartControls();
    initializeAboutSection();
    initializeContactForm();
});

function initializeCategories() {
    const categories = document.querySelectorAll('.category');
    
    categories.forEach(category => {
        // Add hover effect
        category.addEventListener('mouseenter', () => {
            category.style.transform = 'scale(1.05)';
            category.style.transition = 'transform 0.3s ease';
        });
        
        category.addEventListener('mouseleave', () => {
            category.style.transform = 'scale(1)';
        });
    });
}

function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');
    
    mobileMenuBtn.addEventListener('click', () => {
        navbar.classList.toggle('menu-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navbar.classList.contains('menu-open')) {
            navbar.classList.remove('menu-open');
        }
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('menu-open');
        });
    });
}

function initializeFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach(card => {
        // Wrap card content
        const content = document.createElement('div');
        content.className = 'content';
        while (card.firstChild) {
            content.appendChild(card.firstChild);
        }
        card.appendChild(content);

        // Mouse move effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            // Apply transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            content.style.transform = 'translateZ(50px)';
            
            // Light effect
            const mouseX = ((x / rect.width) * 100).toFixed(2);
            const mouseY = ((y / rect.height) * 100).toFixed(2);
            card.style.setProperty('--mouse-x', `${mouseX}%`);
            card.style.setProperty('--mouse-y', `${mouseY}%`);
        });
        
        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            content.style.transform = 'translateZ(0)';
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });

        // Smooth transition on mouse enter
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.3s ease';
            content.style.transition = 'transform 0.3s ease';
        });

        // Remove transition on mouse move for smooth tilt
        card.addEventListener('mousemove', () => {
            card.style.transition = 'none';
            content.style.transition = 'none';
        });
    });
}

function initializeTradingChart() {
    const ctx = document.getElementById('tradingChart').getContext('2d');
    
    // Generate sample data
    const labels = [];
    const prices = [];
    let price = 48000;
    
    for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);
        price += (Math.random() - 0.5) * 1000;
        prices.push(price);
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(92, 36, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(92, 36, 255, 0)');

    // Chart configuration
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'BTC/USDT',
                data: prices,
                borderColor: '#5C24FF',
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#5C24FF',
                pointHoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        maxRotation: 0
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        callback: value => `$${value.toLocaleString()}`
                    }
                }
            }
        }
    });
}

function initializeChartControls() {
    const buttons = document.querySelectorAll('.chart-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Here you would typically update the chart data based on the timeframe
            // For demo purposes, we'll just update the price and change randomly
            updatePriceAndChange();
        });
    });
}

function updatePriceAndChange() {
    const price = document.querySelector('.price');
    const change = document.querySelector('.change');
    
    // Generate random price change
    const changeValue = (Math.random() * 10 - 5).toFixed(2);
    const newPrice = (48256.12 + parseFloat(changeValue)).toFixed(2);
    
    price.textContent = `$${newPrice}`;
    change.textContent = `${changeValue > 0 ? '+' : ''}${changeValue}%`;
    change.className = `change ${changeValue > 0 ? 'positive' : 'negative'}`;
}

function initializeAboutSection() {
    animateStatsOnScroll();
    animateTimelineOnScroll();
}

function animateStatsOnScroll() {
    const stats = document.querySelectorAll('.stat-item h3');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const value = parseFloat(target.textContent.replace(/[^0-9.]/g, ''));
                animateValue(target, 0, value, 2000);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        let currentValue = progress * (end - start) + start;
        if (currentValue > 999) {
            currentValue = currentValue.toLocaleString();
        }
        
        // Add appropriate suffix (B+, K+, %)
        if (obj.textContent.includes('B')) {
            obj.textContent = `$${currentValue.toFixed(1)}B+`;
        } else if (obj.textContent.includes('K')) {
            obj.textContent = `${Math.floor(currentValue)}K+`;
        } else if (obj.textContent.includes('%')) {
            obj.textContent = `${currentValue.toFixed(1)}%`;
        } else {
            obj.textContent = `${Math.floor(currentValue)}+`;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function animateTimelineOnScroll() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(item);
    });
}

function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const formGroups = document.querySelectorAll('.form-group');
    
    // Add floating label effect
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const label = group.querySelector('label');
        
        if (input && label) {
            // Check initial state
            if (input.value) {
                label.classList.add('active');
            }
            
            // Handle input events
            input.addEventListener('focus', () => {
                label.classList.add('active');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.classList.remove('active');
                }
            });
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Disable form while submitting
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showSuccessMessage(form);
            
            // Reset form
            form.reset();
            
            // Reset floating labels
            formGroups.forEach(group => {
                const label = group.querySelector('label');
                if (label) {
                    label.classList.remove('active');
                }
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            showErrorMessage(form);
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

function showSuccessMessage(form) {
    // Remove any existing messages
    removeMessages();
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Thank you! Your message has been sent successfully.';
    
    // Add message after form
    form.parentNode.insertBefore(successMessage, form.nextSibling);
    
    // Show message with animation
    requestAnimationFrame(() => {
        successMessage.classList.add('show');
    });
    
    // Remove message after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
        setTimeout(() => {
            successMessage.remove();
        }, 300);
    }, 5000);
}

function showErrorMessage(form) {
    // Remove any existing messages
    removeMessages();
    
    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Oops! Something went wrong. Please try again later.';
    
    // Add message after form
    form.parentNode.insertBefore(errorMessage, form.nextSibling);
    
    // Show message with animation
    requestAnimationFrame(() => {
        errorMessage.classList.add('show');
    });
    
    // Remove message after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
        setTimeout(() => {
            errorMessage.remove();
        }, 300);
    }, 5000);
}

function removeMessages() {
    const messages = document.querySelectorAll('.success-message, .error-message');
    messages.forEach(message => message.remove());
} 