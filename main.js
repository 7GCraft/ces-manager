const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const ipcs = require(path.join(
  __dirname,
  "src",
  "handlers",
  "ipcEventHandler"
));

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.on("closed", () => app.quit());
  win.loadFile(path.join(__dirname, "src", "index.html"));
}

app.on("ready", () => {
  createWindow();
  ipcs.initializeIpcMains();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow();
//     }
// });

//Make navbar instead of adding new windows -- DONE. KEEPING THE CODE BELOW JUST IN CASE

// function addNewWindow(url, title) {
//     addWindow =  new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true
//         },
//         title: title
//     });

//     addWindow.loadFile(path.join(__dirname, 'src', url))

//     //Garbage
//     addWindow.on('close', function(){
//         addWindow = null
//     });
// }

// const template = [
//     {
//         label: 'Menu',
//         submenu: [
//             {
//                 label: 'State List',
//                 click () {
//                     addNewWindow('views/stateInfo.html', 'State List')
//                 }
//             },
//             {
//                 label: 'Region List',
//                 click () {
//                     addNewWindow('views/regionList.html','Region List')
//                 }
//             },
//             {
//                 label: 'Resources',
//                 click () {
//                     addNewWindow('views/resources.html', 'Resources')
//                 }
//             },
//             {
//                 label: 'Trade Agreements',
//                 click () {
//                     addNewWindow('views/tradeAgreementList.html', 'Trade Agreements')
//                 }
//             }
//         ]
//     }
// ]

//Check if mac
// if(process.platform == 'darwin'){
//     template.unshift({});
// }

// //Dev tools if not in prod
// if(process.env.NODE_ENV !== 'production'){
//     template.push({
//         label: 'Dev Tools',
//         submenu: [
//             {
//                 label: 'Toggle Dev Tools',
//                 accelerator : 'F12',
//                 click(item, focusedWindow){
//                     focusedWindow.toggleDevTools();
//                 }
//             },
//             {
//                 role: 'reload'
//             }
//         ]
//     })
// }
//const menu = Menu.buildFromTemplate(template)
