document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    console.log('scrollY:', window.scrollY); // тест
    if (window.scrollY > 50) {
      header.classList.add('sticky');
      document.body.classList.add('header-sticky');
    } else {
      header.classList.remove('sticky');
      document.body.classList.remove('header-sticky');
    }
  });
  
  // ✅ СЛАЙДЕР "ДО/ПОСЛЕ" (переменные только для HERO)
  const slider = document.querySelector(".slider-container");
  const handle = document.querySelector(".slider-handle");
  const dirtyShoe = document.querySelector(".dirty-shoe");
  const cleanShoe = document.querySelector(".clean-shoe");

  let heroIsDragging = false;
  let heroStartX = 0;

  const moveSlider = (percent) => {
    const clipLeft = percent + "%";
    const clipRight = 100 - percent + "%";

    dirtyShoe.style.clipPath = `inset(0 ${clipRight} 0 0)`;
    cleanShoe.style.clipPath = `inset(0 0 0 ${clipLeft})`;
    handle.style.left = percent + "%";
  };

  const handleStart = (e) => {
    heroIsDragging = true;
    heroStartX = e.clientX || e.touches[0].clientX;
    slider.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };

  const handleMove = (e) => {
    if (!heroIsDragging) return;
    e.preventDefault();
    const rect = slider.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    moveSlider(percent);
  };

  const handleEnd = () => {
    heroIsDragging = false;
    slider.style.cursor = "grab";
    document.body.style.userSelect = "";
  };

  if (handle) {
    handle.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    handle.addEventListener("touchstart", handleStart, { passive: false });
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
  }

  window.addEventListener("resize", () => {
    moveSlider(50);
  });
  moveSlider(50);

  // ✅ ГОРОДА + ТЕЛЕФОНЫ (Десктоп + Мобильное меню)
  const locationToggle = document.getElementById("locationToggle");
  const dropdown = document.getElementById("cityDropdown");
  const phoneSpan = document.getElementById("phoneSpan");
  const mobileLocationToggle = document.getElementById("mobileLocationToggle");
  const mobileCityDropdown = document.getElementById("mobileCityDropdown");
  const mobileCitySpan = document.getElementById("mobileCity");
  const mobilePhoneSpan = document.getElementById("mobilePhone");

  const phones = {
    Иркутск: "📱 +7 (3952) 123-456",
    Москва: "📱 +7 (495) 123-45-67",
    "Санкт-Петербург": "📱 +7 (812) 123-45-67",
    Бишкек: "📱 +996 (312) 12-34-56",
  };

  function updateAllCities(city) {
  const phoneText = phones[city] || phones["Иркутск"];
  
  // ✅ Хедер — убираем "г. " 
  document.getElementById('cityName').textContent = city; // ← БЫЛО: `г. ${city}`
  document.getElementById('phoneSpan').textContent = phoneText;
  
  // Остальной код...
  dropdown.classList.remove("active");
  console.log(`✅ Город: ${city}`);
}

  // ✅ ДЕСКТОП DROPDOWN
  if (locationToggle) {
    locationToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (dropdown) dropdown.classList.toggle("active");
    });
  }

  if (dropdown) {
    dropdown.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const city = e.target.textContent.trim();
        updateAllCities(city);
        dropdown.classList.remove("active");
        console.log(`✅ Десктоп - Город: ${city}`);
      });
    });
  }

  // ✅ МОБИЛЬНЫЙ DROPDOWN В МЕНЮ
  if (mobileLocationToggle) {
    mobileLocationToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (mobileCityDropdown) mobileCityDropdown.classList.toggle("active");
    });
  }

  if (mobileCityDropdown) {
    mobileCityDropdown.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const city = e.target.textContent.trim();
        updateAllCities(city);
        mobileCityDropdown.classList.remove("active");
        console.log(`✅ Мобильное меню - Город: ${city}`);
      });
    });
  }

  // Закрытие dropdown'ов по клику вне
  document.addEventListener("click", (e) => {
    if (locationToggle && !locationToggle.contains(e.target)) {
      if (dropdown) dropdown.classList.remove("active");
    }
    if (mobileLocationToggle && !mobileLocationToggle.contains(e.target)) {
      if (mobileCityDropdown) mobileCityDropdown.classList.remove("active");
    }
  });

  // ✅ БУРГЕР МЕНЮ
  const burger = document.getElementById("burger");
  const nav = document.getElementById("navMobile");
  const overlay = document.getElementById("overlay");

  function toggleMenu() {
    if (burger) burger.classList.toggle("active");
    if (nav) nav.classList.toggle("active");
    document.body.classList.toggle("menu-open");
    if (overlay) overlay.classList.toggle("active");
    if (mobileCityDropdown) mobileCityDropdown.classList.remove("active");
  }

  if (burger) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleMenu();
    });
  }

  if (nav) {
    nav.querySelectorAll("a:not(.dropdown-item)").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        toggleMenu();
      });
    });
  }

  if (overlay) {
    overlay.addEventListener("click", toggleMenu);
  }

  // ✅ КАРУСЕЛЬ УСЛУГ С ПЕРЕТАСКИВАНИЕМ
  async function initServicesCarousel() {
    const slideWidth = 344; // 🔥 ДОБАВЬ ЭТУ СТРОКУ!!!
    try {
      const response = await fetch("services.json");
      const services = await response.json();

      const track = document.getElementById("carouselTrack");
      const carousel = document.querySelector(".services-carousel");
      if (!track || !carousel) return;

      let currentIndex = 0;
      let cardsPerView = window.innerWidth > 900 ? 3 : 1;
      let carouselIsDragging = false;
      let carouselStartX = 0;
      let startTranslate = 0;
      let currentTranslate = 0;

      // Создаем карточки услуг
      services.forEach((service) => {
        const card = document.createElement("div");
        card.className = "service-card";
        card.innerHTML = `
          <div class="service-image" style="background-image: url(${service.image})"></div>
          <h3 class="service-title">${service.title}</h3>
          <p class="service-details">${service.short}</p>
          <div class="service-price">${service.price}</div>
        `;
        track.appendChild(card);
      });

      const cards = track.children;
      const prevBtn = document.getElementById("prevBtn");
      const nextBtn = document.getElementById("nextBtn");

      function updateCarousel() {
  const translateX = -(currentIndex * slideWidth) - 22; // ← +22px центр!
  
  track.style.transform = `translateX(${translateX}px)`;
  
  requestAnimationFrame(() => {
    const slides = track.querySelectorAll('.review-slide');
    
    slides.forEach((slide, index) => {
      const distance = Math.abs(index - (4 + currentIndex)); // ← центр=4!
      
      if (distance <= 1) {
        const scale = 1 - (distance * 0.25);
        const size = 360 - (distance * 80);
        
        slide.style.transform = `scale(${scale})`;
        slide.style.height = `${size}px`;
        slide.style.width = `${size}px`;
        slide.style.flex = `0 0 ${size}px`;
        slide.style.opacity = '1';
      } else {
        slide.style.opacity = '0';
      }
    });
  });
}





      // ✅ ПЕРЕТАСКИВАНИЕ КАРУСЕЛИ
      function dragStart(e) {
        carouselIsDragging = true;
        carousel.classList.add("dragging");
        track.classList.add("dragging");

        carouselStartX = e.clientX || e.touches[0].clientX;
        startTranslate = currentTranslate;

        document.addEventListener("mousemove", dragMove);
        document.addEventListener("mouseup", dragEnd);
        document.addEventListener("touchmove", dragMove, { passive: false });
        document.addEventListener("touchend", dragEnd);
      }

      function dragMove(e) {
        if (!carouselIsDragging) return;
        e.preventDefault();

        const clientX = e.clientX || e.touches[0].clientX;
        const movedBy = carouselStartX - clientX;
        currentTranslate = startTranslate - movedBy;

        const cardWidth = cards[0]?.offsetWidth + 24;
        const maxTranslate = 0;
        const minTranslate = -(services.length - cardsPerView) * cardWidth;

        currentTranslate = Math.max(
          minTranslate,
          Math.min(maxTranslate, currentTranslate)
        );
        track.style.transform = `translateX(${currentTranslate}px)`;
      }

      function dragEnd() {
        carouselIsDragging = false;
        carousel.classList.remove("dragging");
        track.classList.remove("dragging");

        document.removeEventListener("mousemove", dragMove);
        document.removeEventListener("mouseup", dragEnd);
        document.removeEventListener("touchmove", dragMove);
        document.removeEventListener("touchend", dragEnd);

        const cardWidth = cards[0]?.offsetWidth + 24;
        currentIndex = Math.round(-currentTranslate / cardWidth);
        currentIndex = Math.max(
          0,
          Math.min(services.length - cardsPerView, currentIndex)
        );

        updateCarousel();
      }

      // Кнопки
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          currentIndex = Math.max(0, currentIndex - 1);
          updateCarousel();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          currentIndex = Math.min(
            services.length - cardsPerView,
            currentIndex + 1
          );
          updateCarousel();
        });
      }

      // ✅ СОБЫТИЯ ПЕРЕТАСКИВАНИЯ КАРУСЕЛИ
      carousel.addEventListener("mousedown", dragStart);
      carousel.addEventListener("touchstart", dragStart, { passive: false });

      window.addEventListener("resize", updateCarousel);
      updateCarousel();
    } catch (error) {
      console.error("❌ Ошибка загрузки услуг:", error);
    }
  }

  initServicesCarousel();
});

