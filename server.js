//Discord stuff
const Discord = require("discord.js");
const client = new Discord.Client();

//Set our prefix
var prefix = "+"

//Set the role that can do admin commands
const roleName = "Medals"

//Require the medals json
//var foobar = require('./medals.json');

//Sqlite3 db for user data
const sqlite3 = require('sqlite3');
let db = new sqlite3.Database('./userData.db');

//db.run('CREATE TABLE user(id text, medals text)');

//When the bot recives a message do this
client.on("message", async message => {
	// It's good practice to ignore other bots. This also makes your bot ignore itself
	// and not get into a spam loop (we call that "botception").
	if(message.author.bot) return;
	
	//Check if if starts with our prefix
	if( message.content.indexOf(prefix) !== 0 ) return;
	
	//Split command and args
	var args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	//Remove the username from args
	args.splice(args.indexOf(message.mentions.members.first()), 1);
	
	//Admin only commands
	if( message.member.roles.find("name", roleName) ) {
		//Honour command
		if( command == "honour" && args.length > 0) {
			if(message.mentions.members.first() !== undefined) {
				//Make sure the user is in the db
				db.run("INSERT INTO user (id, medals) SELECT '" + message.mentions.members.first().toString() + "', '[]' WHERE NOT EXISTS ( SELECT 1 FROM user WHERE id = '" + message.mentions.members.first().toString() + "' )");
				
				//Award the medal to them
				db.get(( "SELECT medals FROM user WHERE id = '" + message.mentions.members.first().toString() + "'" ), function(err, allRows) {
					medals = JSON.parse(allRows.medals);
					medals.push(args.join(" "));
					db.run("UPDATE user SET medals = '" + JSON.stringify(medals) + "' WHERE id = '" + message.mentions.members.first().toString() + "'" );
					message.channel.send("Honoured!");
				});
			} else {
				message.channel.send("Specify a user!");
			}
		}
		
		//Clear command
		if( command == "clear" ) {
			if( message.mentions.members.first() !== undefined ) {
				db.run("UPDATE user SET medals = '[]' WHERE id = '" + message.mentions.members.first().toString() + "'" );
				message.channel.send("Medals Cleared!");
			} else {
				message.channel.send("Specify a user!");
			}
		}
	}
	
	//Medals command
	if( command == "medals" ) {
		var target = message.mentions.members.first();
		if(message.mentions.members.first() == undefined) {
			target = "<@" + message.member.user.id + ">";
		}
		db.get(( "SELECT medals FROM user WHERE id = '" + target.toString() + "'" ), function(err, allRows) {
			//Check if user has any medals
			if(allRows == null || allRows.medals == "[]") {
				message.channel.send("That user has no medals :(");
				return;
			}
			//Parse medals
			medals = JSON.parse(allRows.medals);
			
			//Print medals
			message.channel.send("Medals:");
			for(var i = 0; i < medals.length; i++) {
				message.channel.send(medals[i]);
			}
		});
	}
});

//Bot login
client.login("TOKEN");
