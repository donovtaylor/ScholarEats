const express = require("express");
const path = require("path");
let router = express.Router();

// server angelo's page dynamically using handlebars
router.get('/angelo', (req, res) => {
  //uses the 'about.hbs' template
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Angelo',
    title: 'About Angelo',
    src: '/images/angelo.jpg',
    alt: 'angelo.jpg',
    desc: 'Angelo is a student at San Francisco State University. Has an aptitude for many hobbies ranging from sewing and clothesmaking to 3D modelling in Blender. Started at SFSU in January 2023 after finishing an enlistment in the United States Marine Corps and is expecting to graduate Decemeber 2024 with a B.S. in Computer Science and a Minor in Mathematics.'
  });
});

// serve donovan's page
router.get('/donovan', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Donovan',
    title: 'About Donovan',
    src: '/images/donovan.jpg',
    alt: 'donovan.jpg',
    desc: 'Donovan is a student at SFSU who is passionate about computer science and expanding his teamwork abilities.'
  });
});

// serve hancun's page
router.get('/hancun', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Hancun',
    title: 'About Hancun',
    src: '/images/hancun.jpg',
    alt: 'hancun.jpg',
    desc: 'Hancun is a student at SFSU who loves video games.'
  });
});

// serve edward's page
router.get('/edward', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Edward',
    title: 'About Edward',
    src: '/images/edward.jpg',
    alt: 'edward.jpg',
    desc: 'Edward is a CS student at SFSU'
  });
});

// serve karl's page
router.get('/karl', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Karl',
    title: 'About Karl',
    src: '/images/karl.jpg',
    alt: 'karl.jpg',
    desc: 'Karl is currently attending his last year at San Francisco State University majoring in Computer Science and is eager to his expand his knowledge in the field.'
  });
});

// serve sai's page
router.get('/sai', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Sai',
    title: 'About Sai',
    src: '/images/sai.jpg',
    alt: 'sai.jpg',
    desc: 'I am Sai Saketh Bavisetti, currently pursuing a Masters in Data Science and AI at San Francisco State University. With a background in Computer Science from GITAM, INDIA, I specialize in developing and analyzing complex algorithms and data using a variety of programming languages and machine learning tools.'
  });
});

// serve maeve's page
router.get('/maeve', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      option: ['Vegan','Vegetarian','Pescatarian','Keto','Halal','Kosher']},
    fName: 'Maeve',
    title: 'About Maeve',
    src: '/images/maeve.jpg',
    alt: 'maeve.jpg',
    desc: 'Maeve is a student at SFSU from San Francisco who loves spending time with family and helping others.'
  });
});

// serve sabrina's page
router.get('/sabrina', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Sabrina',
    title: 'About Sabrina',
    src: '/images/sabrina.jpg',
    alt: 'sabrina.jpg',
    desc: 'Sabrina is a student at SFSU who aspires to improve others\' lives through her work.'
  });
});

// serve tina's page
router.get('/tina', (req, res) => {
  res.render('about', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'about.css'],
    dropdown_filters: {value: 'Filter', id: 'filter_options',
      checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard'],
      radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']},
    fName: 'Tina',
    title: 'About Tina',
    src: '/images/tina.jpg',
    alt:'tina.jpg',
    desc:'Tina is a SFSU student who loves swimming and major is computer science.'
  });
});

module.exports = router;