// ✅ ГАЛЕРЕЯ "О НАС" + МОДАЛКА — ЧИСТЫЙ КОД (ВСЕ ДУБЛИКАТЫ УДАЛЕНЫ!)
const galleryImages = [
  "./img/gallery/1.png",
  "./img/gallery/2.png",
  "./img/gallery/3.png",
  "./img/gallery/4.png",
  "./img/gallery/5.png",
  "./img/gallery/6.png",
  "./img/gallery/7.png",
  "./img/gallery/8.png",
];

let currentGalleryIndex = 0;
let modalIndex = 0;
let isModalOpen = false;

function initAboutGallery() {
  const track = document.getElementById("galleryTrack");
  if (!track) return;

  track.innerHTML = "";
  galleryImages.forEach((image, index) => {
    const slide = document.createElement("div");
    slide.className = "gallery-item";
    slide.style.cssText = `
      background-image: url(${image});
      background-size: cover;
      background-position: center;
      cursor: pointer;
    `;
    slide.addEventListener("click", (e) => openModalGallery(index));
    track.appendChild(slide);
  });

  // КНОПКИ ГАЛЕРЕИ
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");

  prevBtn?.addEventListener("click", () => {
    currentGalleryIndex = currentGalleryIndex > 0 ? currentGalleryIndex - 1 : 7;
    updateGallery();
  });

  nextBtn?.addEventListener("click", () => {
    currentGalleryIndex = currentGalleryIndex < 7 ? currentGalleryIndex + 1 : 0;
    updateGallery();
  });

  updateGallery();
}

