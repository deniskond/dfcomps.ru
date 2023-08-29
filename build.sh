docker build -t dfcomps https://github.com/deniskond/dfcomps.ru.git#master
docker run -p 80:80 --rm -it dfcomps