import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Token from .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Map() {
    // Create a ref for the div
    const mapContainer = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current, // ✅ ref, not string
            style: "mapbox://styles/mapbox/streets-v11",
            center: [123.2700, 13.6475], // [lng, lat]
            zoom: 12,
        });

        return () => {
            map.remove();
        };
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{
                width: "100%",
                height: "100vh", // make sure it’s visible
            }}
        />
    );
}
