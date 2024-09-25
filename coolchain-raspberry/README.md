docker run --name coolchain-pi -it --rm balenalib/raspberry-pi2-node /bin/bash

docker cp yourPathToCoolchain/coolchain/coolchain-raspberry/dist/. coolchain-pi:/home

cd home
node bundle.js