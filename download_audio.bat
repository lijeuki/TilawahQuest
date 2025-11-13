@echo off
:: TilawahQuest Audio Downloader
:: Downloads all Quran audio files from verses.quran.com
:: Organizes by Surah name and Ayah number

echo ========================================
echo   TilawahQuest Audio Downloader
echo ========================================
echo.
echo This will download all Quran audio files
echo Reciter: Mishary Alafasy
echo Source: verses.quran.com
echo.
echo Total files: ~6,236 ayahs
echo Estimated size: ~300-600 MB
echo Estimated time: ~30-60 minutes
echo.
pause

:: Check if curl is available
where curl >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: curl is not installed or not in PATH
    echo Please install curl or use Windows 10/11 which has it built-in
    pause
    exit /b 1
)

:: Create directory structure
echo Creating directory structure...
if not exist "public\audio\alafasy" mkdir "public\audio\alafasy"
if not exist "public\audio\logs" mkdir "public\audio\logs"

:: Log file
set LOGFILE=public\audio\logs\download_log_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt
set LOGFILE=%LOGFILE: =0%
echo Download started at %date% %time% > "%LOGFILE%"
echo. >> "%LOGFILE%"

:: Download function with surah names
:: Format: surah_number ayah_count surah_name
echo Starting download...
echo.

call :download_surah 1 7 "Al-Fatihah"
call :download_surah 2 286 "Al-Baqarah"
call :download_surah 3 200 "Ali-Imran"
call :download_surah 4 176 "An-Nisa"
call :download_surah 5 120 "Al-Maidah"
call :download_surah 6 165 "Al-Anam"
call :download_surah 7 206 "Al-Araf"
call :download_surah 8 75 "Al-Anfal"
call :download_surah 9 129 "At-Tawbah"
call :download_surah 10 109 "Yunus"
call :download_surah 11 123 "Hud"
call :download_surah 12 111 "Yusuf"
call :download_surah 13 43 "Ar-Rad"
call :download_surah 14 52 "Ibrahim"
call :download_surah 15 99 "Al-Hijr"
call :download_surah 16 128 "An-Nahl"
call :download_surah 17 111 "Al-Isra"
call :download_surah 18 110 "Al-Kahf"
call :download_surah 19 98 "Maryam"
call :download_surah 20 135 "Ta-Ha"
call :download_surah 21 112 "Al-Anbiya"
call :download_surah 22 78 "Al-Hajj"
call :download_surah 23 118 "Al-Muminun"
call :download_surah 24 64 "An-Nur"
call :download_surah 25 77 "Al-Furqan"
call :download_surah 26 227 "Ash-Shuara"
call :download_surah 27 93 "An-Naml"
call :download_surah 28 88 "Al-Qasas"
call :download_surah 29 69 "Al-Ankabut"
call :download_surah 30 60 "Ar-Rum"
call :download_surah 31 34 "Luqman"
call :download_surah 32 30 "As-Sajdah"
call :download_surah 33 73 "Al-Ahzab"
call :download_surah 34 54 "Saba"
call :download_surah 35 45 "Fatir"
call :download_surah 36 83 "Ya-Sin"
call :download_surah 37 182 "As-Saffat"
call :download_surah 38 88 "Sad"
call :download_surah 39 75 "Az-Zumar"
call :download_surah 40 85 "Ghafir"
call :download_surah 41 54 "Fussilat"
call :download_surah 42 53 "Ash-Shuraa"
call :download_surah 43 89 "Az-Zukhruf"
call :download_surah 44 59 "Ad-Dukhan"
call :download_surah 45 37 "Al-Jathiyah"
call :download_surah 46 35 "Al-Ahqaf"
call :download_surah 47 38 "Muhammad"
call :download_surah 48 29 "Al-Fath"
call :download_surah 49 18 "Al-Hujurat"
call :download_surah 50 45 "Qaf"
call :download_surah 51 60 "Adh-Dhariyat"
call :download_surah 52 49 "At-Tur"
call :download_surah 53 62 "An-Najm"
call :download_surah 54 55 "Al-Qamar"
call :download_surah 55 78 "Ar-Rahman"
call :download_surah 56 96 "Al-Waqiah"
call :download_surah 57 29 "Al-Hadid"
call :download_surah 58 22 "Al-Mujadilah"
call :download_surah 59 24 "Al-Hashr"
call :download_surah 60 13 "Al-Mumtahanah"
call :download_surah 61 14 "As-Saff"
call :download_surah 62 11 "Al-Jumuah"
call :download_surah 63 11 "Al-Munafiqun"
call :download_surah 64 18 "At-Taghabun"
call :download_surah 65 12 "At-Talaq"
call :download_surah 66 12 "At-Tahrim"
call :download_surah 67 30 "Al-Mulk"
call :download_surah 68 52 "Al-Qalam"
call :download_surah 69 52 "Al-Haqqah"
call :download_surah 70 44 "Al-Maarij"
call :download_surah 71 28 "Nuh"
call :download_surah 72 28 "Al-Jinn"
call :download_surah 73 20 "Al-Muzzammil"
call :download_surah 74 56 "Al-Muddathir"
call :download_surah 75 40 "Al-Qiyamah"
call :download_surah 76 31 "Al-Insan"
call :download_surah 77 50 "Al-Mursalat"
call :download_surah 78 40 "An-Naba"
call :download_surah 79 46 "An-Naziat"
call :download_surah 80 42 "Abasa"
call :download_surah 81 29 "At-Takwir"
call :download_surah 82 19 "Al-Infitar"
call :download_surah 83 36 "Al-Mutaffifin"
call :download_surah 84 25 "Al-Inshiqaq"
call :download_surah 85 22 "Al-Buruj"
call :download_surah 86 17 "At-Tariq"
call :download_surah 87 19 "Al-Ala"
call :download_surah 88 26 "Al-Ghashiyah"
call :download_surah 89 30 "Al-Fajr"
call :download_surah 90 20 "Al-Balad"
call :download_surah 91 15 "Ash-Shams"
call :download_surah 92 21 "Al-Lail"
call :download_surah 93 11 "Ad-Duhaa"
call :download_surah 94 8 "Ash-Sharh"
call :download_surah 95 8 "At-Tin"
call :download_surah 96 19 "Al-Alaq"
call :download_surah 97 5 "Al-Qadr"
call :download_surah 98 8 "Al-Bayyinah"
call :download_surah 99 8 "Az-Zalzalah"
call :download_surah 100 11 "Al-Adiyat"
call :download_surah 101 11 "Al-Qariah"
call :download_surah 102 8 "At-Takathur"
call :download_surah 103 3 "Al-Asr"
call :download_surah 104 9 "Al-Humazah"
call :download_surah 105 5 "Al-Fil"
call :download_surah 106 4 "Quraish"
call :download_surah 107 7 "Al-Maun"
call :download_surah 108 3 "Al-Kawthar"
call :download_surah 109 6 "Al-Kafirun"
call :download_surah 110 3 "An-Nasr"
call :download_surah 111 5 "Al-Masad"
call :download_surah 112 4 "Al-Ikhlas"
call :download_surah 113 5 "Al-Falaq"
call :download_surah 114 6 "An-Nas"

