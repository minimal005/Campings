// код з документації https://docs.mapbox.com/mapbox-gl-js/example/cluster/
// кластерна карта на головній сторінці

// встановлення маркера карти
mapboxgl.accessToken = mapToken;

// створення карти
const map = new mapboxgl.Map({
  container: "cluster-map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/light-v10",
  center: [-103.5917, 40.6699],
  zoom: 3,
});

// Додаємо навігацію на карту
const nav = new mapboxgl.NavigationControl();
map.addControl(nav);

map.on("load", () => {
  // Додайте нове джерело з наших географічних даних JSON
  // і встановіть для параметра кластера значення true. GL-JS will
  // add the point_count property to your source data.

  //   реєструємо джерело (sourse) campgrounds, на яке потім посилатимемося
  map.addSource("campgrounds", {
    type: "geojson",
    // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.

    // в index.ejs налаштуємо скрипт (campgrounds) в <script> для mapbox
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "campgrounds",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#00BCD4",
        10,
        "#2196F3",
        30,
        "#3F51B5",
      ],
      "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "campgrounds",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  //   вигляд некасмомізованих точок
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "campgrounds",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 6,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  // inspect a cluster on click
  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("campgrounds")
      //   метод називається 'отримання масштабування розширення кластера'.
      //   Цей код відповідає за те, що коли ви натискаєте на кластер, це наближає вас до карти?
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  //   Коли подія клацання відбувається на об’єкті в шарі некластеризованих точок,
  // відкривається спливаюче вікно в місці розташування об’єкта з описом HTML із його властивостей.
  //  при створенні власних даних набір має містити geometry і properties інфо: https://docs.mapbox.com/help/getting-started/creating-data/

  map.on("click", "unclustered-point", (e) => {
    const { popUpMarkup } = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    // Переконайтеся, що якщо карту зменшено, щоб було видно кілька копій об’єкта, спливаюче
    // вікно з’явилося над копією, на яку вказано.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
});
