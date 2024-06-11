import './css/styles.css';
import './images/turing-logo.png';
import './images/Travel Photo - Beach from Above.jpg';
import './images/Travel Photo - Rocky Beach from Above.jpg';
import './images/Travel Photo - Alt Rocky Beach.jpg';
import './images/Travel Photo - City on Rocky Coast.jpg';
import { fetchAllData, allTripData, allDestinationData, allUsersData, allSingleUserData } from './startData';
import { validateCredentials, extractTravelerId } from './logic functions/loginLogicFunctions';
import { travelerPastTrips, calculateAnnualSpend, calculateTotalWithAgentFee, getUpcomingTrips } from './logic functions/travelerLogicFunctions';
import { displayPastTrips, displayRecentTripImage, displayTotalCost, displayUpcomingTrips } from './domUpdates/domUpdates';

document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.querySelector('.login-view');
  const dashboard = document.querySelector('.dashboard');
  const loginForm = document.querySelector('.login-form');
  const userGreeting = document.getElementById('user-greeting');
  const destinationSelect = document.getElementById('destination-select');
  const calculateCostButton = document.getElementById('calculate-cost-button');
  const estimatedCostElement = document.getElementById('estimated-cost');
  const dateInput = document.getElementById('date-input');
  const durationInput = document.getElementById('duration-input');
  const travelersInput = document.getElementById('travelers-input');
  const errorMessageElement = document.getElementById('error-message');

  loginForm.addEventListener('submit', handleLogin);

  // Add event listeners to form inputs
  dateInput.addEventListener('input', validateForm);
  durationInput.addEventListener('input', validateForm);
  travelersInput.addEventListener('input', validateForm);
  destinationSelect.addEventListener('input', validateForm);

  function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (validateCredentials(username, password)) {
      const travelerId = extractTravelerId(username);
      fetchAllData(travelerId).then(() => {
        const user = allUsersData.find(user => user.id === travelerId);
        showDashboard(user);

        const { pastTripsDestinations, recentDestination } = travelerPastTrips(travelerId);
        displayPastTrips(pastTripsDestinations, recentDestination);
        displayRecentTripImage(recentDestination);

        const totalCost = calculateAnnualSpend(travelerId);
        const { agentFee, totalWithFee } = calculateTotalWithAgentFee(totalCost);
        displayTotalCost(totalCost, agentFee, totalWithFee);

        const upcomingTrips = getUpcomingTrips(travelerId);
        displayUpcomingTrips(upcomingTrips);

        populateDestinations();
      });
    } else {
      alert('Invalid username or password');
    }
  }

  function showDashboard(travelerData) {
    loginView.classList.add('hidden');
    dashboard.classList.remove('hidden');
    userGreeting.innerText = `Welcome, ${travelerData.name}`;
  }

  function populateDestinations() {
    allDestinationData.forEach(destination => {
      const option = document.createElement('option');
      option.value = destination.id;
      option.textContent = destination.destination;
      destinationSelect.appendChild(option);
    });
  }

  function validateForm() {
    let errorMessage = '';
    if (!dateInput.value) {
      errorMessage = 'Please enter a trip start to begin your estimate.';
    } else if (durationInput.value < 3) {
      errorMessage = 'Please enter a duration of at least 3 days.';
    } else if (travelersInput.value < 1) {
      errorMessage = 'Please enter the number of travelers (at least 1).';
    } else if (!destinationSelect.value) {
      errorMessage = 'Please select a destination.';
    }

    errorMessageElement.innerText = errorMessage;
    calculateCostButton.disabled = !!errorMessage;
  }

  calculateCostButton.addEventListener('click', () => {
    if (calculateCostButton.disabled) {
      validateForm();
    } else {
      const date = dateInput.value;
      const duration = parseInt(durationInput.value);
      const travelers = parseInt(travelersInput.value);
      const destinationId = parseInt(destinationSelect.value);

      const destination = allDestinationData.find(dest => dest.id === destinationId);

      if (destination) {
        const lodgingCost = destination.estimatedLodgingCostPerDay * duration * travelers;
        const flightsCost = destination.estimatedFlightCostPerPerson * travelers;
        const totalCost = lodgingCost + flightsCost;
        const agentFee = totalCost * 0.1;
        const totalWithFee = totalCost + agentFee;

        estimatedCostElement.innerText = `Estimated Cost: $${totalCost.toFixed(2)}\nAgent Fee: $${agentFee.toFixed(2)}\nTotal with Fee: $${totalWithFee.toFixed(2)}`;
        errorMessageElement.innerText = ''; // Clear error message if calculation is successful
      } else {
        estimatedCostElement.innerText = 'Please select a valid destination.';
      }
    }
  });

  // Initial validation check
  validateForm();
});
