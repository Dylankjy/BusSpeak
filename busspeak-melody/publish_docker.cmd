@echo off

docker build . --tag ghcr.io/dylankjy/busspeak-melody:latest
docker push ghcr.io/dylankjy/busspeak-melody:latest
