import * as React from "react";
import { TileLayer, Marker, Popup, MapContainer, useMapEvents} from "react-leaflet";
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

function Dragger({category, setTopSchools, latlong, setMarkers, sidebarOpen}) {
  //Set colors for markers
  var colors = ["red", "green", "gold", "blue", "grey", "orange", "black", "violet", "yellow"];
  //Array for markers to render
  var markerComponentArray = [];

  // Todo, implement efficient way to do this (do not fire every 400ms)
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 20)
  }, [sidebarOpen])

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
          var popUpText = `<h1>${feature.properties.name}</h1>`
          
          category.forEach(function(type) {
            if (feature.properties.overall && feature.properties.overall[type]) {
                popUpText += `<p style="margin: 0px"><strong  style="margin: 0px">${type} Pontszám:</strong> ${feature.properties.overall[type]}</p>`;
            }
          });
    
        // Add additional details
        popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">Van E-Titán?:</strong> ${ new Boolean(feature.properties.etitan) ? "Igen" : "Nem"}</p>`;
        popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">Cím:</strong> ${feature.properties.address}</p>`;
        popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">Kategóriák:</strong> ${feature.properties.tags.join(', ')}</p>`
        popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">NKHAzon:</strong> ${feature.properties.nkhid}</p>`;


        // Show stats for the selected types
        category.forEach(function(type) {
            if (feature.properties.stats) {
                var stats = feature.properties.stats;
                popUpText += `<h1><strong>${type} Statisztikai adatok</strong></h1>`;
                if (stats["ÁKÓ"] && stats["ÁKÓ"][type]) {
                    for (var key in stats["ÁKÓ"][type]) {
                        popUpText += `<p style="margin-bottom: 0px;"><strong>ÁKÓ ${type} ${key}:</strong></p>`;
                        for (var key2 in stats["ÁKÓ"][type][key]) {
                            //Fucked one liner
                            popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">${JSON.stringify(stats["ÁKÓ"][type][key][key2]["year"])} ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["quarter"])}. negyedév:</strong> ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["value"]).replace(/(\")/g,"")}</p>`;
                        }
                  }
                }
                if (stats["VSM"] && stats["VSM"][type]) {
                    for (var key in stats["VSM"][type]) {
                        popUpText += `<p style="margin-bottom: 0px;"><strong>VSM ${type} ${key}:</strong></p>`;
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
        <MapContainer loadingControl={true}  center={props.center} zoom={props.zoom} style={{height: "95vh", width: "100%"}}>
          <Dragger category={props.data} setTopSchools={props.setTopSchools} latlong={props.latlong} setMarkers={setMarkers} sidebarOpen={props.sidebarOpen}/>
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
                  <td style={{paddingTop: "5px", paddingBottom: "5px"}} onClick={() => setLatlong([school.lat, school.lng])}>{school.name}</td>
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
  const [ sidebarOpen, setSidebarOpen ] = React.useState(true);
  const [ daSelectaOpen, setDaSelecta] = React.useState(true)
  const closeModal = () => {
    setOpen(false);
    cookies.set("popup", "closed", { path: "/" , maxAge: 60*60*1});
  }

  React.useEffect(() => {
    if (cookies.get("popup") === "closed") {
      setOpen(false);
    }
  }, [])

  React.useEffect(() => {
    console.log(daSelectaOpen)
    if (daSelectaOpen) {
      document.getElementById('da-selecta').style.display = "block";
      document.getElementById('category-button').style.display = "none";
      document.getElementById('da-table').style.height = "60vh";
    }
  }, [daSelectaOpen])

  React.useEffect(() => {
    var checkboxes = document.getElementsByName('categoryCheckbox');
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        document.getElementById('category-button').style.display = "";
        document.getElementById('da-selecta').style.display = "none";
        document.getElementById('da-table').style.height = "85vh";
      }
    }
    setDaSelecta(false);
  }, [category])



  React.useEffect(() => {
    if (sidebarOpen) {
      document.getElementsByClassName("sidebar")[0].style.display = "block";
    } else {
      document.getElementsByClassName("sidebar")[0].style.display = "none";
    }
  })

  return (
    
    <div className="App">
      <div style={{backgroundColor: "#202632", height: "5vh"}}></div>
      <button id="sidebar-button" onClick={() => setSidebarOpen(!sidebarOpen)} style={{position: "absolute", top: "10px", left: "10px", zIndex: "1000", backgroundColor: "#202632", color: "white", borderRadius: "5px", border: "none", fontSize: "1.5em", cursor: "pointer"}}>Menü</button>
      <button onClick={() => setOpen(true)} style={{position: "absolute", bottom: "10px", right: "10px", zIndex: "1000", backgroundColor: "#202632", color: "white", borderRadius: "5px", border: "none", fontSize: "1.5em", cursor: "pointer"}}>Súgó</button>
                      <PopupComponent open={open} closeOnDocumentClick onClose={closeModal}>

        <div className="modal">
          <p className="close" onClick={closeModal}>&times;</p>
          <div className="textContainer">
            <h1>Magyarországi autósiskolák térképe</h1>
            <div>
              <ol>
                <li>Válaszd ki a jogosítvány kategóriát.</li>
                <li>Zoomolj a térképen arra a területre, ahol keresel.</li>
                <li>Az A, B és C kategóriák esetében a bal oldalon megjelennek az adott terület iskolái rangsorolva, a besorolás alapját az <a href="https://github.com/watchingdogs/autosiskola#a-statisztikák-és-a-rangsor-jelentése">Átlagos Képzési Óraszám és a forgalmi Vizsga Sikerességi Mutató</a> képezik. A rangsorban mindig csak a képernyőn látható iskolák szerepelnek.</li>
                <li>Egy-egy térképjelölőre kattintva meg lehet nézni az adott iskola legutóbbi két negyedéves statisztikáját, valamint egyéb elérhető infókat.</li>
              </ol>
              <p>Részletes magyarázat <a href="https://github.com/watchingdogs/autosiskola" autoFocus>GitHub-on található</a>.</p>
            </div>
          </div>
        </div>
      </PopupComponent>
       <div className="container-fluid">
            <div className="sidebar">
                <div id="da-selecta" style={{ marginBottom: "20px"}}>
                <h2>Jogosítvány kategóriák</h2>
                    <LicenseSelector setData={setCategory} />
                </div>
                <button onClick={() => setDaSelecta(true)} id="category-button" style={{position: "static", zIndex: "1000", backgroundColor: "#202632", color: "white", borderRadius: "5px", border: "none", fontSize: "1.5em", cursor: "pointer"}}>Kategóriák</button>
                <div id="da-table" style={{overflowY: "scroll", height: "95vh"}}>
                <h2>Rangsor <a href="https://github.com/watchingdogs/autosiskola#a-statisztikák-és-a-rangsor-jelentése" style={{fontSize: "0.6em", verticalAlign: "super", color: "#bde6f9"}}>[Mi ez?]</a></h2>
                    <SchoolTable topSchools={topSchools} setLatlong={setLatlong}/>
                </div>
            </div>
            <div className="map" style={{height: "95vh", width: "100%"}}>
                <MainMap center={[47.168463, 19.395633]} zoom={8} data={category} setTopSchools={setTopSchools} latlong={latlong} sidebarOpen={sidebarOpen}/>
            </div>
        </div>
    </div>
  );
}

export default App;
