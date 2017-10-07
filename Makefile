#適当に叩くコマンドたたいてく
#setup:
#  wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip
#
HEROKU =$(shell which heroku)
NPM=$(shell which npm)
WGET=$(shell which wget)
NODE=$(shell which node)

logs:
	$(HEROKU) logs --app healty-diet-line-diet --tail

setup:
	$(NPM) install

#macしかみてないhttps://ngrok.com/download
ngrok:
	mkdir bin
	$(WGET) https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip
	unzip ngrok-stable-darwin-amd64.zip
	mv ngrok bin/
	rm ngrok-stable-darwin-amd64.zip

tunnel:
	./bin/ngrok http 3000

run:
	$(NODE) examples/echo-bot/index.js

.env:
	cp .env.sample .env
