# Repalogic Group – Seat Booking Challenge

A responsive event seat-booking application built using **Vanilla HTML, CSS, and JavaScript (ES6+)** as part of the Repalogic Group Front-End Engineer assessment.

The application allows users to view an event's seating arrangement, select available seats, calculate ticket prices with applicable discounts, and complete a booking through an accessible checkout dialog.

## Live Demo

[View Live Application](https://shrutisoni08.github.io/Repalogic-Group---Seat-Booking-Challenge/)

## GitHub Repository

[View Source Code](https://github.com/shrutisoni08/Repalogic-Group---Seat-Booking-Challenge)

## Technologies Used

- HTML5
- CSS3 (CSS Grid, Custom Properties, Responsive Design)
- Vanilla JavaScript (ES6+)
- Node.js and `node:assert` for logic testing
- GitHub Pages for deployment

## Features

### 1. Interactive Seat Selection
- Displays six rows (A–F), with ten seats per row.
- Dynamically categorizes seats into Front, Standard, and Premium sections.
- Clearly distinguishes available, selected, and sold seats.
- Provides accessible seat names for screen readers.
- Supports keyboard navigation using arrow keys.

### 2. Booking Validation
- Allows a maximum of six seats per booking.
- Prevents invalid selections that would leave a single available seat isolated.
- Validates the complete selection before proceeding to checkout.
- Displays all applicable validation errors together.

### 3. Dynamic Pricing
- Automatically calculates the total based on selected seat categories.
- Applies a 10% discount when booking four or more seats.
- Displays prices in EUR using `Intl.NumberFormat`.

### 4. Accessible Checkout
- Includes an accessible booking dialog.
- Requires a valid name and email address.
- Moves focus to invalid fields when validation fails.
- Supports closing the dialog using the Escape key.
- Returns focus to the Continue button after closing.
- Announces successful bookings to assistive technologies.

### 5. Loading and Error Handling
- Loads event information dynamically from `event.json` using Fetch API.
- Displays a loading state while retrieving event data.
- Provides an error message and Retry option if loading fails.
- Renders the event name safely as text to prevent HTML/script injection.

### 6. Responsive Design
- Uses CSS Grid for the seating arrangement.
- Keeps the seat map independently scrollable on smaller screens.
- Supports light and dark color schemes.
- Includes visible keyboard focus indicators.

## Project Structure

```text
Repalogic-Group---Seat-Booking-Challenge/
│
├── index.html
├── styles.css
├── event.json
├── README.md
│
├── js/
│   ├── seats.js
│   └── app.js
│
└── tests/
    └── seats.test.js
```

**File Responsibilities:**

- `index.html` – Application structure and semantic HTML.
- `styles.css` – Styling, responsive layout, seat states, and accessibility-focused visual indicators.
- `event.json` – Event information, seat categories, pricing, and sold seats.
- `js/seats.js` – Pure JavaScript module containing seat selection, validation, and pricing logic without DOM dependencies.
- `js/app.js` – Application initialization, DOM interactions, rendering, event loading, and checkout functionality.
- `tests/seats.test.js` – Automated tests for the seat-selection and pricing logic using Node.js assertions.

## Getting Started

Since this project uses plain HTML, CSS, and JavaScript without frameworks or build tools, no package installation is required.

**1. Clone the repository**

```bash
git clone https://github.com/shrutisoni08/Repalogic-Group---Seat-Booking-Challenge.git
```

**2. Navigate to the project directory**

```bash
cd Repalogic-Group---Seat-Booking-Challenge
```

**3. Run the application**

Serve the project using a local development server (for example, VS Code Live Server).

> Note: Running the application directly through `file://` may prevent `fetch()` from loading `event.json` because of browser security restrictions.

## Running Tests

The seat and pricing logic is separated from the DOM, allowing it to be tested independently using Node.js.

Run the test file with:

```bash
node tests/seats.test.js
```

The tests cover the required seat-selection scenarios, invalid selections, maximum booking limits, and pricing calculations.

## Accessibility Considerations

The application incorporates the following accessibility practices:

- Semantic HTML elements and real buttons for individual seats.
- Descriptive accessible names for seats, including row, seat number, category, price, and availability.
- Keyboard navigation across the seating map.
- Visible focus indicators.
- Accessible checkout dialog and focus management.
- Screen-reader announcements for booking confirmation.
- Seat availability is communicated through text and visual indicators, not colour alone.

## Future Improvements

With additional development time, the application could be enhanced further with:

- More refined UI/UX design and visual polish.
- Smoother transitions and interactive animations.
- Enhanced loading skeletons and feedback states.
- A more detailed multi-step booking experience.
- Additional automated tests and broader accessibility testing.

---

**Developed by:** Shruti Soni  
**Assessment:** Repalogic Group – Front-End Engineer: Seat Booking Challenge
