require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const onboard = require('./onboard');
const bad_words = require('badwords-list').regex;
const qs = require('querystring');
const axios = require('axios');
const slack = require('./tinyspeck');

const postResult = result => console.log(result.data);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('HLC Slack Mod Running');
});

slack.listen(process.env.PORT,process.env.SLACK_VERIFICATION_TOKEN);

slack.on('message', message => {
  console.log('Event fired');
  event = message.event
  if(event.channel != 'G7GSR750V'){
         if(message.event.text.search(bad_words) != -1){
           var message = {
             token:process.env.SLACK_TOKEN,
             as_user: true,
             channel:event.channel,
             text:'<@' + event.user + '>:Please refrain from using abusive language.Repeated usage could lead to a permanent ban.'
           }
           slack.send(message).then(data => console.log(data))
           console.log(1);
           var notify_message = {
             token:process.env.SLACK_TOKEN,
             channel:'#admin-alerts',
             attachments: [
              {
                title: 'Alert: Profanity Detected',
                text: 'Profanity used by<@' + event.user + '>:' + event.text,
                color: '#74c8ed',
                callback_id: 'alert-acknowledge',
                color: '#3060f0',
                actions: [{
                  name: 'acknowledge',
                  text: 'Acknowledge',
                  type: 'button',
                  value: 'accept',
                  style: 'primary',
                }]
              }]}
           slack.send(notify_message).then(data => console.log(data))
         }}})

slack.on('team_join', message =>{
  event = message.event;
  const { team_id, id } = event.user;
  onboard.initialMessage(team_id, id);
  var notify_message = {
    token:process.env.SLACK_TOKEN,
    channel:'#admin-alerts',
    attachments: [{
                title: 'Alert: New User Joined',
                text: '<@' + event.user.id + '>:' + 'has joined the workspace',
                color: '#74c8ed',
                callback_id: 'alert-acknowledge',
                color: '#3060f0',
                actions: [{
                  name: 'acknowledge',
                  text: 'Acknowledge',
                  type: 'button',
                  value: 'accept',
                  style: 'primary',
                }]
              }]}
  slack.send(notify_message).then(data => console.log(data));
  var message = {
    token:process.env.SLACK_TOKEN,
    as_user: true,
    channel:'#general',
    text:'<@' + event.user.id + '>, welcome to the HLC International Slack workspace!'
  }
  slack.send(message).then(data => console.log(data));
})

slack.on('channel_created', message => {
  var notify_message = {
    token:process.env.SLACK_TOKEN,
    channel:'#admin-alerts',
    attachments: [{
                title: 'Alert: New Channel Created',
                text: '<@' + event.channel.creator + '> has created the channel <@' + event.channel.id + '>',
                color: '#74c8ed',
                callback_id: 'alert-acknowledge',
                color: '#3060f0',
                actions: [{
                  name: 'acknowledge',
                  text: 'Acknowledge',
                  type: 'button',
                  value: 'accept',
                  style: 'primary',
                }]
              }]}
  slack.send(notify_message).then(data => console.log(data));
})

slack.on('channel_deleted', message => {
  var notify_message = {
    token:process.env.SLACK_TOKEN,
    channel:'#admin-alerts',
    attachments: [{
                title: 'Alert: Channel Deleted',
                text: 'The channel <@' + event.channel + '> has deleted the channel <@' + event.channel.id + '>',
                color: '#74c8ed',
                callback_id: 'alert-acknowledge',
                color: '#3060f0',
                actions: [{
                  name: 'acknowledge',
                  text: 'Acknowledge',
                  type: 'button',
                  value: 'accept',
                  style: 'primary',
                }]
              }]}
  slack.send(notify_message).then(data => console.log(data));
})

slack.on('member_left_channel', message => {
  event = message.event;
  var notify_message = {
             token:process.env.SLACK_TOKEN,
             channel:'#admin-alerts',
             attachments: JSON.stringify([
              {
                title: 'Alert: User Left Channel',
                text: '<@' + event.user + '> has left the channel <@' + event.channel + '>',
                color: '#74c8ed',
                callback_id: 'alert-acknowledge',
                color: '#3060f0',
                actions: [{
                  name: 'acknowledge',
                  text: 'Acknowledge',
                  type: 'button',
                  value: 'accept',
                  style: 'primary',
                }]
              }])}
  slack.send(notify_message).then(data => console.log(data));
})

slack.on('group_open', message => {
  var notify_message = {
             token:process.env.SLACK_TOKEN,
             channel:'#admin-alerts',
             attachments: JSON.stringify([
              {
                title: 'Alert: New Private Channel Created',
                text: '<@' + event.user + '> has created the private channel <@' + event.channel + '>',
                color: '#74c8ed',
                callback_id: 'alert-acknowledge',
                color: '#3060f0',
                actions: [{
                  name: 'acknowledge',
                  text: 'Acknowledge',
                  type: 'button',
                  value: 'accept',
                  style: 'primary',
                }]
              }])}
  slack.send(notify_message).then(data => console.log(data));
  
})

slack.on('group_close',message =>{
  var notify_message = {
             token:process.env.SLACK_TOKEN,
             channel:'#admin-alerts',
             attachments: [
              {
                title: 'Alert: Private Channel Deleted',
                text: '<@' + event.user + '> has deleted the private channel <@' + event.channel + '>',
                color: '#74c8ed',
                callback_id: 'alert-acknowledge',
                color: '#3060f0',
                actions: [{
                  name: 'acknowledge',
                  text: 'Acknowledge',
                  type: 'button',
                  value: 'accept',
                  style: 'primary',
                }]
              }]}
  slack.send(notify_message).then(data => console.log(data));
})

slack.on('user_change',message => {
  
})

slack.on('interactive_message', message => {
  if(message.callback_id == 'alert-acknowledge'){
    console.log(message);
    var notify_message = {
      token:process.env.SLACK_TOKEN,
      channel:message.channel.id,
      ts:message.message_ts,
      text:'Acknowledged by <@' + message.user.id + '>'
    }
    slack.send(notify_message).then(data => console.log(data));
  }
})

slack.on('/send-as-mod', message => {
  var notify_message = {
    token:process.env.SLACK_TOKEN,
    channel:message.channel_id,
    text:message.text
  }
  slack.send(notify_message).then(data => console.log(data));
})


setInterval(function(){
  var msg = {
    token:process.env.SLACK_OAUTH_TOKEN
  };
  //axios.post('https://slack.com/api/team.integrationLogs', qs.stringify(msg)).then(postResult);
},1000);


/*
app.post('/interactive-message', (req, res) => {
  console.log(req.body);
  const json = JSON.parse(req.body.payload);
  if(json.callback_id == 'terms-of-service'){
  const { token, user, team } = JSON.parse(req.body.payload);
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    onboard.accept(user.id, team.id);
    res.send({ text: 'Thank you! The Terms of Service have been accepted.' });
  } else { res.sendStatus(500); }
}
if(json.callback_id == 'alert-acknowledge'){
 res.send('Acknowledged by <@' + json.user.id + '>') 
}});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
*/

