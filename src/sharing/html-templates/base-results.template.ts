export const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  body, html {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    text-align: center; /* Ensures that content is centered */
    background: #203763; /* Replace with your chosen blue for the overall background */
  }
  .hero-image {
    width: 100%;
    height: 350px; /* Set a fixed height for the hero images */
    background-size: cover;
    background-position: center;
  }
  .results-container {
    padding: 20px;
    background: linear-gradient(#203763, #2C5293);
  }
  .result-entry {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    margin: 10px;
    padding: 20px;
    border-radius: 10px;
    background: #243F71; /* Replace with an even lighter blue for individual entries */
    color: white; /* Set text color to white for better visibility */
  }
  h2 {
    color: white; /* Make headers stand out */
  }
  p {
    color: #E6E6E6; /* A slightly off-white color for less important text to reduce contrast slightly */
  }
</style>
</head>
<body>
  <img src="{{topImage}}" class="hero-image">
  <div class="results-container">
    {{entries}}
  </div>
  <img src="{{bottomImage}}" class="hero-image">
</body>
</html>
`;
