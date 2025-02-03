import { LicenseSelector } from "../LicenseSelector"
import { SchoolTable } from "../SchoolTable"

export function SideBar(props) {
  return (
    <div className="sidebar">
      <a href="/" style={{ color: "white" }}>Kilépés a főoldalra</a>
      {true ? (
        <div id="da-selecta" style={{ marginBottom: "20px" }}>
          <h2>Jogosítvány kategóriák</h2>
          <LicenseSelector setCategories={props.setCategories} categories={props.categories} />
        </div>
      ) : null}
      <div id="da-table" style={{ overflowY: "scroll", height: "95vh" }}>
        <h2>
          Rangsor
          <a
            target="_blank"
            href="https://github.com/watchingdogs/autosiskola#a-statisztikák-és-a-rangsor-jelentése"
            style={{ fontSize: "0.6em", verticalAlign: "super", color: "#bde6f9" }}
            rel="noreferrer"
          >
            [Mi ez?]
          </a>
        </h2>
        <SchoolTable topSchools={props.topSchools} setLatlong={props.setLatlong}/>
      </div>
    </div>
  )
}
