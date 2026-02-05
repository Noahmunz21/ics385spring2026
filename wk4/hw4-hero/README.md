**Hero HW4 - Node.js NPM Package Assignment Overview**

This project extends the original "hero" application by incorporating 5 NPM packages to generate random content and save each output to 5 separate .txt files. The application also runs a local web server to display all generated content.

**Installation Instructions**

Ensure Node.js and NPM are installed on your system
Navigate to the hero-hw4 directory:

bash   cd hero-hw4

Install all dependencies:

bash   npm install
How to Run

Execute the application:

bash   node index.js
or
bash   npm start

The program will:

Generate random content from all 5 packages
Display the content in the console
Save each piece of content to its respective .txt file
Start a web server at http://127.0.0.1:3000/


Visit http://127.0.0.1:3000/ in your browser to view all generated content

Output Files
Each time the program runs, it creates/overwrites 5 text files:

Each file contains one type of generated content
Files are saved in the same directory as index.js
Content is prefixed with a descriptive label