function updateGallery() {
  const track = document.getElementById("galleryTrack");
  if (track) {
    track.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;
  }
}

function openModalGallery(startIndex = 0) {
  const modal = document.getElementById("modalGallery");
  const modalTrack = document.getElementById("modalTrack");

  if (!modal || !modalTrack) return;

  // ✅ ОЧИСТКА + НОВЫЕ СЛАЙДЫ
  modalTrack.innerHTML = "";
  galleryImages.forEach((image) => {
    const slide = document.createElement("div");
    slide.className = "modal-slide";
    slide.style.cssText = `
      background-image: url(${image});
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      width: 100%;
      height: 100%;
    `;
    modalTrack.appendChild(slide);
  });

  modalIndex = startIndex;
  updateModalGallery();
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  isModalOpen = true;
}

function updateModalGallery() {
  const modalTrack = document.getElementById("modalTrack");
  if (modalTrack && isModalOpen) {
    modalTrack.style.transform = `translateX(-${modalIndex * 100}%)`;
  }
}

function closeModalGallery() {
  const modal = document.getElementById("modalGallery");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
  isModalOpen = false;
}

// ✅ ЕДИНЫЙ ОБРАБОТЧИК ДЛЯ ВСЕХ КНОПОК МОДАЛКИ
document.addEventListener("click", (e) => {
  const modal = document.getElementById("modalGallery");

  if (!isModalOpen) return;

  // Закрытие
  if (e.target.id === "modalClose" || e.target.id === "modalOverlay") {
    closeModalGallery();
  }
  // Навигация
  else if (e.target.id === "modalPrev") {
    e.preventDefault();
    e.stopPropagation();
    modalIndex = modalIndex > 0 ? modalIndex - 1 : galleryImages.length - 1;
    updateModalGallery();
  } else if (e.target.id === "modalNext") {
    e.preventDefault();
    e.stopPropagation();
    modalIndex = modalIndex < galleryImages.length - 1 ? modalIndex + 1 : 0;
    updateModalGallery();
  }
});

document.addEventListener("keydown", (e) => {
  if (!isModalOpen || e.key !== "Escape") return;
  closeModalGallery();
});

// ✅ ЗАПУСК
initAboutGallery();

// ✅ УСЛУГИ + ОТЗЫВЫ — ПОЛНЫЙ РАБОЧИЙ БЛОК
// ✅ БЛОК ОТЗЫВЫ — 3 БЕСКОНЕЧНЫХ КАРТИНКИ (мал-больш-мал)
// 🔥 ИСПРАВЛЕННЫЙ БЛОК ОТЗЫВОВ — ТОЛЬКО 3 ВИДИМЫХ
// ✅ ЗАМЕНИ ВЕСЬ БЛОК ОТЗЫВОВ В script.js (найди initServicesAndReviews)

