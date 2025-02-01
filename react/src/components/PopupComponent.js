import { Popup } from "reactjs-popup"

export function PopupComponent({ isModalOpen, closeModal }) {
  return (
    <Popup open={isModalOpen} closeOnDocumentClick onClose={closeModal}>
      <div className="modal">
        <p className="close" onClick={closeModal}>
          &times;
        </p>
        <div className="textContainer">
          <h1>Magyarországi autósiskolák térképe</h1>
          <div>
            <ol>
              <li>Válaszd ki a jogosítvány kategóriát.</li>
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
            <p>
              Részletes magyarázat{" "}
              <a target="_blank" href="https://github.com/watchingdogs/autosiskola" autoFocus rel="noreferrer">
                GitHub-on található
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Popup>
  )
}
