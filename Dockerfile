FROM alpine:3.14
RUN apk add thttpd
RUN  adduser -D tohr
USER tohr
WORKDIR /home/tohr
COPY . .
CMD ["thttpd", "-D", "-h", "0.0.0.0", "-p", "80", "-d", "/home/tohr", "-u", "tohr", "-l", "-"]