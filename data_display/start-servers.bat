@echo off
echo Starting Satellite Data Display...
echo.
echo This will automatically load data from Google Apps Script:
echo https://script.google.com/macros/s/AKfycbzGTpGEHKNOUAyRujHVE7-SNEZDo9pAWV1_NW-ykJgzyCv9MY-tNBB3M22mpUyxmQkn/exec
echo.

echo Starting frontend server...
start "Frontend Server" cmd /k "npm start"

echo.
echo Frontend: http://localhost:3000
echo.
echo The app will automatically load data from Google Apps Script.
echo No backend server needed - data is fetched directly from the script!
echo.
echo Press any key to close this window...
pause > nul
