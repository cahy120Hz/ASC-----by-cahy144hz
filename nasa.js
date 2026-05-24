/**
 * ASC Hub — NASA API Module
 * Handles all NASA API requests with fallback data
 */

const NASA_API_KEY = 'DEMO_KEY'; // Replace with your key: https://api.nasa.gov/
const NASA_BASE = 'https://api.nasa.gov';

/**
 * Fetch Astronomy Picture of the Day
 */
async function fetchAPOD() {
  try {
    const res = await fetch(`${NASA_BASE}/planetary/apod?api_key=${NASA_API_KEY}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return { success: true, data };
  } catch (e) {
    console.warn('NASA APOD fallback:', e.message);
    return {
      success: false,
      data: {
        title: 'The Pillars of Creation — James Webb',
        date: new Date().toISOString().split('T')[0],
        explanation: 'The Eagle Nebula\'s Pillars of Creation merupakan salah satu gambar paling ikonik dalam sejarah astronomi. Pertama kali diabadikan oleh Hubble pada 1995 dan kini dilihat kembali oleh James Webb Space Telescope dalam inframerah dengan detail yang belum pernah ada sebelumnya. Pilar-pilar gas dan debu ini terbentang sejauh beberapa tahun cahaya dan berfungsi sebagai tempat lahirnya bintang-bintang baru. Di ujung pilar-pilar tersebut, bintang-bintang muda masih terbentuk dari materi yang mengkondensasi karena gravitasi. Radiasi dari bintang-bintang muda inilah yang mengikis dan membentuk kontur dramatis struktur kosmik yang megah ini.',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg/800px-Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg',
        hdurl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg/800px-Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg',
        media_type: 'image',
        copyright: 'NASA / ESA / Hubble Heritage Team'
      }
    };
  }
}

/**
 * Simulate ISS Position (realtime simulation)
 * Real API: http://api.open-notify.org/iss-now.json (CORS limited)
 */
function simulateISS() {
  const t = Date.now() / 1000;
  const period = 92.68 * 60; // seconds per orbit
  const angle = (t % period) / period * 2 * Math.PI;
  const lat = 51.6 * Math.sin(angle + t * 0.001);
  const lng = ((t * 0.0416) % 360) - 180;
  return {
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    altitude: (408 + Math.sin(t * 0.01) * 2).toFixed(1),
    velocity: (7.66 + Math.sin(t * 0.005) * 0.02).toFixed(3),
    timestamp: Math.floor(t)
  };
}

/**
 * Fetch Mars Weather (Insight Lander - historical)
 */
async function fetchMarsWeather() {
  return {
    sol: 1452,
    maxTemp: -13,
    minTemp: -85,
    windSpeed: 7.4,
    pressure: 743,
    season: 'Summer'
  };
}

// Export for use in script.js
window.ASCAPI = { fetchAPOD, simulateISS, fetchMarsWeather };
