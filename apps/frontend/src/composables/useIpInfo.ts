import { ref } from 'vue';

export interface IpInfo {
  ip: string;
  country?: string;
  countryCode?: string;
  error?: string;
}

export function useIpInfo() {
  const ipInfo = ref<IpInfo>({ ip: '' });
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getIpInfo = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Lấy địa chỉ IP bằng cách sử dụng một trong những API sau
      let ipData;
      let ipAddress = '';
      
      // API chính để lấy IP
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        }
      } catch (err) {
        console.warn('Primary IP API failed, trying backup...', err);
      }
      
      // API dự phòng nếu API chính không hoạt động
      if (!ipAddress) {
        try {
          const backupIpResponse = await fetch('https://ipinfo.io/json');
          if (backupIpResponse.ok) {
            const backupData = await backupIpResponse.json();
            ipAddress = backupData.ip;
            
            // ipinfo.io cũng trả về thông tin quốc gia, nên ta có thể sử dụng luôn
            ipInfo.value = {
              ip: backupData.ip,
              country: backupData.country_name || backupData.country,
              countryCode: backupData.country
            };
            
            loading.value = false;
            return ipInfo.value;
          }
        } catch (err) {
          console.warn('Backup IP API failed too', err);
        }
      }
      
      // Nếu không lấy được IP, trả về giá trị mặc định
      if (!ipAddress) {
        ipAddress = 'unknown';
        ipInfo.value = {
          ip: ipAddress,
          country: 'Unknown',
          countryCode: 'XX'
        };
        
        loading.value = false;
        return ipInfo.value;
      }
      
      ipInfo.value.ip = ipAddress;
      
      // Lấy thông tin quốc gia từ IP
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          
          ipInfo.value = {
            ip: ipAddress,
            country: geoData.country_name,
            countryCode: geoData.country_code
          };
        } else {
          throw new Error('Failed to fetch country information');
        }
      } catch (geoErr) {
        console.warn('Geo API failed, trying backup...', geoErr);
        
        // API dự phòng khác để lấy thông tin quốc gia
        try {
          const backupGeoResponse = await fetch(`https://ipinfo.io/${ipAddress}/json`);
          if (backupGeoResponse.ok) {
            const backupGeoData = await backupGeoResponse.json();
            
            ipInfo.value = {
              ip: ipAddress,
              country: backupGeoData.country_name || backupGeoData.country,
              countryCode: backupGeoData.country
            };
          } else {
            // Nếu không lấy được thông tin quốc gia, đặt giá trị mặc định
            ipInfo.value = {
              ip: ipAddress,
              country: 'Unknown',
              countryCode: 'XX'
            };
          }
        } catch (backupGeoErr) {
          console.error('All Geo APIs failed', backupGeoErr);
          ipInfo.value = {
            ip: ipAddress,
            country: 'Unknown',
            countryCode: 'XX'
          };
        }
      }
    } catch (err) {
      console.error('Error fetching IP info:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
      ipInfo.value.error = error.value;
      ipInfo.value = {
        ip: 'unknown',
        country: 'Unknown',
        countryCode: 'XX',
        error: error.value
      };
    } finally {
      loading.value = false;
    }
    
    return ipInfo.value;
  };

  return {
    ipInfo,
    loading,
    error,
    getIpInfo
  };
} 