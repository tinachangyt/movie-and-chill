import React from 'react';
import ReactDOM from 'react-dom';
import { ajax } from 'jquery';
import Scroll from 'react-scroll';
import {scroller} from 'react-scroll';

//smooth scroll variables
let Link       = Scroll.Link;
let Element    = Scroll.Element;
let Events     = Scroll.Events;
let scroll     = Scroll.animateScroll;
let scrollSpy  = Scroll.scrollSpy;

//firebase set-up
var config = {
	apiKey: "AIzaSyDFJpSrUmV-aIVDVaS23DmqltAWjXsJZsg",
	authDomain: "to-watch-list-53e61.firebaseapp.com",
	databaseURL: "https://to-watch-list-53e61.firebaseio.com",
	projectId: "to-watch-list-53e61",
	storageBucket: "to-watch-list-53e61.appspot.com",
	messagingSenderId: "847841768687"
};
firebase.initializeApp(config);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();





class GetMovieData extends React.Component {
	constructor() {
		super();
		this.state = {
			userSearch: '',
			movies: [],
			selectedMovies: [],
			loggedIn: false,
			user: null			
		};
		this.handleChange = this.handleChange.bind(this);
		this.updateSelectedMovieNotes = this.updateSelectedMovieNotes.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.selectedToList = this.selectedToList.bind(this);
		this.addNote = this.addNote.bind(this);
	}