// ✅ ЗАМЕНИ ВЕСЬ БЛОК ОТЗЫВОВ В script.js (найди initServicesAndReviews)

async function initServicesAndReviews() {
  // 1. УСЛУГИ И ЦЕНЫ (без изменений)
  try {
    const response = await fetch("services.json");
    const services = await response.json();
    const grid = document.getElementById("servicesGrid");
    
    if (grid) {
      grid.innerHTML = "";
      services.forEach((service) => {
        const card = document.createElement("div");
        card.className = "service-price-card";
        card.innerHTML = `
          <div class="service-price-image" style="background-image: url(${service.image})"></div>
          <h3 class="service-price-title">${service.title}</h3>
          <p class="service-price-desc">${service.short}</p>
          <div class="service-price-bottom">
            <div class="service-price-price">${service.price}</div>
            <div class="add-to-cart">
              <div class="plus">+</div>
              <span>В корзину</span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
      console.log("✅ Услуги загружены");
    }
  } catch (error) {
    console.error("❌ Ошибка услуг:", error);
  }

  // 🔥 2. ОТЗЫВЫ — ИДЕАЛЬНАЯ КАРУСЕЛЬ 3 БЕСКОНЕЧНЫХ КАРТИНКИ
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  
  if (!track) return;
  
  const reviewsData = [
    './img/otzivi/1.png',
    './img/otzivi/2.png', 
    './img/otzivi/3.png'
  ];
  
  let currentIndex = 0; // 0=1я большая, 1=2я большая, 2=3я большая
  const slideWidth = 344; // 300px + 24px gap
  const totalSlides = 3;

  function createSlides() {
    track.innerHTML = '';
    // 🔥 9 слайдов: [1][2][3][1][2][3][1][2][3]
    for (let i = 0; i < 9; i++) {
      const slide = document.createElement('div');
      slide.className = 'review-slide';
      const imgIndex = i % totalSlides;
      slide.style.backgroundImage = `url(${reviewsData[imgIndex]})`;
      slide.dataset.index = imgIndex;
      track.appendChild(slide);
    }
  }
  
  function updateCarousel() {
    // 🔥 Центр = слайд №4 (индекс 3 из 0-8)
    const centerSlide = 4 + currentIndex;
    const translateX = -(currentIndex * slideWidth);

  track.style.paddingLeft = '220px'; 
  track.style.transform = `translateX(-${currentIndex * 344 - 120}px)`;
  track.style.marginLeft = '-110px !important';
    
    // 🔥 АНИМАЦИЯ размеров через requestAnimationFrame
    requestAnimationFrame(() => {
      const slides = track.querySelectorAll('.review-slide');
      
      slides.forEach((slide, index) => {
        const distance = Math.abs(index - (4 + currentIndex)); // центр = 3+currentIndex
        
        if (distance <= 1) { // только 3 видимых
          const scale = 1 - (distance * 0.25); // центр=1.0, бока=0.75
          const size = 360 - (distance * 80);   // центр=360px, бока=280px
          
          slide.style.transform = `scale(${scale})`;
          slide.style.height = `${size}px`;
          slide.style.minHeight = `${size}px`;
          slide.style.width = `${size}px`;
          slide.style.minWidth = `${size}px`;
          slide.style.flex = `0 0 ${size}px`;
          slide.style.opacity = '1';
          slide.style.zIndex = 10 - distance;
          slide.style.boxShadow = `0 ${20 * scale}px ${40 * scale}px rgba(0,0,0,${scale * 0.2})`;
        } else {
          // остальные скрываем
          slide.style.opacity = '0';
          slide.style.transform = 'scale(0.5)';
          slide.style.height = '200px';
          slide.style.flex = '0 0 200px';
        }
      });
    });
  }

  // 🔥 СВАЙП ДЛЯ МОБИЛКИ
let isDragging = false;
let startX = 0;

track.addEventListener('touchstart', (e) => {
  isDragging = true;
  startX = e.touches[0].clientX;
}, { passive: true });

track.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const currentX = e.touches[0].clientX;
  const diffX = startX - currentX;
  
  if (Math.abs(diffX) > 50) { // свайп > 50px
    if (diffX > 0) currentIndex = (currentIndex + 1) % totalSlides; // вправо
    else currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; // влево
    updateCarousel();
    isDragging = false;
  }
}, { passive: false });

track.addEventListener('touchend', () => {
  isDragging = false;
});

  
  // ✅ Стрелки — БЕСКОНЕЧНЫЙ цикл
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateCarousel();
    });
  }
  
  // ✅ СТАРТ
  createSlides();
  updateCarousel();
  console.log("✅ Отзывы: идеальная карусель готова!");
}

// ✅ ЗАПУСК ОТЗЫВОВ
initServicesAndReviews();


// ✅ АККОРДЕОН FAQ
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const isActive = item.classList.contains('active');
    
    // Закрываем все
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    
    // Открываем кликнутый (если был закрыт)
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// ✅ ГЛОБАЛЬНЫЙ ОБЪЕКТ КОРЗИНЫ
let cart = {
  items: [],
  count: 0,
  total: 0
};

// ✅ ИНИЦИАЛИЗАЦИЯ КОРЗИНЫ из localStorage
function initCart() {
  const saved = localStorage.getItem('shoeCleaningCart');
  if (saved) {
    cart = { ...cart, ...JSON.parse(saved) };
  }
  updateCartBadge();
  updateCartDrawer();
}

// ✅ СОХРАНЕНИЕ В localStorage
function saveCart() {
  localStorage.setItem('shoeCleaningCart', JSON.stringify(cart));
  updateCartBadge();
  updateCartDrawer();
}

// ✅ ОБНОВЛЕНИЕ БЕЙДЖА В HEADER
function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(badge => {
    const totalEl = badge.querySelector('.cart-total');
    
    // ✅ ТОЛЬКО РУБЛИ
    totalEl.textContent = cart.total.toLocaleString() + ' ₽';
    
    if (cart.total > 0) {
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  });
}


// ✅ РЕНДЕР КОРЗИНЫ (drawer)
function updateCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const itemsContainer = document.getElementById('cartItems');
  const emptyState = document.getElementById('cartEmpty');
  const cartItemCount = document.getElementById('cartItemCount');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const cartFooter = document.getElementById('cartFooter');

  cartItemCount.textContent = cart.count;
  cartTotalPrice.textContent = cart.total.toLocaleString() + ' ₽';

  if (cart.items.length === 0) {
    itemsContainer.style.display = 'none';
    emptyState.style.display = 'flex';
    cartFooter.style.display = 'none';
    checkoutBtn.disabled = true;
  } else {
    itemsContainer.style.display = 'block';
    emptyState.style.display = 'none';
    cartFooter.style.display = 'block';
    checkoutBtn.disabled = false;
    
    // ✅ РЕНДЕР ТОВАРОВ
    itemsContainer.innerHTML = '';
    cart.items.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-image" style="background-image: url(${item.image})"></div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
          <div class="cart-qty-controls">
            <button class="qty-btn" data-index="${index}" data-action="decrease">-</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
          </div>
          <div class="cart-item-total">${itemTotal.toLocaleString()} ₽</div>
        </div>
        <button class="cart-item-remove" data-index="${index}">×</button>
      `;
      itemsContainer.appendChild(itemEl);
    });
  }
}

// ✅ ДОБАВЛЕНИЕ ТОВАРА
function addToCart(price, title, image) {
  // Ищем товар в корзине
  const existingItem = cart.items.find(item => item.title === title);
  
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.items.push({
      id: Date.now(), // уникальный ID
      title,
      price: parseInt(price),
      qty: 1,
      image
    });
  }
  
  cart.count++;
  cart.total += parseInt(price);
  
  saveCart();
}

