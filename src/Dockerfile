FROM node:10

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    texlive \
    texlive-base \
    texlive-binaries \
    texlive-font-utils \
    texlive-fonts-recommended \
    texlive-formats-extra \
    texlive-generic-extra \
    texlive-generic-recommended \
    texlive-lang-english \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-luatex \
    texlive-metapost \
    texlive-pictures

COPY ./package.json .
RUN npm install

COPY . /usr/src/app
    
CMD ["npm", "start"]