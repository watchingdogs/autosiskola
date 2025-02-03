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

import MapImage from "../src/map.png"


import { Button, Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';

const BrowserRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/map',
    element: <AppMap />,
  },
  {
    path: '/about',
    element: <About />,
  },
])

function AppMap() {
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
      <Navigation isSidebarOpen={isSidebarOpen} showCategories={showCategories} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="container-fluid">
        {isSidebarOpen ? <SideBar topSchools={topSchools} setLatlong={setLatlong} setCategories={setCategories} isCategoriesShown={isCategoriesShown} categories={categories} /> : null}
        <Map categories={categories} setTopSchools={setTopSchools} latlong={latlong} isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  )
}

function MainNavigation() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">Autósiskola térkép</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/map">Térkép</Nav.Link>
            <Nav.Link href="/about">Módszertan</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

function Home() {
  return (
    <>
    <MainNavigation />
    <div className="textContainer" style={{ overflowY: "unset", height: "100%"}}>
          <h1 style={{ marginBottom: "20px", marginTop: "20px"}}>Magyarországi autósiskolák térképe</h1>
          <p style={{ marginLeft: "20vw", marginRight: "20vw", textAlign: "justify"}}>A nagyobb városokban nehéz magabiztosan autósiskolát választani. Mi ezt a problémát próbáljuk megoldani, és egyszerűbbé tenni ezt a folyamatot mindenki számára. Nem a mi feladatunk lenne, hogy ezt megoldjuk, hanem a KAV-é (Közlekedési Alkalmassági és Vizsgaközpont Nonprofit Kft.), mivel náluk van az összes adat. Emellett sajnos az eduKRESZ egyik weboldala sem ad átfogó képet a biztos választáshoz, ezért jött létre ez a projekt.</p>
          <div>
          <img src={MapImage} alt="Map" style={{ width: "100%", height: "auto", marginTop: "20px", marginBottom: "20px"}} />
            <h2 style={{ marginBottom: "15px"}}>Hogyan működik a térkép?</h2>
            <ol>
              <li>Válaszd ki a jogosítvány kategóriát. (Választhatsz többet is, ilyenkor <strong>a színek a különböző kategóriákat jelzik.</strong>)</li>
              <li>Zoomolj a térképen arra a területre, ahol keresel.</li>
              <li>
                Az A, B és C kategóriák esetében a bal oldalon megjelennek az adott terület iskolái rangsorolva, a besorolás alapját az{" "}
                <a target="_bank" href="https://github.com/watchingdogs/autosiskola#a-statisztikák-és-a-rangsor-jelentése">
                  Átlagos Képzési Óraszám és a forgalmi Vizsga Sikerességi Mutató
                </a>{" "}
                képezik. A rangsorban mindig csak a képernyőn látható iskolák szerepelnek.
              </li>
              <li>Egy-egy térképjelölőre kattintva meg lehet nézni az adott iskola legutóbbi két negyedéves statisztikáját, valamint egyéb elérhető infókat.</li>
            </ol>
            <p style={{ paddingBottom: "30px"}}>
              Részletes magyarázat{" "}
              <a target="_blank" href="https://github.com/watchingdogs/autosiskola" autoFocus rel="noreferrer">
                GitHub-on található
              </a>
              .
            </p>
          </div>
        </div>
    </>
  )
}

function About() {
  return (
    <>
    <MainNavigation />
    <div className="textContainer">
          <h1 style={{ marginBottom: "20px", marginTop: "20px"}}>Módszertan</h1>
          <p style={{ marginLeft: "15vw", marginRight: "15vw", textAlign: "justify"}}>A rangsor pontszáma két statisztikát vesz alapul: az Átlagos Képzési Óraszámot (ÁKÓ) és a forgalmi Vizsga Sikerességi Mutatót (VSM). Ezeket a felugró ablakok is mutatják.</p>
          <p style={{ marginLeft: "15vw", marginRight: "15vw", textAlign: "justify"}}>Az <strong>ÁKÓ</strong> azt mutatja meg, hogy a minimum teljesítendő gyakorlati (vezetési) órákhoz képest a tanulók ténylegesen hány többletórát vesznek a sikeres vizsgáig. B kategóriás jogosítványnál a minimum 29 óra jeleneti a 100%-ot, és így például 158% 46 gyakorlati órát jelent. Ez természetesen nem csak az iskolákat minősíti, hanem a vizsgázókat is. Elképzelhető, hogy egy iskolához csak kiemelkedően tehetséges vagy gyenge tanulók jelentkeztek egy adott időszakban. A VSM-nak két típusa van, az elméleti és a gyakorlati. Az elméleti VSM nincs beleszámolva a rangsor pontszámába, mivel sok helyen E-Titánon keresztül lehet KRESZ tanfolyamot végezni, így nem lehet megkülönböztetni ezeket az eseteket a tantermi oktatást végző iskoláktól.</p>
          <p style={{ marginLeft: "15vw", marginRight: "15vw", textAlign: "justify"}}>A rangsor pontszáma tehát az elméleti VSM és az ÁKÓ reciprokának az egyenlő súlyozású átlaga. Ez csak a legutóbbi két negyedévet veszi figyelembe, tehát négy adatot átlagol. Minél több adat van, annál pontosabb képet ad az iskoláról a pontszáma.</p>
          <p style={{ marginLeft: "15vw", marginRight: "15vw", textAlign: "justify"}}>A térképjelölőkön az <strong>OÁ</strong> az Országos Átlagot jelenti.</p>
          <p style={{ paddingBottom: "30px", color: "red", fontWeight: "bold"}}>
              Részletes magyarázat{" "}
              <a target="_blank" href="https://github.com/watchingdogs/autosiskola" autoFocus rel="noreferrer">
                GitHub-on található
              </a>
              .
            </p>
    </div>
    </>
  )
}

function App() {
    return (
      <RouterProvider router={BrowserRouter} />
  )
}

export default App
