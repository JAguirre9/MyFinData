MyFinData – Personal Expense Tracker

MiFinData is a personal project designed to help track daily expenses using two separate sources of funds: Cash and Card.
This application represents my first complete web project using HTML, CSS, and JavaScript, providing a simple but effective interface with local data storage.

*Main Features
*1. Initial Balance Management

At the start of the day, the user can enter:

Initial Cash balance

Initial Card balance

Total combined balance

These values are automatically saved using LocalStorage, so they remain even after closing the page.

*2. Expense Logging

Users can record expenses by entering:

Date

Place

Description

Category

Amount

Payment Method (Cash or Card)

Each submitted expense:

-Automatically deducts from the correct balance
-Updates the “Spent Today” value
-Appears in a table
-Is stored in LocalStorage for persistence

*3. Clear Balance Visualization

The interface displays real-time values for:

Initial Cash

Initial Card

Total Initial Balance

Amount Spent Today

Presented inside three clean, separated boxes for better readability.

*4. Responsive Layout

The project includes responsive design through media queries, ensuring it works smoothly on:

Desktop

Tablet

Mobile devices

*Technologies Used
Technology	Purpose
HTML5	Structure of the application
CSS3	Visual design and responsive layout
JavaScript (Vanilla)	App logic and dynamic updates
LocalStorage	Persistent data storage on the browser
Project Structure
/
├── index.html
├── style.css
└── script.js

*Key Learnings

This project was my first full experience building a frontend application.
Through it, I learned how to:

Manipulate the DOM

Handle form events

Work with arrays and objects

Use LocalStorage for persistence

Design responsive layouts

Separate concerns between HTML, CSS, and JS

Use Git and GitHub in a real workflow

*Future Improvements

Some features I plan to add:

Automatic export of expenses to Google Sheets

Filters by date and category

Expense charts (e.g., using Chart.js)

Income tracking

Dark mode

*Contributions

This is a personal and learning-focused project, but improvements and suggestions are always welcome.
Feel free to open an issue or submit a pull request.

*Author

Julian Aguirre
First complete web project
Created to organize my finances and grow as a developer.
