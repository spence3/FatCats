const symbols = '|/-\\'.split('')
let count = 0
let totalCount = 0

//spinner code
function tick(){
    console.log('in tick')
    process.stdout.write('\b')
    process.stdout.write(symbols[count++ % 4])
    totalCount++
    if(totalCount == 20) return

}

// for(let i=0; i < Infinity; i++){
//     if(i % 10000000 === 0) tick() 
// }

setInterval(tick, 70)