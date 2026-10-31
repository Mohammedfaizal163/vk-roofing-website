/**
 * VK Roofings and Sheds - Main Interactive Script
 * Provides: Cost Calculator, Mobile Drawer, Project Filters, Lightbox, Quote Modal, FAQ Accordions
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initEstimatorCalculator();
  initProjectFilters();
  initFaqAccordion();
  initQuoteModal();
  initMaterialTabs();
  initLightbox();
});

/* ==========================================================================
   1. Mobile Drawer Navigation
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('close-mobile-menu');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');

  if (!menuBtn || !drawer) return;

  function openMenu() {
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    setTimeout(() => backdrop.classList.add('opacity-100'), 10);
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.add('translate-x-full');
    backdrop.classList.remove('opacity-100');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Close when clicking internal links
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   2. Interactive Roofing Cost & Material Estimator
   ========================================================================== */
function initEstimatorCalculator() {
  const projectTypeSelect = document.getElementById('calc-project-type');
  const areaSlider = document.getElementById('calc-area-slider');
  const areaNumber = document.getElementById('calc-area-number');
  const materialSelect = document.getElementById('calc-material');
  const minPriceEl = document.getElementById('calc-min-price');
  const maxPriceEl = document.getElementById('calc-max-price');
  const whatsappQuoteBtn = document.getElementById('calc-whatsapp-btn');

  if (!areaSlider || !minPriceEl) return;

  // Base rates per sq. ft (approximate standard rates for Tamil Nadu)
  const rates = {
    residential: {
      ppgl: [130, 180],
      tile: [190, 290],
      metal: [140, 210],
      puf: [220, 310]
    },
    industrial: {
      ppgl: [160, 240],
      galvalume: [175, 260],
      puf: [240, 360],
      standing_seam: [280, 420]
    },
    commercial: {
      ppgl: [165, 250],
      polycarbonate: [210, 320],
      puf: [250, 380]
    },
    platform: {
      standard_ms: [360, 520],
      heavy_duty: [480, 750]
    },
    sports: {
      ppgl: [210, 310],
      puf: [280, 420]
    }
  };

  function updateCalculation() {
    const pType = projectTypeSelect ? projectTypeSelect.value : 'industrial';
    const area = parseInt(areaSlider.value, 10) || 1500;
    const material = materialSelect ? materialSelect.value : 'ppgl';

    let rateRange = [160, 250];
    if (rates[pType] && rates[pType][material]) {
      rateRange = rates[pType][material];
    } else if (rates[pType]) {
      const keys = Object.keys(rates[pType]);
      rateRange = rates[pType][keys[0]];
    }

    const minTotal = Math.round(area * rateRange[0]);
    const maxTotal = Math.round(area * rateRange[1]);

    minPriceEl.textContent = formatINR(minTotal);
    maxPriceEl.textContent = formatINR(maxTotal);

    if (whatsappQuoteBtn) {
      const typeLabel = projectTypeSelect ? projectTypeSelect.options[projectTypeSelect.selectedIndex].text : pType;
      const matLabel = materialSelect ? materialSelect.options[materialSelect.selectedIndex].text : material;
      const text = encodeURIComponent(
        `Hello VK Roofings & Sheds,\n\nI used your online calculator for an estimate:\n• Project Type: ${typeLabel}\n• Area: ${area.toLocaleString('en-IN')} sq. ft.\n• Preferred Material: ${matLabel}\n• Estimated Budget: ${formatINR(minTotal)} - ${formatINR(maxTotal)}\n\nPlease provide an official quotation and inspection schedule for my site in Tamil Nadu.`
      );
      whatsappQuoteBtn.href = `https://wa.me/919094785431?text=${text}`;
    }
  }

  function formatINR(amount) {
    if (amount >= 100000) {
      return '₹ ' + (amount / 100000).toFixed(2) + ' Lakhs';
    }
    return '₹ ' + amount.toLocaleString('en-IN');
  }

  if (areaSlider && areaNumber) {
    areaSlider.addEventListener('input', (e) => {
      areaNumber.value = e.target.value;
      updateCalculation();
    });
    areaNumber.addEventListener('input', (e) => {
      areaSlider.value = e.target.value;
      updateCalculation();
    });
  }

  if (projectTypeSelect) {
    projectTypeSelect.addEventListener('change', () => {
      updateMaterialOptions();
      updateCalculation();
    });
  }

  if (materialSelect) {
    materialSelect.addEventListener('change', updateCalculation);
  }

  function updateMaterialOptions() {
    if (!projectTypeSelect || !materialSelect) return;
    const pType = projectTypeSelect.value;
    materialSelect.innerHTML = '';

    const optionsMap = {
      residential: [
        { val: 'tile', text: 'Classic Tile / Mangalore Style' },
        { val: 'metal', text: 'Color Coated Metal Sheet' },
        { val: 'puf', text: 'Insulated PUF Heat-Proof Panel' }
      ],
      industrial: [
        { val: 'ppgl', text: 'Color-Coated PPGI / PPGL Sheet' },
        { val: 'puf', text: 'Insulated PUF Sandwich Panel (Best Thermal Control)' },
        { val: 'galvalume', text: 'High Tensile Galvalume Sheet' },
        { val: 'standing_seam', text: 'Standing Seam Metal Roof' }
      ],
      commercial: [
        { val: 'ppgl', text: 'PPGL Color Coated Sheet' },
        { val: 'polycarbonate', text: 'Polycarbonate Skylight / Shed' },
        { val: 'puf', text: 'PUF Insulated Composite Panel' }
      ],
      platform: [
        { val: 'standard_ms', text: 'Standard MS Industrial Mezzanine' },
        { val: 'heavy_duty', text: 'Heavy Machinery Support Steel Platform' }
      ],
      sports: [
        { val: 'puf', text: 'Acoustic & Thermal PUF Panel (Badminton Court)' },
        { val: 'ppgl', text: 'Curved High-Span PPGL Shed' }
      ]
    };

    const list = optionsMap[pType] || optionsMap.industrial;
    list.forEach(opt => {
      const el = document.createElement('option');
      el.value = opt.val;
      el.textContent = opt.text;
      materialSelect.appendChild(el);
    });
  }

  // Initial calculation
  updateCalculation();
}

