Bcrypt protects user passwords by running them through a one-way hashing algorithm with a cost factor (10 salt rounds in this project), making it computationally expensive to reverse or brute-force. Even if the database is compromised, attackers only see the hash — never the original password. Each hash also includes a unique random salt, meaning two users with the same password will have completely different hashes. This prevents rainbow table attacks where precomputed hash lists are used to crack passwords.


<img width="1148" height="767" alt="Screenshot 2026-04-22 at 9 36 27 AM" src="https://github.com/user-attachments/assets/2ed3d000-b257-4ab2-8172-339b189bfb2d" />
<img width="1140" height="765" alt="Screenshot 2026-04-22 at 9 26 48 AM" src="https://github.com/user-attachments/assets/f252de05-77d0-4ab1-8dd9-ade9039328a6" />
<img width="518" height="421" alt="Screenshot 2026-04-22 at 9 26 14 AM" src="https://github.com/user-attachments/assets/130d06f8-36b4-4e80-8207-73f34ff83ea5" />
<img width="1150" height="576" alt="Screenshot 2026-04-22 at 9 25 50 AM" src="https://github.com/user-attachments/assets/9658aa25-17d6-4684-885b-2727acfb8418" />
