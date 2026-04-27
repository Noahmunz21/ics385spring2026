The main challenge integrating Passport.js was a MongoDB buffering timeout error where the server was starting and accepting requests before the database connection was fully established. This caused Passport's deserializeUser to fail when trying to look up users. The fix was restructuring server.js to start the Express listener inside the mongoose.connect().then() callback, ensuring the server only accepts requests after Atlas is fully connected. 
AI Tools Used: Claude (Anthropic) assisted with Passport.js integration and session configuration.

<img width="1114" height="697" alt="Screenshot 2026-04-26 at 5 07 27 PM" src="https://github.com/user-attachments/assets/6d2eb6e7-d8da-48eb-912a-d08589a125da" />
<img width="1145" height="689" alt="Screenshot 2026-04-26 at 5 12 58 PM" src="https://github.com/user-attachments/assets/75eea122-f156-4b77-a4cb-18ad4777292e" />
<img width="1099" height="563" alt="Screenshot 2026-04-26 at 5 14 23 PM" src="https://github.com/user-attachments/assets/7aaf9a54-083b-4f8e-8792-275e27887f2a" />
