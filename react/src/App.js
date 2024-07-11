import * as React from "react";
import { Map, TileLayer, Marker, Popup, MapContainer, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import iskolak from './data/iskolak.json';
import "leaflet-loading";
import "leaflet-loading/src/Control.Loading.css"

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Dragger({category, setTopSchools}) {
  var colors = ["red", "green", "gold", "blue", "grey", "orange", "black", "violet", "yellow"];
  
  React.useEffect(() => {
    MapUpdater();
  }, [category])

  function MapUpdater() {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    })
  var labels = document.getElementsByName('categoryLabel');
  for (var i = 0; i < labels.length; i++) {
    labels[i].style.color = 'white';
  }
  category.forEach((cat) => {
    var color = colors[category.indexOf(cat) % 9];
    var checkboxes = document.getElementsByName('categoryCheckbox');
    var labels = document.getElementsByName('categoryLabel');
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].value === cat) {
        labels[i].style.color = color;
      }
    }
    iskolak.features.forEach((feature) => {
        var colorIndex = category.indexOf(cat) % 9;
        var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        if (map.getBounds().contains(latlng) && feature.properties.tags.includes(cat)) {
          var icon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + colors[colorIndex] + '.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
          var popUpText = `
          <h1>${feature.properties.name}</h1>
          <p style="display: inline;"><p style="display: inline; font-weight: bold;">Kategóriák:</p> ${feature.properties.tags.join(', ')}</p>
          `

          category.forEach(function(type) {
            if (feature.properties.overall && feature.properties.overall[type]) {
                popUpText += `<p style="margin: 0px"><strong  style="margin: 0px">Overall ${type}:</strong> ${feature.properties.overall[type]}</p>`;
            }
        });
    
        // Add additional details
        popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">Van E-Titán?:</strong> ${ new Boolean(feature.properties.etitan) ? "Igen" : "Nem"}</p>`;
        if (feature.properties.email) {
            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">Email:</strong> <a href="mailto:${feature.properties.email}">${feature.properties.email}</a></p>`;
        }
        if (feature.properties.web) {
            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">Web:</strong> <a href="${feature.properties.web}" target="_blank">${feature.properties.web}</a></p>`;
        }
        if (feature.properties.phone) {
            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">Telefonszám:</strong> ${feature.properties.phone}</p>`;
        }
        if (feature.properties.address) {
            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">Cím:</strong> ${feature.properties.address}</p>`;
        }
        if (feature.properties.nkhid) {
            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">NKHAzon:</strong> ${feature.properties.nkhid}</p>`;
        }

        // Show stats for the selected types
        category.forEach(function(type) {
            if (feature.properties.stats) {
                var stats = feature.properties.stats;
                popUpText += `<h1><strong>Statisztikai adatok ${type} kategóriához</strong></h1>`;
                if (stats["ÁKÓ"] && stats["ÁKÓ"][type]) {
                    for (var key in stats["ÁKÓ"][type]) {
                        popUpText += `<p><strong>ÁKÓ ${type} ${key}:</strong></p>`;
                        for (var key2 in stats["ÁKÓ"][type][key]) {
                            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">${JSON.stringify(stats["ÁKÓ"][type][key][key2]["year"])} ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["quarter"])}. negyedév:</strong> ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["value"]).replace(/(\")/g,"")}</p>`;
                        }
                  }
                }
                if (stats["VSM"] && stats["VSM"][type]) {
                    for (var key in stats["VSM"][type]) {
                        popUpText += `<p><strong>VSM ${type} ${key}:</strong></p>`;
                        for (var key2 in stats["VSM"][type][key]) {
                            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">${JSON.stringify(stats["VSM"][type][key][key2]["year"])} ${JSON.stringify(stats["VSM"][type][key][key2]["quarter"])}. negyedév:</strong> ${JSON.stringify(stats["VSM"][type][key][key2]["value"]).replace(/(\")/g,"")}</p>`;
                        }
                  }
                }
            }
        });

          var marker = L.marker(latlng, {icon: icon}).bindPopup(popUpText);
          marker.addTo(map);
        }
      })
    }
  )

