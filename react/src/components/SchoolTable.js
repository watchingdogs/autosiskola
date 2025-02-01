import React from "react"

export function SchoolTable({ topSchools, setLatlong }) {
  if (topSchools.length === 0) {
    return (
      <div>
        Nincsenek megjeleníthető adatok!<strong> (a rangsor csak az A, B és C kategóriák esetén elérhető)</strong>
      </div>
    )
  }

  if (topSchools[0] === "inprogress") {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <p>Engedjen fel a frissítéshez!</p>
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Iskola neve</th>
          <th>Pontszám</th>
        </tr>
      </thead>
      <tbody>
        {topSchools.map((school, index) => {
          return (
            <tr key={index}>
              <td className="school-name-interactive" onClick={() => setLatlong([school.lat, school.lng])}>
                {school.name}
              </td>
              <td>{(Math.round(school.overall * 100) / 100).toFixed(2)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