// ✅ ИЗМЕНЕНИЕ КОЛИЧЕСТВА
function changeQty(index, action) {
  const item = cart.items[index];
  if (!item) return;
  
  if (action === 'increase') {
    item.qty++;
    cart.count++;
    cart.total += item.price;
  } else if (action === 'decrease' && item.qty > 1) {
    item.qty--;
    cart.count--;
    cart.total -= item.price;
  } else if (action === 'decrease' && item.qty === 1) {
    // Удаляем товар
    cart.items.splice(index, 1);
    cart.count--;
    cart.total -= item.price;
  }
  
  saveCart();
}

// ✅ УДАЛЕНИЕ ТОВАРА
function removeItem(index) {
  const item = cart.items[index];
  if (!item) return;
  
  cart.count -= item.qty;
  cart.total -= item.price * item.qty;
  cart.items.splice(index, 1);
  
  saveCart();
}

// ✅ ОТКРЫТИЕ/ЗАКРЫТИЕ КОРЗИНЫ
function toggleCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('overlay');
  
  drawer.classList.toggle('active');
  overlay?.classList.toggle('active');
  document.body.classList.toggle('cart-open');
}

// ✅ ОБРАБОТЧИКИ СОБЫТИЙ КОРЗИНЫ
document.addEventListener('click', function(e) {
  // ✅ КЛИК ПО "В КОРЗИНУ" (услуги)
  if (e.target.closest('.add-to-cart')) {
    e.preventDefault();
    const card = e.target.closest('.service-price-card');
    const priceEl = card.querySelector('.service-price-price');
    const titleEl = card.querySelector('.service-price-title');
    const imageEl = card.querySelector('.service-price-image');
    
    const price = parseInt(priceEl.textContent.replace(/[^\d]/g, ''));
    const title = titleEl.textContent.trim();
    const image = imageEl.style.backgroundImage.slice(5, -2); // убираем url()
    
    addToCart(price, title, image);
    
    // Анимация кнопки
    const btn = e.target.closest('.add-to-cart');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<div class="plus">✓</div><span>Добавлено!</span>';
    btn.style.background = '#10b981';
    btn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.style.transform = '';
    }, 800);
  }
  
  // ✅ КЛИК ПО КОРЗИНЕ В HEADER
  if (e.target.closest('.cart-item')) {
    e.preventDefault();
    toggleCartDrawer();
  }
  
  // ✅ КНОПКИ +/- и УДАЛЕНИЕ
  if (e.target.classList.contains('qty-btn')) {
    const index = parseInt(e.target.dataset.index);
    const action = e.target.dataset.action;
    changeQty(index, action);
  }
  
  if (e.target.classList.contains('cart-item-remove')) {
    const index = parseInt(e.target.dataset.index);
    removeItem(index);
  }
  
  // ✅ ОФОРМИТЬ ЗАКАЗ
  if (e.target.id === 'checkoutBtn') {
    toggleCartDrawer();
    openOrderModal(); // функция из следующего шага
  }
  
  // ✅ ЗАКРЫТИЕ КОРЗИНЫ
  if (e.target.id === 'cartClose') {
    toggleCartDrawer();
  }
});

