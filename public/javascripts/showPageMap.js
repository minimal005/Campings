//Mapbox GL JS інфо https://docs.mapbox.com/mapbox-gl-js/example/

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10", // вигляд карти, як варіант "mapbox://styles/mapbox/streets-v11"
  center: campground.geometry.coordinates, // відцентровка над координатами
  zoom: 10, // масштаб
});

// додавання маркера
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
  )
  .addTo(map);
