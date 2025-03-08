type CustomLayer = {
  _heat?: boolean;
  _markerCluster?: boolean;
  options?: L.LayerOptions & { className?: string };
} & L.Layer;

export function clearMapLayers(map: L.Map) {
  map.eachLayer((layer: CustomLayer) => {
    if (
      layer._heat ||
      layer._markerCluster ||
      layer.options?.className === "price-marker"
    ) {
      map.removeLayer(layer as L.Layer);
    }
  });
}
