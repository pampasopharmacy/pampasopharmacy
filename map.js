var map = L.map("map").setView([6.696983, -1.624179], 15); // Initial coordinates
var marker = L.marker([0, 0], { draggable: true }).addTo(map); // Make the marker draggable
var newLatitude = 0;
var newLongitude = 0;

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Initialize EasyAutocomplete for location suggestions
var options = {
    url: function(phrase) {
        return "https://nominatim.openstreetmap.org/search?format=json&q=" + phrase;
    },
    getValue: "display_name",
    list: {
        match: {
            enabled: true
        }
    }
};

$("#location").easyAutocomplete(options);

// Event handler for when the marker is dragged
marker.on("dragend", function(event) {
    var newLatLng = event.target.getLatLng();
    newLatitude = newLatLng.lat;
    newLongitude = newLatLng.lng;

    // Update the input field with the new coordinates
    document.getElementById("location").value = newLatitude + ", " + newLongitude;

    // Calculate and display the distance
    var initialCoordinates = [6.696983, -1.624179]; // Initial coordinates
    var distance = calculateDistance(initialCoordinates, [newLatitude, newLongitude]);
    var cost = calculateCost(distance);

    document.getElementById("distanceInfo").innerText = "Estimated distance from store: " + distance.toFixed(2) + " miles";
    document.getElementById("costInfo").innerText = "Estimated Delivery Cost: " + cost;
});

function geocodeLocation() {
    var locationInput = document.getElementById("location").value;

    // Use OpenStreetMap's Nominatim geocoding service
    var geocodeURL = "https://nominatim.openstreetmap.org/search?format=json&q=" + locationInput;

    fetch(geocodeURL)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Extract coordinates from the geocoding response
                newLatitude = parseFloat(data[0].lat);
                newLongitude = parseFloat(data[0].lon);

                map.setView([newLatitude, newLongitude], 15);
                marker.setLatLng([newLatitude, newLongitude]);
                marker.bindPopup("Updated Marker Title").openPopup();

                // Calculate and display the distance
                var initialCoordinates = [6.696983, -1.624179]; // Initial coordinates
                var distance = calculateDistance(initialCoordinates, [newLatitude, newLongitude]);
                var cost = calculateCost(distance);

                document.getElementById("distanceInfo").innerText = "Estimated Distance from store: " + distance.toFixed(2) + " miles";
                document.getElementById("costInfo").innerText = "Estimated Delivery Cost: " + cost;
            } else {
                alert("Location not found.");
            }
        })
        .catch(error => {
            console.error(error);
            alert("Error geocoding location.");
        });
}

function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            newLatitude = position.coords.latitude;
            newLongitude = position.coords.longitude;

            map.setView([newLatitude, newLongitude], 15);
            marker.setLatLng([newLatitude, newLongitude]);
            marker.bindPopup("My Location").openPopup();

            // Calculate and display the distance
            var initialCoordinates = [6.696983, -1.624179]; // Initial coordinates
            var distance = calculateDistance(initialCoordinates, [newLatitude, newLongitude]);
            var cost = calculateCost(distance);

            document.getElementById("distanceInfo").innerText = "Estimated Distance from store: " + distance.toFixed(2) + " miles";
            document.getElementById("costInfo").innerText = "Estimated Delivery Cost: " + cost;
        }, function (error) {
            console.error("Error getting location: " + error.message);
            alert("Error getting your location. Please enable location services.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function sendLocationToWhatsApp() {
    var locationURL = "https://www.openstreetmap.org/?mlat=" + newLatitude + "&mlon=" + newLongitude;
    var distance = document.getElementById("distanceInfo").innerText;
    var cost = document.getElementById("costInfo").innerText;
    var whatsappMessage = "Location: " + locationURL + "\n" + distance + "\n" + cost;

    var phoneNumber = "233244245888"; // Replace with the desired WhatsApp number

    var whatsappURL = "https://api.whatsapp.com/send?phone=" + phoneNumber + "&text=" + encodeURIComponent(whatsappMessage);

    window.open(whatsappURL);
}

// Function to calculate the distance in miles using Haversine formula
function calculateDistance(coord1, coord2) {
    var R = 3958.8; // Earth's radius in miles
    var lat1 = coord1[0];
    var lon1 = coord1[1];
    var lat2 = coord2[0];
    var lon2 = coord2[1];

    var dLat = toRadians(lat2 - lat1);
    var dLon = toRadians(lon2 - lon1);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Function to calculate cost based on distance
function calculateCost(distance) {
    if (distance < 2) {
        return "₵" + (15).toFixed(2);
    } else if (distance >= 2 && distance < 3) {
        return "₵" + (20).toFixed(2);
    } else if (distance >= 3 && distance < 4) {
        return "₵" + (25).toFixed(2);
    } else if (distance >= 4 && distance < 5) {
        return "₵" + (30).toFixed(2);
    } else if (distance >= 5 && distance < 7) {
        return "₵" + (37).toFixed(2);
    } else if (distance >= 7 && distance < 9) {
        return "₵" + (40).toFixed(2);
     } else if (distance >= 9 && distance < 11) {
         return "₵" + (46).toFixed(2);
     } else if (distance >= 11 && distance < 14) {
         return "₵" + (50).toFixed(2);
     } else {
        // Handle distances greater than or equal to 6 miles
        // You can add your own logic here if needed
        return "Delivery will be negotiated since distance from store exceeds 14 miles";
    }
}
