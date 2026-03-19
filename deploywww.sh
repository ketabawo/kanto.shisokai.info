#!/bin/bash

source .env.local

echo "Deploying www.shisokai.info..."

if ! command -v lftp &> /dev/null; then
    echo "lftp not found. Install: brew install lftp"
    exit 1
fi

lftp -c "
set ftp:ssl-allow no
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
mirror -R --delete --verbose ./www/ $FTP_DIR_WWW
bye
"

if [ $? -eq 0 ]; then
    echo "Done! https://www.shisokai.info/"
else
    echo "FTP upload failed"
    exit 1
fi