// ✅ ИНИЦИАЛИЗАЦИЯ при загрузке
document.addEventListener('DOMContentLoaded', function() {
  initCart();
});

// ✅ МОДАЛКА ОФОРМЛЕНИЯ ЗАКАЗА
let currentCity = 'Иркутск';
let currentPhone = '+7 (3952) 123-456';

function openOrderModal() {
  const modal = document.getElementById('orderModal');
  const overlay = document.getElementById('orderOverlay');
  
  // Подтягиваем только город (телефон остается пустым с плейсхолдером)
  document.getElementById('selectedCity').textContent = currentCity;
  // ❌ УБРАЛИ: document.getElementById('orderPhone').value = currentPhone;
  
  document.getElementById('orderCount').textContent = cart.count;
  document.getElementById('orderTotal').textContent = cart.total.toLocaleString() + ' ₽';
  
  // Время через 2 часа
  const now = new Date();
  now.setHours(now.getHours() + 2);
  document.getElementById('pickupTime').value = now.toISOString().slice(0, 16);
  
  // Очищаем пожелания и телефон
  document.getElementById('orderWishes').value = '';
  document.getElementById('orderPhone').value = ''; // ✅ ПУСТОЕ ПОЛЕ
  document.querySelector('.char-count').textContent = '0/500 символов';
  
  document.getElementById('confirmOrder').disabled = cart.items.length === 0;
  
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // ✅ ФОКУС на телефон
  document.getElementById('orderPhone').focus();
}



function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  const overlay = document.getElementById('orderOverlay');
  
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ✅ СИНХРОНИЗАЦИЯ ГОРОДА/ТЕЛЕФОНА с хедером
function updateOrderCity(city) {
  currentCity = city;
  const phoneText = phones[city] || phones['Иркутск'];
  currentPhone = phoneText.replace('📱 ', '');
  document.getElementById('selectedCity').textContent = city;
  
  if (document.getElementById('orderModal').classList.contains('active')) {
    document.getElementById('orderPhone').value = currentPhone;
  }
}

// ✅ ОБРАБОТЧИКИ МОДАЛКИ ОФОРМЛЕНИЯ
document.addEventListener('click', function(e) {
  // ✅ ЗАКРЫТИЕ МОДАЛКИ
  if (e.target.id === 'orderClose' || e.target.id === 'orderOverlay' || e.target.id === 'cancelOrder') {
    closeOrderModal();
  }
  
  // ✅ ОФОРМЛЕНИЕ ГОРОДА
  if (e.target.classList.contains('dropdown-item') && e.target.closest('#orderCityDropdown')) {
    e.preventDefault();
    const city = e.target.dataset.city || e.target.textContent.trim();
    updateOrderCity(city);
    document.getElementById('orderCity').classList.remove('active');
  }
  
  // ✅ ОТКРЫТИЕ ВЫПАДАЮЩЕГО СПИСКА
  if (e.target.closest('#orderCity')) {
    e.stopPropagation();
    const citySelect = document.getElementById('orderCity');
    const dropdown = document.getElementById('orderCityDropdown');
    citySelect.classList.toggle('active');
  }
  
  // ✅ ОТПРАВКА ЗАКАЗА
  if (e.target.id === 'confirmOrder') {
    e.preventDefault();
    submitOrder();
  }
});

