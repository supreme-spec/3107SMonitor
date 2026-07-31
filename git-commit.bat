@echo off
cd /d "D:\smart-security-monitor\smart-security-monitor"

echo Initializing git repository...
git init

echo Adding remote repository...
git remote add origin https://github.com/supreme-spec/3107SMonitor.git

echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Fix: Database restore from ZIP archive with embedding support

- Fixed race condition during database extraction from ZIP
- Added WAL file handling for SQLite database integrity  
- Added database validation after restore (size, table count)
- Added embedding count verification after restore
- Fixed face-engine function imports (registerPerson, unregisterPerson)
- Added missing imports: getEmbeddingCountForPerson, removeDescriptorsByPhotoPath, reloadFaceDescriptors, syncIndexWithPython
- Improved backup process to include WAL files
- Enhanced logging for restore process"

echo Renaming branch to main...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause