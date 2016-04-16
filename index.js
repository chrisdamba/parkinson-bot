var Botkit = require("botkit");
var Witbot = require("witbot");
var slackToken = process.env.SLACK_TOKEN;
var witToken = process.env.WIT_TOKEN;
var witbot = Witbot(witToken);
var controller = Botkit.slackbot({debug: false});

controller
.spawn({ token: slackToken })
.startRTM(function (err, bot, payload) {
	if (err) throw new Error('Error connecting to Slack: ', err);
	console.log('Connected to slack');
});


// wire up DMs and direct mentions to wit.ai
controller.hears('.*', 'direct_message,direct_mention', function (bot, message) {
	var wit = witbot.process(message.text, bot, message);

	wit.hears('hello', 0.9, function (bot, message, outcome) {
		bot.startConversation(message, function (_, convo) {
			convo.ask('Hello, how are your tremors today?', function (response, convo) {
				witbot.process(response.text)
						.hears('good', 0.5, function (outcome) {
							convo.say('I am so glad to hear it!');
							convo.next();
						})
						.hears('Good but', 0.5, function (outcome) {
							convo.say('I\'m sorry to hear that, have you taken any new medication?');
							convo.next();
						})
						.hears('bad', 0.5, function (outcome) {
							convo.say('I\'m sorry to hear that, have you taken any new medication?');
							convo.next();
						})
						.otherwise(function (outcome) {
							convo.say('I\'m cofused');
							convo.repeat();
							convo.next();
						})
			})
		})
	});

	wit.otherwise(function (bot, message) {
		bot.reply(message, 'I\'m sorry I didn\'t understand that.')
	})
});

