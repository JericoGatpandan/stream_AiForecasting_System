# STREAM Weather Application Data Directory

This directory contains all the geospatial and sensor data for the STREAM Weather Application. The structure is designed to make it easy to add, edit, or remove sensors and barangay information without modifying the application code.

## Directory Structure

```
data/
├── barangays.json           # Index file listing all available barangays
├── sensors.json             # All weather sensors with their latest readings
├── barangays/               # Directory containing individual barangay GeoJSON files
│   ├── abella.geojson       # Polygon boundary for Abella barangay
│   ├── [barangay-id].geojson # Add additional barangay files here
```

## How to Add a New Barangay

1. **Create a GeoJSON File**
   - Create a new file in the `barangays/` directory with the name `[barangay-id].geojson`
   - Ensure the GeoJSON file includes:
     - Polygon coordinates for the barangay boundary
     - Properties including at least the `name` field

2. **Update `barangays.json`**
   - Add a new entry to the `barangays` array with the following structure:

```json
{
  "id": "your-barangay-id",
  "name": "Barangay Display Name",
  "file": "your-barangay-id.geojson",
  "center": [longitude, latitude],
  "zoom_level": 15,
  "status": "active"
}
```

## How to Add or Update Sensors

1. **Edit `sensors.json`**
   - To add a new sensor, add a new object to the `sensors` array:

```json
{
  "id": "unique-sensor-id",
  "name": "Sensor Display Name",
  "barangay": "Associated Barangay Name",
  "lat": 13.1234,
  "lng": 123.1234,
  "status": "active",
  "readings": {
    "water_level": 0.0,
    "rainfall": 0.0,
    "temperature": 28.0,
    "humidity": 70,
    "wind_speed": 10.0,
    "wind_direction": "NE",
    "visibility": 15.0,
    "uv_index": 5.0,
    "scope": 800
  }
}
```

2. **Update Existing Sensor Readings**
   - Find the sensor in the `sensors.json` file
   - Update the values in the `readings` object

## Data Format Guidelines

### Barangay GeoJSON
- Must be valid GeoJSON format
- Should include a `FeatureCollection` with at least one `Feature` of type `Polygon`
- Properties should include `name` matching the barangay name

### Sensors JSON
- Each sensor must have a unique `id`
- `barangay` field should match one of the barangay names
- `lat` and `lng` must be valid coordinates within Naga City
- All reading values should be numeric (except wind direction)

## Tips for Managing Data

- Keep backups of your data before making significant changes
- Use tools like [geojson.io](https://geojson.io/) to create or edit GeoJSON files
- Validate your GeoJSON files using tools like [GeoJSONLint](http://geojsonlint.com/)
- When updating sensor data regularly, consider automating the process