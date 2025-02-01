import "leaflet-loading"
import "leaflet-loading/src/Control.Loading.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet/dist/leaflet.css"
import * as React from "react"
import "./App.css"
import { Navigation } from "./components/layout/Navigation"
import { SideBar } from "./components/layout/SideBar"
import { Map } from "./components/Map"
import { PopupComponent } from "./components/PopupComponent"
import { usePopup } from "./hooks/usePopup"

function App() {
  const { isModalOpen, openModal, closeModal } = usePopup()
  const [isCategoriesShown, setIsCategoriesShown] = React.useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

  const [categories, setCategories] = React.useState([])
  const [topSchools, setTopSchools] = React.useState([])
  const [latlong, setLatlong] = React.useState([])

  React.useEffect(() => {
    if (categories.length > 0) {
      setIsCategoriesShown(false)
    }
  }, [categories])

  const showCategories = () => {
    setIsCategoriesShown(true)
  }

  return (
    <div className="App">
      <Navigation openModal={openModal} isSidebarOpen={isSidebarOpen} showCategories={showCategories} setIsSidebarOpen={setIsSidebarOpen} />
      <PopupComponent closeModal={closeModal} isModalOpen={isModalOpen} />
      <div className="container-fluid">
        {isSidebarOpen ? <SideBar topSchools={topSchools} setLatlong={setLatlong} setCategories={setCategories} isCategoriesShown={isCategoriesShown} categories={categories} /> : null}
        <Map categories={categories} setTopSchools={setTopSchools} latlong={latlong} isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  )
}

export default App
