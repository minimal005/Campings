//Mapbox GL JS інфо https://docs.mapbox.com/mapbox-gl-js/example/

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12", // вигляд карти, стилі: https://docs.mapbox.com/api/maps/styles/
  center: campground.geometry.coordinates, // відцентровка над координатами
  zoom: 10, // масштаб
});

// додавання маркера
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  // встановлюємо вспливаюче вікно при натисканні на цей маркер
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5>${campground.title}</h5><p>${campground.location}</p>`
    )
  )
  .addTo(map);
