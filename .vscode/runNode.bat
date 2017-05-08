SET ALFRED_SERVER_PORT=5555
SET ALFRED_CORS_ENABLE=true
call grunt build
call node %* | bunyan -o short