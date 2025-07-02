const fs = require('fs');
const csvParser = require('csv-parser');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Function to insert post directly
async function insertPost(rowData) {
  try {
    const response = await fetch('https://outerlimits.onrender.com/api/createfakepost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData) // Directly send rowData as the body
    });

    const data = await response.json();
    console.log('Fake post created:', data);
    return data.insertedId; // Return the insertedId to ensure post creation
  } catch (error) {
    console.error('Error inserting fake post:', error);
  }
}

// Function to insert comment directly
async function insertComment(rowData) {
  try {
    const response = await fetch(`https://outerlimits.onrender.com/api/addfakecomment/${rowData.fakepost_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData) // Directly send rowData as the body
    });

    const data = await response.json();
    console.log('Fake comment created:', data);
  } catch (error) {
    console.error('Error inserting fake comment:', error);
  }
}

// Function to read CSV line by line and execute post insertions sequentially
async function read_and_insert_fake_posts() {
  return new Promise((resolve, reject) => {
    const fakePosts = [];
    
    fs.createReadStream('fakepost.csv', { encoding: 'utf8' })
      .pipe(csvParser())
      .on('data', (rowData) => {
        fakePosts.push(rowData);
      })
      .on('end', async () => {
        console.log('Finished reading fake posts.');

        // Sequentially insert posts one after the other
        for (const rowData of fakePosts) {
          await insertPost(rowData);
        }
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Function to read CSV line by line and execute comment insertions sequentially
async function read_and_insert_fake_comments() {
  return new Promise((resolve, reject) => {
    const fakeComments = [];
    
    fs.createReadStream('fake_comment.csv', { encoding: 'utf8' })
      .pipe(csvParser())
      .on('data', (rowData) => {
        fakeComments.push(rowData);
      })
      .on('end', async () => {
        console.log('Finished reading fake comments.');

        // Sequentially insert comments one after the other
        for (const rowData of fakeComments) {
          await insertComment(rowData);
        }
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Main function to run the process linearly
async function processPostsAndComments() {
  try {
    await read_and_insert_fake_posts();  // Insert posts first
    console.log('All fake posts inserted. Now inserting comments...');
    await read_and_insert_fake_comments(); // Insert comments after posts
    console.log('All fake comments inserted.');
  } catch (error) {
    console.error('Error in the process:', error);
  }
}

// Start the process
processPostsAndComments();