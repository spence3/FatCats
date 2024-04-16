'use strict'
const needPath = require('path')
const filesize = require('filesize');



const fs = require('fs')

//global flags
let path = '.'
let setPath = false
let sortTree = compareFileByDefault
let numberFormatter = commaSize//metric
let threshold = 0
let block = false

function usage() { //used after v0.2
  const help = fs.readFileSync('help.txt', 'utf-8')
  console.log(help)
  process.exit()
}

function setFlags() {
  const args = process.argv.slice(2)
  for(let i = 0; i < args.length; i++) {
    args[i] === '-h' || args[i] ==='--help' ? usage() : null//help flag
    block = args[i] === '-b' || args[i] ==='--blocksize' && true//blocksize is true if -b, else default

    if(args[i] === '-p' || args[i] === '--path'){
      if(args[i+1]){
        path = args[++i]
        setPath = true
        // i++//next arg
      }
    }

    //metric
    if(args[i] === '-m' || args[i] === '--metric') {
      numberFormatter = metricSize
    }

    //threshold
    if(args[i] == '-t' || args[i] == '--threshold') {
      threshold = args[++i]
    }

    //sorting
    if(args[i] == '-s' || args[i] == '--sort') {
      if(args[i+1] == 'alpha') {
        sortTree = compareFilesByName
        i++
      }
      else if(args[i+1] == 'exten') {
        sortTree = compareFilesByExten
        i++
      }
      else if(args[i+1] == 'size') {
        sortTree = compareFilesBySize
        i++
      }
      else {
        sortTree = compareFileByDefault
        i++
      }
    }
  }
}

function BuildTree(dir) {
  //base case
  const children = (fs.readdirSync(dir.name))
  for (const child of children)  {
      const relativePath = `${dir.name}/${child}`
      //path: ./.git/hooks
      //dir.name: ./.git/hooks
      const stats = fs.statSync(relativePath)
      if(stats.isDirectory()) {
          // console.log(`${child}/`)
          const tempDir = BuildTree( {
              name: relativePath,
              size: 0,
              children:[]
          })
          dir.children.push(tempDir)
      }
      else if(stats.isFile) {
          //create a new objec for the file and add it to the parent
          let tempFile = file(child, stats.size)
          dir.children.push(tempFile)

      }
  }
  dir.children.sort(sortTree)

  return dir
}

function metricSize(size) {
  return filesize(size, { base: 2, standard: 'jedec' });
}

function commaSize(size) {
  //change size in the roundsize function
  size = roundSize(size)
  return `${size.toLocaleString()} bytes` //change this
}

function roundSize(size) {//1 or 4096
  const blocksize = 4096
  if(!block) return size
  return Math.ceil(size/blocksize) * blocksize
}


//sort comparators utils
const compareNums = (a, b) => b - a
const compareStr = (a, b) => a.localeCompare(b)
const noCompare = (a, b) => 0
const getExtension = str => str.slice(str.lastIndexOf('.'))

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
  return noCompare(a, b)
}

//preorder
function printTree(tree) {
  if(!tree)return

  let  {name, size, children} = tree

  if(children) {
   if(size >= threshold) console.group(`${name}/ ${numberFormatter(size)}`)
  }
  else {
    if(size >= threshold) console.group(`${name} ${numberFormatter(size)}`)
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
    //name: '.',
    name: path,
    children:[],
    size: 0
  }

  //file directory
  let tree = BuildTree(root)

  // OUTPUT
  printTree(tree)
}
main()