'use strict'
const dogs = require('./dog.json')

let nums = [1,7,9,8,3,2,10,-5]
let strs = ['gamma', 'alpha', 'Alpha', 'Beta', 'beta', 'Gamma', 'ALPHA']
//descending

const sizeMapping = {
    XXS: 0,
    XS: 1,
    S: 2,
    M: 3,
    L: 4,
    XL: 5,
    XXL: 6 
}

//sort comparators utils
const compareNums = (a, b) => a - b
const compareStr = (a, b) => a.localeCompare(b)
const noCompare = (a, b) => 0
const shuffle = (a, b) => Math.random() - 0.5

//Global Flags
let path = 'I'
let metric = false
let sortOrder = noCompare

/*
if flag === sort{
    if nexflag === name or n{
        sortOrder = comparefilesbyname
    }
    else if nextflag === size or s{
        soroder = comparefilesbysize
    }
}
*/

files.sort(sortOrder)

function desc(comparator){
    return function(a,b){
        return -comparator(a,b)
    }
}

//sort by name
function compareDogByName(a, b){
    const aName = a.name
    const bName = b.name
    return compareStr(aName, bName)
}

//sort by age
function compareDogByAge(a, b){
    const aAge = a.age
    const bAge = b.age
    return compareNums(aAge, bAge)
}

//sort by sex
function compareDogSex(a, b){
    const aSex = a.sex
    const bSex = b.sex
    return compareStr(aSex, bSex)
}

//sort by breed
function compareDogBreed(a, b){
    const aBreed = a.breed
    const bBreed = b.breed
    return compareStr(aBreed, bBreed)
}

//compare dog by size
function compareBySize(a,b){
    const aSize = sizeMapping[a.size]
    const bSize = sizeMapping[b.size]
    return compareNums(aSize, bSize)
}


// console.log(dogs.sort(compareDogByName))
// console.table(dogs.sort(compareDogByAge))
// console.table(dogs.sort(compareDogSex))
console.table(dogs.sort(desc(compareBySize)))





























const classMapping = {
    freshman: 1,
    sophmore: 2,
    junior: 3,
    senior: 4,
    gradstudent: 5
}

function compareByYear(a,b){
    const aYear = classMapping[a]
    const bYear = classMapping[b]
    return compareNums(aYear, bYear)
}

const studentYrs = ['freshman', 'sophmore', 'junior', 'senior', 'gradstudent', 'junior', 'sophmore']
// console.table(studentYrs.sort(compareByYear))