**Hero HW4 - Node.js NPM Package Assignment Overview**

This project extends the original "hero" application by incorporating 5 NPM packages to generate random content and save each output to 5 separate .txt files. The application also runs a local web server to display all generated content.

**Quick Start Instructions**

**Step 1: Install Dependencies**
Before running the code, you need to install all the NPM packages:
bash - npm install

This will install all 5 packages listed in package.json:
superheroes
supervillains
inspirational-quotes
popular-movie-quotes
famous-last-words


**Step 2: Run the Application**

bashnode index.js

or

bashnpm start

**Step 3: What Happens**
When you run the application, it will:
Generate random content from each of the 5 packages
Print to console showing what was generated

Create 5 .txt files:
superhero.txt
supervillain.txt
inspirational-quote.txt
movie-quote.txt
famous-last-words.txt

Start a web server at http://127.0.0.1:3000/

Step 4: View Results
In Console:
You'll see output like:
=== Generated Content ===
Super Hero: Batman
Super Villain: Lex Luthor
Inspirational Quote: "The only way to do great work is to love what you do."
Movie Quote: "May the Force be with you."
Famous Last Words: "I should never have switched from Scotch to Martinis."
========================

✓ Saved to superhero.txt
✓ Saved to supervillain.txt
✓ Saved to inspirational-quote.txt
✓ Saved to movie-quote.txt
✓ Saved to famous-last-words.txt

All files saved successfully!

Server running at http://127.0.0.1:3000/

**In Browser:**
Visit http://127.0.0.1:3000/ to see all content displayed together.

**In Files:**
Check each .txt file to see the individual content saved.

**Stopping the Server**
Press Ctrl+C in the terminal to stop the web server.


**Troubleshooting**
Problem: "Cannot find module 'superheroes'"
Solution: Run npm install first
Problem: Port 3000 is already in use
Solution: Stop other applications from using port 3000, or change the port in index.js
Problem: Files not being created
Solution: Ensure you have write permissions in the directory
