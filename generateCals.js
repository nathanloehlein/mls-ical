const fs = require('fs');
const ics = require('ics');
const fetch = require('node-fetch');
const clubsData = require('./data/clubs.json');

fetch('https://sportapi.mlssoccer.com/api/matches?culture=en-us&dateFrom=2024-01-01&dateTo=2024-12-31&excludeSecondaryTeams=true')
  .then((response) => response.text())
  .then((body) => {
    const matches = JSON.parse(body);
    clubsData.forEach(club => {
      const formattedMatches = [];
      matches
        .filter(match => (match.home.abbreviation === club.abbreviation || match.away.abbreviation === club.abbreviation))
        .forEach(match => {
          const matchData = new Object;
          const matchDate = new Date(match.matchDate);

          matchData.title = match.home.shortName + ' vs ' + match.away.shortName;
          matchData.location = match.venue.name + ', ' + match.venue.city;
          matchData.description = match.competition.name + '\nWatch on: ' + (match.broadcasters && match.broadcasters.length > 0 ? match.broadcasters[0].broadcasterName : null);
          matchData.start = [matchDate.getFullYear(), matchDate.getMonth() + 1, matchDate.getDate(), matchDate.getHours(), matchDate.getMinutes()];
          matchData.startInputType = 'local';
          matchData.duration = { hours: 2, minutes: 15 };
          formattedMatches.push(matchData);

          if (parseInt(match.matchDay) >= 37) {
            const { error, value } = ics.createEvents(formattedMatches);

            if (error) {
              console.log(error)
              return
            }

            fs.writeFile('public/' + club.abbreviation + '.ics', value, (err) => {
              if (err) throw err;
              console.log(club.abbreviation + '.ics calendar file saved');
            });
          }
        }); // matches.forEach
    }); // clubsData.forEach
  }); // .then



