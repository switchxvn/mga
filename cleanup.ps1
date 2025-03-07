# Script to clean up unnecessary .js and .js.map files
Write-Host "===== FRONTEND ====="
$frontendJsFiles = Get-ChildItem -Path apps/frontend/src -Recurse -Include *.js -Exclude nuxt.config.js
Write-Host "Found $($frontendJsFiles.Count) .js files in apps/frontend/src"
$frontendJsFiles | ForEach-Object {
    Write-Host "Deleting $($_.FullName)"
    Remove-Item -Path $_.FullName -Force
}
Write-Host "Deleted $($frontendJsFiles.Count) .js files in apps/frontend/src"

$frontendJsMapFiles = Get-ChildItem -Path apps/frontend/src -Recurse -Include *.js.map
Write-Host "Found $($frontendJsMapFiles.Count) .js.map files in apps/frontend/src"
$frontendJsMapFiles | ForEach-Object {
    Write-Host "Deleting $($_.FullName)"
    Remove-Item -Path $_.FullName -Force
}
Write-Host "Deleted $($frontendJsMapFiles.Count) .js.map files in apps/frontend/src"

Write-Host "`n===== BACKEND ====="
$backendJsFiles = Get-ChildItem -Path apps/backend/src -Recurse -Include *.js
Write-Host "Found $($backendJsFiles.Count) .js files in apps/backend/src"
$backendJsFiles | ForEach-Object {
    Write-Host "Deleting $($_.FullName)"
    Remove-Item -Path $_.FullName -Force
}
Write-Host "Deleted $($backendJsFiles.Count) .js files in apps/backend/src"

$backendJsMapFiles = Get-ChildItem -Path apps/backend/src -Recurse -Include *.js.map
Write-Host "Found $($backendJsMapFiles.Count) .js.map files in apps/backend/src"
$backendJsMapFiles | ForEach-Object {
    Write-Host "Deleting $($_.FullName)"
    Remove-Item -Path $_.FullName -Force
}
Write-Host "Deleted $($backendJsMapFiles.Count) .js.map files in apps/backend/src"

Write-Host "`n===== LIBS ====="
$libsJsFiles = Get-ChildItem -Path libs -Recurse -Include *.js
Write-Host "Found $($libsJsFiles.Count) .js files in libs"
$libsJsFiles | ForEach-Object {
    Write-Host "Deleting $($_.FullName)"
    Remove-Item -Path $_.FullName -Force
}
Write-Host "Deleted $($libsJsFiles.Count) .js files in libs"

$libsJsMapFiles = Get-ChildItem -Path libs -Recurse -Include *.js.map
Write-Host "Found $($libsJsMapFiles.Count) .js.map files in libs"
$libsJsMapFiles | ForEach-Object {
    Write-Host "Deleting $($_.FullName)"
    Remove-Item -Path $_.FullName -Force
}
Write-Host "Deleted $($libsJsMapFiles.Count) .js.map files in libs"

Write-Host "`n===== COMPLETED ====="
$totalCount = $frontendJsFiles.Count + $frontendJsMapFiles.Count + $backendJsFiles.Count + $backendJsMapFiles.Count + $libsJsFiles.Count + $libsJsMapFiles.Count
Write-Host "Deleted a total of $totalCount unnecessary files" 