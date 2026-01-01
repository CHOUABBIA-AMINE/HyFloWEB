# Offline Map Tiles

## Directory Structure

This directory contains offline map tiles for Algeria (zoom levels 6-10).

```
tiles/
└── algeria/
    ├── 6/
    │   ├── 29/
    │   │   ├── 19.png
    │   │   ├── 20.png
    │   │   └── 21.png
    │   ├── 30/
    │   │   ├── 19.png
    │   │   ├── 20.png
    │   │   └── 21.png
    │   └── 31/
    ├── 7/
    ├── 8/
    ├── 9/
    └── 10/
```

## Algeria Coverage

### Geographic Bounds
- **North**: 37.5° N
- **South**: 19.0° N
- **West**: 8.7° W
- **East**: 12.0° E

### Zoom Levels: 6-10
- **Zoom 6**: Country overview (~500 tiles, 2 MB)
- **Zoom 7**: Regional view (~2,000 tiles, 8 MB)
- **Zoom 8**: Provincial view (~8,000 tiles, 32 MB)
- **Zoom 9**: City view (~32,000 tiles, 128 MB)
- **Zoom 10**: District view (~130,000 tiles, 520 MB)

**Total**: ~171,000 tiles, ~690 MB

## How to Download Tiles

### Option 1: Using MOBAC (Mobile Atlas Creator)

1. **Download MOBAC**:
   ```bash
   # Download from: https://mobac.sourceforge.io/
   # Or use direct link:
   wget https://sourceforge.net/projects/mobac/files/latest/download -O MOBAC.zip
   unzip MOBAC.zip
   ```

2. **Run MOBAC**:
   ```bash
   java -jar Mobile_Atlas_Creator.jar
   ```

3. **Configure Settings**:
   - Map Source: OpenStreetMap Mapnik
   - Zoom Levels: 6 to 10
   - Output Format: "PNG tiles in OSM structure"

4. **Select Region**:
   - Click "Add Selection"
   - Draw rectangle covering Algeria:
     - Top-left: 37.5°N, 8.7°W
     - Bottom-right: 19.0°N, 12.0°E

5. **Create Atlas**:
   - Name: "algeria"
   - Click "Create Atlas"
   - Wait for download to complete (~30-60 minutes)

6. **Copy Tiles**:
   ```bash
   # MOBAC outputs to: atlases/algeria/
   # Copy tiles to public directory:
   cp -r atlases/algeria/* public/tiles/algeria/
   ```

### Option 2: Using TileStache

```bash
# Install TileStache
pip install tilestache

# Create config file: tilestache.cfg
cat > tilestache.cfg << EOF
{
  "cache": {
    "name": "Disk",
    "path": "./tiles/algeria",
    "umask": "0000"
  },
  "layers": {
    "osm": {
      "provider": {"name": "proxy", "url": "https://tile.openstreetmap.org/{Z}/{X}/{Y}.png"},
      "metatile": {"rows": 4, "columns": 4}
    }
  }
}
EOF

# Download tiles for Algeria
tilestache-seed.py -c tilestache.cfg -l osm -b 19 -8.7 37.5 12 -e png 6 7 8 9 10
```

### Option 3: Using Custom Python Script

See `scripts/download-tiles.py` in the project root.

```bash
python scripts/download-tiles.py \
  --output public/tiles/algeria \
  --bbox 19,-8.7,37.5,12 \
  --zoom 6-10
```

## Tile Server URL Configuration

The offline tiles are accessed via:
```
/tiles/algeria/{z}/{x}/{y}.png
```

Where:
- `{z}` = Zoom level (6-10)
- `{x}` = Tile X coordinate
- `{y}` = Tile Y coordinate

## Storage Considerations

### Development
- Keep tiles in `public/tiles/` for easy access
- Size: ~690 MB

### Production
- Consider using CDN for faster delivery
- Compress tiles with gzip (saves ~30%)
- Use progressive loading

### Optimization

```bash
# Optimize PNG tiles (reduce size by 20-40%)
find public/tiles/algeria -name '*.png' -exec optipng -o7 {} \;

# Or use pngquant for lossy compression (reduce by 50-70%)
find public/tiles/algeria -name '*.png' -exec pngquant --ext .png --force {} \;
```

## License

OpenStreetMap tiles are licensed under:
- **Data**: ODbL (Open Database License)
- **Tiles**: CC BY-SA 2.0

**Attribution Required**: © OpenStreetMap contributors

See: https://www.openstreetmap.org/copyright

## Updating Tiles

To update tiles with latest OSM data:

1. Delete old tiles:
   ```bash
   rm -rf public/tiles/algeria/*
   ```

2. Re-run download process (see above)

3. Clear browser cache to load new tiles

## Troubleshooting

### Tiles Not Loading

1. Check file permissions:
   ```bash
   chmod -R 755 public/tiles/
   ```

2. Verify file structure:
   ```bash
   ls -la public/tiles/algeria/6/30/
   ```

3. Check browser console for 404 errors

### Missing Tiles

Some tiles may be blank (ocean/empty areas). This is normal.
The `OfflineTileLayer` component handles missing tiles gracefully.

## Support

For issues or questions:
- Check: `docs/OFFLINE_MAPS.md`
- GitHub Issues: [Create issue](https://github.com/CHOUABBIA-AMINE/iaas-web/issues)
