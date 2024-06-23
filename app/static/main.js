var map = L.map('map').setView([47.168463, 19.395633], 8);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Ezen kívül kb mindent a ChatGPT írt :)

var licenseTypes = ["AM", "A1", "A2", "A", "B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE", "K", "T", "Troli"];
var markers = [];

// Populate the sidebar with checkboxes for license types
var licenseTypesDiv = document.getElementById('license-types');
licenseTypes.forEach(function(type) {
    var label = document.createElement('label');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'licenseType';
    checkbox.value = type;
    checkbox.onchange = function() {
        filterByLicenseType();
    };
    if (type === 'B') {
        checkbox.checked = true; // Set 'B' to be selected by default
    }
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(type));
    licenseTypesDiv.appendChild(label);
    licenseTypesDiv.appendChild(document.createElement('br'));
});

var geojsonLayer;
var geojsonData;

// Fetch the geojson data
fetch("static/iskolak.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        geojsonData = data;
        geojsonLayer = L.geoJson(geojsonData, {
            onEachFeature: function (feature, layer) {
                markers.push(layer);
            }
        }).addTo(map);
        filterByLicenseType(); // Apply initial filter
        updateTopSchoolsList(); // Update the top schools list
    })
    .catch(function(error) {
        console.log(`Error: ${error}`);
    });

map.on('moveend', updateTopSchoolsList);

// Filter points by license type and update popups
function filterByLicenseType() {
    var selectedTypes = Array.from(document.querySelectorAll('input[name="licenseType"]:checked')).map(cb => cb.value);

    if (geojsonLayer) {
        map.removeLayer(geojsonLayer); // Remove existing geojson layer

        var filteredData = {
            "type": "FeatureCollection",
            "features": geojsonData.features.filter(function(feature) {
                return selectedTypes.some(type => feature.properties.tags.includes(type));
            })
        };

        markers = []; // Clear markers array
        geojsonLayer = L.geoJson(filteredData, {
            onEachFeature: function (feature, layer) {
                updatePopup(feature, layer);
                markers.push(layer);
            }
        }).addTo(map);
        updateTopSchoolsList(); // Update the top schools list
    }
}

// Update popup content based on the selected license type
function updatePopup(feature, layer) {
    var selectedTypes = Array.from(document.querySelectorAll('input[name="licenseType"]:checked')).map(cb => cb.value);
    var popupContent = `<div><h3>${feature.properties.name}</h3>`;

    // Show overall stats for the selected types
    selectedTypes.forEach(function(type) {
        if (feature.properties.overall && feature.properties.overall[type]) {
            popupContent += `<p><strong>Overall ${type}:</strong> ${feature.properties.overall[type]}</p>`;
        }
    });

    // Add additional details
    popupContent += `<p><strong>Van E-Titán?:</strong> ${feature.properties.etitan}</p>`;
    if (feature.properties.email) {
        popupContent += `<p><strong>Email:</strong> <a href="mailto:${feature.properties.email}">${feature.properties.email}</a></p>`;
    }
    if (feature.properties.web) {
        popupContent += `<p><strong>Web:</strong> <a href="${feature.properties.web}" target="_blank">${feature.properties.web}</a></p>`;
    }
    if (feature.properties.phone) {
        popupContent += `<p><strong>Phone:</strong> ${feature.properties.phone}</p>`;
    }
    if (feature.properties.address) {
        popupContent += `<p><strong>Address:</strong> ${feature.properties.address}</p>`;
    }
    if (feature.properties.nkhid) {
        popupContent += `<p><strong>NKHAzon:</strong> ${feature.properties.nkhid}</p>`;
    }
    if (feature.properties.tags && feature.properties.tags.length > 0) {
        popupContent += `<p><strong>Tags:</strong> ${feature.properties.tags.join(', ')}</p>`;
    }

    // Show stats for the selected types
    selectedTypes.forEach(function(type) {
        if (feature.properties.stats) {
            var stats = feature.properties.stats;
            popupContent += `<p><strong>Stats for ${type}:</strong></p>`;
            if (stats["ÁKÓ"] && stats["ÁKÓ"][type]) {
                popupContent += `<p><strong>ÁKÓ ${type}:</strong> ${JSON.stringify(stats["ÁKÓ"][type])}</p>`;
            }
            if (stats["VSM"] && stats["VSM"][type]) {
                popupContent += `<p><strong>VSM ${type}:</strong> ${JSON.stringify(stats["VSM"][type])}</p>`;
            }
        }
    });

    popupContent += `</div>`;
    layer.bindPopup(popupContent);
}

// Update the list of top schools in the sidebar
function updateTopSchoolsList() {
    var topSchoolsDiv = document.getElementById('top-schools');
    if (!topSchoolsDiv) return;
    topSchoolsDiv.innerHTML = ''; // Clear the list

    var bounds = map.getBounds();
    var selectedTypes = Array.from(document.querySelectorAll('input[name="licenseType"]:checked')).map(cb => cb.value);

    var schoolsInBounds = markers.filter(function(marker) {
        return bounds.contains(marker.getLatLng()) &&
            selectedTypes.some(type => marker.feature.properties.tags.includes(type));
    });

    var topSchools = schoolsInBounds
        .map(function(marker) {
            var maxOverall = 0;
            selectedTypes.forEach(function(type) {
                if (marker.feature.properties.overall && marker.feature.properties.overall[type]) {
                    maxOverall = Math.max(maxOverall, marker.feature.properties.overall[type]);
                }
            });
            return {
                marker: marker,
                name: marker.feature.properties.name,
                overall: maxOverall
            };
        })
        .sort(function(a, b) {
            return b.overall - a.overall;
        })
        .slice(0, 50); // Limit to top 50

    topSchools.forEach(function(school) {
        var listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${school.name}</strong>: ${school.overall}`;
        listItem.onclick = function() {
            map.setView(school.marker.getLatLng(), 15);
            school.marker.openPopup();
        };
        topSchoolsDiv.appendChild(listItem);
    });
}