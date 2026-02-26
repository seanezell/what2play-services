@echo off
if not exist terraform\zip mkdir terraform\zip

for /d %%d in (lambdas\*) do (
    echo Packaging %%~nd...
    cd %%d
    if exist package.json npm install --production
    tar -a -c -f ..\..\terraform\zip\%%~nd.zip *
    cd ..\..
)
