import { useEffect } from "react"
import { COLORS, LICENCE_TYPES } from "../helpers/constants"

export function LicenseSelector({ setCategories, categories }) {
  var checkboxes = document.getElementsByName("categoryCheckbox")

  useEffect(() => {
    var labels = document.getElementsByName("categoryLabel")
    //Reset legend colors
    for (var i = 0; i < labels.length; i++) {
      labels[i].style.color = "white"
    }

    categories.forEach((cat) => {
      var color = COLORS[categories.indexOf(cat) % 9]
      var checkboxes = document.getElementsByName("categoryCheckbox")
      var labels = document.getElementsByName("categoryLabel")
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].value === cat) {
          //Set legend color for marker (if categories matches)
          labels[i].style.color = color
        }
      }
    })

    // The user can select up to 9 license types
    if (categories.length >= 9) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].disabled = true
        }
      }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].disabled = false
      }
    }
  }, [categories, checkboxes])

  function handleChange() {
    var selectedTypes = []
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        selectedTypes.push(checkboxes[i].value)
      }
    }
    setCategories(selectedTypes)
  }

  return (
    <div id="license-types">
      {LICENCE_TYPES.map((type) => (
        <label name="categoryLabel" key={type}>
          <input type="checkbox" name="categoryCheckbox" value={type} onChange={handleChange} checked={categories.includes(type)} />
          {type}
        </label>
      ))}
    </div>
  )
}