/* ==========================================================================
   3. Interactive Project Portfolio Filters
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold', 'shadow-md');
        b.classList.add('bg-slate-100', 'text-slate-700', 'border-slate-200');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold', 'shadow-md');
      btn.classList.remove('bg-slate-100', 'text-slate-700', 'border-slate-200');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter || (filter === 'commercial' && category.includes('commercial'))) {
          card.style.display = 'block';
          card.classList.add('animate-fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. Interactive FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = !answer.classList.contains('hidden');

      // Close all others
      items.forEach(other => {
        const otherAns = other.querySelector('.faq-answer');
        const otherIcon = other.querySelector('.faq-icon');
        if (otherAns) otherAns.classList.add('hidden');
        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        answer.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

/* ==========================================================================
   5. Interactive Quote Modal
   ========================================================================== */
function initQuoteModal() {
  const modal = document.getElementById('quote-modal');
  const backdrop = document.getElementById('quote-modal-backdrop');
  const closeBtns = document.querySelectorAll('.close-quote-modal');
  const openBtns = document.querySelectorAll('[data-quote-modal]');
  const form = document.getElementById('quote-modal-form');

  if (!modal) return;

  function openModal(defaultService = '') {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (defaultService && form) {
      const select = form.querySelector('[name="service"]');
      if (select) select.value = defaultService;
    }
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      openModal(service);
    });
  });

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value;
      const phone = form.querySelector('[name="phone"]').value;
      const service = form.querySelector('[name="service"]').value;
      const message = form.querySelector('[name="message"]').value;
      const location = form.querySelector('[name="location"]')?.value || 'Tamil Nadu';

      const waMsg = encodeURIComponent(
        `*New Website Quote Request*\n\n• Name: ${name}\n• Phone: ${phone}\n• Service: ${service}\n• Location: ${location}\n• Details: ${message}`
      );

      // Open WhatsApp with prefilled lead details
      window.open(`https://wa.me/919094785431?text=${waMsg}`, '_blank');
      showToast('Thank you! Redirecting to WhatsApp to send your quote request.');
      closeModal();
      form.reset();
    });
  }
}

/* ==========================================================================
   6. Material Comparison Tabs
   ========================================================================== */
function initMaterialTabs() {
  const tabBtns = document.querySelectorAll('.material-tab-btn');
  const tabPanels = document.querySelectorAll('.material-tab-panel');

  if (!tabBtns.length || !tabPanels.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'shadow-md', 'font-bold');
        b.classList.add('bg-slate-100', 'text-slate-700', 'border-slate-200');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'shadow-md', 'font-bold');
      btn.classList.remove('bg-slate-100', 'text-slate-700', 'border-slate-200');

      const targetId = btn.getAttribute('data-target');
      tabPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   7. Image Lightbox
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('close-lightbox');

  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const src = el.getAttribute('data-src') || el.querySelector('img')?.src;
      const title = el.getAttribute('data-title') || el.querySelector('img')?.alt || 'Project Photo';
      if (src) {
        lightboxImg.src = src;
        if (lightboxCaption) lightboxCaption.textContent = title;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   Utility: Toast Notification
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-amber-500 text-white px-6 py-3.5 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 opacity-0 translate-y-4';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4');
  }, 4000);
}
