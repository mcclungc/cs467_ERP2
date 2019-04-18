FROM mysql:5.5

ENV MYSQL_DATABASE=erp
ENV MYSQL_ROOT_PASSWORD=password

COPY ./img/ /tmp
COPY ./custom.cnf /etc/mysql/conf.d
RUN chown mysql:mysql /tmp/*
COPY ./*.sql /docker-entrypoint-initdb.d/
