import React, { Component} from "react";
import {hot} from "react-hot-loader";
import "./App.css";

const List = ( { list } ) => 
  list.map( ( { objectID, ...item } ) => 
    <Item
      key={ objectID }
      { ...item }
    /> 
  );

const Item = ( { title, url, author, num_comments, points } ) => (
  <div>
    <span>
      <a href={ url }>{ title }</a>
    </span>
    <span>{ author }</span>
    <span>{ num_comments }</span>
    <span>{ points }</span>
  </div>
);

  
const App = () => {

  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];
  const [searchTerm, setSearchTerm] = React.useState(
    localStorage.getItem('search') || 'React'
  );

  React.useEffect(() => {
      localStorage.setItem( 'search', searchTerm );
    }, [searchTerm]);  

  const handleSearch = event => {
    setSearchTerm( event.target.value );
  };

  const searchedStories = stories.filter(  story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );  

    return(
      <div className="App">
        <h1> My Hacker Stories</h1>
        <Search search={ searchTerm } onSearch = { handleSearch } />
        <p>Search Term is: { searchTerm } </p>
        <hr />
        <List list = { searchedStories } />
      </div>
    );
}

const Search = ( { search, onSearch } ) => (
    <div>
      <label htmlFor="search"> Search: </label>
      <input id="search" type="text" onChange = { onSearch } value = { search } />
    </div>
  )

export default hot(module)(App);