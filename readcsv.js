const fs = require('fs');
const csvParser = require('csv-parser');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

// Function to insert post directly
async function insertPost(rowData) {
  try {
    const response = await fetch('https://outer.socialsandbox.xyz/api/createfakepost', {
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
    const response = await fetch(`https://outer.socialsandbox.xyz/api/addfakecomment/${rowData.fakepost_id}`, {
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

// Function to read and insert fake posts first
function read_and_insert_fake_posts(callback) {
  const fakePosts = [];

  fs.createReadStream('fakepost.csv')
    .pipe(csvParser())
    .on('data', (rowData) => {
      fakePosts.push(insertPost(rowData));
    })
    .on('end', async () => {
      console.log('Finished reading and inserting fake posts.');
      // Wait for all posts to be inserted before proceeding to comments
      await Promise.all(fakePosts);
      // Call the callback to proceed with comments insertion
      callback();
    });
}

// Function to read and insert fake comments only after posts are inserted
function read_and_insert_fake_comments() {
  fs.createReadStream('fake_comment.csv')
    .pipe(csvParser())
    .on('data', async (rowData) => {
      // Insert each comment, ensuring that its corresponding post has been inserted
      await insertComment(rowData);
    })
    .on('end', () => {
      console.log('Finished reading and inserting fake comments.');
    });
}

// First, insert all posts, then insert comments
read_and_insert_fake_posts(read_and_insert_fake_comments);