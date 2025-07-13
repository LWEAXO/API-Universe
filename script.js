let currentPage = 1;
const itemsPerPage = 15;
let isLoading = false;
let allApis = [];
let filteredApis = [];

async function fetchApiData() {
    try {
        const response = await fetch('api/data.json');
        if (!response.ok) throw new Error('API verileri alınamadı');
        return await response.json();
    } catch (error) {
        console.error('Hata:', error);
        document.getElementById('apiGrid').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                API verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </div>
        `;
        return [];
    }
}

function renderApiCards(apis, append = false) {
    const apiGrid = document.getElementById('apiGrid');
    if (!append) apiGrid.innerHTML = '';
    
    if (apis.length === 0) {
        apiGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Sonuç bulunamadı</p>
            </div>
        `;
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    apis.slice(0, currentPage * itemsPerPage).forEach(api => {
        let pricingText, pricingClass, pricingIcon;
        
        if (api.pricing === 'free') {
            pricingText = 'Ücretsiz';
            pricingClass = 'free';
            pricingIcon = '<i class="fas fa-lock-open"></i>';
        } else if (api.pricing === 'paid') {
            pricingText = 'Premium';
            pricingClass = 'paid';
            pricingIcon = '<i class="fas fa-crown"></i>';
        } else {
            pricingText = 'Ücretsiz/Premium';
            pricingClass = 'both';
            pricingIcon = '<i class="fas fa-star-half-alt"></i>';
        }
        
        const categoryIcons = {
            'Sosyal Medya': 'fa-hashtag',
            'Finans': 'fa-chart-line',
            'Haritalar': 'fa-map-marked-alt',
            'Yapay Zeka': 'fa-robot',
            'E-Ticaret': 'fa-shopping-cart',
            'Veri': 'fa-database',
            'Hava Durumu': 'fa-cloud-sun'
        };
        
        const categoryIcon = categoryIcons[api.category] || 'fa-code';
        
        const apiCard = document.createElement('div');
        apiCard.className = 'api-card';
        apiCard.innerHTML = `
            <div class="api-card-header">
                <span class="category">${api.category}</span>
                <h3><i class="fas ${categoryIcon}"></i> ${api.name}</h3>
            </div>
            <div class="api-card-body">
                <p>${api.description}</p>
            </div>
            <div class="api-card-footer">
                <span class="pricing ${pricingClass}">${pricingIcon} ${pricingText}</span>
                <a href="${api.link}" target="_blank" class="btn btn-primary">
                    <i class="fas fa-external-link-alt"></i> Detaylar
                </a>
            </div>
        `;
        fragment.appendChild(apiCard);
    });
    
    apiGrid.appendChild(fragment);
}

async function loadMoreApis() {
    if (isLoading || (currentPage * itemsPerPage) >= filteredApis.length) return;
    
    isLoading = true;
    document.getElementById('loading').style.display = 'flex';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    currentPage++;
    renderApiCards(filteredApis, true);
    
    isLoading = false;
    document.getElementById('loading').style.display = 'none';
}

function updateApiCounter() {
    const totalApis = filteredApis.length;
    const freeApis = filteredApis.filter(api => api.pricing === 'free').length;
    const paidApis = filteredApis.filter(api => api.pricing === 'paid').length;
    const bothApis = filteredApis.filter(api => api.pricing === 'both').length;
    
    document.getElementById('api-counter').innerHTML = `
        <span class="highlight">${totalApis}+</span> API arasından 
        (<span class="free">${freeApis} ücretsiz</span>, 
        <span class="paid">${paidApis} premium</span>, 
        <span class="both">${bothApis} hibrit</span>) keşfedin,<br>
        projelerinizi bir üst seviyeye taşıyın. Hemen aramaya başlayın!
    `;
}

function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.textContent.trim();
            
            if (category === 'Tümü') {
                filteredApis = [...allApis];
            } else if (category === 'Ücretsiz') {
                filteredApis = allApis.filter(api => api.pricing === 'free');
            } else if (category === 'Premium') {
                filteredApis = allApis.filter(api => api.pricing === 'paid');
            } else {
                filteredApis = allApis.filter(api => api.category === category);
            }
            
            currentPage = 1;
            updateApiCounter();
            renderApiCards(filteredApis);
        });
    });
}

function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.category-btn.active').textContent.trim();
        
        let results = [...allApis];
        
        if (activeCategory === 'Ücretsiz') {
            results = results.filter(api => api.pricing === 'free');
        } else if (activeCategory === 'Premium') {
            results = results.filter(api => api.pricing === 'paid');
        } else if (activeCategory !== 'Tümü') {
            results = results.filter(api => api.category === activeCategory);
        }
        
        if (searchTerm) {
            results = results.filter(api => 
                api.name.toLowerCase().includes(searchTerm) || 
                api.description.toLowerCase().includes(searchTerm) ||
                api.category.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredApis = results;
        currentPage = 1;
        updateApiCounter();
        renderApiCards(filteredApis);
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && performSearch());
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading) {
            loadMoreApis();
        }
    }, { threshold: 0.1 });
    
    observer.observe(document.getElementById('loading'));
}

document.addEventListener('DOMContentLoaded', async () => {
    setupThemeToggle();
    allApis = await fetchApiData();
    filteredApis = [...allApis];
    
    if (allApis.length > 0) {
        updateApiCounter();
        renderApiCards(filteredApis);
        setupCategoryFilters();
        setupSearchFunctionality();
        setupInfiniteScroll();
    }
}); //lweaxo