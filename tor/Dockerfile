FROM ubuntu:21.10 as onion-generator
RUN apt update
RUN apt install git gcc libsodium-dev make autoconf -y
RUN git clone https://github.com/cathugger/mkp224o.git
WORKDIR /mkp224o
RUN ./autogen.sh
RUN ./configure
RUN make
RUN ./mkp224o lahav -n 1

FROM alpine:3.15.4
RUN apk add tor
RUN echo "HiddenServiceDir /var/lib/tor/bitcoin-graph/" >> /etc/tor/torrc
RUN echo "HiddenServicePort 80 webapp:5000" >> /etc/tor/torrc

COPY --from=onion-generator /mkp224o/lahav*.onion /var/lib/tor/bitcoin-graph/
RUN chmod -R 700 /var/lib/tor/bitcoin-graph/
COPY ./tor-start.sh ./
CMD '/tor-start.sh'