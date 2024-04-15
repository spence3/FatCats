//use eval for printing out error messages dynamically
//@ts-check
const needPath = require('path')
const fs = require('fs')
const chalk = require('chalk');

//language defaults
let helpFile = 'help.en_US.txt'
let messageFile = 'messages.en_US.json'
let msg = require(`./${messageFile}`)

//spinner code
const symbols = '|/-\\'.split('')
let count = 0
let totalCount = 0
function tick(){
  process.stdout.write('\b')
  process.stdout.write(symbols[count++ % 4])
  totalCount++
  if(totalCount == 100000) process.exit()

}

//global flags
let path = '.'
let setPath = false //user input path
let foundPath = false //check if path is in list of children
let sortTree = compareFileByDefault
let numberFormatter = commaSize//metric
let threshold = 0
let childList = []


function usage() { //used after v0.2
  const help = fs.readFileSync(helpFile, 'utf-8')
  console.log(help)
  process.exit()
}

function setFlags() {
  const args = process.argv.slice(2)
  try{//for user input errors
    for(let i = 0; i < args.length; i++) {

      //langauge flag
      if(args[0] === '-l' || args[0] === '--language' && args.length > 1){
        let lang = args[1]
        messageFile = `messages.${lang}.json`;
        msg = require(`./${messageFile}`);
        helpFile = `help.${lang}.txt`
      }

      //help flag
      else if(args[0] === '-h' || args[0] === '--help') usage()

      //path
      else if(args[0] === '-p' || args[0] === '--path'){
        if(args[1]){
          path = args[1]
          setPath = true
        }
        else{
          throw new Error(msg['No Path Was Given'])// no path is input
        }
      }

      //metric
      else if(args[i] === '-m' || args[i] === '--metric') {
        numberFormatter = metricSize
      }

      //threshold
      else if(args[0] == '-t' || args[0] == '--threshold') {
        if(args[1] == null) throw new Error(msg['No Number Was Input By User'])// error here for not second param
        let threshold
        threshold = args[1]//threashold should be a number
        // @ts-ignore
        if(isNaN(threshold)){//error for threshold not being a number
          throw new Error(msg[`Must Enter a Number For Threshold`])
        }
      }

      //sorting
      else if(args[0] == '-s' || args[0] == '--sort') {
        if(args[1] == 'alpha') {
          sortTree = compareFilesByName
        }
        else if(args[1] == 'exten') {
          sortTree = compareFilesByExten
        }
        else if(args[1] == 'size') {
          sortTree = compareFilesBySize
        }
        else {
          sortTree = compareFileByDefault
        }
      }
      //error right here if user doesn't put correct first arg
      else{
        throw new Error(msg[`Incorrect parameter input by user`])
        
      }
    }
  }
  catch(error){
    // @ts-ignore
    // console.log(chalk.green('Welcome to Tutorials Point'))
    console.error(chalk.red.bold(error.message));
    usage()
  }
}

function BuildTree(dir, path) {
  //base case
  const children = (fs.readdirSync(path))//for later use if user input path correctly
  childList.push(children)
  for (const child of children) {
    const relativePath = `${path}/${child}`
    const stats = fs.statSync(relativePath)
    if(stats.isDirectory()) {
        const tempDir = BuildTree( {
          name: child,
          size: 0,
          children:[]
        }, 
          relativePath
      )
      dir.children.push(tempDir)
    }

    else {
        //create a new object for the file and add it to the parent
        let tempFile = file(child, stats.size)
        dir.children.push(tempFile)

    }
  }
  dir.children.sort(sortTree)
  return dir
}

function metricSize(size) {
  let sizeString = ''
  sizeString += `${(size /= 1000).toFixed(2)} KB ` //kilobyte
  sizeString += `${(size /= 1e+6).toFixed(2)} MB ` //megabyte
  sizeString += `${(size /= 1e+9).toFixed(2)} GB ` //gigabyte
  sizeString += `${(size /= 6e-9).toFixed(2)} TB ` //terabyte
  return sizeString.toLocaleString()
}

function commaSize(size) {
  //change size in the roundsize function
  size = size
  return `${size.toLocaleString()} bytes` //change this
}

function printPath(name) {
  let absolutePath
  if(setPath && path === name) return absolutePath = needPath.resolve(path)
  return name
}

//sort comparators utils
const compareNums = (a, b) => b - a
const compareStr = (a, b) => a.localeCompare(b)
const noCompare = () => 0
const getExtension = str => str.slice(str.lastIndexOf('.'));

//sorting
function compareFilesByName(a, b) {
  const aFileName = a.name
  const bFileName = b.name
  return compareStr(aFileName, bFileName)
}

function compareFilesByExten(a, b) {
  const aExten = getExtension(a.name)
  const bExten = getExtension(b.name)
  return compareStr(aExten, bExten)
}

function compareFilesBySize(a, b) {
  const aFileSize = a.size
  const bFileSize = b.size
  return compareNums(aFileSize, bFileSize)
}

function compareFileByDefault(a, b) {
  return noCompare()
}

//preorder
function printTree(tree) {
  if(!tree)return

  let {name, size, children} = tree
  const absolutePath = needPath.resolve(path, name);

  if(children) {
   if(size >= threshold) console.group(chalk.yellow.bold(`${absolutePath} ${numberFormatter(size)}`))
  }
  else {
    if(size >= threshold) console.group(chalk.blueBright(`${printPath(name)} ${numberFormatter(size)}`))
  }
  if(children) {//for directories and subdirectories
    for(let child of children) {
      printTree(child)
      console.groupEnd()
    }
  }
}

const file = (name, size) => ( {name, size})
const dir  = (name, size, children) =>( {name, size, children})

function main() {
  // INPUT
  setFlags()

  // PROCESS
  const root = {
    name: '.',
    children:[],
    size: 0
  }

  const loadingInterval = setInterval(tick, 100)

  //file directory
  let tree = BuildTree(root, '.')
  for(const childPath of childList){
    if(childPath.includes(path) || path == '.') foundPath = true
  }
  setTimeout(() => {
    for (const childPath of childList) {
      if (childPath.includes(path) || path == '.') foundPath = true;
    }
    // Clear the loading interval once processing is complete
    clearInterval(loadingInterval);

    if (!foundPath) {
      console.error('Error Message: no path was found');
      usage();
    } 
    else {
      // Output the tree
      printTree(tree);
    }
    
  }, 1000);
}
main()
