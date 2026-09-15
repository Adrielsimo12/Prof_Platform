Option Explicit

Dim shell, fso, base, backendCommand, frontendCommand
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
base = fso.GetParentFolderName(WScript.ScriptFullName)

backendCommand = "cmd /c cd /d """ & base & "\backend"" && """ & base & "\backend\venv\Scripts\python.exe"" seed.py && """ & base & "\backend\venv\Scripts\python.exe"" seed_competences.py && """ & base & "\backend\venv\Scripts\python.exe"" app.py"
frontendCommand = "cmd /c cd /d """ & base & "\frontend"" && npm run dev -- --host 0.0.0.0"

shell.Run backendCommand, 0, False
shell.Run frontendCommand, 0, False
WScript.Sleep 4000
shell.Run "http://localhost:5173", 1, False

Set fso = Nothing
Set shell = Nothing
