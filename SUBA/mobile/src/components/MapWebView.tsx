import React, { useRef } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { WebView } from "react-native-webview"
import { TEXT_STYLES, COLORS } from "../theme"

interface Stop { id: string; lat: number; lng: number; name: string; color?: string }
interface BusPos { id: string; lat: number; lng: number; color?: string; label?: string }

interface Props {
  height?: number
  center: { lat: number; lng: number }
  user?: { lat: number; lng: number }
  stops?: Stop[]
  buses?: BusPos[]
  polylines?: { id: string; coords: { lat: number; lng: number }[]; color?: string }[]
}

const MapWebView: React.FC<Props> = ({ height = 400, center, user, stops = [], buses = [], polylines = [] }) => {
  const webRef = useRef<any>(null)

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        html,body,#map{height:100%;margin:0;padding:0;background:#f3f5f8}
      .legend{position:absolute;left:12px;bottom:12px;background:#fff;border:1px solid #eee;border-radius:12px;padding:8px 10px;display:flex;gap:10px;align-items:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#333}
      .legend .item{display:flex;align-items:center;gap:6px}
      .stop-dot{width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.15)}
      .bus-icon{width:14px;height:14px;display:inline-block;background: url('data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="%23000000"><path d="M16 1H8C5.243 1 3 3.243 3 6v9a2 2 0 002 2v2a1 1 0 002 0v-2h10v2a1 1 0 002 0v-2a2 2 0 002-2V6c0-2.757-2.243-5-5-5zM8 3h8a3 3 0 013 3v1H5V6a3 3 0 013-3zm11 6v6H5V9h14zM7.5 19a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>`
      )}') no-repeat center/contain;border-radius:3px}
      .user-dot{position:relative;width:12px;height:12px;border-radius:50%;background:#1976D2;box-shadow:0 0 0 3px rgba(25,118,210,0.25)}
      .pulse{position:absolute;top:50%;left:50%;width:12px;height:12px;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 0 rgba(25,118,210,0.35);animation:pulse 2s infinite}
      @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(25,118,210,0.35)}70%{box-shadow:0 0 0 12px rgba(25,118,210,0)}100%{box-shadow:0 0 0 0 rgba(25,118,210,0)}}
    </style>
  </head>
  <body>
    <div id="map"></div>
      <script>
        (function(){
          function insertStylesheet(){
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
            link.onerror = function(){
              var l2 = document.createElement('link');
              l2.rel = 'stylesheet';
              l2.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
              document.head.appendChild(l2);
            };
            document.head.appendChild(link);
          }

          function loadLeaflet(cb){
            var s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
            s.onload = cb;
            s.onerror = function(){
              var s2 = document.createElement('script');
              s2.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
              s2.onload = cb;
              s2.onerror = function(){
                var map = document.getElementById('map');
                map.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#556;">No se pudo cargar el mapa. Verifica tu conexión.</div>';
              };
              document.body.appendChild(s2);
            };
            document.body.appendChild(s);
          }

          function init(){
            try{
              var center = { lat: ${center.lat}, lng: ${center.lng} };
              var map = L.map('map', { preferCanvas: true }).setView([center.lat, center.lng], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

              function stopMarker(lat, lng, color, name){
                return L.circleMarker([lat, lng], { radius: 7, fillOpacity: 1, color: '#ffffff', weight: 2, fillColor: color || '#1976D2' }).bindPopup(name || 'Parada');
              }

              function busIconFor(color, label){
                var fill = encodeURIComponent(color || '#FF6B00');
                var text = (label || '').slice(0,3);
                var svg = ''
                  + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="36" height="36">'
                  +   '<defs>'
                  +     '<filter id="s" x="-20%" y="-20%" width="140%" height="140%">'
                  +       '<feDropShadow dx="0" dy="1" stdDeviation="1.4" flood-color="#000" flood-opacity="0.25" />'
                  +     '</filter>'
                  +   '</defs>'
                  +   '<g filter="url(#s)">'
                  +     '<circle cx="24" cy="24" r="20" fill="' + fill + '" stroke="#FFFFFF" stroke-width="2" />'
                  +     '<g>'
                  +       '<rect x="14" y="14" width="20" height="22" rx="4" ry="4" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.5"/>'
                  +       '<rect x="16" y="16" width="16" height="8" rx="2" ry="2" fill="#2C2C2C"/>'
                  +       '<rect x="16" y="26" width="16" height="4" rx="1.5" ry="1.5" fill="#E6E6E6"/>'
                  +       '<circle cx="18.5" cy="34" r="2.5" fill="#2C2C2C"/>'
                  +       '<circle cx="27.5" cy="34" r="2.5" fill="#2C2C2C"/>'
                  +       '<circle cx="19.5" cy="29" r="1.3" fill="#FFC107"/>'
                  +       '<circle cx="26.5" cy="29" r="1.3" fill="#FFC107"/>'
                  +     '</g>'
                  +     (text ? ('<text x="24" y="45" text-anchor="middle" font-size="9" font-family="-apple-system,Segoe UI,Roboto,Arial" fill="#1A1A1A" stroke="#FFFFFF" stroke-width="2" paint-order="stroke">' + text + '</text>') : '')
                  +   '</g>'
                  + '</svg>';
                return L.icon({ iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg), iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18] });
              }

              var userDivIcon = L.divIcon({ html: '<div class="user-dot"><span class="pulse"></span></div>', className: '', iconSize: [18, 18], iconAnchor: [9, 9] });

              var stopsData = [];
              try { stopsData = JSON.parse(decodeURIComponent(window.name || '[]')) } catch(e){}
              stopsData.forEach(function(s){ stopMarker(s.lat, s.lng, s.color, s.name).addTo(map) });

              var busesData = [];
              try { busesData = JSON.parse(decodeURIComponent(window.title || '[]')) } catch(e){}
              busesData.forEach(function(b){ L.marker([b.lat, b.lng], { icon: busIconFor(b.color, b.label) }).addTo(map).bindPopup(b.label ? ('Bus ' + b.label) : 'Bus') });

              try {
                var userData = JSON.parse(decodeURIComponent(window.__user || 'null'))
                if (userData && userData.lat && userData.lng) {
                  L.marker([userData.lat, userData.lng], { icon: userDivIcon }).addTo(map).bindPopup('Tu ubicación')
                }
              } catch(e){}

              try {
                var p = JSON.parse(decodeURIComponent(window.location.hash2 || '[]'))
                p.forEach(function(pl){ var coords = pl.coords.map(function(c){ return [c.lat, c.lng] }); L.polyline(coords, { color: pl.color || '#1976D2', weight: 4 }).addTo(map) })
              } catch(e){}

              try {
                var latlngs = [];
                if (stopsData && stopsData.length) { stopsData.forEach(function(s){ latlngs.push([s.lat, s.lng]) }) }
                if (busesData && busesData.length) { busesData.forEach(function(b){ latlngs.push([b.lat, b.lng]) }) }
                try { var userData2 = JSON.parse(decodeURIComponent(window.__user || 'null')); if (userData2 && userData2.lat && userData2.lng) latlngs.push([userData2.lat, userData2.lng]) } catch(_){}
                if (latlngs.length) { map.fitBounds(latlngs, { padding: [40, 40], maxZoom: 16 }) }
              } catch(e){}

              var legend = document.createElement('div');
              legend.className = 'legend';
              legend.innerHTML = '<div class="item"><span class="user-dot"></span><span>Usuario</span></div>'+
                                 '<div class="item"><span class="stop-dot" style="background:#1976D2"></span><span>Parada</span></div>'+
                                 '<div class="item"><span class="bus-icon"></span><span>Bus</span></div>';
              document.body.appendChild(legend);
            } catch(e){
              var mapEl = document.getElementById('map');
              mapEl.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#556;">Error al inicializar el mapa.</div>';
            }
          }

          insertStylesheet();
          loadLeaflet(init);
        })();
      </script>
  </body>
  </html>
  `

  // We pass data via window.name and window.title because percent-encoding in locations can be tricky
  const injectedName = encodeURIComponent(JSON.stringify(stops.map((s) => ({ ...s, color: s['color'] || '#1976D2' }))))
  const injectedTitle = encodeURIComponent(JSON.stringify(buses))
  const injectedHash2 = encodeURIComponent(JSON.stringify(polylines))
  const injectedUser = encodeURIComponent(JSON.stringify(user || null))

  const source = { html }

  return (
    <View style={{ height }}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={source}
        javaScriptEnabled
        domStorageEnabled
        style={{ backgroundColor: 'transparent' }}
        injectedJavaScriptBeforeContentLoaded={`window.name='${injectedName}'; window.title='${injectedTitle}'; window.location.hash2='${injectedHash2}'; window.__user='${injectedUser}';`}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})

export default MapWebView
