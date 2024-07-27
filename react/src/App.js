import * as React from "react";
import { Map, TileLayer, Marker, Popup, MapContainer, useMapEvents, Circle } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import iskolak from './data/iskolak.json';
import "leaflet-loading";
import "leaflet-loading/src/Control.Loading.css"
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Popup as PopupComponent } from "reactjs-popup";
import Cookies from "universal-cookie"
const cookies = new Cookies();

//Set default icon for markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Dragger({category, setTopSchools, latlong, setMarkers}) {
  //Set colors for markers
  var colors = ["red", "green", "gold", "blue", "grey", "orange", "black", "violet", "yellow"];
  //Array for markers to render
  var markerComponentArray = [];

  React.useEffect(() => {
    MapUpdater();
  }, [category])

    React.useEffect(() => {
      if (latlong.length === 0) {
        return;
      }
      map.setView([latlong[0], latlong[1]], 23)
    }, [latlong])


  function MapUpdater() {
  setMarkers([]);
  markerComponentArray = [];
  var labels = document.getElementsByName('categoryLabel');
  //Reset legend colors
  for (var i = 0; i < labels.length; i++) {
    labels[i].style.color = 'white';
  }
  category.forEach((cat) => {
    var color = colors[category.indexOf(cat) % 9];
    var checkboxes = document.getElementsByName('categoryCheckbox');
    var labels = document.getElementsByName('categoryLabel');
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].value === cat) {
        //Set legend color for marker (if category matches)
        labels[i].style.color = color;
      }
    }
    iskolak.features.forEach((feature) => {
        var colorIndex = category.indexOf(cat) % 9;
        var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        if (map.getBounds().contains(latlng) && feature.properties.tags.includes(cat)) {
          //Use colors from the repo of pointhi (refer to array above to see marker colors)
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
                popUpText += `<p style="margin: 0px"><strong  style="margin: 0px">Pontszám ${type}:</strong> ${feature.properties.overall[type]}</p>`;
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
                            //Fucked one liner
                            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">${JSON.stringify(stats["ÁKÓ"][type][key][key2]["year"])} ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["quarter"])}. negyedév:</strong> ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["value"]).replace(/(\")/g,"")}</p>`;
                        }
                  }
                }
                if (stats["VSM"] && stats["VSM"][type]) {
                    for (var key in stats["VSM"][type]) {
                        popUpText += `<p><strong>VSM ${type} ${key}:</strong></p>`;
                        for (var key2 in stats["VSM"][type][key]) {
                            //And one more time
                            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">${JSON.stringify(stats["VSM"][type][key][key2]["year"])} ${JSON.stringify(stats["VSM"][type][key][key2]["quarter"])}. negyedév:</strong> ${JSON.stringify(stats["VSM"][type][key][key2]["value"]).replace(/(\")/g,"")}</p>`;
                        }
                  }
                }
            }
        });

          var marker = (
            <Marker position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]} icon={icon}>
              <Popup>
                <div dangerouslySetInnerHTML={{__html: popUpText}} />
              </Popup>
            </Marker>
          )
          markerComponentArray.push(marker);
          setMarkers(markerComponentArray);
        }
      })
    }
  )

if (category.length === 0) {
  setTopSchools([]);
  return;
}

  //Get schoolsin map bounds
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
          var lat = parseFloat(school.geometry.coordinates[1]);
          var lng = parseFloat(school.geometry.coordinates[0]);
          //Make school table data
          topSchools.push({
            name: school.properties.name + " " + category[j] + " kategóriában",
            overall: school.properties.overall[category[j]],
            lat: lat,
            lng: lng
          })
        }
      }
    }

 //Sort top schools by overall score
 topSchools =  topSchools.sort(function(a, b) {
      return b.overall - a.overall;
  })
  //Get top 50 schools
  topSchools = topSchools.slice(0, 50);
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


