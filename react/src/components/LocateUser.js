import * as React from "react"

import L from "leaflet"
import { Marker, useMapEvents } from "react-leaflet"

export function LocateUser() {
  const [position, setPosition] = React.useState(null)

  const blueCircleSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="#fefdfe"/>
      <circle cx="10" cy="10" r="7" fill="#0f53ff"/>
    </svg>
    `

  const blueCircleIconUrl = `data:image/svg+xml;base64,${btoa(blueCircleSvg)}`

  const userIcon = new L.Icon({
    iconUrl: blueCircleIconUrl,
    iconSize: [25, 25], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
  })

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  React.useEffect(() => {
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true })
  }, [map])

  return position === null ? null : <Marker position={position} icon={userIcon} />
}
