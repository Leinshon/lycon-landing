/**
 * Lycon Planning - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initTypedText();
    initSmoothScroll();
    initHeaderScroll();
    initScrollAnimations();
    initCurrentYear();
    initTimelineProgress();
    initBrandStoryModal();
    initCalculatorModal();
});

/**
 * Set Current Year in Footer
 */
function initCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');

            // Update aria-label
            const isOpen = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-label', '메뉴 열기');
            }
        });

        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-label', '메뉴 열기');
            });
        });
    }
}

/**
 * Typed Text Animation
 */
function initTypedText() {
    const typedElement = document.getElementById('typedText');
    if (!typedElement) return;

    const words = [
        '스마트하게 설계하세요',
        '체계적으로 관리하세요',
        '안전하게 준비하세요',
        '현명하게 계획하세요'
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typedElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typedElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            // Pause at end of word
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing animation
    setTimeout(type, 1000);
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#" or a button/action link (modal triggers handled separately)
            if (href === '#' || href.startsWith('#signup') || href.startsWith('#login') ||
                href.startsWith('#contact') || href.startsWith('#calculator') || href.startsWith('#learn-more')) {
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Header Background on Scroll (with throttle)
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 50) {
                    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.boxShadow = 'none';
                }

                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Scroll Animations - Toss Style (통합 IntersectionObserver)
 */
function initScrollAnimations() {
    // Add fade-in class to animatable elements
    const animatableSelectors = [
        '.section-header',
        '.feature-card',
        '.pricing-card',
        '.cta-calculator > *'
    ];

    animatableSelectors.forEach(function(selector) {
        document.querySelectorAll(selector).forEach(function(el, index) {
            el.classList.add('fade-in');
            el.style.transitionDelay = (index % 4) * 0.1 + 's';
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Story chapter 애니메이션 처리
                if (entry.target.classList.contains('story-chapter')) {
                    // Animate status bars when visible
                    const statusBars = entry.target.querySelectorAll('.status-bar');
                    statusBars.forEach(function(bar) {
                        const classes = Array.from(bar.classList).filter(function(c) {
                            return c.startsWith('satisfaction-');
                        });
                        if (classes.length > 0) {
                            bar.classList.remove(classes[0]);
                            setTimeout(function() {
                                bar.classList.add(classes[0]);
                            }, 300);
                        }
                    });
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(function(el) {
        observer.observe(el);
    });

    // Observe story chapters
    document.querySelectorAll('.story-chapter').forEach(function(chapter) {
        observer.observe(chapter);
    });
}

/**
 * Timeline Progress Bar - Scroll-based progress indicator
 */
function initTimelineProgress() {
    const storySection = document.querySelector('.story-section');
    const progressFill = document.getElementById('timelineProgress');
    const progressContainer = document.querySelector('.timeline-progress-container');
    const markers = document.querySelectorAll('.timeline-marker');
    const chapters = document.querySelectorAll('.story-chapter');
    const storyCta = document.querySelector('.story-cta');

    if (!storySection || !progressFill || markers.length === 0) return;

    // Chapter to marker index mapping based on age (5 markers now)
    // Chapter 1,2: 45세 -> marker 0
    // Chapter 3: 55세 -> marker 1
    // Chapter 4: 60세 -> marker 2
    // Chapter 5,6: 65세 -> marker 3
    // Chapter 7: 70세 -> marker 4
    const chapterToMarkerMap = {
        '1': 0,  // 45세
        '2': 0,  // 45세
        '3': 1,  // 55세
        '4': 2,  // 60세
        '5': 3,  // 65세
        '6': 3,  // 65세
        '7': 4   // 70세
    };

    let ticking = false;

    function updateProgress() {
        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.4; // 화면의 40% 지점

        // Hide progress bar when Story CTA section is visible
        if (storyCta && progressContainer) {
            const ctaRect = storyCta.getBoundingClientRect();
            if (ctaRect.top < windowHeight * 0.6) {
                progressContainer.style.opacity = '0';
                progressContainer.style.pointerEvents = 'none';
            } else {
                progressContainer.style.opacity = '1';
                progressContainer.style.pointerEvents = 'auto';
            }
        }

        // Find current active chapter based on which chapter's top is closest to trigger point
        let activeChapter = null;

        chapters.forEach(function(chapter) {
            const rect = chapter.getBoundingClientRect();
            const chapterTop = rect.top;

            // 챕터가 화면에 들어왔고, 트리거 포인트를 지나갔을 때
            if (chapterTop < triggerPoint && chapterTop > -rect.height) {
                activeChapter = chapter.getAttribute('data-chapter');
            }
        });

        // Calculate progress bar width based on active chapter (4 intervals for 5 markers)
        let progress = 0;
        if (activeChapter) {
            const markerIndex = chapterToMarkerMap[activeChapter];
            progress = markerIndex * (100 / 4);
        }

        progressFill.style.width = progress + '%';

        // Update markers
        markers.forEach(function(marker, index) {
            marker.classList.remove('active', 'passed');

            if (activeChapter) {
                const activeMarkerIndex = chapterToMarkerMap[activeChapter];

                if (index < activeMarkerIndex) {
                    marker.classList.add('passed');
                } else if (index === activeMarkerIndex) {
                    marker.classList.add('active');
                }
            }
        });

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateProgress();
            });
            ticking = true;
        }
    });

    // Initial update
    updateProgress();
}

/**
 * Brand Story Modal
 */
function initBrandStoryModal() {
    const openBtn = document.getElementById('openBrandStory');
    const closeBtn = document.getElementById('closeBrandStory');
    const modal = document.getElementById('brandStoryModal');
    const overlay = document.getElementById('modalOverlay');

    if (!openBtn || !modal) return;

    // Open modal
    openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal - close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal - overlay click
    if (overlay) {
        overlay.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal - ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Calculator Modal - Triggered from Misconception Card
 */
function initCalculatorModal() {
    const openTrigger = document.getElementById('openCalculatorModal');
    const closeBtn = document.getElementById('closeCalculatorModal');
    const modal = document.getElementById('calculatorModal');
    const overlay = document.getElementById('calculatorModalOverlay');

    // Modal calculator elements
    const modalAgeSlider = document.getElementById('modalAgeSlider');
    const modalInitialSlider = document.getElementById('modalInitialSlider');
    const modalAgeDisplay = document.getElementById('modalAgeDisplay');
    const modalInitialDisplay = document.getElementById('modalInitialDisplay');
    const modalInitialInvestment = document.getElementById('modalInitialInvestment');
    const modalMonthlyAmount = document.getElementById('modalMonthlyAmount');
    const modalTotalPrincipal = document.getElementById('modalTotalPrincipal');
    const modalTotalProfit = document.getElementById('modalTotalProfit');
    const modalTotalAmount = document.getElementById('modalTotalAmount');

    if (!openTrigger || !modal) return;

    // Constants
    const TARGET_AGE = 65;
    const TARGET_AMOUNT = 1000000000; // 10억원
    const ANNUAL_RATE = 0.07; // 7% annual return
    const MONTHLY_RATE = ANNUAL_RATE / 12;

    // Format functions
    function formatNumber(num) {
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function formatToEok(num) {
        const eok = num / 100000000;
        if (eok >= 1) {
            return eok.toFixed(1).replace(/\.0$/, '') + '억원';
        }
        const man = num / 10000;
        if (man >= 1) {
            return formatNumber(Math.round(man)) + '만원';
        }
        return formatNumber(num) + '원';
    }

    function formatInitialDisplay(valueInMan) {
        if (valueInMan === 0) {
            return '0원';
        }
        if (valueInMan >= 10000) {
            return (valueInMan / 10000) + '억원';
        }
        return formatNumber(valueInMan) + '만원';
    }

    // Calculate monthly investment needed after initial lump sum
    // FV = PV * (1+r)^n + PMT * ((1+r)^n - 1) / r
    // Solving for PMT: PMT = (FV - PV * (1+r)^n) * r / ((1+r)^n - 1)
    function calculateMonthlyInvestment(startAge, initialInvestment) {
        const years = TARGET_AGE - startAge;
        const months = years * 12;

        if (months <= 0) {
            return { monthlyPayment: 0, monthlyTotal: 0, initialGrowth: 0, profit: 0, initialInvestment: initialInvestment };
        }

        // Future value of initial investment
        const initialFV = initialInvestment * Math.pow(1 + MONTHLY_RATE, months);

        // Remaining amount needed from monthly contributions
        const remainingTarget = TARGET_AMOUNT - initialFV;

        // If initial investment grows enough, no monthly payment needed
        if (remainingTarget <= 0) {
            const profit = TARGET_AMOUNT - initialInvestment;
            return { monthlyPayment: 0, monthlyTotal: 0, initialGrowth: initialFV, profit: profit, initialInvestment: initialInvestment };
        }

        // Monthly payment needed for the remaining amount
        const monthlyPayment = remainingTarget * MONTHLY_RATE /
            (Math.pow(1 + MONTHLY_RATE, months) - 1);

        const monthlyTotal = monthlyPayment * months;
        const totalPrincipal = initialInvestment + monthlyTotal;
        const profit = TARGET_AMOUNT - totalPrincipal;

        return { monthlyPayment, monthlyTotal, initialGrowth: initialFV, profit, initialInvestment: initialInvestment };
    }

    function updateModalDisplay() {
        const age = parseInt(modalAgeSlider.value);
        const initialInMan = parseInt(modalInitialSlider.value); // 만원 단위
        const initialInvestment = initialInMan * 10000; // 원 단위로 변환

        const result = calculateMonthlyInvestment(age, initialInvestment);

        // Update displays
        modalAgeDisplay.textContent = age + '세';
        modalInitialDisplay.textContent = formatInitialDisplay(initialInMan);
        modalInitialInvestment.textContent = formatInitialDisplay(initialInMan);

        if (result.monthlyPayment >= 0) {
            if (result.monthlyPayment === 0) {
                modalMonthlyAmount.textContent = '추가 필요없음';
            } else {
                modalMonthlyAmount.textContent = formatNumber(result.monthlyPayment) + '원';
            }
            modalTotalPrincipal.textContent = formatToEok(result.monthlyTotal);
            modalTotalProfit.textContent = '+' + formatToEok(result.profit);
            modalTotalAmount.textContent = '10억원';
        } else {
            modalMonthlyAmount.textContent = '-';
            modalTotalPrincipal.textContent = '-';
            modalTotalProfit.textContent = '-';
            modalTotalAmount.textContent = '-';
        }
    }

    // Function to open modal
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateModalDisplay();
    }

    // Open modal - clicking anywhere on the card or the button
    openTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
    });

    // Open modal from #calculator links
    document.querySelectorAll('a[href="#calculator"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });

    // Slider event listeners
    if (modalAgeSlider) {
        modalAgeSlider.addEventListener('input', function() {
            updateModalDisplay();
        });
    }

    if (modalInitialSlider) {
        modalInitialSlider.addEventListener('input', function() {
            updateModalDisplay();
        });
    }

    // Close modal - close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal - overlay click
    if (overlay) {
        overlay.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal - ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