echo.
echo ========================================
echo   Download Complete!
echo ========================================
echo.
echo Check the log file for details:
echo %LOGFILE%
echo.
echo Total files downloaded: Check public\audio\alafasy\ folder
echo.
pause
exit /b 0

:: Function to download a complete surah
:download_surah
setlocal
set SURAH_NUM=%1
set AYAH_COUNT=%2
set SURAH_NAME=%~3

:: Pad surah number to 3 digits
set "SURAH_PADDED=00%SURAH_NUM%"
set "SURAH_PADDED=%SURAH_PADDED:~-3%"

echo.
echo [%SURAH_PADDED%] Downloading %SURAH_NAME% (%AYAH_COUNT% ayahs)...
echo [%SURAH_PADDED%] Downloading %SURAH_NAME% (%AYAH_COUNT% ayahs)... >> "%LOGFILE%"

for /l %%A in (1,1,%AYAH_COUNT%) do (
    call :download_ayah %SURAH_NUM% %%A "%SURAH_NAME%"
)

echo [%SURAH_PADDED%] %SURAH_NAME% complete!
echo [%SURAH_PADDED%] %SURAH_NAME% complete! >> "%LOGFILE%"
endlocal
exit /b 0

:: Function to download a single ayah
:download_ayah
setlocal
set SURAH_NUM=%1
set AYAH_NUM=%2
set SURAH_NAME=%~3

:: Pad numbers to 3 digits
set "SURAH_PADDED=00%SURAH_NUM%"
set "SURAH_PADDED=%SURAH_PADDED:~-3%"
set "AYAH_PADDED=00%AYAH_NUM%"
set "AYAH_PADDED=%AYAH_PADDED:~-3%"

:: Filename format: 001001.mp3 (surah padded + ayah padded)
set FILENAME=%SURAH_PADDED%%AYAH_PADDED%.mp3
set FILEPATH=public\audio\alafasy\%FILENAME%

:: Skip if already exists
if exist "%FILEPATH%" (
    echo   [SKIP] %FILENAME% - Already exists
    echo   [SKIP] %FILENAME% - Already exists >> "%LOGFILE%"
    endlocal
    exit /b 0
)

:: Download URL
set URL=https://verses.quran.com/Alafasy/mp3/%FILENAME%

:: Download with curl
curl -f -s -S --connect-timeout 10 --max-time 30 -o "%FILEPATH%" "%URL%" 2>nul

if %errorlevel% equ 0 (
    echo   [OK] %FILENAME% - %SURAH_NAME% Ayah %AYAH_NUM%
    echo   [OK] %FILENAME% - %SURAH_NAME% Ayah %AYAH_NUM% >> "%LOGFILE%"
) else (
    echo   [FAIL] %FILENAME% - Download failed
    echo   [FAIL] %FILENAME% - Download failed (URL: %URL%) >> "%LOGFILE%"
    if exist "%FILEPATH%" del "%FILEPATH%"
)

endlocal
exit /b 0
