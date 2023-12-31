'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-20T21:31:17.178Z',
    '2022-12-28T07:42:02.383Z',
    '2023-06-18T09:15:04.904Z',
    '2023-06-25T10:17:24.185Z',
    '2023-06-29T14:11:59.604Z',
    '2023-07-08T17:01:17.194Z',
    '2023-07-10T13:36:17.929Z',
    '2023-07-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2023-04-15T14:18:46.235Z',
    '2023-06-05T16:33:06.386Z',
    '2023-06-19T14:43:26.374Z',
    '2023-07-02T18:49:59.371Z',
    '2023-07-09T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (day1, day2) =>
    Math.round(Math.abs(day2 - day1) / (1000 * 60 * 60 * 24));

  // Activate the calculation based on days (like yesterday, 2 days ago etc...)
  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

// Refactored Format Currency(API) Function
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// LogOutTimer Function
const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When zero second, stop timer and logout
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrease by 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//========== Display Movement Fuunction ==========
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Dates shown on Each Movement Transaction
    const date = new Date(acc.movementsDates[i]); //i is looped on each account
    const displayDate = formatMovementDate(date, acc.locale);

    // Automatic Internationalizing Number Generation
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    // Each Movement row
    const html = `
      <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>

      <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//========== Display Balance Fuunction ==========
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formatBalance = formatCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formatBalance}`;
};

//========== Display Summary Fuunction ==========
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//=================== Create Username Function ===================
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

//===================== Update UI Function =====================
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//////////////////////////////////////////////////
//=============== Event handlers Function ===============
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//============ Login Function ============
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // CREATE AND display current DATE AND TIME
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // Setting Date and Time Automatically according to Users location
    // const locale = navigator.language;
    // console.log(locale);

    // Called From API
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    /////////////////////
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

//============ Transfer Function ============
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add Transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

//============ Request Loan Function ============
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add Loan Date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset Timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

//============ Delete Account Function ============
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

//============ Sort Function ============
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
//////////////////////////////////////////////////
// LECTURES
// Base 10 => 0 to 9;
// Binary Base 2 => 0, 1;

// console.log(Math.trunc(0.1 + 0.2) === Math.trunc(0.3));

// Conversion
// console.log(Number('23'));
// console.log(+'23');

//========= Parsing =========
// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('e25', 10));

// console.log(Number.parseInt('2.5rem'));
// console.log(Number.parseFloat('2.5rem'));

// Check if value is NaN
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20x'));
// console.log(Number.isNaN(23 / 0));

// Checking if value is number
// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20x'));
// console.log(Number.isFinite(23 / 0));

// Check if value is interger
// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));
// console.log(Number.isInteger(23 / 0));

// Math and Rounding

// Math Operations
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 18, 23, 11, 2));
// console.log(Math.max(5, 18, '23', 11, 2));
// console.log(Math.max(5, 18, '23px', 11, 2)); //It doesnot parseInt

// console.log(Math.min(5, 18, 23, 11, 2));

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
//0...1 -> 0... (max - min) -> min...max

// console.log(randomInt(10,20));

// Rounding Integers
// console.log(Math.trunc(23.5));

// console.log(Math.round(23.3)); //Rounds Down
// console.log(Math.round(23.8)); //Rounds Up

// Ceil rounds up
// console.log(Math.ceil(23.8));
// console.log(Math.ceil(23.2));

// Floor Rounds Down
// console.log(Math.floor(23.8));
// console.log(Math.floor(23.8));
// console.log(Math.round('23.8'));

// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3));

// Rounding Decimals
// console.log((2.7).toFixed(0));
// console.log((2.7).toFixed(3));
// console.log((2.73235).toFixed(3));
// console.log(+(2.73235).toFixed(3));

//======= Remainder Operator =======
// console.log(5 % 2);
// console.log(5 / 2); // 5 = 2*2 + 1

// console.log(8 % 3);
// console.log(8 / 3); // 8 = 2*3 + 2

// Even Number
// console.log(6 % 2);
// console.log(6 / 2);

// console.log(7 % 2);
// console.log(7 / 2);

// const isEven = n => n % 2 === 0;
// console.log(isEven(8));
// console.log(isEven(23));
// console.log(isEven(54));

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     // 0,2,4,6
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//     // 0,3,6,9
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

// Working with BIGINT
// console.log(2**53-1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(2**53-2);
// console.log(2**53-3);
// console.log(2**53-4);
// console.log(2**53-5);
// console.log(2**53-6);
// console.log(2**53-7);

// console.log(2749789283295938407593737287534n);
// console.log(BigInt(2749789283295938407593737287534));
// console.log(BigInt(27497892832));

// Operations

// console.log(10000n + 10000n);
// console.log(891247475841256279407894789247749408694n * 7293476497495475698n);

// const huge =23597853047874278n;
// const num = 23;
// console.log(huge * BigInt(num));

// Exceptions
// console.log(20n > 15);
// console.log(20n === 20);
// console.log(typeof 20n);
// console.log(20n == '20');

// console.log(huge + ' is REALLY big!!!!');

// Divisions
// console.log(11n / 3n);
// console.log(10/3);

// Create a Date
// const now = new Date();
// console.log(now);

// console.log(new Date('Jul 10 2023 16:49:00'));
// console.log(new Date('December 24, 2015'));

// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 17, 23, 15, 45));
// console.log(new Date(2034, 10, 45));

// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 1000));

// Working with dates
// const future = new Date(2037, 10, 17, 23, 15, 45);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(new Date(2142108945000));

// console.log(Date.now());

// // Set Method
// future.setFullYear(2040);
// console.log(future);

const future = new Date(2037, 10, 17, 23, 15, 45);
// console.log(+future);

const calcDaysPassed = (day1, day2) =>
  Math.abs(day2 - day1) / (1000 * 60 * 60 * 24);

const days = calcDaysPassed(new Date(2037, 10, 17), new Date(2037, 10, 28));
// console.log(days);

// console.log(new Date());

//================== Internationalizing Numbers ==================
const num = 3464446445.54;

const option = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  useGrouping: false,
};

// console.log('US:    ', new Intl.NumberFormat('en-US', option).format(num));
// console.log('Germany:    ', new Intl.NumberFormat('de-DE', option).format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language).format(num)
// );

//============ SetTimeout and SetTImeInterval Function ============
// SetTimeOut
const ingredients = ['olives', ''];
const pizzaTimer = setTimeout(
  (ing1, ing2) => {
    // console.log(`Here is your Pizza with ${ing1} and ${ing2}`);
  },
  3000,
  ...ingredients
);
// console.log('Waiting...');
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// SetInterval
setInterval(function () {
  const now = new Date();
  const timer =
    `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`.padStart(2, 0);
  // console.log(timer);
}, 1000);
