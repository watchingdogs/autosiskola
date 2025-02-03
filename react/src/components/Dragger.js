import L from "leaflet"
import * as React from "react"
import { Marker, Popup, useMapEvents } from "react-leaflet"
import iskolak from "../data/iskolak.json"
import { COLORS } from "../helpers/constants"
import  CommentBox from "./Comment.js"

//Set default icon for markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
})

export function Dragger({ categories, setTopSchools, latlong, setMarkers, isSidebarOpen }) {
  //Array for markers to render
  var markerComponentArray = []

  // Todo, implement efficient way to do this (do not fire every 400ms)
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 20)
  }, [isSidebarOpen])

  React.useEffect(() => {
    MapUpdater()
  }, [categories])

  React.useEffect(() => {
    if (latlong.length === 0) {
      return
    }
    map.setView([latlong[0], latlong[1]], 23)
  }, [latlong])

  function MapUpdater() {
    setMarkers([])
    markerComponentArray = []

    categories.forEach((cat) => {
      iskolak.features.forEach((feature) => {
        var colorIndex = categories.indexOf(cat) % 9
        var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
        if (map.getBounds().contains(latlng) && feature.properties.tags.includes(cat)) {
          //Use colors from the repo of pointhi (refer to array above to see marker colors)
          var icon = new L.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-" + COLORS[colorIndex] + ".png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
          var popUpText = `<h1>${feature.properties.name}</h1>`

          categories.forEach(function (type) {
            if (feature.properties.overall && feature.properties.overall[type]) {
              popUpText += `<p style="margin: 0px"><strong  style="margin: 0px">${type} Pontszám:</strong> ${feature.properties.overall[type]}</p>`
            }
          })

          // Add additional details
          popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">Van E-Titán?:</strong> ${!!feature.properties.etitan ? "Igen" : "Nem"}</p>`
          popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">Cím:</strong> ${feature.properties.address}</p>`
          popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">Kategóriák:</strong> ${feature.properties.tags.join(", ")}</p>`
          popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top: 0px">NKHAzon:</strong> ${feature.properties.nkhid}</p>`

          // Show stats for the selected types
          categories.forEach(function (type) {
            if (feature.properties.stats) {
              var stats = feature.properties.stats
              popUpText += `<h1><strong>${type} Statisztikai adatok</strong></h1>`
              if (stats["ÁKÓ"] && stats["ÁKÓ"][type]) {
                for (var key in stats["ÁKÓ"][type]) {
                  popUpText += `<p style="margin-bottom: 0px;"><strong>ÁKÓ ${type} ${key}:</strong></p>`
                  for (var key2 in stats["ÁKÓ"][type][key]) {
                    //Fucked one liner
                    popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">${JSON.stringify(
                      stats["ÁKÓ"][type][key][key2]["year"]
                    )} ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["quarter"])}. negyedév:</strong> ${JSON.stringify(stats["ÁKÓ"][type][key][key2]["value"]).replace(/(\")/g, "")}</p>`
                  }
                }
              }
              if (stats["VSM"] && stats["VSM"][type]) {
                for (var key in stats["VSM"][type]) {
                  popUpText += `<p style="margin-bottom: 0px;"><strong>VSM ${type} ${key}:</strong></p>`
                  for (var key2 in stats["VSM"][type][key]) {
                    //And one more time
                    popUpText += `<p style="margin-bottom: 0px; margin-top:0px"><strong style="margin-bottom: 0px; margin-top:0px">${JSON.stringify(
                      stats["VSM"][type][key][key2]["year"]
                    )} ${JSON.stringify(stats["VSM"][type][key][key2]["quarter"])}. negyedév:</strong> ${JSON.stringify(stats["VSM"][type][key][key2]["value"]).replace(/(\")/g, "")}</p>`
                  }
                }
              }
            }
          })

          var marker = (
            <Marker position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]} icon={icon}>
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: popUpText }} />
                <CommentBox id={feature.properties.nkhid} />
              </Popup>
            </Marker>
          )
          markerComponentArray.push(marker)
          setMarkers(markerComponentArray)
        }
      })
    })

    if (categories.length === 0) {
      setTopSchools([])
      return
    }

    //Get schoolsin map bounds
    var schoolsInBounds = []
    iskolak.features.forEach((feature) => {
      var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
      if (map.getBounds().contains(latlng)) {
        var school = feature
        schoolsInBounds.push(school)
      }
    })

    var topSchools = []

    for (var i = 0; i < schoolsInBounds.length; i++) {
      var school = schoolsInBounds[i]
      for (var j = 0; j < categories.length; j++) {
        if (school.properties.overall && school.properties.overall[categories[j]]) {
          var lat = parseFloat(school.geometry.coordinates[1])
          var lng = parseFloat(school.geometry.coordinates[0])
          //Make school table data
          topSchools.push({
            name: school.properties.name + " " + categories[j] + " kategóriában",
            overall: school.properties.overall[categories[j]],
            lat: lat,
            lng: lng,
          })
        }
      }
    }

    //Sort top schools by overall score
    topSchools = topSchools.sort(function (a, b) {
      return b.overall - a.overall
    })
    //Get top 50 schools
    topSchools = topSchools.slice(0, 50)
    setTopSchools(topSchools)
  }

  const map = useMapEvents({
    dragend() {
      MapUpdater()
    },
    dragstart() {
      setTopSchools(["inprogress"])
    },
    zoomend() {
      MapUpdater()
    },
    load() {
      MapUpdater()
    },
  })
  return null
}

