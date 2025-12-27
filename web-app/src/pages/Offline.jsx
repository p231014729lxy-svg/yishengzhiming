import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Calendar, Clock, RefreshCw, Navigation } from 'lucide-react';
import L from 'leaflet';
import { cityData, getCoordinates } from '../utils/cityData';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const Offline = () => {
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  
  const [mapCenter, setMapCenter] = useState([39.9042, 116.4074]);
  const [zoom, setZoom] = useState(12);
  const [events, setEvents] = useState([]);

  // Init with random events
  useEffect(() => {
    generateRandomEvents(mapCenter);
  }, []);

  const handleProvinceChange = (e) => {
    const val = e.target.value;
    setProvince(val);
    setCity('');
    setDistrict('');
    
    // Auto select first city if available (for municipalities like Beijing, it might be 'District')
    const provData = cityData.find(p => p.name === val);
    if (provData && provData.children.length > 0) {
      setCity(provData.children[0].name);
      // Update map
      const coords = getCoordinates(val, provData.children[0].name, '');
      setMapCenter(coords);
      setZoom(10);
      generateRandomEvents(coords);
    }
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setCity(val);
    setDistrict('');
    
    const coords = getCoordinates(province, val, '');
    setMapCenter(coords);
    setZoom(12);
    generateRandomEvents(coords);
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setDistrict(val);
    // Slight random offset for district center or just keep city center for now
    setZoom(13);
  };

  const generateRandomEvents = (center) => {
    const newEvents = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      title: `公益站点 ${String.fromCharCode(65 + i)}`,
      address: '随机生成的活动地址 ' + (i + 1) + ' 号',
      date: '2024.05.' + (20 + i),
      time: '10:00 - 17:00',
      status: Math.random() > 0.5 ? 'Booking' : 'Full',
      position: [
        center[0] + (Math.random() - 0.5) * 0.1,
        center[1] + (Math.random() - 0.5) * 0.1
      ]
    }));
    setEvents(newEvents);
  };

  const getCityOptions = () => {
    const prov = cityData.find(p => p.name === province);
    return prov ? prov.children : [];
  };

  const getDistrictOptions = () => {
    const prov = cityData.find(p => p.name === province);
    if (!prov) return [];
    const c = prov.children.find(c => c.name === city);
    return c ? c.children : [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 min-h-screen">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">线下行动 · 城市连接</h2>
        <p className="text-slate-600">寻找你身边的公益站点，让爱触手可及。</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={province}
            onChange={handleProvinceChange}
          >
            <option value="">选择省份/直辖市</option>
            {cityData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>

          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={city}
            onChange={handleCityChange}
            disabled={!province}
          >
            <option value="">选择城市</option>
            {getCityOptions().map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>

          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={district}
            onChange={handleDistrictChange}
            disabled={!city}
          >
            <option value="">选择区/县</option>
            {getDistrictOptions().map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        <button 
          onClick={() => generateRandomEvents(mapCenter)}
          className="flex items-center px-4 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新附近站点
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 h-[600px]">
        {/* Event List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">{event.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  event.status === 'Booking' ? 'bg-green-100 text-green-700' : 
                  event.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {event.status === 'Booking' ? '报名中' : event.status === 'Full' ? '已满员' : '暂未开放'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  {event.address}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {event.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  {event.time}
                </div>
              </div>

              <button 
                disabled={event.status !== 'Booking'}
                onClick={() => alert("紧急联系中,请稍后")}
                className={`w-full py-2 border rounded-lg font-medium transition-all ${
                    event.status === 'Booking' 
                    ? 'border-slate-200 text-slate-600 hover:bg-brand-500 hover:text-white hover:border-brand-500' 
                    : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                }`}
              >
                {event.status === 'NotImplemented' ? '敬请期待' : '查看详情'}
              </button>
            </div>
          ))}
        </div>

        {/* Real Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl border border-white/50 h-full relative z-0">
           <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
             <ChangeView center={mapCenter} zoom={zoom} />
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />
             {events.map(event => (
               <Marker key={event.id} position={event.position}>
                 <Popup>
                   <div className="p-2">
                     <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                     <p className="text-xs text-slate-500">{event.address}</p>
                   </div>
                 </Popup>
               </Marker>
             ))}
           </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Offline;