if (category.length === 0) {
  setTopSchools([]);
  return;
}

  //get top schools
  var schoolsInBounds = [];
  iskolak.features.forEach((feature) => {
    var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    if (map.getBounds().contains(latlng)) {
      var school = feature
      schoolsInBounds.push(school);  
    }
    })
    
    var topSchools = []

    for (var i = 0; i < schoolsInBounds.length; i++) {
      var school = schoolsInBounds[i];
      for (var j = 0; j < category.length; j++) {
        if (school.properties.overall && school.properties.overall[category[j]]) {
          topSchools.push({
            name: school.properties.name + " " + category[j] + " kategóriában",
            overall: school.properties.overall[category[j]]
          })
        }
      }
    }

console.log(topSchools)

 topSchools =  topSchools.sort(function(a, b) {
      return b.overall - a.overall;
  })
  topSchools = topSchools.slice(0, 50);
  console.log(topSchools)

  setTopSchools(topSchools);

  }

    const map = useMapEvents({
      dragend() {
       MapUpdater();
      },
      dragstart() {
        setTopSchools(["inprogress"]);
      },
      zoomend() {
        MapUpdater();
      },
      load() {
        MapUpdater();
      }
    })
    return null
  }

export const MainMap = (props) => {

  
    var mapBounds = L.latLngBounds(iskolak.features.map(function(feature) {
        return L.geoJSON(feature).getBounds();
    }));
    
    var mapCenter = mapBounds.getCenter();
  

    return (
        <MapContainer loadingControl={true}  center={props.center} zoom={props.zoom} style={{height: "100vh", width: "100%"}}>
          <Dragger category={props.data} setTopSchools={props.setTopSchools} />
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          />
        </MapContainer>
    )
}

function LicenseSelector({setData}) {
  var licenseTypes = ["AM", "A1", "A2", "A", "B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE", "K", "T", "Troli"];  
  var colors = ["red", "green", "gold", "blue", "grey", "orange", "black", "violet", "yellow"];
  
  function handleChange() {
    var checkboxes = document.getElementsByName('categoryCheckbox');
    var labels = document.getElementsByName('categoryLabel');
    var selectedTypes = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        selectedTypes.push(checkboxes[i].value);
      }
    }
    if (selectedTypes.length >= 4) {
      var checkboxes = document.getElementsByName('categoryCheckbox');
      for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].disabled = true;
        }
      }
    } else {
      var checkboxes = document.getElementsByName('categoryCheckbox');
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].disabled = false;
      }
    }
    
    setData(selectedTypes);
  }

  return (
    <div id="license-types">
      {licenseTypes.map((type) => (
        <label name="categoryLabel">
          <input type="checkbox" name="categoryCheckbox" value={type} onChange={() => handleChange()} />
          {type}
        </label>
      ))}
    </div>
  );
}

function SchoolTable({topSchools}) {

  if (topSchools.length === 0) {
    return <div>Nincsenek megjeleníthető adatok!<strong> (a rangsor csak az A, B és C kategóriák esetén elérhető)</strong></div>
  }

  if (topSchools[0] == "inprogress") {
    return <><div style={{textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
      <p>Engedjen fel a frissítéshez!</p>
    <div className="loader" ></div>
    </div>
    </>
  }

  return (
    <>
    <table>
      <thead>
        <tr>
          <th>Iskola neve</th>
          <th>Átlag</th>
        </tr>
      </thead>
      <tbody>
        {topSchools.map((school) => {
          return (
                <tr>
                  <td>{school.name}</td>
                  <td>{school.overall}</td>
                </tr>
              )
        })}
      </tbody>
    </table>
    </>
  );
}



function App() {


  const [ category, setCategory ] = React.useState([]);
  const [ topSchools, setTopSchools ] = React.useState([]);

  return (
    <div className="App">
       <div className="container-fluid">
            <div className="sidebar">
                <h2>Jogosítvány típus</h2>
                <div>
                    <LicenseSelector setData={setCategory} />
                </div>
                <h2>Legjobb* iskolák</h2>
                <div style={{height: "65vh", overflowY: "scroll"}}>
                    <SchoolTable topSchools={topSchools} />
                </div>
            </div>
            <div className="map" style={{height: "100vh", width: "100%"}}>
                <MainMap center={[47.168463, 19.395633]} zoom={8} data={category} setTopSchools={setTopSchools} />
            </div>
        </div>
    </div>
  );
}

export default App;
