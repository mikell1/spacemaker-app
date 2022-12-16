import './leaflet/leaflet.css';

import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet'
import { useState, useRef } from 'react';
import { useMapEvents } from 'react-leaflet/hooks'

import union from '@turf/union';
import intersect from '@turf/intersect';
import area from '@turf/area';


/**
 * Component for showing the work surface.
 *
 * @component
 * @param {object} props the component's properties
 */
function WorkSurface(props) {
    const selected = useRef(null);
    let collection = props.solution;

    const [featureCollection, setFeatureCollection] = useState(collection);
    const [actionOptions, setActionOptions] = useState(null);
    const [waiterKey, rerenderGeoJSON] = useState(0);

    /**
     * Component for showing the select options is shown right above the user's click.
     * The available operations on polygons are intersect and union.
     * The component is visible when a polygon is clicked.
     * 
     * @component
     */
    function SelectOptions() {
        let options = actionOptions;
        if (options == null) return null;

        const selectOperation = (operation) => {
            selected.current.operation = operation;
            setPolygonStyle(operation, selected.current.layer)
            setActionOptions(null);
        }
        return (
            <div className='p-options' style={{top: options.top + "px", left: options.left + "px"}}>
                <button onClick={() => selectOperation("intersect")}>
                    Intersect
                </button>
                <button onClick={() => selectOperation("union")}>
                    Union
                </button>
            </div>
        );
    }

    /**
     * Selects the polygon if an operation is not set, otherwise calls polygonOperation()
     * which performs an operation on the selected polygons.
     * 
     * @param {Event} event the click event
     * @param {Polygon} polygon the polygon
     * @param {Layer} layer the polygon's GeoJSON layer object
     */
    function polygonOnClick(event, polygon, layer) {
        if (selected.current && selected.current.operation) {
            polygonOperation(selected.current.operation, selected.current.polygon, polygon);
            setPolygonStyle("unselect", selected.current.layer);
            selected.current = null;
        } else {
            if (selected.current) setPolygonStyle("unselect", selected.current.layer);
            setPolygonStyle("select", layer);
            selected.current = {
                "polygon": polygon,
                "layer": layer,
                "operation": false
            }
            props.updateStatistics(area(selected.current.polygon));
            setActionOptions({
                "top": event.containerPoint.y - 54,
                "left": event.containerPoint.x - 50,
            });
        }
    }

    /**
     * Sets the style of a polygon's layer, in particular its color
     * 
     * @param {str} type the new style of the polygon
     * @param {Layer} layer the polygon's GeoJSON layer object
     */
    function setPolygonStyle(type, layer) {
        if (type === "hover") layer.setStyle({color: "#0da20d"})
        if (type === "hoverend") layer.setStyle({color: "#3388ff"})
        if (type === "select") layer.setStyle({color: "green"})
        if (type === "unselect") layer.setStyle({color: "#3388ff"})
        if (type === "intersect") layer.setStyle({color: "yellow"})
        if (type === "union") layer.setStyle({color: "yellow"})
    }

    /**
     * Specifies events for each polygon individually.
     */
    function onEachFeature(feature, layer){
        layer.on({
            click: (event) => polygonOnClick(event, feature, layer),
            mouseover: () => {if (!selected.current || feature !== selected.current.polygon) setPolygonStyle("hover", layer)},
            mouseout: () => {if (!selected.current || feature !== selected.current.polygon) setPolygonStyle("hoverend", layer)}
        });
    }

    /**
     * Performs an operation (intersect or union) on two polygons.
     * Rerenders the GeoJSON object with the new polygon if the operation was a success.
     * 
     * @param {str} operation the operation to be performed on the two polygons
     * @param {Polygon} poly1 the first polygon
     * @param {Polygon} poly2 the second polygon
     */
    function polygonOperation(operation, poly1, poly2) {
        var newPolygon;
        if (operation === "intersect") newPolygon = intersect(poly1, poly2);
        if (operation === "union") newPolygon = union(poly1, poly2);
        if (!newPolygon) return;    //returns quickly if operation cannot be done.

        var newCollection = collection;
        newCollection.features = collection.features.filter(e => e !== poly1 && e !== poly2);
        newCollection.features.push(newPolygon);
        collection = newCollection;
        setFeatureCollection(newCollection);
        rerenderGeoJSON((count) => count + 1);
        props.updateStatistics(null);
    }

    /**
     * Adds an eventHandler to the map, in particular a click handler
     * When users click anywhere on the map that is not a polygon or the select options,
     * the selected polygon will be unselected, select options hidden and statistics updated.
     */
    function EventHandler() {
        useMapEvents({
            click: (event) => {
                try {
                    if (event.originalEvent.originalTarget.className.includes("leaflet-container")) {
                        setActionOptions(null);
                        if (selected.current) setPolygonStyle("unselect", selected.current.layer)
                        selected.current = null;
                        props.updateStatistics(null);
                    }
                } catch (error) {}
            }
        })
        return null;
    }

    /**
     * Calculates the centroid of a FeatureCollection.
     * 
     * @param {FeatureCollection} collection the FeatureCollection
     * @returns {LatLngExpression} the centroid
     */
    function centerPoint(collection) {
        let minLat = Infinity;
        let minLon = Infinity;
        let maxLat = -Infinity;
        let maxLon = -Infinity;
        for (var i = 0; i < collection.features.length; i++) {
            let poly = collection.features[i];
            for (var j = 0; j < poly.geometry.coordinates.length; j++) {
                let coordsset = poly.geometry.coordinates[j];
                for (var k = 0; k < coordsset.length; k++) {
                    let point = coordsset[k];
                    minLon = Math.min(minLon, point[0]);
                    maxLon = Math.max(maxLon, point[0]);
                    minLat = Math.min(minLat, point[1]);
                    maxLat = Math.max(maxLat, point[1]);
                }
            }
        }
        return [(minLat + maxLat)/2, (minLon + maxLon)/2];
    }
    
    return (
        <MapContainer center={centerPoint(collection)} zoom={16}>
            <EventHandler />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            />
            <SelectOptions />
            <GeoJSON key={waiterKey} data={featureCollection} onEachFeature={onEachFeature} />
        </MapContainer>
    );
}



export default WorkSurface;