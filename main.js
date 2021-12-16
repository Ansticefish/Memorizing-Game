const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: ' CardsMatched',
  GameFinished: 'GameFinished',
}


const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]


const view = {
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `<p>${number}</p>
      <img src="${symbol}" alt="Card Pattern">
      <p>${number}</p>`
  },

  getCardElements (index) {
    return `
    <div class="card back" data-index="${index}"></div>`
  },

  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards (randomCardsIndex) {
    const rootElement = document.querySelector('#cards')
    // NEW CONCEPT
    rootElement.innerHTML = randomCardsIndex.map(index => this.getCardElements(index)).join('')
  },

  flipCards (...cards){
    // 原本為背面情況
    cards.map((card)=> {
      if (card.classList.contains('back')){
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }

    // 原本為正面情況
    card.classList.add('back')
    card.innerHTML = null

    })

  },
    
  pairCards (...cards) {
    cards.map((card)=>{
      card.classList.add('paired')
    })
  },

  renderScore(score){
    document.querySelector('#score').innerText = `Score : ${score}`
  },

  renderTriedTimes (times){
    document.querySelector('#tried-times').innerText = `You've tried ${times} times!`
  },

  appendWrongAnimation (...cards) {
    cards.map((card)=>{
      card.classList.add('wrong')
      card.addEventListener('animationend', event => 
      event.target.classList.remove('wrong'), {once:true})
    })
  },

  renderEnd(score, times, bestRecord) {

    document.querySelector('.end-container').innerHTML += `
    <div class="end-animation" id="end">
    <div id="end-words">
      <h1>Congratulations!</h1>
      <h3>Your Final Score is <em>${score}</em> !</h3>
      <h3>You've tried ${times} times!</h3>
      <button id="play-again-btn">Play again !</button>
      <h4 id="best-record"></h4>
    </div>
  </div>
    `
   if (bestRecord === times) {
      document.querySelector('#best-record').innerText = `Wow! You just broke your personal record!`
    } else {
        document.querySelector('#best-record').innerText = `Best record: complete within ${bestRecord} times! `
    } 

  },
}



const model = {
  revealedCards: [],

  score: 0,

  triedTimes: 0,

  isRevealedCardsMatched () {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  saveRecord (newTriedTimes) {
    let bestRecord = Number(localStorage.getItem('personalBest')) || 0
    if (bestRecord === 0 || newTriedTimes < bestRecord) {
      bestRecord = newTriedTimes
      localStorage.setItem('personalBest', JSON.stringify(bestRecord))
    }
    
  },

  retrieveRecord () {
    const bestRecord = Number(localStorage.getItem('personalBest'))
    return bestRecord
  }
}


const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)

        view.renderTriedTimes(++model.triedTimes)
        // 比對數字
        if (model.isRevealedCardsMatched()){ 
          // 配對成功
          view.renderScore(model.score += 10)
          
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          
          // 遊戲結束
          if (model.score === 260){
            this.currentState = GAME_STATE.GameFinished
            model.saveRecord(model.triedTimes)
            view.renderEnd(model.score, model.triedTimes, model.retrieveRecord())
            
            const playAgainBtn = document.querySelector('#play-again-btn')
            playAgainBtn.addEventListener('click', this.resetGame)
          }
          
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout (this.resetCards, 1000)
          this.currentState = GAME_STATE.FirstCardAwaits
        }
        break
    }
  },

  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  resetGame () {
    document.querySelector('.end-container').innerHTML = ''
    controller.generateCards()
    model.score = 0
    model.triedTimes = 0
    view.renderScore(model.score)
    view.renderTriedTimes(model.triedTimes)
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
      })
    })
  }

}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    return number
  },
}


// main code
controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event =>{
  controller.dispatchCardAction(card)
  })
})

