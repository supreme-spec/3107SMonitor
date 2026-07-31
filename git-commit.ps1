cd "D:\smart-security-monitor\smart-security-monitor"

Write-Host "Initializing git repository..."
git init

Write-Host "Adding remote repository..."
git remote add origin https://github.com/supreme-spec/3107SMonitor.git

Write-Host "Adding all changes..."
git add .

Write-Host "Committing changes..."
git commit -m "Fix: Database restore from ZIP archive with embedding support

- Fixed race condition during database extraction from ZIP
- Added WAL file handling for SQLite database integrity  
- Added database validation after restore (size, table count)
- Added embedding count verification after restore
- Fixed face-engine function imports (registerPerson, unregisterPerson)
- Added missing imports: getEmbeddingCountForPerson, removeDescriptorsByPhotoPath, reloadFaceDescriptors, syncIndexWithPython
- Improved backup process to include WAL files
- Enhanced logging for restore process"

Write-Host "Renaming branch to main..."
git branch -M main

Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Done!"