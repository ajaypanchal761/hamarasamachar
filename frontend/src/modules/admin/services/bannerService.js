// Banner management service
const BANNERS_KEY = 'admin_banners';

// Initialize with dummy data if not exists
function initializeBanners() {
  const existing = localStorage.getItem(BANNERS_KEY);
  if (!existing) {
    const defaultBanners = [
      {
        id: 1,
        title: 'मुख्य बैनर',
        imageUrl: '/images/banner1.jpg',
        link: 'https://example.com',
        position: 'homepage_top',
        order: 1,
        status: 'active',
        target: '_blank',
        clicks: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'साइडबार बैनर',
        imageUrl: '/images/banner2.jpg',
        link: 'https://example.com',
        position: 'sidebar',
        order: 1,
        status: 'active',
        target: '_self',
        clicks: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(BANNERS_KEY, JSON.stringify(defaultBanners));
  }
}

// Initialize on load
initializeBanners();

export const bannerService = {
  // Get all banners
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const banners = JSON.parse(localStorage.getItem(BANNERS_KEY) || '[]');
    return banners.sort((a, b) => {
      // Sort by position first
      if (a.position !== b.position) {
        return a.position.localeCompare(b.position);
      }
      // For new format with images array, sort by first image's order
      const aOrder = a.images && a.images.length > 0 ? a.images[0].order : (a.order || 0);
      const bOrder = b.images && b.images.length > 0 ? b.images[0].order : (b.order || 0);
      return aOrder - bOrder;
    });
  },

  // Get banner by ID
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const banners = JSON.parse(localStorage.getItem(BANNERS_KEY) || '[]');
    return banners.find(banner => banner.id === parseInt(id));
  },

  // Create new banner
  create: async (bannerData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const banners = JSON.parse(localStorage.getItem(BANNERS_KEY) || '[]');

    const newBanner = {
      id: Date.now(),
      ...bannerData,
      clicks: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    banners.push(newBanner);
    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    return newBanner;
  },

  // Update banner
  update: async (id, bannerData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const banners = JSON.parse(localStorage.getItem(BANNERS_KEY) || '[]');
    const index = banners.findIndex(banner => banner.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('बैनर नहीं मिला');
    }

    banners[index] = {
      ...banners[index],
      ...bannerData,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    return banners[index];
  },

  // Delete banner
  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const banners = JSON.parse(localStorage.getItem(BANNERS_KEY) || '[]');
    const filtered = banners.filter(banner => banner.id !== parseInt(id));
    localStorage.setItem(BANNERS_KEY, JSON.stringify(filtered));
    return true;
  },

  // Get banners by position
  getByPosition: async (position) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const banners = JSON.parse(localStorage.getItem(BANNERS_KEY) || '[]');
    return banners
      .filter(banner => banner.position === position && banner.status === 'active')
      .sort((a, b) => a.order - b.order);
  }
};

