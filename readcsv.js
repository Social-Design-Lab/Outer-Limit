const fs = require('fs');
const csvParser = require('csv-parser');
const fetch = require('node-fetch'); // Make sure you have node-fetch installed

function read_csv() {
  // Process fake comments
  fs.createReadStream('fake_comment.csv')
    .pipe(csvParser())
    .on('data', (rowData) => {
        const mappedData = {
            fake_comment_id: rowData['﻿fake_comment_id'],
            user_name: rowData['user_name'],
            content: rowData['content'],
            where_to_insert: rowData['where_to_insert'],
            ordinal_position:rowData['ordinal_position'],
            post_url: rowData['post_url'],
            like: rowData['likes'],
            time: rowData['time'],
            profile: rowData['profile']
          };
      
          console.log(mappedData);

      fetch('https://outer.socialsandbox.xyz/api/createfakecomment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedData)
      })
      .then(response => response.json())
      .then(data => { console.log('Fake comment created:', data); })
      .catch(error => { console.error('Error creating fake comment:', error); });
    })
    .on('end', () => { console.log('CSV file successfully processed for fake comments'); });

  // Process fake posts
  fs.createReadStream('fakepost.csv')
    .pipe(csvParser())
    .on('data', (rowData) => {
        
        const mappedData = {
            fakepost_url: rowData['fakepost_url'],
            fakepost_index: rowData['fakepost_index'],
            fakepost_title: rowData['fakepost_title'],
            fakepost_content: rowData['fakepost_content'],
            fakepost_image: rowData['fakepost_image'],
            fakepost_like: rowData['fakepost_likes'],
            fakepost_time: rowData['fakepost_time'], 
            fakepost_community:rowData['fakepost_community'], 
            fakepost_poster:rowData['fakepost_poster'], 
          };
      
          console.log(mappedData);

      fetch('https://outer.socialsandbox.xyz/api/createfakepost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedData)
      })
      .then(response => response.json())
      .then(data => { console.log('Fake post created:', data); })
      .catch(error => { console.error('Error creating fake post:', error); });
    })
    .on('end', () => { console.log('CSV file successfully processed for fake posts'); });
}

read_csv();