function LocateUser() {
  const [position, setPosition] = React.useState(null);

  const blueCircleSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="9" fill="#fefdfe"/>
    <circle cx="10" cy="10" r="7" fill="#0f53ff"/>
  </svg>
  `;

const blueCircleIconUrl = `data:image/svg+xml;base64,${btoa(blueCircleSvg)}`;
  const userIcon = new L.Icon({
    iconUrl: blueCircleIconUrl,
    iconSize: [25, 25], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
  });

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  React.useEffect(() => {
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={userIcon} />
  );
}


export const MainMap = (props) => {

  const [markers, setMarkers] = React.useState([]);
    return (
        <MapContainer loadingControl={true}  center={props.center} zoom={props.zoom} style={{height: "100vh", width: "100%"}}>
          <Dragger category={props.data} setTopSchools={props.setTopSchools} latlong={props.latlong} setMarkers={setMarkers}/>
          <TileLayer
            url="https://api.mapbox.com/styles/v1/erzsil196/clxrvhy6w00p301qw1ibgez6w/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZXJ6c2lsMTk2IiwiYSI6ImNseHJ2OWU5ODB5bmEyc3F3d210NXVkczIifQ.Xl_oYoTm89cQLKi8Z3HsrQ"
          />
          <MarkerClusterGroup maxClusterRadius={50}>
            {markers}
          </MarkerClusterGroup>
          <LocateUser />
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
    // The user can select up to 9 license types
    if (selectedTypes.length >= 9) {
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

function SchoolTable({topSchools, setLatlong}) {

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
          <th>Pontszám</th>
        </tr>
      </thead>
      <tbody>
        {topSchools.map((school) => {
          return (
                <tr>
                  <td onClick={() => setLatlong([school.lat, school.lng])}>{school.name}</td>
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
  const [ latlong, setLatlong ] = React.useState([]);
  const [ open, setOpen ] = React.useState(true);
  const closeModal = () => {
    setOpen(false);
    cookies.set("popup", "closed", { path: "/" , maxAge: 60*60*1});
  }

  React.useEffect(() => {
    if (cookies.get("popup") === "closed") {
      setOpen(false);
    }
  }, [])

  return (
    <div className="App">
                      <PopupComponent open={open} closeOnDocumentClick onClose={closeModal}>
        <div className="modal" style={{backgroundColor: "white", width: "70vw", height: "70vh", borderRadius: "10px"}} >
          <p className="close" onClick={closeModal} style={{textAlign: "right", cursor: "pointer", fontSize: "2em", marginRight: "10px", marginBottom: "0px"}}>
            &times;
          </p>
          <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h1 style={{ marginTop: "0px", marginBottom: "5px", textAlign: "center"}}>Kedves felhasználó!</h1>
          <div style={{ overflowY: "scroll", height: "35vh", width: "50vw"}}>
          <p>Üdvözlünk az oldalunkon. Itt az összes (interneten fellelhető) magyarországi autósiskolát keresheted, hely alapján. Az iskolát jelölő markerre kattintva további információkat érhetsz el az iskolával kapcsolatban. Az iskolákat (A, B, C kategóriában) a statisztikai adatok alapján besoroltuk (de ezek az adatok nem lettek mind ember által ellenőrizve, így csak hozzávetőleges képet adhatnak a szolgáltatás minőségéről). Az iskola nevére kattintva a markerre ugorhatsz a térképen.</p>
          <p style={{ fontWeight: "bold", color: "red"}}>Az oldal használatából, illetve az adatok értelmezéséből felmerülő problémákért jogi felelősséget nem vállalunk!</p>
          <p>Hiba észelése esetén a <a href="https://github.com/watchingdogs/autosiskola">GitHub-on</a> issue nyitásával tudod jelezni a problémát a fejlesztők felé.</p>
          </div>
          </div>
        </div>
      </PopupComponent>
       <div className="container-fluid">
            <div className="sidebar">
                <h2>Jogosítvány kategóriák</h2>

                <div>
                    <LicenseSelector setData={setCategory} />
                </div>
                <h2>Legjobb* iskolák</h2>
                <div style={{height: "65vh", overflowY: "scroll"}}>
                    <SchoolTable topSchools={topSchools} setLatlong={setLatlong}/>
                </div>
            </div>
            <div className="map" style={{height: "100vh", width: "100%"}}>
                <MainMap center={[47.168463, 19.395633]} zoom={8} data={category} setTopSchools={setTopSchools} latlong={latlong}/>
            </div>
        </div>
    </div>
  );
}

export default App;
