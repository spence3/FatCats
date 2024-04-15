// let helpFile = 'help.en_US.txt'
let messageFile = 'messages.en_US.json'


const msg = require(`./${messageFile}`)
// const helpText = fs.readFileSync(`./${helpFile}`, 'utf8')

console.log(msg['This is a message of joy!'])

console.log(msg['This is a message of mid'])

console.log(msg['This is a message of bad'])