// ✅ СЧЕТЧИК СИМВОЛОВ ПОЖЕЛАНИЙ
document.getElementById('orderWishes')?.addEventListener('input', function() {
  const count = this.value.length;
  const max = 500;
  const charCount = document.querySelector('.char-count');
  charCount.textContent = `${count}/${max} символов`;
  
  if (count > max * 0.9) {
    charCount.style.color = '#ef4444';
  } else {
    charCount.style.color = '#a3a3a3';
  }
});

// ✅ ОТПРАВКА ЗАКАЗА
// ✅ ПОЛНАЯ ФУНКЦИЯ submitOrder()
function submitOrder() {
  const pickupTime = document.getElementById('pickupTime').value;
  const phoneInput = document.getElementById('orderPhone').value.trim();
  const wishes = document.getElementById('orderWishes').value.trim();
  
  // ✅ ВАЛИДАЦИЯ
  if (!pickupTime) {
    alert('❌ Выберите удобное время забора');
    document.getElementById('pickupTime').focus();
    return;
  }
  
  if (!phoneInput || phoneInput.length < 10) {
    alert('❌ Введите корректный номер телефона');
    document.getElementById('orderPhone').focus();
    return;
  }
  
  // ✅ ФОРМИРОВАНИЕ ДАННЫХ ЗАКАЗА
  const orderData = {
    city: currentCity,
    phone: phoneInput,
    time: pickupTime,
    wishes: wishes,
    items: cart.items.map(item => `${item.title} ×${item.qty} (${item.price.toLocaleString()}₽)`),
    total: cart.total,
    count: cart.count,
    date: new Date().toLocaleString('ru-RU')
  };
  
  // ✅ СООБЩЕНИЕ ДЛЯ TELEGRAM/WHATSAPP
  const telegramMessage = `🧹 НОВЫЙ ЗАКАЗ ХИМЧИСТКИ ОБУВИ

📍 Город: ${orderData.city}
📱 Телефон: ${orderData.phone}
⏰ Время забора: ${new Date(orderData.time).toLocaleString('ru-RU', { 
  day: 'numeric', 
  month: 'short', 
  hour: '2-digit', 
  minute: '2-digit' 
})}

🛒 ЗАКАЗ (${orderData.count} позиций):
${orderData.items.map(item => `• ${item}`).join('\n')}

💰 ИТОГО: ${orderData.total.toLocaleString()} ₽

💬 ПОЖЕЛАНИЯ:
${wishes || 'нет комментариев'}

📅 ${orderData.date}`;

  // ✅ ССЫЛКИ ДЛЯ ОТПРАВКИ
  const phoneDigits = phoneInput.replace(/[^\d]/g, '');
  const telegramUrl = `https://t.me/YOUR_BOT_TOKEN?text=${encodeURIComponent(telegramMessage)}`;
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(telegramMessage)}`;
  
  // ✅ УСПЕХ
  alert(`✅ Заказ #${Math.floor(Math.random() * 1000)} успешно оформлен!\n\n📱 Менеджер свяжется в течение 15 минут по номеру:\n${phoneInput}`);
  
  // ✅ ОЧИСТКА КОРЗИНЫ
  cart = { items: [], count: 0, total: 0 };
  saveCart();
  closeOrderModal();
  
  // ✅ ОТКРЫВАЕМ WHATSAPP с введенным номером
  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
  }, 500);
}

// ✅ ОБРАБОТЧИК ДЛЯ КНОПОК order-btn и hero-button
document.addEventListener('click', function(e) {
  // ✅ КНОПКИ "Оформить заказ" (.order-btn) И Hero кнопка (.hero-button)
  if (e.target.closest('.order-btn') || e.target.closest('.hero-button') || e.target.closest('.gradient-btn')) {
  e.preventDefault();
  console.log('✅ Кнопка найдена!', e.target);
  openQuickOrderModal();
}
  
  // ... остальные обработчики (корзина и т.д.) остаются
});

