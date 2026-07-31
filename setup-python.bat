@echo off
cd /d "D:\smart-security-monitor\smart-security-monitor"

echo Creating Python virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo Downloading InsightFace models...
python -c "import insightface; insightface.app.FaceAnalysis(name='buffalo_l', root='models')"

echo Python setup complete!
pause