	componentDidMount() {
		// add an on auth state changed that checks to see when the user is logged in
		// when the user logs in, store the user details in state (check the todo app for example)
		// grab the user's uid from this.state.user.uid
		// go back to the firebase database and grab the user's movielist using their uid
		// e.g firebase.database().ref(userId).on('value', (snapshot) )
		// when the snapshot comes back, it will be an object - need to convert them into a array of objects using a for in loop
		// then store the converted array into the state of the application
		// then once stored in the state, map over it and print it out onto the page

		auth.onAuthStateChanged((user) => {
			if (user) {
				this.setState({
					user: user,
					loggedIn: true
				});
				const userId = this.state.user.uid;
				const userRef = firebase.database().ref(userId);

				userRef.on('value', (snapshot) => {
					const userSelected = snapshot.val();
					const newSelected = [];
					const userNotes = snapshot.val();
					const newUserNotes = '';
					for (let key in userSelected) {
						// console.log(userSelected);
						newSelected.push({
							key: key,
							description: userSelected[key]
						});
					}
					this.setState({
						selectedMovies: newSelected,
						noteText: '',
						noteWatchedTime: '',
						noteRating:''
					});
				});
			} else {
				this.setState({
					user: null,
					loggedIn: false
				});
			}
		});
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	updateSelectedMovieNotes(i, e) {
		const state = Object.assign({}, this.state);

		const selectedMovie = state.selectedMovies[i];
		const notes = selectedMovie.description.notes;
		notes[e.target.name] = e.target.value;

		this.setState(state);
	}

	handleSubmit(e) {
		e.preventDefault();
		// console.log('worked', this.state.userSearch);
		ajax({
			url:'https://api.themoviedb.org/3/search/multi',
			method: 'GET',
			dataType: 'json',
			data: {
				api_key: '5f8094c760a916f6b73d1268ee42030b',
				query: this.state.userSearch
			}
		})
		.then((res) => {
			const movieData = res.results;
			// console.log('Are these data showing?', movieData);
			this.setState({
				movies: movieData
			});
		});
	}

	login() {
		auth.signInWithPopup(provider)
			.then((result) => {
				const user = result.user;
			this.setState({
				user: user,
				loggedIn: true
			});
		});
	}

	logout() {
		auth.signOut()
			.then(() => {
				this.setState({
					user: null,
					loggedIn: false
				});
			});
	}

	selectedToList(e, details) {
		e.preventDefault();
		// console.log("the addToList button is working");
		const userId = this.state.user.uid;
		const userRef = firebase.database().ref(`${userId}`);

		const selectedMovie = Object.assign(details, { 
			notes: {
				noteText: '',
				noteWatchedTime: '',
				noteRating: ''
			}
		});

		userRef.push(details);
	}

	removeFromList (e, details) {
		e.preventDefault();
		// console.log("Is remove button working?")
		const userId = this.state.user.uid;
		const userRef = firebase.database().ref(`${userId}/${details.key}`);

		userRef.remove();
	}

	addNote(i, e) {
		e.preventDefault();
		const details = this.state.selectedMovies[i];

		const userId = this.state.user.uid;
		const userRef = firebase.database().ref(`${userId}/${details.key}`);

		userRef.set(details.description);
	}

	//smooth scrolls
	scrollToTop() {
		scroll.scrollToTop();
	}
	scrollMore() {
		scroll.scrollMore(800);
	}


	render() {
		const showLoggedIn = () => {
			// if user is logged-in, then display below
			if (this.state.loggedIn === true) {
				return (
					<div> {/* root-enveloping-element starts */}
						{/* scroll-top side button */}
						<a href="#home" className="topButton" onClick={this.scrollToTop}>
							<i className="fa fa-arrow-up" aria-hidden="true"></i>
							<p>TOP</p>
						</a>
						<button className="logoutButton" onClick={this.logout}>Logout</button>


						{/* search bar */}
						<form className="search" onSubmit={this.handleSubmit}>
							<label htmlFor="userSearch"></label>
							<input className="search__bar" type="search" name="userSearch" placeholder="enter movie or TV show" onChange={this.handleChange} value={this.state.userSearch} />
							<button className="search__submitButton" type="submit" onClick={this.scrollMore}>
								<i className="fa fa-search" aria-hidden="true"></i>
							</button>
						</form>


						{/* search results */}
						<div className="movieCatalogue">
							<h2>Select Movie or Show</h2>
							<div className="movieCatalogue__movies">
								{this.state.movies.map((details) => {
									return(
										<div className="movieInfo" key={details.id}>
											<div className="icons selectIcon">
												<a href="" onClick={ (e) => this.selectedToList(e, details) }>
													<i className="fa fa-plus" aria-hidden="true"></i>
												</a>
											</div>
											<div className="movieInfo__image">
												<img src={`http://image.tmdb.org/t/p/w500/${details.poster_path}`} alt="movie posters"/>
											</div>
											<div className="movieInfo__details">
												<div className="movieInfo__details--title">
													<h3>{details.title}</h3>
													<h3>{details.name}</h3>
												</div>
												<p className="mediaType">{details.media_type}</p>
												<p>{details.overview}</p>
												<p className="rating">★ {details.vote_average} /10</p>
											</div>
										</div>
									)
								})}
							</div>
						</div>


						{/* selected movies/ shows */}
						<div id="selectedSection">
							<h2>My List</h2>
							<div className="movieCatalogue__movies">
								{this.state.selectedMovies.map((details, i) => {
									const selectedData = details.description;
									// console.log(selectedData);
									return (
										<div className="movieInfo" key={selectedData.id}>
											<div className="icons">
												<a href="" className="fa fa-times" onClick={ (e) => this.removeFromList(e, details) }></a>
											</div>
											<div className="movieInfo__image">
												<img src={`http://image.tmdb.org/t/p/w500/${selectedData.poster_path}`} alt="movie posters"/>
											</div>
											<div className="movieInfo__details">
												<div className="movieInfo__details--title">
													<h3>{selectedData.title}</h3>
													<h3>{selectedData.name}</h3>
												</div>
												<p className="mediaType">{selectedData.media_type}</p>
											</div>


											{/* user notes */}
											<form className="noteForm" onSubmit={(e) => this.addNote(i, e)}>
												<label htmlFor="noteText"></label>
												<textarea 
													name="noteText" 
													placeholder="notes" 
													onChange={e => this.updateSelectedMovieNotes(i, e)} 
													value={selectedData.notes.noteText}>
												</textarea>
												<div className="range-slider">
													<label htmlFor="noteRating">
														<i className="fa fa-star" aria-hidden="true"></i>
														Rating
													</label>
													<input 
														className="range-slider__range" 
														type="range" 
														min="0" 
														max="10" 
														step="1" 
														name="noteRating" 
														onChange={e => this.updateSelectedMovieNotes(i, e)} 
														value={selectedData.notes.noteRating} 
														data-thumbwidth="20"
													/>
												</div>
												<label htmlFor="noteWatchedTime">
													<i className="fa fa-clock-o" aria-hidden="true"></i>
													Stopped At
												</label>
												<input 
													className="noteWatchedTime" 
													type="text" 
													name="noteWatchedTime" 
													placeholder="ex. Season1 Ep1, 00:00:00" 
													onChange={e => this.updateSelectedMovieNotes(i, e)} 
													value={selectedData.notes.noteWatchedTime}
												/>
												<button className="saveButton" type="submit">save</button>
											</form> {/* end of user notes */}
										</div> // end of root-enveloping-element of Selected Section
									) // end of return
								})}
							</div>
						</div> {/* end of Selected Section" */}
					</div> // root-enveloping-element ends
				) // end of return in if-statement


			} else { // if user is logged-out, then display below
				return (
					<div className="startPage">
						<div className="startPage__appIntro">
							<p>Ever forget what movies or TV shows you have been wanting to watch ?  This app helps you keep track of them! Login to create your own to-watch list !</p>
						</div>
						<button className="startPage__loginButton" onClick={this.login}>Login</button>
					</div>
				) // end of else-statement
			} // end of if-else-statement
		} // end of showLoggedIn()


		// main structure of the app
		return (
			<div>
				<header id="home" className="headerWrapper">
					<img className="logo" src="../../assets/logo.png" alt="Watta Watch app logo" />
				</header>
				<main className="wrapper">
					{showLoggedIn()}
				</main>
				<footer>
					<p>Copyright © 2017 Designed and Coded by Tina Chang</p>
				</footer>
			</div>
		)
	} // end of render
}



class App extends React.Component {
	render() {
		return (
			<div>
				<GetMovieData />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));