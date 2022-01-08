import './App.css';
import axios from 'axios';
import React from 'react';

const BASE_URL = "https://deckofcardsapi.com/api/deck";

export default class App extends React.Component {

  state = {
    deck_id: -1,
    cards: [],
    discarded: [],
    numDraws: 0,
    cardsLeft: 52,
    isFullHouse: false,
  }

  componentDidMount() {
    axios.get(BASE_URL+'/new/shuffle/?deck_count=1')
      .then(res => {
        const deck = res.data;
        this.setState({ deck_id: deck.deck_id });

        const deckId = deck.deck_id;
        this.draw(5);
        // axios.get(BASE_URL +'/' + deckId + '/draw/?count=' + 5)
        // .then(res => {
        //   const draw = res.data;
        //   this.setState({ cards: draw.cards });
        //   this.setState({ cardsLeft: draw.remaining });
        // })
      })   
  }

  handleDraw = event => {
    const discardCount = this.state.discarded.length;
    this.draw(discardCount);

    // const deckId = this.state.deck_id;
    // axios.get(BASE_URL +'/' + deckId + '/draw/?count=' + discardCount)
    // .then(res => {
    //   const draw = res.data;
    //   let currCards = this.state.cards;
    //   this.setState({ cards: currCards.concat(draw.cards) });
    //   this.setState({ cardsLeft: draw.remaining });
    // })

    // this.setState({ discarded: [] });
    // this.setState({ numDraws: this.state.numDraws+1 });
  }

  handleDrawAllNew = event => {
    this.setState({ cards: [] })
    this.draw(5)

    // const deckId = this.state.deck_id;
    // axios.get(BASE_URL +'/' + deckId + '/draw/?count=' + 5)
    // .then(res => {
    //   const draw = res.data;
    //   let currCards = this.state.cards;
    //   this.setState({ cards: currCards.concat(draw.cards) });
    //   this.setState({ cardsLeft: draw.remaining });
    // })

    // this.setState({ discarded: [] });
    // this.setState({ numDraws: this.state.numDraws+1 });
  }

  draw(count) {
    // console.log("drawing")
    const deckId = this.state.deck_id;
    axios.get(BASE_URL +'/' + deckId + '/draw/?count=' + count)
    .then(res => {
      const draw = res.data;
      let currCards = this.state.cards;
      this.setState({ cards: currCards.concat(draw.cards) });
      this.setState({ cardsLeft: draw.remaining });
    })

    this.setState({ discarded: [] });
    this.setState({ numDraws: this.state.numDraws+1 });
  }

  handleDiscard = event => {
    const code = event.target.alt;

    let discarded = this.state.discarded;
    discarded.push(code);
    // this.setState({ discarded });

    const cards = this.state.cards;
    const filteredCards = cards.filter((card) => {
      return card.code !== code;
    });
    this.setState({cards: filteredCards});
  }

  handleReloadPage = event => {
    window.location.reload(true);
  }

  isFullHouse() {
    const cards = this.state.cards;

    if (cards.length !== 5)
      return false;

    let firstRank = cards[0].value;
    let secondRank = undefined;
    let firstRankCount = 1;
    let secondRankCount = 0;
    for (let i = 1; i < cards.length; i++) {
      const card = cards[i];
      if (card.value === firstRank) {
        firstRankCount++;
      }
      else {
        if (!secondRank) {
          secondRank = card.value;
          secondRankCount++;
        }
        else if (card.value === secondRank) {
          secondRankCount++;
        }
        else {
          return false;
        }
      }
    }

    return (firstRankCount === 3 && secondRankCount === 2) || 
           (firstRankCount === 2 && secondRankCount === 3);
  }

  isGameOver() {
    return this.state.cardsLeft === 0 || (this.state.cardsLeft + this.state.cards.length) < 5;
  }

  isDiscardPileEmpty() {
    return this.state.discarded.length === 0;
  }

  isFirstDraw() {
    return this.state.numDraws === 1;
  }

  render() {
    console.log(this.state)

    const drawDisabled    = (this.isDiscardPileEmpty())? true: false;
    const drawNewDisabled = (this.isGameOver())? true: false;

    let status = "";
    let msg = "";
    if ( this.isFullHouse() ) {
      status = "fullHouse";
      msg = "You won! Let's Go!"
    }
    else if ( this.isGameOver() ) {
      status = "gameOver";
      msg = <div>Sorry, you lost!... <input type="button" value="Try again?" onClick={this.handleReloadPage} /></div>
    }

    return (
      <div className="App">
        <div># of Draws: {this.state.numDraws}</div>
        <div># of cards left: {this.state.cardsLeft}</div>
        <input type="button" value="Draw" onClick={this.handleDraw} disabled={drawDisabled} className="button" />
        {this.isFirstDraw() && (<div>Click a card to discard</div>)}
        <div className={status}>
          <div>{msg}</div>
          {/* {
            this.state.cards
              .map(card =>
                <div class="container">
                  <img key={card.code} src={card.image} alt={card.code} onClick={this.handleDiscard} className="card" />
                  <div class="middle">
                    <div class="text">Click to Discard</div>
                  </div>
                </div>
              )
          } */}
          {
            this.state.cards
              .map(card =>
                  <img key={card.code} src={card.image} alt={card.code} onClick={this.handleDiscard} className="card" />
              )
          }
        </div>
        <input type="button" value="Draw New 5" onClick={this.handleDrawAllNew} disabled={drawNewDisabled} />
      </div>
    );
  }
}
