import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Card from "./Card";
import "./Deck.css";

const BASE_URL = "http://deckofcardsapi.com/api/deck";

const DeckOfCards = () => {
  // deck ID
  const [deck, setDeck] = useState(null);
  // card numbers pushed into empty array
  const [cardsDrawn, setCardsDrawn] = useState([]);
  // initally set to false for cards drawn automatically
  const [autoDraw, setAutoDraw] = useState(false);
  const timerId = useRef(null); //global variable for timer

  /** create new shuffled deck  */
  useEffect(() => {
    async function getData() {
      let d = await axios.get(`${BASE_URL}/new/shuffle/`);
      setDeck(d.data);
    }
    getData();
  }, [setDeck]); // changes deck if page reloads
  /******************************* */

  useEffect(() => {
    /** Draw card from deck, and push card to cardDrawn state array */
    async function getCard() {
      let { deck_id } = deck;

      try {
        let drawRes = await axios.get(`${BASE_URL}/${deck_id}/draw/`);

        if (drawRes.data.remaining === 0) {
          setAutoDraw(false);
          throw new Error("No cards remaining!");
        }

        // set card to first card in cards array
        const card = drawRes.data.cards[0];

        // set up card objs in array
        // add cards to deck/array of cards already drawn
        setCardsDrawn((cD) => [
          ...cD, // cards already in array
          // obj created for cards drawn
          {
            id: card.code,
            name: card.value + " " + card.suit,
            image: card.image,
          },
        ]);
      } catch (err) {
        alert(err);
      }
    }
    /************************************  */

    /** Automatically draw cards if autoDraw is true and theres no timerRef */
    if (autoDraw && !timerId.current) {
      // set 'current' object of useRef variable
      // async due to getCard being an async function
      timerId.current = setInterval(async () => {
        await getCard();
      }, 1000);
    }

    //clears last timer when it unmounts (when button is clicked)
    // helps restart the timer
    return () => {
      clearInterval(timerId.current);
    };

    /************************************  */
  }, [autoDraw, setAutoDraw, deck]);

  const toggleAutoDraw = () => {
    // toggles between true and false
    setAutoDraw((auto) => !auto);
  };

  // loop over all cards in array
  const cards = cardsDrawn.map(({ id, name, image }) => (
    <Card key={id} name={name} image={image} />
  ));

  return (
    <div className="Deck">
      {deck ? (
        <button onClick={toggleAutoDraw}>
          {/* if autoDraw is true, display stop. Otherwise, display keep */}
          {autoDraw ? "Stop" : "Keep"} Drawing For Me
        </button>
      ) : null}
      <div className="Deck-cardarea">{cards}</div>
    </div>
  );
};

export default DeckOfCards;
