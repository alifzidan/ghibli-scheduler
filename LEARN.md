# 🎓 Learning Guide: Forest Scheduler

This project demonstrates how to build a **User-Centric** web application using only standard web technologies. It focuses on **Accessibility** (a11y) and **Atmospheric Design**.

---

## 🎨 1. Design System (Tailwind CSS)

We defined a custom color palette in `tailwind.config` to strictly enforce the "Forest" theme.

```javascript
colors: {
    'forest-cream': '#fdfcf0', // Background
    'forest-brown': '#5d4037', // Text
    'forest-green': '#8da399', // Accents
    'forest-accent': '#e6a863', // Highlights (Orange)
}
```

**Why?** Consistent colors are key to "Branding". By using semantic names like `forest-cream` instead of `#fdfcf0`, the code is easier to understand and maintain.

---

## 🗓️ 2. Calendar Logic (Vanilla JS)

Generating a calendar grid requires understanding `Date` objects.

*   **Logic**:
    1.  Get the `year` and `month`.
    2.  Find the `index` of the first day of the month (0 = Sunday, 1 = Monday...).
    3.  Find the `lastDate` (number of days in the month).
    4.  **Loop 1**: Create empty/gray slots for the previous month's trailing days.
    5.  **Loop 2**: Create the actual days (1 to 31).
    6.  **Loop 3**: Fill the rest of the grid with next month's days to keep the layout stable.

```javascript
const firstDayIndex = new Date(year, month, 1).getDay();
const lastDay = new Date(year, month + 1, 0).getDate();
```

---

## 🦉 3. Geolocation API (The Owl)

The Owl feature uses the browser's built-in `navigator.geolocation` API.

```javascript
navigator.geolocation.getCurrentPosition(
    (position) => {
        // Success: We get latitude & longitude
        const { latitude, longitude } = position.coords;
        showRecommendation(latitude, longitude);
    },
    (error) => {
        // Error: User denied permission or signal lost
        alert("Cannot find location.");
    }
);
```

**Note**: In this app, we "Mock" the actual places data. Instead of calling a paid API like Google Maps, we randomly select a cozy string from a list. This tricks the user into feeling a personalized connection without complexity.

---

## 🎙️ 4. Web Speech API (Voice Input)

We use the `webkitSpeechRecognition` interface to listen to the user.

*   **Setup**: `new webkitSpeechRecognition()`
*   **Language**: `recognition.lang = 'ja-JP'` (Japanese)
*   **Events**:
    *   `onstart`: Show a visual indicator (Pulse animation).
    *   `onresult`: Get the transcribed text string and insert it into the input field.

---

## ♿ 5. Accessibility Tricks

*   **Zoom Mode**: We verify accessibility by adding a `.large-text` class to the `<body>`.
    *   CSS: `body.large-text { font-size: 1.25rem; }`
    *   Using `rem` units means everything scales relative to the root font size.
*   **Hanko (Stamps)**: Simple `div` elements with `click` listeners are used instead of complex radio buttons for easier interaction on touch screens.

---

## 📚 Extensions to Try

1.  **Weather API**: Connect the Owl to a real Weather API (like OpenWeatherMap) to say "It's raining, take an umbrella!" ☔
2.  **Holidays**: Import a Japanese Holidays library to color holidays red on the calendar. 🎌
3.  **Dark Mode**: Create a "Night Forest" theme using CSS variables. 🌙
