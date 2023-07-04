/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
   
    extend: {
      fontFamily: {
        sans: ["Bai Jamjuree", "sans-serif"],
      },
      colors:{
        'ceruleanBlue': '#03A8E8',
        'fernGreen': '#70C073',
        'havelockBlue': '#558FC1',
        'lightOlive' : '#BCB859',
        'satinSheenGold': 'D8A633',
        'seashellWhite': '#EDEDEE'
      },
    },
  },
  plugins: [],
}

