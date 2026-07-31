# 🐍 Python Face Engine Setup Guide

## 📋 Overview

The Python Face Engine provides face detection and recognition functionality. The distance estimation module is **optional** and can be enabled/disabled via environment variable.

## 🚀 Quick Setup

### Option 1: Automated Setup (Windows)

```bash
cd "D:\smart-security-monitor\smart-security-monitor"
setup-python.bat
```

This will:
1. Create Python virtual environment (`venv/`)
2. Install all dependencies from `requirements.txt`
3. Download InsightFace models (`buffalo_l`)

### Option 2: Manual Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate.bat

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Download InsightFace models
python -c "import insightface; insightface.app.FaceAnalysis(name='buffalo_l', root='models')"
```

## ⚙️ Configuration

### Enable/Disable Distance Estimation

In your `.env` file:

```env
# Disable distance estimation (default)
FACE_ENABLE_DISTANCE=false

# Enable distance estimation for camera calibration
FACE_ENABLE_DISTANCE=true
```

### Required Environment Variables

```env
# Python Face Engine URL
FACE_SERVER_URL=http://localhost:8001

# API key for Python server
FACE_API_KEY=your-secret-key

# Database path
DB_PATH=prisma/dev.db

# Distance estimation (optional)
FACE_ENABLE_DISTANCE=false
```

## 🎯 Distance Estimation Features

When `FACE_ENABLE_DISTANCE=true`, the following features become available:

### 1. **Distance Calculation**
- Automatic distance estimation from camera
- Ladder calibration method
- Multiple calibration modes (homography, person2, pinhole)

### 2. **Zone Filtering**
- Configure ROI (Region of Interest) polygons
- Filter faces by distance range
- Ignore too close/too far faces

### 3. **Camera Calibration**
- Focal length calibration per camera
- Custom distance thresholds
- Zone-based detection

### 4. **API Endpoints**

**Detect with Distance:**
```bash
curl -X POST http://localhost:8001/detect-with-distance \
  -F "image=@photo.jpg" \
  -F "distance_calib_mode=pinhole" \
  -F "focal_length_px=1000" \
  -F "distance_min_m=2.0" \
  -F "distance_max_m=4.0"
```

**Response:**
```json
{
  "faces": [
    {
      "box": {"x": 100, "y": 50, "width": 80, "height": 100},
      "score": 0.95,
      "distance_m": 3.2,
      "depth_mode": "pinhole",
      "in_zone": true
    }
  ]
}
```

## 🔧 Troubleshooting

### Issue: `venv` already exists
```bash
# Delete existing venv
rmdir /s venv

# Recreate
python -m venv venv
```

### Issue: InsightFace models not downloading
```bash
# Manually download models
python -c "import insightface; insightface.app.FaceAnalysis(name='buffalo_l', root='models', download=True)"
```

### Issue: CUDA errors
If you get CUDA errors but don't have NVIDIA GPU:
```bash
# Install CPU version of onnxruntime
pip uninstall onnxruntime-gpu
pip install onnxruntime
```

### Issue: Distance module fails to load
```bash
# Check if distance.py exists
Test-Path face_server\distance.py

# Disable distance estimation if not needed
# Set FACE_ENABLE_DISTANCE=false in .env
```

## 📊 Performance Impact

### With Distance Disabled (Default)
- ✅ Faster startup
- ✅ Lower memory usage
- ✅ Simpler configuration
- ❌ No distance estimation

### With Distance Enabled
- ✅ Distance estimation available
- ✅ Camera calibration support
- ✅ Zone filtering
- ❌ Slightly slower startup
- ❌ Additional memory usage

## 🎯 Use Cases for Distance Estimation

1. **Camera Calibration**
   - Set focal length per camera
   - Calibrate distance thresholds
   - Optimize detection zones

2. **Zone-Based Detection**
   - Define passage zones
   - Ignore guard zones
   - Filter by distance range

3. **Quality Control**
   - Better recognition at optimal distances
   - Ignore too close/too far faces
   - Adjust detection sensitivity

## 🚀 Starting the Server

### Development Mode
```bash
npm run dev
```
This starts Python server automatically with settings from `.env`.

### Manual Python Server Start
```bash
# Activate virtual environment
venv\Scripts\activate.bat

# Start Python server
python face_server.py
```

### Production Mode
```bash
# Activate virtual environment
venv\Scripts\activate.bat

# Start with uvicorn
uvicorn face_server:app --host 0.0.0.0 --port 8001
```

## ✅ Verification

### Check Python Server Health
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "initialized": true,
  "version": "4.0.0"
}
```

### Test Distance Estimation (if enabled)
```bash
curl -X POST http://localhost:8001/detect-with-distance \
  -F "image=@test-photo.jpg" \
  -H "X-API-Key: your-secret-key"
```

## 📝 Notes

- Distance estimation is **optional** and disabled by default
- The working project (2907SMonitor) doesn't use distance estimation
- This is an additional feature for future camera calibration improvements
- All face recognition features work without distance estimation