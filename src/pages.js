const path = require('path')
const baseViewDir = path.join(__dirname, 'views');

const todoPage = (window) => {
    if (window != null)
        window.loadFile(path.join(baseViewDir, 'todo.html'));
}

module.exports = {
    todoPage
};