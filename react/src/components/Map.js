import MarkerClusterGroup from "@changey/react-leaflet-markercluster"
import React from "react"
import { MapContainer, TileLayer } from "react-leaflet"
import { Dragger } from "./Dragger"
import { LocateUser } from "./LocateUser"

export function Map({ categories, setTopSchools, latlong, isSidebarOpen }) {
  const [markers, setMarkers] = React.useState([])

  return (
    <MapContainer loadingControl={true} center={[47.168463, 19.395633]} zoom={8} style={{ height: "100vh", width: "100%" }}>
      <Dragger categories={categories} setTopSchools={setTopSchools} latlong={latlong} setMarkers={setMarkers} isSidebarOpen={isSidebarOpen} />
      <TileLayer url="https://api.mapbox.com/styles/v1/erzsil196/clxrvhy6w00p301qw1ibgez6w/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZXJ6c2lsMTk2IiwiYSI6ImNseHJ2OWU5ODB5bmEyc3F3d210NXVkczIifQ.Xl_oYoTm89cQLKi8Z3HsrQ" />
      <MarkerClusterGroup maxClusterRadius={50}>{markers}</MarkerClusterGroup>
      <LocateUser />
    </MapContainer>
  )
}