// ✅ ФУНКЦИЯ ОТКРЫТИЯ БЫстрой МОДАЛКИ
function openQuickOrderModal() {
  const modal = document.getElementById('quickOrderModal');
  const overlay = document.getElementById('quickOrderOverlay');
  
  // Город из текущего состояния
  document.getElementById('quickSelectedCity').textContent = currentCity || 'Иркутск';
  
  // Время +2 часа от сейчас
  const now = new Date();
  now.setHours(now.getHours() + 2);
  document.getElementById('quickPickupTime').value = now.toISOString().slice(0, 16);
  
  // Очищаем поля
  document.getElementById('quickPhone').value = '';
  document.getElementById('quickAddress').value = '';
  document.getElementById('quickWishes').value = '';
  document.querySelector('#quickOrderModal .char-count') && 
    (document.querySelector('#quickOrderModal .char-count').textContent = '0/500 символов');
  
  // Показываем модалку
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('quickPhone').focus();
}

// ✅ ЗАКРЫТИЕ БЫстрой МОДАЛКИ
function closeQuickOrderModal() {
  const modal = document.getElementById('quickOrderModal');
  const overlay = document.getElementById('quickOrderOverlay');
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ✅ ОТПРАВКА БЫСТРОГО ЗАКАЗА
document.addEventListener('click', function(e) {
  if (e.target.id === 'quickConfirmOrder') {
    const phone = document.getElementById('quickPhone').value.trim();
    const address = document.getElementById('quickAddress').value.trim();
    const time = document.getElementById('quickPickupTime').value;
    const wishes = document.getElementById('quickWishes').value.trim();
    const city = document.getElementById('quickSelectedCity').textContent;
    
    if (!phone || phone.length < 10) {
      alert('❌ Введите телефон');
      document.getElementById('quickPhone').focus();
      return;
    }
    
    if (!address) {
      alert('❌ Укажите адрес');
      document.getElementById('quickAddress').focus();
      return;
    }
    
    if (!time) {
      alert('❌ Выберите время');
      return;
    }
    
    const message = `🧹 БЫСТРЫЙ ЗАКАЗ ХИМЧИСТКИ

📍 Город: ${city}
📱 Телефон: ${phone}
📍 Адрес: ${address}
⏰ Время: ${new Date(time).toLocaleString('ru-RU', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })}
💬 Что чистить: ${wishes || 'по договоренности'}

${new Date().toLocaleString('ru-RU')}`;
    
    const phoneDigits = phone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    
    alert('✅ Заказ отправлен!\nМенеджер свяжется через 15 минут');
    closeQuickOrderModal();
    setTimeout(() => window.open(whatsappUrl, '_blank'), 500);
  }
  
  // Закрытие модалки
  if (e.target.id === 'quickOrderClose' || e.target.id === 'quickOrderOverlay') {
    closeQuickOrderModal();
  }
  
  // Выбор города
  if (e.target.closest('#quickCity')) {
    e.stopPropagation();
    document.getElementById('quickCity').classList.toggle('active');
  }
  
  if (e.target.closest('#quickCityDropdown')) {
    const city = e.target.dataset.city || e.target.textContent.trim();
    document.getElementById('quickSelectedCity').textContent = city;
    document.getElementById('quickCity').classList.remove('active');
  }
});


// ✅ ПРЯМАЯ ПРИВЯЗКА К КНОПКАМ (100% работает)
document.querySelectorAll('.hero-button, .order-btn, .gradient-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('🚀 Кнопка нажата!');
    openQuickOrderModal();
  });
});

// ✅ ФУНКЦИЯ МОДАЛКИ (если нет)
function openQuickOrderModal() {
  console.log('🎉 Пытаемся открыть модалку');
  
  const modal = document.getElementById('quickOrderModal');
  const overlay = document.getElementById('quickOrderOverlay');
  
  if (!modal) {
    console.error('❌ Нет #quickOrderModal в HTML!');
    return;
  }
  
  // Заполняем
  document.getElementById('quickSelectedCity').textContent = 'Иркутск';
  const now = new Date();
  now.setHours(now.getHours() + 2);
  document.getElementById('quickPickupTime').value = now.toISOString().slice(0, 16);
  
  // Показываем
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  console.log('✅ Модалка должна открыться!');
}

// ✅ НАДЕЖНАЯ ПРИВЯЗКА К КНОПКАМ (дублирует основной обработчик)
document.addEventListener('DOMContentLoaded', function() {
  // Привязываем КНОПКИ hero и order
  document.querySelectorAll('.hero-button, .order-btn, .gradient-btn, button.gradient-btn').forEach(btn => {
    btn.style.cursor = 'pointer'; // визуальная обратная связь
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚀 Кнопка сработала!');
      openQuickOrderModal();
    });
  });
});



