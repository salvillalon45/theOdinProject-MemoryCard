// -----------------------------------------------
//
// MemoryGame -> GameBoard.js
// Desc: Component to hold the cards of the game
//
// -----------------------------------------------

// -----------------------------------------------
// Imports

// React
import React, { useState, useEffect, useRef } from 'react';

// Components
import PopUp from '../../PopUp';

// Bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardColumns from 'react-bootstrap/CardColumns';
// -----------------------------------------------

// -----------------------------------------------
// Imports
import {
	createCardsState,
	determineGameOver,
	checkAdvanceLevel,
	updateCardsIndex,
	shuffleCards,
	determineScore
} from '../MemoryGameUtil.js';

function GameBoard(props) {
	const { amountOfCards, level } = props;

	const [cardsIndex, _setCardsIndex] = useState(
		createCardsState(amountOfCards)
	);
	const [cards, setCards] = useState([]);
	const [gameCheck, setGameCheck] = useState(false);

	const cardsIndexRef = useRef(cardsIndex);
	const setCardsIndex = (cardName, value) => {
		cardsIndexRef.current[cardName] = value;
		_setCardsIndex({ ...cardsIndexRef.current });
	};

	function resetCardsIndex(resetValue) {
		cardsIndexRef.current = resetValue;
		_setCardsIndex(resetValue);
	}

	function handleCardClicked(cardName, id) {
		const gameCheck = determineGameOver(id);
		setGameCheck(gameCheck);
		setCardsIndex(cardName, 1);
		props.handleSetCurrentScore(props.currentScore + 1);
	}

	function renderCards() {
		const totalCards = Array.from(Array(amountOfCards).keys());
		const cardsArray = totalCards.map(index => {
			const cardName = 'card' + index;
			const id = cardsIndex[cardName];

			return (
				<Card
					onClick={() => {
						handleCardClicked(cardName, id);
					}}
					key={index}
					className={'text-center ' + cardName}
					id={id}
				>
					<Card.Body>
						<Card.Title className='xxxLarge'>{index}</Card.Title>
					</Card.Body>
				</Card>
			);
		});

		const shuffledCards = shuffleCards(cardsArray);
		setCards(shuffledCards);
	}

	// This effect is needed so that we change the column count when the level has change
	useEffect(() => {
		if (level === 1) {
			document.querySelector('.card-columns').classList.add('test');
		} else {
			document.querySelector('.card-columns').classList.remove('test');
		}
	});

	// This effect depends on the amountOfCards changing. Needed so that we update the state
	// for cardsIndex
	useEffect(() => {
		updateCardsIndex(amountOfCards, setCardsIndex);
	}, [amountOfCards]);

	// This effect activate everytime the user clicks on a card.
	useEffect(() => {
		renderCards();
	}, [cardsIndex]);

	// determine next step. This effect depends on whether the user clicks on all the correct cards
	useEffect(() => {
		if (gameCheck === false && checkAdvanceLevel(cardsIndex)) {
			props.handleSetAmountOfCards(amountOfCards + 2);
			props.handleSetLevel(level + 1);
			setCards([]);
		}
	}, [checkAdvanceLevel(cardsIndex)]);

	// This effect is sed to reset the game. It resets everything so that the user is ready to play
	// a new game
	useEffect(() => {
		if (gameCheck) {
			props.handleSetAmountOfCards(4);
			props.handleSetLevel(1);

			const score = determineScore(props.currentScore, props.bestScore);
			props.handleSetBestScore(score);
			props.handleSetCurrentScore(0);

			const newCardsState = createCardsState(4);
			resetCardsIndex(newCardsState);
			setCards([]);
		}
	}, [gameCheck]);

	return (
		<Row id='gameBoardContainer'>
			<Col>
				{gameCheck && (
					<PopUp
						text={'Your score is: ' + props.bestScore}
						nextStepText='Play Again?'
						step={1}
						handleReset={props.handleReset}
						handleGameCheck={setGameCheck}
					/>
				)}

				<CardColumns>{cards}</CardColumns>
			</Col>
		</Row>
	);
}

export default GameBoard;
